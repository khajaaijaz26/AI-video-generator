"use client";
import { motion } from "framer-motion";
import { Clock, Eye, User, Download, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Props {
  metadata: {
    title: string;
    description?: string;
    thumbnail?: string;
    channel?: string;
    duration?: number;
    view_count?: number;
    url: string;
  };
  onBack: () => void;
  onDownload: () => void;
}

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function VideoPreview({ metadata, onBack, onDownload }: Props) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="md:flex">
        {/* Thumbnail */}
        <div className="md:w-80 flex-shrink-0 relative bg-black">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-56 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-56 md:h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No thumbnail</p>
            </div>
          )}
          {/* 9:16 overlay indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-primary/70 rounded-lg w-24 h-44 opacity-70" title="9:16 crop area" />
          </div>
        </div>

        {/* Info */}
        <div className="p-6 flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-bold leading-tight">{metadata.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {metadata.channel && (
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{metadata.channel}</span>
              )}
              {metadata.duration && (
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatDuration(metadata.duration)}</span>
              )}
              {metadata.view_count && (
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{formatViews(metadata.view_count)} views</span>
              )}
            </div>
          </div>

          {metadata.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{metadata.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {metadata.duration && metadata.duration > 60 && (
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                Will be trimmed to 60s max
              </div>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-500 font-medium">
              Original audio will be replaced
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-medium text-sm"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
            >
              <Download className="w-4 h-4" /> Download & Edit
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
