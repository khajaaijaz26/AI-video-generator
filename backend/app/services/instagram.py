import httpx
import asyncio
from app.schemas import UploadInstagramRequest
from app.config import settings


class InstagramService:
    GRAPH_URL = "https://graph.instagram.com/v19.0"

    async def upload_reel(self, file_path: str, req: UploadInstagramRequest, upload_id: str, db):
        from sqlalchemy import select
        from app.models import OAuthToken, Upload
        from app.database import AsyncSessionLocal

        async with AsyncSessionLocal() as s:
            result = await s.execute(select(OAuthToken).where(OAuthToken.platform == "instagram"))
            token = result.scalar_one_or_none()
            if not token:
                async with AsyncSessionLocal() as s2:
                    r2 = await s2.execute(select(Upload).where(Upload.id == upload_id))
                    upload = r2.scalar_one_or_none()
                    if upload:
                        upload.status = "error"
                        await s2.commit()
                return

            access_token = token.access_token

        try:
            # Step 1: Get user ID
            async with httpx.AsyncClient() as client:
                me_resp = await client.get(
                    f"{self.GRAPH_URL}/me",
                    params={"fields": "id,username", "access_token": access_token},
                )
                if me_resp.status_code != 200:
                    raise Exception("Failed to get Instagram user info")
                user_id = me_resp.json()["id"]

                # Step 2: Create media container
                # Note: video_url must be publicly accessible
                # In production, upload file to a CDN or serve via ngrok
                video_url = f"http://localhost:8000/uploads/{file_path.split('/')[-1]}"

                container_resp = await client.post(
                    f"{self.GRAPH_URL}/{user_id}/media",
                    data={
                        "media_type": "REELS",
                        "video_url": video_url,
                        "caption": req.caption,
                        "access_token": access_token,
                    },
                )
                if container_resp.status_code != 200:
                    raise Exception(f"Container creation failed: {container_resp.text}")

                container_id = container_resp.json()["id"]

                # Step 3: Poll for container status
                for _ in range(30):
                    await asyncio.sleep(5)
                    status_resp = await client.get(
                        f"{self.GRAPH_URL}/{container_id}",
                        params={"fields": "status_code", "access_token": access_token},
                    )
                    status_code = status_resp.json().get("status_code")
                    if status_code == "FINISHED":
                        break
                    if status_code == "ERROR":
                        raise Exception("Instagram media processing failed")

                # Step 4: Publish
                publish_resp = await client.post(
                    f"{self.GRAPH_URL}/{user_id}/media_publish",
                    data={
                        "creation_id": container_id,
                        "access_token": access_token,
                    },
                )
                if publish_resp.status_code != 200:
                    raise Exception(f"Publish failed: {publish_resp.text}")

                media_id = publish_resp.json().get("id")

            async with AsyncSessionLocal() as s:
                r = await s.execute(select(Upload).where(Upload.id == upload_id))
                upload = r.scalar_one_or_none()
                if upload:
                    upload.status = "done"
                    upload.platform_id = media_id
                    upload.platform_url = f"https://www.instagram.com/p/{media_id}/"
                    await s.commit()

        except Exception as e:
            async with AsyncSessionLocal() as s:
                r = await s.execute(select(Upload).where(Upload.id == upload_id))
                upload = r.scalar_one_or_none()
                if upload:
                    upload.status = "error"
                    await s.commit()
