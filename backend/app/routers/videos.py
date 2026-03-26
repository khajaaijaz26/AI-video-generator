from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os

from app.database import get_db
from app.models import Video, Job
from app.schemas import VideoAnalyzeRequest, VideoMetadata, VideoProcessRequest, VideoResponse, JobResponse
from app.services.downloader import VideoDownloader
from app.services.processor import VideoProcessor

router = APIRouter()
downloader = VideoDownloader()
processor = VideoProcessor()


@router.post("/analyze", response_model=VideoMetadata)
async def analyze_video(req: VideoAnalyzeRequest):
    """Fetch video metadata from a YouTube URL without downloading."""
    try:
        meta = await downloader.get_metadata(req.url)
        return meta
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/download", response_model=JobResponse)
async def download_video(
    req: VideoAnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Download a YouTube video and create a processing job."""
    video_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())

    video = Video(id=video_id, source_url=req.url, status="pending")
    db.add(video)

    job = Job(id=job_id, video_id=video_id, type="download", status="queued", progress=0)
    db.add(job)
    await db.commit()

    background_tasks.add_task(downloader.download, req.url, video_id, job_id, db)

    await db.refresh(job)
    return job


@router.get("/status/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/process", response_model=JobResponse)
async def process_video(
    req: VideoProcessRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Convert a downloaded video to Shorts/Reels format."""
    result = await db.execute(select(Video).where(Video.id == req.video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.status not in ("done", "downloaded"):
        raise HTTPException(status_code=400, detail=f"Video is not ready. Status: {video.status}")

    job_id = str(uuid.uuid4())
    job = Job(id=job_id, video_id=req.video_id, type="process", status="queued", progress=0)
    db.add(job)
    await db.commit()

    background_tasks.add_task(processor.process, req, job_id, db)

    await db.refresh(job)
    return job


@router.get("/", response_model=list[VideoResponse])
async def list_videos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).order_by(Video.created_at.desc()))
    return result.scalars().all()


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.delete("/{video_id}")
async def delete_video(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    # Delete processed file from disk before removing DB record
    if video.output_path and os.path.exists(video.output_path):
        try:
            os.remove(video.output_path)
        except OSError:
            pass
    await db.delete(video)
    await db.commit()
    return {"message": "Video deleted"}
