"use client";
import { motion } from "framer-motion";
import { Video, TrendingUp, Upload, Zap, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-6 flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const QuickAction = ({ href, icon: Icon, title, description, gradient }: any) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-2xl p-6 cursor-pointer group hover:border-primary/50 transition-colors"
    >
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-lg mb-1 group-hover:gradient-text transition-all">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Get started <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ videos: 0, uploads: 0, trending: 0 });

  useEffect(() => {
    api.get("/api/videos/").then(r => {
      const videos = r.data || [];
      const done = videos.filter((v: any) => v.status === "done").length;
      setStats(s => ({ ...s, videos: done }));
    }).catch(() => {});

    api.get("/api/upload/history").then(r => {
      setStats(s => ({ ...s, uploads: (r.data || []).length }));
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden p-8 md:p-12"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(219,39,119,0.2) 50%, rgba(234,88,12,0.2) 100%)",
          border: "1px solid rgba(124,58,237,0.3)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              AI-Powered
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Transform Videos</span>
            <br />
            <span className="text-foreground">Into Viral Shorts</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mb-6">
            Paste any YouTube URL and instantly convert it to copyright-safe Shorts and Reels.
            Upload directly to YouTube and Instagram with one click.
          </p>
          <Link href="/convert">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
            >
              <Play className="w-5 h-5" />
              Start Converting
            </motion.button>
          </Link>
        </div>
        {/* Decorative */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 opacity-30">
          <div className="w-24 h-40 rounded-2xl bg-gradient-to-b from-purple-500 to-pink-500" />
          <div className="w-24 h-40 rounded-2xl bg-gradient-to-b from-pink-500 to-orange-500 mt-8" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Video} label="Videos Processed" value={stats.videos} color="bg-gradient-to-br from-purple-600 to-purple-400" />
        <StatCard icon={Upload} label="Total Uploads" value={stats.uploads} color="bg-gradient-to-br from-pink-600 to-pink-400" />
        <StatCard icon={TrendingUp} label="Trending Saved" value={stats.trending} color="bg-gradient-to-br from-orange-600 to-orange-400" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/convert"
            icon={Zap}
            title="Convert Video"
            description="Paste a YouTube URL and convert to Shorts format instantly"
            gradient="bg-gradient-to-br from-purple-600 to-purple-400"
          />
          <QuickAction
            href="/trending"
            icon={TrendingUp}
            title="Trending Videos"
            description="Discover what's trending and get inspired for your next Short"
            gradient="bg-gradient-to-br from-pink-600 to-pink-400"
          />
          <QuickAction
            href="/uploads"
            icon={Upload}
            title="Upload History"
            description="View all your processed videos and upload status"
            gradient="bg-gradient-to-br from-orange-600 to-orange-400"
          />
        </div>
      </div>
    </div>
  );
}
