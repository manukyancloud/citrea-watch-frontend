"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "./glass-card";
import { LiveIndicator } from "./live-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Activity, Clock, Blocks, Coins, DollarSign } from "lucide-react";

interface NetworkStatsProps {
  cbtcSupply?: number | null;
  stablecoinSupplyUsd?: number | null;
  tps?: number | null;
  averageBlockTimeSec?: number | null;
  blockHeight?: number | null;
}

export function NetworkStats({
  cbtcSupply,
  stablecoinSupplyUsd,
  tps,
  averageBlockTimeSec,
  blockHeight,
}: NetworkStatsProps) {
  const [liveBlockHeight, setLiveBlockHeight] = useState<number | null>(null);
  const [liveTps, setLiveTps] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadLiveStats = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ??
          "https://explorer-stats.mainnet.citrea.xyz/api/v1/pages/main";
        if (!process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL) {
          console.warn("NEXT_PUBLIC_BLOCKSCOUT_API_URL is not set");
        }
        const response = await fetch(
          apiUrl,
          { method: "GET" }
        );
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

        setLiveBlockHeight(
          typeof totalBlocks === "number" && Number.isFinite(totalBlocks)
            ? totalBlocks
            : null
        );

        if (typeof yesterdayTxs === "number" && Number.isFinite(yesterdayTxs)) {
          const tpsValue = yesterdayTxs / 86400;
          setLiveTps(Number.isFinite(tpsValue) ? tpsValue : null);
        } else {
          setLiveTps(null);
        }
      } catch (error) {
        console.error("Network stats fetch failed", error);
        if (!isActive) return;
        setLiveBlockHeight(null);
        setLiveTps(null);
      }
    };

    loadLiveStats();
    const interval = window.setInterval(loadLiveStats, 30_000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  const networkStats = [
    {
      label: "cBTC (CLEMENTINE)",
      value:
        typeof cbtcSupply === "number"
          ? cbtcSupply.toLocaleString(undefined, { maximumFractionDigits: 6 })
          : "—",
      unit: "cBTC",
      icon: <img src="/cbtc.svg" alt="cBTC" className="w-4 h-4" />,
      isLive: true,
      tooltip:
        "Total Native Bitcoin minted via Clementine Bridge (Net Deposits).\nThis supply is distributed across user wallets, smart contracts and protocol system vaults (Fees & Failed Deposits).",
    },
    {
      label: "Stablecoin Supply",
      value:
        typeof stablecoinSupplyUsd === "number"
          ? `$${stablecoinSupplyUsd.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`
          : "—",
      unit: "",
      icon: <img src="/ctusd.svg" alt="ctUSD" className="w-4 h-4" />,
      isLive: false,
      tooltip:
        "Total circulating supply of USD-pegged assets on Citrea Mainnet.\nComposed of JUSD, ctUSD, USDC.e, USDT.e etc.",
    },
    {
      label: "TPS",
      value:
        typeof liveTps === "number"
          ? liveTps.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : typeof tps === "number"
            ? tps.toLocaleString(undefined, { maximumFractionDigits: 3 })
            : "—",
      unit: "tx/s",
      icon: <Activity className="w-4 h-4 text-[#EF8F36]" />,
      isLive: typeof liveTps === "number",
      tooltip: "Average transactions per second over the last 24 hours or today's throughput.",
    },
    {
      label: "Block Time (Avg)",
      value:
        typeof averageBlockTimeSec === "number"
          ? averageBlockTimeSec.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
          : "—",
      unit: "sec",
      icon: <Clock className="w-4 h-4 text-[#EF8F36]" />,
      isLive: false,
      tooltip: "Average block time over the recent window.",
    },
    {
      label: "Block Height",
      value:
        typeof liveBlockHeight === "number"
          ? liveBlockHeight.toLocaleString()
          : typeof blockHeight === "number"
            ? blockHeight.toLocaleString()
            : "—",
      unit: "",
      icon: <Blocks className="w-4 h-4 text-[#EF8F36]" />,
      isLive: typeof liveBlockHeight === "number",
      tooltip: "Current block height on the network.",
    },
  ];
  return (
    <GlassCard
      title="Network Statistics"
      icon={<Activity className="w-4 h-4" />}
      tooltip="Network health and performance metrics for Citrea Network"
      headerAction={<LiveIndicator status="online" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {networkStats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-muted/30 dark:bg-[rgba(255,255,255,0.02)] border border-[rgba(239,143,54,0.05)] hover:border-[rgba(239,143,54,0.15)] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span
                  className={`text-[10px] text-muted-foreground tracking-wider ${stat.label.startsWith("cBTC") ? "" : "uppercase"
                    }`}
                >
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {stat.isLive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] live-pulse" />
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-[#EF8F36] cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground whitespace-pre-line text-left text-pretty"
                    >
                      <p>{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-semibold text-foreground">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-muted-foreground">{stat.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
