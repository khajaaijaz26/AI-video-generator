"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Youtube, Instagram, Download, CheckCircle, Loader2, ExternalLink } from "lucide-react";

interface Props {
  videoId: string;
  jobId: string | null;
  metadata: any;
}

export default function ExportPanel({ videoId, jobId, metadata }: Props) {
  const [processStatus, setProcessStatus] = useState<"queued" | "running" | "done" | "error">("queued");
  const [progress, setProgress] = useState(0);
  const [ytTitle, setYtTitle] = useState(metadata?.title ? `${metadata.title} #Shorts` : "My Short #Shorts");
  const [ytDesc, setYtDesc] = useState("");
  const [igCaption, setIgCaption] = useState("");
  const [ytUploadId, setYtUploadId] = useState<string | null>(null);
  const [igUploadId, setIgUploadId] = useState<string | null>(null);
  const [ytStatus, setYtStatus] = useState<string | null>(null);
  const [igStatus, setIgStatus] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/videos/status/${jobId}`);
        const { status, progress: p } = res.data;
        setProcessStatus(status);
        setProgress(p || 0);
        if (status === "done" || status === "error") clearInterval(interval);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (!ytUploadId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/upload/history`);
        const upload = res.data.find((u: any) => u.id === ytUploadId);
        if (upload) {
          setYtStatus(upload.status);
          if (upload.status === "done" || upload.status === "error") clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [ytUploadId]);

  useEffect(() => {
    if (!igUploadId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/upload/history`);
        const upload = res.data.find((u: any) => u.id === igUploadId);
        if (upload) {
          setIgStatus(upload.status);
          if (upload.status === "done" || upload.status === "error") clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [igUploadId]);

  const uploadYouTube = async () => {
    try {
      const res = await api.post("/api/upload/youtube", {
        video_id: videoId,
        title: ytTitle,
        description: ytDesc,
        tags: ["Shorts", "YouTubeShorts"],
        privacy: "public",
      });
      setYtUploadId(res.data.id);
      setYtStatus("uploading");
      toast.success("YouTube upload started!");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Upload failed. Connect YouTube in Settings first.");
    }
  };

  const uploadInstagram = async () => {
    try {
      const res = await api.post("/api/upload/instagram", {
        video_id: videoId,
        caption: igCaption,
      });
      setIgUploadId(res.data.id);
      setIgStatus("uploading");
      toast.success("Instagram upload started!");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Upload failed. Connect Instagram in Settings first.");
    }
  };

  const StatusIcon = ({ status }: { status: string | null }) => {
    if (status === "done") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "uploading") return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
    if (status === "error") return <span className="text-xs text-destructive">Failed</span>;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Processing Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {processStatus === "queued" && "Waiting in queue..."}
              {processStatus === "running" && "Processing video..."}
              {processStatus === "done" && "Video ready!"}
              {processStatus === "error" && "Processing failed"}
            </span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #db2777)" }}
              initial={{ width: 0 }}
              animate={{ width: `${processStatus === "done" ? 100 : progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {processStatus === "done" && (
          <a
            href={`${backendUrl}/api/videos/${videoId}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Download className="w-4 h-4" /> Download processed video
          </a>
        )}
      </div>

      {/* YouTube Upload */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-semibold">Upload to YouTube Shorts</h3>
          {ytStatus && <StatusIcon status={ytStatus} />}
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={ytTitle}
            onChange={e => setYtTitle(e.target.value)}
            placeholder="Video title..."
            className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
          />
          <textarea
            value={ytDesc}
            onChange={e => setYtDesc(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm resize-none"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={uploadYouTube}
            disabled={processStatus !== "done" || ytStatus === "uploading" || ytStatus === "done"}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}
          >
            <Youtube className="w-4 h-4" />
            {ytStatus === "done" ? "Uploaded!" : ytStatus === "uploading" ? "Uploading..." : "Upload to YouTube"}
          </motion.button>
        </div>
      </div>

      {/* Instagram Upload */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Instagram className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="font-semibold">Upload to Instagram Reels</h3>
          {igStatus && <StatusIcon status={igStatus} />}
        </div>
        <div className="space-y-3">
          <textarea
            value={igCaption}
            onChange={e => setIgCaption(e.target.value)}
            placeholder="Caption & hashtags..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm resize-none"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={uploadInstagram}
            disabled={processStatus !== "done" || igStatus === "uploading" || igStatus === "done"}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777, #ea580c)" }}
          >
            <Instagram className="w-4 h-4" />
            {igStatus === "done" ? "Uploaded!" : igStatus === "uploading" ? "Uploading..." : "Upload to Instagram"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
