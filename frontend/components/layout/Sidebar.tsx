"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Zap, TrendingUp, Upload, Settings, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/convert", icon: Zap, label: "Convert" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/uploads", icon: Upload, label: "My Videos" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:flex flex-col h-full glass border-r border-border">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">AI Video</p>
          <p className="text-xs text-muted-foreground">Generator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                style={active ? { background: "linear-gradient(135deg, #7c3aed, #db2777)" } : {}}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <p className="text-xs font-medium text-primary mb-1">Pro Tip</p>
        <p className="text-xs text-muted-foreground">Use royalty-free music to make your Shorts copyright-safe!</p>
      </div>
    </aside>
  );
}
