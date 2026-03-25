import yt_dlp
import os
import asyncio
from app.config import settings
from app.schemas import VideoMetadata


class VideoDownloader:
    def __init__(self):
        self.output_dir = settings.upload_dir

    async def get_metadata(self, url: str) -> VideoMetadata:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._extract_info, url)

    def _extract_info(self, url: str) -> VideoMetadata:
        ydl_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return VideoMetadata(
                title=info.get("title", ""),
                description=info.get("description", ""),
                thumbnail=info.get("thumbnail", ""),
                channel=info.get("uploader", ""),
                duration=info.get("duration"),
                view_count=info.get("view_count"),
                url=url,
            )

    async def download(self, url: str, video_id: str, job_id: str, db):
        from sqlalchemy import select
        from app.models import Video, Job
        loop = asyncio.get_event_loop()

        async def _update_job(progress: int, status: str):
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as s:
                result = await s.execute(select(Job).where(Job.id == job_id))
                job = result.scalar_one_or_none()
                if job:
                    job.progress = progress
                    job.status = status
                    await s.commit()

        async def _update_video(status: str, title: str = None, thumbnail: str = None,
                                channel: str = None, duration: int = None,
                                output_path: str = None, error: str = None):
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as s:
                result = await s.execute(select(Video).where(Video.id == video_id))
                video = result.scalar_one_or_none()
                if video:
                    video.status = status
                    if title:
                        video.title = title
                    if thumbnail:
                        video.thumbnail = thumbnail
                    if channel:
                        video.channel = channel
                    if duration:
                        video.duration = duration
                    if output_path:
                        video.output_path = output_path
                    if error:
                        video.error_msg = error
                    await s.commit()

        await _update_job(0, "running")
        await _update_video("downloading")

        output_template = os.path.join(self.output_dir, f"{video_id}_source.%(ext)s")

        def progress_hook(d):
            if d["status"] == "downloading":
                pct = d.get("_percent_str", "0%").strip().replace("%", "")
                try:
                    asyncio.run_coroutine_threadsafe(
                        _update_job(int(float(pct)), "running"), loop
                    )
                except Exception:
                    pass

        ydl_opts = {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": output_template,
            "progress_hooks": [progress_hook],
            "quiet": True,
            "no_warnings": True,
            "writeautomaticsub": True,
            "subtitleslangs": ["en"],
            "subtitlesformat": "srt",
        }

        try:
            info = await loop.run_in_executor(None, self._do_download, url, ydl_opts)
            output_path = os.path.join(self.output_dir, f"{video_id}_source.mp4")
            if not os.path.exists(output_path):
                # Try to find the file
                for f in os.listdir(self.output_dir):
                    if f.startswith(f"{video_id}_source"):
                        output_path = os.path.join(self.output_dir, f)
                        break

            await _update_video(
                "downloaded",
                title=info.get("title"),
                thumbnail=info.get("thumbnail"),
                channel=info.get("uploader"),
                duration=info.get("duration"),
                output_path=output_path,
            )
            await _update_job(100, "done")
        except Exception as e:
            await _update_video("error", error=str(e))
            await _update_job(0, "error")

    def _do_download(self, url: str, ydl_opts: dict) -> dict:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            return info
