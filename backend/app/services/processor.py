import ffmpeg
import os
import asyncio
import uuid
from app.config import settings
from app.schemas import VideoProcessRequest
from app.services.music import MusicService

music_service = MusicService()


class VideoProcessor:
    def __init__(self):
        self.output_dir = settings.upload_dir

    async def process(self, req: VideoProcessRequest, job_id: str, db):
        from sqlalchemy import select
        from app.models import Video, Job
        from app.database import AsyncSessionLocal

        async def _update(progress: int, status: str, error: str = None):
            async with AsyncSessionLocal() as s:
                result = await s.execute(select(Job).where(Job.id == job_id))
                job = result.scalar_one_or_none()
                if job:
                    job.progress = progress
                    job.status = status
                    if error:
                        job.error = error
                    await s.commit()

        async def _update_video(status: str, output_path: str = None, error: str = None):
            async with AsyncSessionLocal() as s:
                result = await s.execute(select(Video).where(Video.id == req.video_id))
                video = result.scalar_one_or_none()
                if video:
                    video.status = status
                    if output_path:
                        video.output_path = output_path
                    if error:
                        video.error_msg = error
                    await s.commit()

        await _update(5, "running")

        try:
            # Get source video path
            async with AsyncSessionLocal() as s:
                result = await s.execute(select(Video).where(Video.id == req.video_id))
                video = result.scalar_one_or_none()
                source_path = video.output_path

            await _update(10, "running")

            loop = asyncio.get_event_loop()
            output_path = await loop.run_in_executor(
                None, self._run_ffmpeg, source_path, req
            )

            await _update(100, "done")
            await _update_video("done", output_path=output_path)

        except Exception as e:
            await _update(0, "error", error=str(e))
            await _update_video("error", error=str(e))

    def _run_ffmpeg(self, source_path: str, req: VideoProcessRequest) -> str:
        output_id = str(uuid.uuid4())
        output_path = os.path.join(self.output_dir, f"{output_id}_short.mp4")

        # Probe video to get dimensions
        probe = ffmpeg.probe(source_path)
        video_info = next(
            (s for s in probe["streams"] if s["codec_type"] == "video"), None
        )
        width = int(video_info["width"])
        height = int(video_info["height"])

        # Build crop filter for 9:16 vertical
        target_aspect = 9 / 16
        if width / height > target_aspect:
            # Wider than target — crop sides
            crop_h = height
            crop_w = int(height * target_aspect)
            crop_x = int((width - crop_w) * req.crop_x)
            crop_y = 0
        else:
            # Taller than target — crop top/bottom
            crop_w = width
            crop_h = int(width / target_aspect)
            crop_x = 0
            crop_y = int((height - crop_h) * 0.5)

        duration = req.end_time - req.start_time

        # Build filter graph
        vf = (
            f"crop={crop_w}:{crop_h}:{crop_x}:{crop_y},"
            f"scale=1080:1920:force_original_aspect_ratio=decrease,"
            f"pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,"
            f"eq=brightness={req.brightness - 1}:contrast={req.contrast}:saturation={req.saturation},"
            f"setpts={1/req.speed}*PTS"
        )

        music_track = music_service.get_track(req.music_id) if req.music_id else None

        if music_track and os.path.exists(music_track.file_path):
            input_video = ffmpeg.input(source_path, ss=req.start_time, t=duration)
            input_music = ffmpeg.input(music_track.file_path, stream_loop=-1)

            video_stream = input_video.video.filter_multi_output(vf)
            audio_stream = input_music.audio.filter("volume", 0.8).filter("atrim", duration=duration)

            (
                ffmpeg
                .output(
                    video_stream,
                    audio_stream,
                    output_path,
                    vcodec="libx264",
                    acodec="aac",
                    preset="fast",
                    crf=23,
                    audio_bitrate="128k",
                    t=duration,
                )
                .overwrite_output()
                .run(quiet=True)
            )
        else:
            # No audio replacement — keep original or mute
            input_video = ffmpeg.input(source_path, ss=req.start_time, t=duration)
            (
                ffmpeg
                .output(
                    input_video.video.filter(vf),
                    output_path,
                    vcodec="libx264",
                    preset="fast",
                    crf=23,
                    an=None,  # no audio
                    t=duration,
                )
                .overwrite_output()
                .run(quiet=True)
            )

        return output_path
