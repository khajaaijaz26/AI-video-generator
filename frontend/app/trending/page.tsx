"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TrendingGrid from "@/components/trending/TrendingGrid";
import { api } from "@/lib/api";
import { Search, RefreshCw } from "lucide-react";

const CATEGORIES = [
  { id: "0", name: "All" },
  { id: "10", name: "Music" },
  { id: "20", name: "Gaming" },
  { id: "25", name: "News" },
  { id: "17", name: "Sports" },
  { id: "28", name: "Tech" },
  { id: "24", name: "Entertainment" },
  { id: "23", name: "Comedy" },
];

const REGIONS = [
  { code: "US", name: "US" },
  { code: "GB", name: "UK" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
];

export default function TrendingPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("0");
  const [region, setRegion] = useState("US");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/trending?category=${category}&region=${region}&max_results=20`);
      setVideos(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTrending();
  }, [category, region]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/api/trending/suggestions?query=${encodeURIComponent(query)}&max_results=12`);
      setSearchResults(res.data);
    } catch {}
    setIsSearching(false);
  };

  const displayVideos = searchResults.length > 0 ? searchResults : videos;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Trending Videos</h1>
        <p className="text-muted-foreground mt-1">Discover what's viral and convert it to a Short</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search YouTube videos..."
          className="w-full pl-12 pr-32 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
        >
          {isSearching ? "..." : "Search"}
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSearchResults([]); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                category === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={region}
            onChange={e => { setRegion(e.target.value); setSearchResults([]); }}
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary"
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setSearchResults([]); fetchTrending(); }}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Search results for "{query}"</span>
          <button onClick={() => setSearchResults([])} className="text-xs text-primary hover:underline">Clear</button>
        </div>
      )}

      <TrendingGrid videos={displayVideos} loading={loading} />
    </div>
  );
}
