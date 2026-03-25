import os
from app.config import settings
from app.schemas import MusicTrack
from typing import List, Optional

# Built-in royalty-free music catalog
TRACKS = [
    MusicTrack(id="upbeat-1", name="Upbeat Vibes", artist="Free Music Archive", genre="Pop", duration=120,
               file_path="", preview_url="/api/music/upbeat-1/stream"),
    MusicTrack(id="chill-1", name="Chill Lofi", artist="Lofi Beats", genre="Lo-Fi", duration=180,
               file_path="", preview_url="/api/music/chill-1/stream"),
    MusicTrack(id="epic-1", name="Epic Cinematic", artist="Cinematic Sounds", genre="Cinematic", duration=150,
               file_path="", preview_url="/api/music/epic-1/stream"),
    MusicTrack(id="dance-1", name="Dance Energy", artist="Electronic Vibes", genre="Electronic", duration=130,
               file_path="", preview_url="/api/music/dance-1/stream"),
    MusicTrack(id="acoustic-1", name="Acoustic Morning", artist="Guitar Moods", genre="Acoustic", duration=160,
               file_path="", preview_url="/api/music/acoustic-1/stream"),
    MusicTrack(id="hip-hop-1", name="Hip Hop Groove", artist="Beat Maker", genre="Hip Hop", duration=140,
               file_path="", preview_url="/api/music/hip-hop-1/stream"),
]


class MusicService:
    def __init__(self):
        self.music_dir = os.path.join(settings.static_dir, "music")
        self._resolve_paths()

    def _resolve_paths(self):
        for track in TRACKS:
            path = os.path.join(self.music_dir, f"{track.id}.mp3")
            track.file_path = path

    def get_tracks(self) -> List[MusicTrack]:
        tracks = []
        for track in TRACKS:
            t = track.model_copy()
            t.file_path = track.file_path
            tracks.append(t)
        return tracks

    def get_track(self, track_id: Optional[str]) -> Optional[MusicTrack]:
        if not track_id:
            return None
        for track in TRACKS:
            if track.id == track_id:
                return track
        return None
