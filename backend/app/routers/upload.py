from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.models import Video, Upload
from app.schemas import UploadYouTubeRequest, UploadInstagramRequest, UploadResponse
from app.services.youtube import YouTubeService
from app.services.instagram import InstagramService

router = APIRouter()
youtube_service = YouTubeService()
instagram_service = InstagramService()


@router.post("/youtube", response_model=UploadResponse)
async def upload_to_youtube(
    req: UploadYouTubeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Video).where(Video.id == req.video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.output_path:
        raise HTTPException(status_code=400, detail="Video has not been processed yet")

    upload_id = str(uuid.uuid4())
    upload = Upload(
        id=upload_id,
        video_id=req.video_id,
        platform="youtube",
        status="uploading",
        title=req.title,
        description=req.description,
    )
    db.add(upload)
    await db.commit()

    background_tasks.add_task(
        youtube_service.upload_short,
        video.output_path,
        req,
        upload_id,
        db,
    )

    await db.refresh(upload)
    return upload


@router.post("/instagram", response_model=UploadResponse)
async def upload_to_instagram(
    req: UploadInstagramRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Video).where(Video.id == req.video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.output_path:
        raise HTTPException(status_code=400, detail="Video has not been processed yet")

    upload_id = str(uuid.uuid4())
    upload = Upload(
        id=upload_id,
        video_id=req.video_id,
        platform="instagram",
        status="uploading",
        description=req.caption,
    )
    db.add(upload)
    await db.commit()

    background_tasks.add_task(
        instagram_service.upload_reel,
        video.output_path,
        req,
        upload_id,
        db,
    )

    await db.refresh(upload)
    return upload


@router.get("/history", response_model=list[UploadResponse])
async def upload_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Upload).order_by(Upload.uploaded_at.desc()))
    return result.scalars().all()
