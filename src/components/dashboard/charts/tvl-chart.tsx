"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "../glass-card";
import { TrendingUp } from "lucide-react";

interface TvlPoint {
  timestamp: number;
  totalTvlUsd: number;
}

const formatValue = (value: number) => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  }
  return `$${value.toLocaleString()}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-[rgba(239,143,54,0.2)]">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-semibold text-foreground">
          {formatValue(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function TVLChart({
  currentTvl,
  history,
}: {
  currentTvl?: number | null;
  history?: TvlPoint[];
}) {
  const [period, setPeriod] = useState<"24H" | "7D" | "30D" | "ALL">("ALL");

  const filteredHistory = useMemo(() => {
    const points = history ?? [];
    if (!points.length || period === "ALL") {
      return points;
    }
    const now = Date.now();
    const hours = period === "24H" ? 24 : period === "7D" ? 24 * 7 : 24 * 30;
    const cutoff = (now - hours * 60 * 60 * 1000) / 1000;
    return points.filter((point) => point.timestamp >= cutoff);
  }, [history, period]);

  const historyData = filteredHistory.map((point) => ({
    date: new Date(point.timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
    }),
    tvl: point.totalTvlUsd,
  }));

  const fallbackData = currentTvl
    ? [
      { date: "Now", tvl: currentTvl },
      { date: "Now", tvl: currentTvl },
    ]
    : [];

  const chartData = historyData.length ? historyData : fallbackData;
  return (
    <GlassCard
      title="Total Value Locked"
      icon={<TrendingUp className="w-4 h-4" />}
      tooltip="Aggregate USD value of all tracked assets on Citrea.\nIncludes Native cBTC, Bridged BTC (syBTC, WBTC.e), and Stablecoins (JUSD, ctUSD, USDC.e, USDT.e).\nNote: Wrapped cBTC (wBTC) supply is excluded to prevent double-counting native cBTC."
      headerAction={
        <div className="flex items-center gap-2">
          {["24H", "7D", "30D", "ALL"].map((periodOption) => (
            <button
              key={periodOption}
              type="button"
              onClick={() => setPeriod(periodOption as typeof period)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${periodOption === period
                  ? "bg-[rgba(239,143,54,0.15)] text-[#EF8F36] border border-[rgba(239,143,54,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {periodOption}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-[300px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF8F36" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#EB582A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#EB582A" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(239, 143, 54, 0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={formatValue}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke="#EF8F36"
              strokeWidth={2}
              fill="url(#tvlGradient)"
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
