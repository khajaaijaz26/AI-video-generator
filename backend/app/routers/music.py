from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.music import MusicService
from app.schemas import MusicTrack
from typing import List
import os

router = APIRouter()
music_service = MusicService()


@router.get("/", response_model=List[MusicTrack])
async def list_tracks():
    """Return all available royalty-free music tracks."""
    return music_service.get_tracks()


@router.get("/{track_id}/stream")
async def stream_track(track_id: str):
    """Stream a music track for preview."""
    track = music_service.get_track(track_id)
    if not track or not os.path.exists(track.file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Track not found")
    return FileResponse(track.file_path, media_type="audio/mpeg")
