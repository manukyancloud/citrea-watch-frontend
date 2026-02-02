"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { GlassCard } from "../glass-card";
import { PieChart as PieChartIcon } from "lucide-react";
import type { TokenTvlItem } from "@/lib/api";

const COLORS = [
  "#EF8F36",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
];

interface BreakdownItem {
  name: string;
  value: number;
  percent: number;
}

interface TVLBreakdownPieProps {
  tokens: TokenTvlItem[];
  totalTvlUsd: number | null;
}

const formatUsd = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function buildBreakdown(tokens: TokenTvlItem[], totalTvlUsd: number): BreakdownItem[] {
  const active = tokens
    .filter((token) => Number.isFinite(token.tvlUsd) && token.tvlUsd > 0)
    .sort((a, b) => b.tvlUsd - a.tvlUsd);

  const top = active.slice(0, 6);
  const others = active.slice(6);
  const otherValue = others.reduce((sum, token) => sum + token.tvlUsd, 0);

  const base = top.map((token) => ({
    name: token.symbol,
    value: token.tvlUsd,
    percent: (token.tvlUsd / totalTvlUsd) * 100,
  }));

  if (otherValue > 0) {
    base.push({
      name: "Others",
      value: otherValue,
      percent: (otherValue / totalTvlUsd) * 100,
    });
  }

  return base;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BreakdownItem }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 border border-[rgba(239,143,54,0.2)]">
      <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
      <p className="text-sm font-mono font-semibold text-foreground">
        {formatUsd(item.value)}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {item.percent.toFixed(2)}%
      </p>
    </div>
  );
}

export function TVLBreakdownPie({ tokens, totalTvlUsd }: TVLBreakdownPieProps) {
  if (!totalTvlUsd || !tokens.length) {
    return (
      <GlassCard
        title="TVL by Asset"
        icon={<PieChartIcon className="w-4 h-4" />}
        tooltip="Distribution of total TVL by asset."
      >
        <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
          TVL breakdown not available yet.
        </div>
      </GlassCard>
    );
  }

  const data = buildBreakdown(tokens, totalTvlUsd);

  return (
    <GlassCard
      title="TVL by Asset"
      icon={<PieChartIcon className="w-4 h-4" />}
      tooltip="Distribution of total TVL by asset."
    >
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {entry.name}
                </span>
              </div>
              <div className="text-xs text-foreground font-mono">
                {entry.percent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
