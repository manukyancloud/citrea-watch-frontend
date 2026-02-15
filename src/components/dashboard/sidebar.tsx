"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  HelpCircle,
  ExternalLink,
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
    external: false,
  },
  {
    title: "Documentation",
    href: "https://github.com/manukyancloud/citrea-watch-frontend",
    icon: HelpCircle,
    external: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [tps, setTps] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ??
          "https://explorer-stats.mainnet.citrea.xyz/api/v1/pages/main";
        const response = await fetch(apiUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error("Stats request failed");
        }
        const payload = (await response.json()) as {
          data?: {
            total_blocks?: { value?: number | string };
            yesterday_transactions?: { value?: number | string };
          };
          total_blocks?: { value?: number | string };
          yesterday_transactions?: { value?: number | string };
        };

        const dataRoot = payload.data ?? payload;
        const totalBlocksRaw = dataRoot.total_blocks?.value;
        const yesterdayTxsRaw = dataRoot.yesterday_transactions?.value;
        const totalBlocks =
          typeof totalBlocksRaw === "string"
            ? Number(totalBlocksRaw)
            : totalBlocksRaw;
        const yesterdayTxs =
          typeof yesterdayTxsRaw === "string"
            ? Number(yesterdayTxsRaw)
            : yesterdayTxsRaw;

        if (!isActive) return;

        setBlockHeight(
          typeof totalBlocks === "number" && Number.isFinite(totalBlocks)
            ? totalBlocks
            : null
        );
        if (typeof yesterdayTxs === "number" && Number.isFinite(yesterdayTxs)) {
          const tpsValue = yesterdayTxs / 86400;
          setTps(Number.isFinite(tpsValue) ? tpsValue : null);
        } else {
          setTps(null);
        }
      } catch {
        if (!isActive) return;
        setBlockHeight(null);
        setTps(null);
      }
    };

    loadStats();
    const interval = window.setInterval(loadStats, 30_000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-card border-r border-[rgba(239,143,54,0.15)] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-0 px-6 py-5 border-b border-[rgba(239,143,54,0.1)]">
        <div className="relative">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-transparent">
            <img
              src="/cw-logo.png"
              alt="Citrea"
              className="w-16 h-16 object-contain"
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
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 dark:hover:bg-[rgba(255,255,255,0.03)]"
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
      <div className="mx-3 mb-3 p-3 rounded-lg bg-muted/40 dark:bg-[rgba(255,255,255,0.02)] border border-[rgba(239,143,54,0.1)]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] live-pulse" />
          <span className="text-xs font-medium text-foreground">
            Network Status
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-muted-foreground">Block</span>
            <p className="font-mono text-foreground">
              {typeof blockHeight === "number"
                ? `#${blockHeight.toLocaleString()}`
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">TPS</span>
            <p className="font-mono text-foreground">
              {typeof tps === "number" ? tps.toFixed(2) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-[rgba(239,143,54,0.1)]">
        {bottomNavItems.map((item) => (
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.title}</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-gradient-to-r from-[rgba(239,143,54,0.15)] to-transparent border border-[rgba(239,143,54,0.2)] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 dark:hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-[#EF8F36]" : "")} />
              <span className="text-sm">{item.title}</span>
            </Link>
          )
        ))}
      </div>
    </aside>
  );
}
