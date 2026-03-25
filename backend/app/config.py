from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    youtube_api_key: str = ""
    youtube_client_id: str = ""
    youtube_client_secret: str = ""
    youtube_redirect_uri: str = "http://localhost:8000/api/auth/youtube/callback"

    instagram_app_id: str = ""
    instagram_app_secret: str = ""
    instagram_redirect_uri: str = "http://localhost:8000/api/auth/instagram/callback"

    database_url: str = "sqlite+aiosqlite:///./app.db"
    upload_dir: str = "./uploads"
    static_dir: str = "./static"
    max_video_duration: int = 600
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
