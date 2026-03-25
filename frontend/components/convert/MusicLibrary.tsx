"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Track {
  id: string;
  name: string;
  artist: string;
  genre: string;
  duration: number;
  preview_url: string;
}

interface Props {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

const GENRE_COLORS: Record<string, string> = {
  Pop: "bg-pink-500/20 text-pink-400",
  "Lo-Fi": "bg-blue-500/20 text-blue-400",
  Cinematic: "bg-orange-500/20 text-orange-400",
  Electronic: "bg-cyan-500/20 text-cyan-400",
  Acoustic: "bg-green-500/20 text-green-400",
  "Hip Hop": "bg-yellow-500/20 text-yellow-400",
};

export default function MusicLibrary({ selected, onSelect }: Props) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    api.get("/api/music/").then(r => setTracks(r.data)).catch(() => {});
  }, []);

  const handlePreview = (track: Track) => {
    if (playing === track.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`${backendUrl}${track.preview_url}`);
    audio.onended = () => setPlaying(null);
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlaying(track.id);
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/20">
            <Music className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="font-semibold">Royalty-Free Music</h3>
            <p className="text-xs text-muted-foreground">Replace original audio to avoid copyright claims</p>
          </div>
        </div>
        {selected && (
          <button onClick={() => onSelect(null)} className="text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tracks.map(track => (
          <motion.div
            key={track.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelect(selected === track.id ? null : track.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
              selected === track.id
                ? "border-primary bg-primary/10"
                : "border-transparent bg-muted/50 hover:border-border"
            }`}
          >
            <button
              onClick={e => { e.stopPropagation(); handlePreview(track); }}
              className="p-2 rounded-lg bg-background hover:bg-muted transition-colors shrink-0"
            >
              {playing === track.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{track.name}</p>
                {selected === track.id && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${GENRE_COLORS[track.genre] || "bg-muted text-muted-foreground"}`}>
              {track.genre}
            </span>
          </motion.div>
        ))}
      </div>

      {!selected && (
        <p className="text-xs text-muted-foreground text-center">
          No music selected — original audio will be muted
        </p>
      )}
    </div>
  );
}
