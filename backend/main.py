from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import init_db
from app.routers import videos, trending, upload, music, auth

app = FastAPI(
    title="AI Video Generator API",
    description="YouTube Shorts & Instagram Reels Generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.static_dir, exist_ok=True)
os.makedirs(os.path.join(settings.static_dir, "music"), exist_ok=True)

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(trending.router, prefix="/api/trending", tags=["trending"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(music.router, prefix="/api/music", tags=["music"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "AI Video Generator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
