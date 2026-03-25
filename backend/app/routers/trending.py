from fastapi import APIRouter, Query
from app.services.youtube import YouTubeService
from app.schemas import TrendingVideo
from typing import List, Optional

router = APIRouter()
youtube_service = YouTubeService()

CATEGORIES = [
    {"id": "0", "name": "All"},
    {"id": "10", "name": "Music"},
    {"id": "20", "name": "Gaming"},
    {"id": "25", "name": "News"},
    {"id": "17", "name": "Sports"},
    {"id": "28", "name": "Science & Tech"},
    {"id": "24", "name": "Entertainment"},
    {"id": "22", "name": "People & Blogs"},
    {"id": "26", "name": "Howto & Style"},
    {"id": "23", "name": "Comedy"},
]

REGIONS = [
    {"code": "US", "name": "United States"},
    {"code": "GB", "name": "United Kingdom"},
    {"code": "IN", "name": "India"},
    {"code": "CA", "name": "Canada"},
    {"code": "AU", "name": "Australia"},
    {"code": "DE", "name": "Germany"},
    {"code": "FR", "name": "France"},
    {"code": "JP", "name": "Japan"},
    {"code": "BR", "name": "Brazil"},
    {"code": "KR", "name": "South Korea"},
]


@router.get("/", response_model=List[TrendingVideo])
async def get_trending(
    category: str = Query("0", description="YouTube category ID"),
    region: str = Query("US", description="Region code"),
    max_results: int = Query(20, ge=1, le=50),
):
    """Get trending YouTube videos."""
    return await youtube_service.get_trending(category, region, max_results)


@router.get("/categories")
async def get_categories():
    return CATEGORIES


@router.get("/regions")
async def get_regions():
    return REGIONS


@router.get("/suggestions")
async def get_suggestions(
    query: str = Query(..., min_length=1),
    max_results: int = Query(10, ge=1, le=20),
):
    """Search YouTube videos by keyword."""
    return await youtube_service.search_videos(query, max_results)
