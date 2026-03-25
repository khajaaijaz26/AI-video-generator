"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

type JobStatus = "queued" | "running" | "done" | "error";

interface Job {
  id: string;
  video_id: string;
  type: string;
  status: JobStatus;
  progress: number;
  error?: string;
}

export function useJobPoller(jobId: string | null, intervalMs = 2000) {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/videos/status/${jobId}`);
        setJob(res.data);
        if (res.data.status === "done" || res.data.status === "error") {
          clearInterval(interval);
        }
      } catch {}
    }, intervalMs);
    return () => clearInterval(interval);
  }, [jobId, intervalMs]);

  return job;
}

export function useVideoProcessor() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [downloadJobId, setDownloadJobId] = useState<string | null>(null);
  const [processJobId, setProcessJobId] = useState<string | null>(null);

  const downloadJob = useJobPoller(downloadJobId);
  const processJob = useJobPoller(processJobId);

  const download = useCallback(async (url: string) => {
    const res = await api.post("/api/videos/download", { url });
    setVideoId(res.data.video_id);
    setDownloadJobId(res.data.id);
    return res.data;
  }, []);

  const process = useCallback(async (settings: any) => {
    if (!videoId) throw new Error("No video to process");
    const res = await api.post("/api/videos/process", {
      video_id: videoId,
      ...settings,
    });
    setProcessJobId(res.data.id);
    return res.data;
  }, [videoId]);

  return {
    videoId,
    downloadJob,
    processJob,
    download,
    process,
    isDownloading: downloadJob?.status === "running",
    isProcessing: processJob?.status === "running",
    isReady: processJob?.status === "done",
  };
}
