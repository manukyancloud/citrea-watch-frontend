"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Database,
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
    description: "Main dashboard with key metrics",
  },
  {
    title: "Bridge & Fees",
    href: "/bridge",
    icon: ArrowLeftRight,
    description: "Bridge analytics and fee metrics",
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-card border-r border-[rgba(239,143,54,0.15)] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(239,143,54,0.1)]">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent">
            <img
              src="/citrea-logo.png"
              alt="Citrea"
              className="w-10 h-10"
            />
          </div>
        </div>
        <div>
          <h1 className="font-semibold text-foreground tracking-tight">
            Citrea Network
          </h1>
          <p className="text-xs text-muted-foreground font-mono">Analytics</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dashboard
          </span>
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-[rgba(239,143,54,0.15)] to-transparent border border-[rgba(239,143,54,0.2)] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-[#EF8F36]"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="text-sm font-medium">{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#EF8F36] live-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Network Status */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(239,143,54,0.1)]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] live-pulse" />
          <span className="text-xs font-medium text-foreground">
            Network Status
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-muted-foreground">Block</span>
            <p className="font-mono text-foreground">#4,892,341</p>
          </div>
          <div>
            <span className="text-muted-foreground">TPS</span>
            <p className="font-mono text-foreground">1,247</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-[rgba(239,143,54,0.1)]">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors"
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.title}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
