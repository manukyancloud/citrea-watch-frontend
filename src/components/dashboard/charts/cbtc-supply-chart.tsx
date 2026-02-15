"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "../glass-card";
import { Database } from "lucide-react";

interface CbtcPoint {
  timestamp: number;
  cbtcSupply: number;
}

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
          {payload[0].value.toLocaleString()} cBTC
        </p>
      </div>
    );
  }
  return null;
}

export function CBTCSupplyChart({
  currentSupply,
  history,
}: {
  currentSupply?: number | null;
  history?: CbtcPoint[];
}) {
  const historyData = (history ?? []).map((point) => ({
    date: new Date(point.timestamp).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
    }),
    supply: point.cbtcSupply,
  }));

  const fallbackData = typeof currentSupply === "number"
    ? [
      { date: "Now", supply: currentSupply },
      { date: "Now", supply: currentSupply },
    ]
    : [];

  const chartData = historyData.length ? historyData : fallbackData;
  return (
    <GlassCard
      title="cBTC Supply Over Time"
      icon={<Database className="w-4 h-4" />}
      tooltip="cBTC supply is calculated via Bridge Events: (Deposits + FailedDeposits - Withdrawals). This represents total native cBTC minted on Citrea; vault balances are part of the distribution, not added to supply."
      headerAction={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#EF8F36]" />
            <span className="text-xs text-muted-foreground">Supply</span>
          </div>
        </div>
      }
    >
      <div className="h-[250px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <filter id="lineglow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
              tickFormatter={(value) => `${value.toLocaleString()}`}
              dx={-10}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="supply"
              stroke="#EF8F36"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#EF8F36",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
