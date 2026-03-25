from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
import uuid


def gen_id():
    return str(uuid.uuid4())


class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True, default=gen_id)
    source_url = Column(String, nullable=False)
    title = Column(String)
    description = Column(Text)
    thumbnail = Column(String)
    channel = Column(String)
    duration = Column(Integer)
    status = Column(String, default="pending")  # pending/downloading/processing/done/error
    output_path = Column(String)
    error_msg = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=gen_id)
    video_id = Column(String, ForeignKey("videos.id"))
    type = Column(String)  # download/process/upload
    status = Column(String, default="queued")  # queued/running/done/error
    progress = Column(Integer, default=0)
    error = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(String, primary_key=True, default=gen_id)
    video_id = Column(String, ForeignKey("videos.id"))
    platform = Column(String)  # youtube/instagram
    platform_id = Column(String)
    platform_url = Column(String)
    status = Column(String)
    title = Column(String)
    description = Column(Text)
    uploaded_at = Column(DateTime, server_default=func.now())


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"

    id = Column(String, primary_key=True, default=gen_id)
    platform = Column(String, unique=True)
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_uri = Column(String)
    client_id = Column(String)
    client_secret = Column(String)
    scopes = Column(Text)
    expires_at = Column(DateTime)
