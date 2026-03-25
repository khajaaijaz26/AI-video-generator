"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Youtube, Instagram, CheckCircle, Link2, Unlink, Key, ExternalLink } from "lucide-react";

const PlatformCard = ({ platform, icon: Icon, color, connected, channelName, onConnect, onDisconnect }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-6 space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">{platform}</h3>
          {connected && channelName && (
            <p className="text-sm text-muted-foreground">@{channelName}</p>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        connected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
      }`}>
        {connected ? <><CheckCircle className="w-3.5 h-3.5" /> Connected</> : "Not connected"}
      </div>
    </div>
    {connected ? (
      <button
        onClick={onDisconnect}
        className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
      >
        <Unlink className="w-4 h-4" />
        Disconnect
      </button>
    ) : (
      <button
        onClick={onConnect}
        className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl text-white text-sm font-medium"
        style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
      >
        <Link2 className="w-4 h-4" />
        Connect {platform}
      </button>
    )}
  </motion.div>
);

export default function SettingsPage() {
  const [status, setStatus] = useState({ youtube_connected: false, instagram_connected: false });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/api/auth/status");
      setStatus(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const connectYouTube = async () => {
    try {
      const res = await api.get("/api/auth/youtube/url");
      window.open(res.data.url, "_blank");
      toast("Complete the OAuth flow in the new tab, then refresh this page.", { icon: "ℹ️" });
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to get OAuth URL. Configure YOUTUBE_CLIENT_ID in backend .env");
    }
  };

  const disconnectYouTube = async () => {
    await api.delete("/api/auth/youtube/disconnect");
    toast.success("YouTube disconnected");
    fetchStatus();
  };

  const connectInstagram = async () => {
    try {
      const res = await api.get("/api/auth/instagram/url");
      window.open(res.data.url, "_blank");
      toast("Complete the OAuth flow in the new tab, then refresh this page.", { icon: "ℹ️" });
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to get OAuth URL. Configure INSTAGRAM_APP_ID in backend .env");
    }
  };

  const disconnectInstagram = async () => {
    await api.delete("/api/auth/instagram/disconnect");
    toast.success("Instagram disconnected");
    fetchStatus();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Connect your accounts and configure API keys</p>
      </div>

      {/* Platform Connections */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Platform Connections
        </h2>
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="grid gap-4">
            <PlatformCard
              platform="YouTube"
              icon={Youtube}
              color="bg-red-500"
              connected={status.youtube_connected}
              onConnect={connectYouTube}
              onDisconnect={disconnectYouTube}
            />
            <PlatformCard
              platform="Instagram"
              icon={Instagram}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              connected={status.instagram_connected}
              onConnect={connectInstagram}
              onDisconnect={disconnectInstagram}
            />
          </div>
        )}
      </section>

      {/* API Configuration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          API Configuration
        </h2>
        <div className="glass rounded-2xl p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Configure your API keys in the backend <code className="bg-muted px-1 rounded text-xs">.env</code> file.
          </p>
          <div className="space-y-2 text-sm">
            {[
              { key: "YOUTUBE_API_KEY", desc: "YouTube Data API v3 — for trending & search" },
              { key: "YOUTUBE_CLIENT_ID / SECRET", desc: "YouTube OAuth — for uploading Shorts" },
              { key: "INSTAGRAM_APP_ID / SECRET", desc: "Instagram Graph API — for uploading Reels" },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <code className="text-primary font-mono text-xs shrink-0">{item.key}</code>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
          >
            Google Cloud Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
