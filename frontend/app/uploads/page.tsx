"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Upload, CheckCircle, XCircle, Clock, ExternalLink, Youtube, Instagram } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; icon: any; label: string }> = {
    done: { color: "text-green-500 bg-green-500/10", icon: CheckCircle, label: "Published" },
    uploading: { color: "text-yellow-500 bg-yellow-500/10", icon: Clock, label: "Uploading" },
    error: { color: "text-red-500 bg-red-500/10", icon: XCircle, label: "Failed" },
  };
  const cfg = map[status] || map.error;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

export default function UploadsPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"uploads" | "videos">("videos");

  useEffect(() => {
    Promise.all([
      api.get("/api/upload/history").then(r => setUploads(r.data)),
      api.get("/api/videos/").then(r => setVideos(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">My Videos</h1>
        <p className="text-muted-foreground mt-1">Manage your processed videos and upload history</p>
      </div>

      <div className="flex gap-2">
        {[{ key: "videos", label: "Processed Videos" }, { key: "uploads", label: "Upload History" }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading...</div>
      ) : tab === "videos" ? (
        <div className="space-y-3">
          {videos.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No videos yet. Go convert some!</p>
            </div>
          ) : (
            videos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                {v.thumbnail && (
                  <img src={v.thumbnail} alt={v.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{v.title || "Untitled"}</p>
                  <p className="text-sm text-muted-foreground truncate">{v.source_url}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.created_at && formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge status={v.status} />
                {v.output_path && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${v.output_path.split("/").pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No uploads yet.</p>
            </div>
          ) : (
            uploads.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className={`p-2 rounded-lg ${u.platform === "youtube" ? "bg-red-500/10" : "bg-purple-500/10"}`}>
                  {u.platform === "youtube"
                    ? <Youtube className="w-5 h-5 text-red-500" />
                    : <Instagram className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.title || "Untitled"}</p>
                  <p className="text-sm text-muted-foreground capitalize">{u.platform}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {u.uploaded_at && formatDistanceToNow(new Date(u.uploaded_at), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge status={u.status} />
                {u.platform_url && (
                  <a href={u.platform_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
