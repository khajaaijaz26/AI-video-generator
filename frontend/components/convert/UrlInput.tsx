"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, Youtube, ArrowRight } from "lucide-react";

interface Props {
  onAnalyze: (url: string) => Promise<void>;
}

const EXAMPLE_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/dQw4w9WgXcQ",
  "https://www.youtube.com/shorts/example",
];

export default function UrlInput({ onAnalyze }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidYouTube = (u: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(u);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url.trim()) { setError("Please enter a YouTube URL"); return; }
    if (!isValidYouTube(url)) { setError("Please enter a valid YouTube URL"); return; }
    setLoading(true);
    try {
      await onAnalyze(url.trim());
    } catch {
      setError("Failed to analyze video. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-500">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Paste YouTube URL</h2>
            <p className="text-sm text-muted-foreground">Supports full videos, Shorts, and playlists</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(""); }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
              disabled={loading}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing video...</>
            ) : (
              <><ArrowRight className="w-5 h-5" /> Analyze Video</>
            )}
          </motion.button>
        </form>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Copyright-Safe", desc: "Replace original audio with royalty-free music", emoji: "🛡️" },
          { title: "9:16 Format", desc: "Auto-crop to perfect vertical Shorts ratio", emoji: "📱" },
          { title: "One-Click Upload", desc: "Publish directly to YouTube & Instagram", emoji: "🚀" },
        ].map(f => (
          <div key={f.title} className="glass rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{f.emoji}</div>
            <p className="font-medium text-sm">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
