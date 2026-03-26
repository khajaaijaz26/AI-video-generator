"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UrlInput from "@/components/convert/UrlInput";
import VideoPreview from "@/components/convert/VideoPreview";
import ClipEditor from "@/components/convert/ClipEditor";
import CaptionEditor from "@/components/convert/CaptionEditor";
import MusicLibrary from "@/components/convert/MusicLibrary";
import ExportPanel from "@/components/convert/ExportPanel";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type Step = "input" | "preview" | "edit" | "export";

export default function ConvertPage() {
  const [step, setStep] = useState<Step>("input");
  const [metadata, setMetadata] = useState<any>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processedJobId, setProcessedJobId] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [editSettings, setEditSettings] = useState({
    startTime: 0,
    endTime: 60,
    musicId: null as string | null,
    captions: [] as any[],
    cropX: 0.5,
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    speed: 1.0,
    addCaptions: true,
    titleOverlay: "",
  });

  const handleAnalyze = async (url: string) => {
    try {
      const res = await api.post("/api/videos/analyze", { url });
      setMetadata({ ...res.data, url });
      setStep("preview");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to analyze video");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.post("/api/videos/download", { url: metadata.url });
      setJobId(res.data.id);
      setVideoId(res.data.video_id);
      toast.success("Download started!");
      setStep("edit");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Download failed");
    }
  };

  const handleProcess = async () => {
    if (!videoId) return;
    try {
      const res = await api.post("/api/videos/process", {
        video_id: videoId,
        start_time: editSettings.startTime,
        end_time: editSettings.endTime,
        music_id: editSettings.musicId,
        captions: editSettings.captions,
        crop_x: editSettings.cropX,
        brightness: editSettings.brightness,
        contrast: editSettings.contrast,
        saturation: editSettings.saturation,
        speed: editSettings.speed,
        add_captions: editSettings.addCaptions,
        title_overlay: editSettings.titleOverlay,
      });
      setProcessedJobId(res.data.id);
      toast.success("Processing started!");
      setStep("export");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Processing failed");
    }
  };

  const steps = [
    { id: "input", label: "1. URL" },
    { id: "preview", label: "2. Preview" },
    { id: "edit", label: "3. Edit" },
    { id: "export", label: "4. Export" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Convert to Shorts</h1>
        <p className="text-muted-foreground mt-1">Transform YouTube videos into copyright-safe Shorts & Reels</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                step === s.id
                  ? "bg-primary text-primary-foreground"
                  : steps.findIndex(x => x.id === step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <UrlInput onAnalyze={handleAnalyze} />
          </motion.div>
        )}
        {step === "preview" && metadata && (
          <motion.div key="preview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <VideoPreview
              metadata={metadata}
              onBack={() => setStep("input")}
              onDownload={handleDownload}
            />
          </motion.div>
        )}
        {step === "edit" && (
          <motion.div key="edit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <ClipEditor
              duration={metadata?.duration || 300}
              settings={editSettings}
              onChange={s => setEditSettings(prev => ({ ...prev, ...s }))}
              jobId={jobId}
              onReady={() => setDownloadReady(true)}
            />
            <MusicLibrary
              selected={editSettings.musicId}
              onSelect={id => setEditSettings(prev => ({ ...prev, musicId: id }))}
            />
            <CaptionEditor
              captions={editSettings.captions}
              onChange={c => setEditSettings(prev => ({ ...prev, captions: c }))}
              addCaptions={editSettings.addCaptions}
              onToggle={v => setEditSettings(prev => ({ ...prev, addCaptions: v }))}
            />
            <div className="flex justify-end">
              <motion.button
                whileHover={downloadReady ? { scale: 1.02 } : {}}
                whileTap={downloadReady ? { scale: 0.98 } : {}}
                onClick={handleProcess}
                disabled={!downloadReady}
                className="px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
              >
                {downloadReady ? "Process Video →" : "Waiting for download..."}
              </motion.button>
            </div>
          </motion.div>
        )}
        {step === "export" && videoId && (
          <motion.div key="export" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <ExportPanel videoId={videoId} jobId={processedJobId} metadata={metadata} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
