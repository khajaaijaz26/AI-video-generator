"use client";
import VideoCard from "./VideoCard";
import { motion } from "framer-motion";

interface Props {
  videos: any[];
  loading: boolean;
}

export default function TrendingGrid({ videos, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-7 bg-muted rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <div className="text-4xl">🎬</div>
        <p className="font-medium">No videos found</p>
        <p className="text-sm">Configure your YouTube API key in backend .env to see trending videos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video, i) => (
        <VideoCard key={video.video_id} video={video} index={i} />
      ))}
    </div>
  );
}
