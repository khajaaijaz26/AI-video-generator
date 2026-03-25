import httpx
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from app.config import settings
from app.schemas import TrendingVideo, UploadYouTubeRequest
from typing import List


def _iso8601_to_seconds(duration: str) -> int:
    """Convert ISO 8601 duration to seconds."""
    import re
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


class YouTubeService:
    def _get_service(self):
        if not settings.youtube_api_key:
            return None
        return build("youtube", "v3", developerKey=settings.youtube_api_key)

    def _get_oauth_service(self, db_token):
        creds = Credentials(
            token=db_token.access_token,
            refresh_token=db_token.refresh_token,
            token_uri=db_token.token_uri or "https://oauth2.googleapis.com/token",
            client_id=db_token.client_id or settings.youtube_client_id,
            client_secret=db_token.client_secret or settings.youtube_client_secret,
            scopes=json.loads(db_token.scopes) if db_token.scopes else [],
        )
        return build("youtube", "v3", credentials=creds)

    async def get_trending(self, category_id: str, region: str, max_results: int) -> List[TrendingVideo]:
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._fetch_trending, category_id, region, max_results)

    def _fetch_trending(self, category_id: str, region: str, max_results: int) -> List[TrendingVideo]:
        service = self._get_service()
        if not service:
            return self._mock_trending()

        kwargs = {
            "part": "snippet,statistics,contentDetails",
            "chart": "mostPopular",
            "regionCode": region,
            "maxResults": max_results,
        }
        if category_id and category_id != "0":
            kwargs["videoCategoryId"] = category_id

        response = service.videos().list(**kwargs).execute()
        results = []
        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            details = item.get("contentDetails", {})
            video_id = item["id"]
            results.append(TrendingVideo(
                video_id=video_id,
                title=snippet.get("title", ""),
                channel=snippet.get("channelTitle", ""),
                thumbnail=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                view_count=int(stats.get("viewCount", 0)) if stats.get("viewCount") else None,
                like_count=int(stats.get("likeCount", 0)) if stats.get("likeCount") else None,
                duration=details.get("duration", ""),
                published_at=snippet.get("publishedAt", ""),
                url=f"https://www.youtube.com/watch?v={video_id}",
            ))
        return results

    def _mock_trending(self) -> List[TrendingVideo]:
        return [
            TrendingVideo(
                video_id="dQw4w9WgXcQ",
                title="Sample Trending Video (Configure API Key)",
                channel="Demo Channel",
                thumbnail="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                view_count=1000000,
                like_count=50000,
                duration="PT3M33S",
                published_at="2024-01-01T00:00:00Z",
                url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            )
        ]

    async def search_videos(self, query: str, max_results: int) -> List[TrendingVideo]:
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._do_search, query, max_results)

    def _do_search(self, query: str, max_results: int) -> List[TrendingVideo]:
        service = self._get_service()
        if not service:
            return []

        response = service.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=max_results,
            order="viewCount",
        ).execute()

        results = []
        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            video_id = item["id"].get("videoId", "")
            results.append(TrendingVideo(
                video_id=video_id,
                title=snippet.get("title", ""),
                channel=snippet.get("channelTitle", ""),
                thumbnail=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                view_count=None,
                like_count=None,
                duration=None,
                published_at=snippet.get("publishedAt", ""),
                url=f"https://www.youtube.com/watch?v={video_id}",
            ))
        return results

    async def upload_short(self, file_path: str, req: UploadYouTubeRequest, upload_id: str, db):
        from sqlalchemy import select
        from app.models import OAuthToken, Upload
        from app.database import AsyncSessionLocal
        import asyncio

        async with AsyncSessionLocal() as s:
            result = await s.execute(select(OAuthToken).where(OAuthToken.platform == "youtube"))
            token = result.scalar_one_or_none()
            if not token:
                async with AsyncSessionLocal() as s2:
                    r2 = await s2.execute(select(Upload).where(Upload.id == upload_id))
                    upload = r2.scalar_one_or_none()
                    if upload:
                        upload.status = "error"
                        await s2.commit()
                return

        loop = asyncio.get_event_loop()
        try:
            result_data = await loop.run_in_executor(
                None, self._do_upload, file_path, req, token
            )

            async with AsyncSessionLocal() as s:
                r = await s.execute(select(Upload).where(Upload.id == upload_id))
                upload = r.scalar_one_or_none()
                if upload:
                    upload.status = "done"
                    upload.platform_id = result_data.get("id")
                    upload.platform_url = f"https://youtube.com/shorts/{result_data.get('id')}"
                    await s.commit()
        except Exception as e:
            async with AsyncSessionLocal() as s:
                r = await s.execute(select(Upload).where(Upload.id == upload_id))
                upload = r.scalar_one_or_none()
                if upload:
                    upload.status = "error"
                    await s.commit()

    def _do_upload(self, file_path: str, req: UploadYouTubeRequest, token) -> dict:
        service = self._get_oauth_service(token)
        title = req.title if "#Shorts" in req.title else f"{req.title} #Shorts"
        body = {
            "snippet": {
                "title": title,
                "description": f"{req.description}\n\n#Shorts",
                "tags": req.tags + ["Shorts", "YouTubeShorts"],
                "categoryId": req.category_id,
            },
            "status": {"privacyStatus": req.privacy},
        }
        media = MediaFileUpload(file_path, mimetype="video/mp4", resumable=True)
        request = service.videos().insert(part="snippet,status", body=body, media_body=media)
        response = request.execute()
        return response
