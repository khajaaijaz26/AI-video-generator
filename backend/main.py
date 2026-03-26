from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import subprocess
import logging

from app.config import settings
from app.database import init_db
from app.routers import videos, trending, upload, music, auth

logger = logging.getLogger(__name__)

# Sine-wave placeholder tracks: track_id → frequency (Hz)
_MUSIC_TRACK_FREQS = {
    "upbeat-1": 440,   # A4 — bright/upbeat
    "chill-1": 220,    # A3 — mellow
    "epic-1": 330,     # E4 — mid/cinematic
    "dance-1": 528,    # slightly sharp — energetic
    "acoustic-1": 262, # C4 — natural/warm
    "hip-hop-1": 174,  # F3 — deep/bass
}


def _generate_music_files(music_dir: str) -> None:
    """Generate sine-wave placeholder MP3s if they don't exist yet."""
    for track_id, freq in _MUSIC_TRACK_FREQS.items():
        path = os.path.join(music_dir, f"{track_id}.mp3")
        if not os.path.exists(path):
            try:
                subprocess.run(
                    [
                        "ffmpeg", "-y",
                        "-f", "lavfi",
                        "-i", f"sine=frequency={freq}:duration=180",
                        "-ar", "44100", "-b:a", "128k",
                        path,
                    ],
                    check=True,
                    capture_output=True,
                )
                logger.info("Generated placeholder music: %s", path)
            except Exception as exc:
                logger.warning("Could not generate music file %s: %s", path, exc)

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
    music_dir = os.path.join(settings.static_dir, "music")
    _generate_music_files(music_dir)


@app.get("/")
async def root():
    return {"message": "AI Video Generator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
