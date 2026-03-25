"use client";
import { motion } from "framer-motion";
import { Eye, Clock, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Video {
  video_id: string;
  title: string;
  channel: string;
  thumbnail: string;
  view_count?: number;
  like_count?: number;
  duration?: string;
  published_at?: string;
  url: string;
}

function formatViews(n?: number) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

function parseISO8601(d?: string) {
  if (!d) return null;
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const s = parseInt(m[3] || "0");
  const total = h * 3600 + min * 60 + s;
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

export default function VideoCard({ video, index }: { video: Video; index: number }) {
  const router = useRouter();
  const duration = parseISO8601(video.duration);
  const views = formatViews(video.view_count);

  const handleConvert = () => {
    router.push(`/convert?url=${encodeURIComponent(video.url)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl overflow-hidden group hover:border-primary/50 transition-all border border-transparent"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => (e.currentTarget.style.display = "none")}
        />
        {duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-mono flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> {duration}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleConvert}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            <Zap className="w-4 h-4" /> Convert
          </motion.button>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium line-clamp-2 leading-tight">{video.title}</p>
        <p className="text-xs text-muted-foreground truncate">{video.channel}</p>
        {views && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" /> {views}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConvert}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-white mt-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
        >
          <Zap className="w-3.5 h-3.5" /> Convert to Short
        </motion.button>
      </div>
    </motion.div>
  );
}
