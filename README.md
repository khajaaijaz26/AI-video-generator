# AI Video Generator — YouTube Shorts & Instagram Reels

Transform full-length YouTube videos into copyright-safe Shorts and Reels with one click.

## Features

- **Paste & Convert** — Paste any YouTube URL and auto-convert to 9:16 vertical format
- **Copyright-Safe** — Strip original audio, add royalty-free music from built-in library
- **Smart Clip Editor** — Timeline scrubber, crop position, brightness/contrast/speed controls
- **Caption Editor** — Auto-generated captions + custom text overlays
- **Upload to YouTube** — Publish directly to YouTube Shorts via OAuth
- **Upload to Instagram** — Publish directly to Instagram Reels via Graph API
- **Trending Discovery** — Browse trending YouTube videos by category and region
- **Search** — Search any keyword to find videos to convert
- **Dark/Light Theme** — Glassmorphism UI with purple → pink → orange gradients

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- FFmpeg installed on your system
- YouTube Data API key (for trending)
- YouTube OAuth credentials (for uploading)
- Instagram App credentials (for uploading)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys

pip install -r requirements.txt
uvicorn main:app --reload
# API runs at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if needed

npm install
npm run dev
# UI runs at http://localhost:3000
```

### 3. Docker (Full Stack)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit both .env files

docker-compose up --build
```

---

## Configuration

### Backend `.env`

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key — enables trending & search |
| `YOUTUBE_CLIENT_ID` | Google OAuth client ID — enables YouTube uploads |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth client secret |
| `INSTAGRAM_APP_ID` | Instagram App ID — enables Instagram uploads |
| `INSTAGRAM_APP_SECRET` | Instagram App secret |

### Getting API Keys

1. **YouTube API Key**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → YouTube Data API v3
2. **YouTube OAuth**: Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web app)
3. **Instagram**: [Meta Developer Portal](https://developers.facebook.com) → New App → Instagram Graph API

---

## How Copyright-Safe Processing Works

1. Download video via yt-dlp (best quality MP4)
2. **Strip original audio** completely
3. Replace with selected royalty-free track from library
4. Crop to 9:16 aspect ratio (configurable position)
5. Apply visual effects (brightness, contrast, speed)
6. Overlay captions if enabled
7. Export as H.264/AAC MP4, max 60 seconds

> The processed video has no original audio, making it safe from content ID claims.

---

## Project Structure

```
├── backend/          # FastAPI + Python
│   ├── app/
│   │   ├── routers/  # API endpoints
│   │   └── services/ # Business logic
│   └── main.py
└── frontend/         # Next.js 14
    ├── app/          # Pages
    ├── components/   # UI components
    ├── hooks/        # React hooks
    └── lib/          # Utilities
```
