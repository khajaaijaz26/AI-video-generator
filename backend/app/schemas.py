from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class VideoAnalyzeRequest(BaseModel):
    url: str


class VideoMetadata(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    channel: Optional[str] = None
    duration: Optional[int] = None
    view_count: Optional[int] = None
    url: str


class VideoProcessRequest(BaseModel):
    video_id: str
    start_time: float = 0
    end_time: float = 60
    music_id: Optional[str] = None
    captions: Optional[List[dict]] = None
    crop_x: float = 0.5  # center
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    speed: float = 1.0
    add_captions: bool = True
    title_overlay: Optional[str] = None


class VideoResponse(BaseModel):
    id: str
    source_url: str
    title: Optional[str]
    thumbnail: Optional[str]
    channel: Optional[str]
    duration: Optional[int]
    status: str
    output_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: str
    video_id: str
    type: str
    status: str
    progress: int
    error: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UploadYouTubeRequest(BaseModel):
    video_id: str
    title: str
    description: str = ""
    tags: List[str] = []
    category_id: str = "22"
    privacy: str = "public"


class UploadInstagramRequest(BaseModel):
    video_id: str
    caption: str = ""


class UploadResponse(BaseModel):
    id: str
    video_id: str
    platform: str
    platform_id: Optional[str]
    platform_url: Optional[str]
    status: str
    title: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


class TrendingVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    thumbnail: str
    view_count: Optional[int]
    like_count: Optional[int]
    duration: Optional[str]
    published_at: Optional[str]
    url: str


class MusicTrack(BaseModel):
    id: str
    name: str
    artist: str
    genre: str
    duration: int
    file_path: str
    preview_url: str


class OAuthStatusResponse(BaseModel):
    youtube_connected: bool
    instagram_connected: bool
    youtube_channel: Optional[str] = None
    instagram_user: Optional[str] = None
