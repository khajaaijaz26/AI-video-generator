# AI Video Generator — YouTube Shorts & Instagram Reels

Transform full-length YouTube videos into copyright-safe Shorts and Reels with one click.

## Features

- **Paste & Convert** — Paste any YouTube URL and auto-convert to 9:16 vertical format
- **Copyright-Safe** — Strip original audio, add royalty-free music from built-in library
- **Smart Clip Editor** — Timeline scrubber, crop position, brightness/contrast/speed controls
- **Caption Editor** — Custom text overlays burned into the video
- **Upload to YouTube** — Publish directly to YouTube Shorts via OAuth
- **Upload to Instagram** — Publish directly to Instagram Reels via Graph API
- **Trending Discovery** — Browse trending YouTube videos by category and region
- **Dark/Light Theme** — Glassmorphism UI with purple → pink → orange gradients

---

## Run Locally (No API Keys Required for Core Features)

The core conversion pipeline (paste URL → download → convert → export) works **without any API keys**. API keys are only needed for uploading to YouTube/Instagram and for real trending data (falls back to demo data otherwise).

### Prerequisites

Install these on your machine before starting:

| Tool | Version | Install |
|---|---|---|
| **Python** | 3.11+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **FFmpeg** | Any recent | See below |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |

**Install FFmpeg:**

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt update && sudo apt install ffmpeg

# Windows — download from https://ffmpeg.org/download.html
# Then add the bin/ folder to your PATH
```

Verify it works:
```bash
ffmpeg -version
```

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/khajaaijaz26/AI-video-generator.git
cd AI-video-generator
```

---

### Step 2 — Start the Backend (FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend starts at **http://localhost:8000**

On first startup it will:
- Create the SQLite database (`app.db`)
- Create upload and static directories
- Generate 6 royalty-free music placeholder files using FFmpeg

You should see output like:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

> **Tip:** If you get `ModuleNotFoundError`, make sure you're using Python 3.11+.
> Check with: `python --version` or `python3 --version`

---

### Step 3 — Start the Frontend (Next.js)

Open a **new terminal**, then:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the dev server
npm run dev
```

The frontend starts at **http://localhost:3000**

---

### Step 4 — Open the app

Visit **http://localhost:3000** in your browser.

You should see the dashboard with the purple/pink gradient theme.

---

## How to Convert a Video

1. Click **Convert** in the sidebar
2. Paste any YouTube URL (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click **Analyze** — video metadata will appear
4. Click **Continue** — download starts in the background
5. Edit your clip: adjust trim, crop, effects, and pick a music track
6. Wait for the download indicator to show **"Ready to process"**
7. Click **Process Video →**
8. Watch the progress bar fill up (usually 30–90 seconds depending on video length)
9. When done, click **Download processed video** to save the MP4

---

## Optional: API Keys for More Features

### YouTube Data API (for real Trending data)

Without this, the Trending page shows demo/mock videos.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **YouTube Data API v3**
3. Create an **API Key** under Credentials
4. Add to `backend/.env`:
   ```
   YOUTUBE_API_KEY=AIza...your_key_here
   ```

### YouTube OAuth (for uploading Shorts)

1. Google Cloud Console → Credentials → **Create OAuth 2.0 Client ID** (Web application)
2. Add authorized redirect URI: `http://localhost:8000/api/auth/youtube/callback`
3. Add to `backend/.env`:
   ```
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_client_secret
   ```

### Instagram Graph API (for uploading Reels)

1. Go to [Meta Developer Portal](https://developers.facebook.com)
2. Create App → Add **Instagram Graph API** product
3. Add to `backend/.env`:
   ```
   INSTAGRAM_APP_ID=your_app_id
   INSTAGRAM_APP_SECRET=your_app_secret
   ```

After adding keys, restart the backend.

---

## Run with Docker (Optional)

Make sure Docker and Docker Compose are installed, then:

```bash
docker-compose up --build
```

This starts both backend (`:8000`) and frontend (`:3000`) in containers.

---

## Troubleshooting

**`ffmpeg: command not found`**
→ Install FFmpeg (see Prerequisites above). The backend needs it to generate music files and process videos.

**`pip install` fails on `yt-dlp` or `ffmpeg-python`**
→ Upgrade pip first: `pip install --upgrade pip`

**Frontend shows "Failed to analyze video"**
→ Make sure the backend is running on port 8000. Check `frontend/.env.local` has `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`.

**"Video is not ready" error when processing**
→ Wait for the "Ready to process" indicator in the Clip Editor before clicking Process Video.

**Trending page shows demo videos**
→ Add a `YOUTUBE_API_KEY` to `backend/.env` (see Optional section above).

**Port already in use**
→ Change the port: `uvicorn main:app --port 8001` (and update `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local` to match).

---

## Project Structure

```
AI-video-generator/
├── backend/                   # FastAPI + Python
│   ├── app/
│   │   ├── routers/           # API endpoints (videos, trending, upload, auth, music)
│   │   ├── services/          # Business logic (downloader, processor, youtube, instagram)
│   │   ├── models.py          # SQLAlchemy DB models
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── config.py          # Settings from .env
│   │   └── database.py        # Async SQLite setup
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt
│   └── .env                   # Your local config (not committed)
│
├── frontend/                  # Next.js 14
│   ├── app/                   # Pages (dashboard, convert, trending, uploads, settings)
│   ├── components/
│   │   ├── convert/           # UrlInput, ClipEditor, MusicLibrary, ExportPanel, ...
│   │   ├── layout/            # Sidebar, Header, ThemeToggle
│   │   └── trending/          # TrendingGrid, VideoCard
│   ├── lib/api.ts             # Axios client for backend
│   ├── package.json
│   └── .env.local             # Your local config (not committed)
│
├── docker-compose.yml
└── README.md
```

---

## How Copyright-Safe Processing Works

1. Download video via yt-dlp (best quality MP4)
2. **Strip original audio** completely — no original sound reaches the output
3. Replace with selected royalty-free track from the built-in library
4. Crop to 9:16 aspect ratio (configurable horizontal position)
5. Scale to 1080×1920 (standard Shorts/Reels resolution)
6. Apply visual effects (brightness, contrast, saturation, speed)
7. Burn in captions (custom text overlays you added in the editor)
8. Export as H.264/AAC MP4, max 60 seconds

> The processed video has zero original audio, making it safe from Content ID claims.
