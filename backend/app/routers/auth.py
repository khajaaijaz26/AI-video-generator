from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google_auth_oauthlib.flow import Flow
import json

from app.database import get_db
from app.models import OAuthToken
from app.config import settings
from app.schemas import OAuthStatusResponse

router = APIRouter()

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube",
]


def get_youtube_flow():
    client_config = {
        "web": {
            "client_id": settings.youtube_client_id,
            "client_secret": settings.youtube_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.youtube_redirect_uri],
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=YOUTUBE_SCOPES,
        redirect_uri=settings.youtube_redirect_uri,
    )


@router.get("/youtube/url")
async def youtube_auth_url():
    if not settings.youtube_client_id:
        raise HTTPException(status_code=400, detail="YouTube OAuth not configured")
    flow = get_youtube_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return {"url": auth_url}


@router.get("/youtube/callback")
async def youtube_callback(code: str, db: AsyncSession = Depends(get_db)):
    flow = get_youtube_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "youtube"))
    token = result.scalar_one_or_none()
    if not token:
        token = OAuthToken(platform="youtube")
        db.add(token)

    token.access_token = creds.token
    token.refresh_token = creds.refresh_token
    token.token_uri = creds.token_uri
    token.client_id = creds.client_id
    token.client_secret = creds.client_secret
    token.scopes = json.dumps(list(creds.scopes))
    await db.commit()

    return {"message": "YouTube connected successfully"}


@router.get("/instagram/url")
async def instagram_auth_url():
    if not settings.instagram_app_id:
        raise HTTPException(status_code=400, detail="Instagram OAuth not configured")
    url = (
        f"https://api.instagram.com/oauth/authorize"
        f"?client_id={settings.instagram_app_id}"
        f"&redirect_uri={settings.instagram_redirect_uri}"
        f"&scope=instagram_basic,instagram_content_publish"
        f"&response_type=code"
    )
    return {"url": url}


@router.get("/instagram/callback")
async def instagram_callback(code: str, db: AsyncSession = Depends(get_db)):
    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.instagram.com/oauth/access_token",
            data={
                "client_id": settings.instagram_app_id,
                "client_secret": settings.instagram_app_secret,
                "grant_type": "authorization_code",
                "redirect_uri": settings.instagram_redirect_uri,
                "code": code,
            },
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Instagram auth failed")
        data = resp.json()

    result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "instagram"))
    token = result.scalar_one_or_none()
    if not token:
        token = OAuthToken(platform="instagram")
        db.add(token)

    token.access_token = data.get("access_token")
    await db.commit()

    return {"message": "Instagram connected successfully"}


@router.get("/status", response_model=OAuthStatusResponse)
async def auth_status(db: AsyncSession = Depends(get_db)):
    yt_result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "youtube"))
    yt_token = yt_result.scalar_one_or_none()

    ig_result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "instagram"))
    ig_token = ig_result.scalar_one_or_none()

    return OAuthStatusResponse(
        youtube_connected=bool(yt_token and yt_token.access_token),
        instagram_connected=bool(ig_token and ig_token.access_token),
    )


@router.delete("/youtube/disconnect")
async def disconnect_youtube(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "youtube"))
    token = result.scalar_one_or_none()
    if token:
        await db.delete(token)
        await db.commit()
    return {"message": "YouTube disconnected"}


@router.delete("/instagram/disconnect")
async def disconnect_instagram(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OAuthToken).where(OAuthToken.platform == "instagram"))
    token = result.scalar_one_or_none()
    if token:
        await db.delete(token)
        await db.commit()
    return {"message": "Instagram disconnected"}
