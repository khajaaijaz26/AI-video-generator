"use client";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, LayoutDashboard, Zap, TrendingUp, Upload, Settings } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/convert": "Convert to Shorts",
  "/trending": "Trending Videos",
  "/uploads": "My Videos",
  "/settings": "Settings",
};

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/convert", icon: Zap, label: "Convert" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/uploads", icon: Upload, label: "My Videos" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border glass">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{PAGE_TITLES[pathname] || "AI Video Generator"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-border px-3 py-2 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
