"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function useTrending(category = "0", region = "US", maxResults = 20) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/api/trending?category=${category}&region=${region}&max_results=${maxResults}`)
      .then(r => setVideos(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, region, maxResults]);

  return { videos, loading, error };
}
