"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  duration: number;
  settings: {
    startTime: number;
    endTime: number;
    cropX: number;
    brightness: number;
    contrast: number;
    saturation: number;
    speed: number;
  };
  onChange: (s: Partial<Props["settings"]>) => void;
  jobId: string | null;
  onReady?: () => void;
}

const SliderRow = ({ label, value, min, max, step, onChange, format }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-primary">{format ? format(value) : value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full accent-purple-600"
    />
  </div>
);

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function ClipEditor({ duration, settings, onChange, jobId, onReady }: Props) {
  const [downloadStatus, setDownloadStatus] = useState<"running" | "done" | "error" | null>(null);
  const maxEnd = Math.min(duration, settings.startTime + 60);

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/videos/status/${jobId}`);
        const s = res.data.status;
        if (s === "done") {
          setDownloadStatus("done");
          onReady?.();
          clearInterval(interval);
        } else if (s === "error") {
          setDownloadStatus("error");
          clearInterval(interval);
        } else {
          setDownloadStatus("running");
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Scissors className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-semibold">Clip Editor</h3>
        </div>
        {downloadStatus === "running" && (
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
          </div>
        )}
        {downloadStatus === "done" && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle className="w-4 h-4" /> Ready to process
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Clip Selection (max 60s)</h4>
        <div className="bg-muted rounded-xl p-4 space-y-3">
          <SliderRow
            label="Start Time"
            value={settings.startTime}
            min={0}
            max={Math.max(0, duration - 5)}
            step={1}
            format={formatTime}
            onChange={(v: number) => onChange({ startTime: v, endTime: Math.min(v + 60, duration) })}
          />
          <SliderRow
            label="End Time"
            value={settings.endTime}
            min={settings.startTime + 5}
            max={maxEnd}
            step={1}
            format={formatTime}
            onChange={(v: number) => onChange({ endTime: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Duration: {formatTime(settings.endTime - settings.startTime)}</span>
            <span>Max: 60s for Shorts</span>
          </div>
        </div>
      </div>

      {/* Crop */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Crop Position (9:16)</h4>
        <div className="bg-muted rounded-xl p-4">
          <SliderRow
            label="Horizontal Position"
            value={settings.cropX}
            min={0}
            max={1}
            step={0.01}
            format={(v: number) => `${Math.round(v * 100)}%`}
            onChange={(v: number) => onChange({ cropX: v })}
          />
          <p className="text-xs text-muted-foreground mt-2">0% = left edge, 50% = center, 100% = right edge</p>
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Visual Effects</h4>
        <div className="bg-muted rounded-xl p-4 space-y-3">
          <SliderRow label="Brightness" value={settings.brightness} min={0.5} max={1.5} step={0.05}
            format={(v: number) => `${Math.round((v - 1) * 100) >= 0 ? "+" : ""}${Math.round((v - 1) * 100)}%`}
            onChange={(v: number) => onChange({ brightness: v })} />
          <SliderRow label="Contrast" value={settings.contrast} min={0.5} max={1.5} step={0.05}
            format={(v: number) => `${Math.round((v - 1) * 100) >= 0 ? "+" : ""}${Math.round((v - 1) * 100)}%`}
            onChange={(v: number) => onChange({ contrast: v })} />
          <SliderRow label="Saturation" value={settings.saturation} min={0} max={2} step={0.1}
            format={(v: number) => `${v.toFixed(1)}x`}
            onChange={(v: number) => onChange({ saturation: v })} />
          <SliderRow label="Speed" value={settings.speed} min={0.5} max={2} step={0.1}
            format={(v: number) => `${v.toFixed(1)}x`}
            onChange={(v: number) => onChange({ speed: v })} />
        </div>
      </div>
    </div>
  );
}
