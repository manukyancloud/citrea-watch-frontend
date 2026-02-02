"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { GlassCard } from "../glass-card";
import { ArrowLeftRight } from "lucide-react";

const sampleBridgeData = [
  { date: "Mon", inflow: 45, outflow: -28 },
  { date: "Tue", inflow: 52, outflow: -35 },
  { date: "Wed", inflow: 38, outflow: -42 },
  { date: "Thu", inflow: 65, outflow: -31 },
  { date: "Fri", inflow: 48, outflow: -38 },
  { date: "Sat", inflow: 72, outflow: -25 },
  { date: "Sun", inflow: 58, outflow: -45 },
];

interface BridgeFlowDataPoint {
  date: string;
  inflow: number;
  outflow: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-[rgba(239,143,54,0.2)]">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: entry.dataKey === "inflow" ? "#22c55e" : "#ef4444",
              }}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {entry.dataKey}:
            </span>
            <span className="text-sm font-mono font-semibold text-foreground">
              {Math.abs(entry.value)} BTC
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

interface BridgeFlowChartProps {
  data?: BridgeFlowDataPoint[];
  isPlaceholder?: boolean;
}

export function BridgeFlowChart({ data, isPlaceholder }: BridgeFlowChartProps) {
  if (isPlaceholder) {
    return (
      <GlassCard
        title="Bridge Inflow/Outflow"
        icon={<ArrowLeftRight className="w-4 h-4" />}
        tooltip="Daily bridge activity showing Bitcoin deposits (inflow) and withdrawals (outflow) through the Citrea trustless bridge."
      >
        <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
          Bridge flow data not available yet.
        </div>
      </GlassCard>
    );
  }

  const bridgeData = data ?? sampleBridgeData;

  return (
    <GlassCard
      title="Bridge Inflow/Outflow"
      icon={<ArrowLeftRight className="w-4 h-4" />}
      tooltip="Daily bridge activity showing Bitcoin deposits (inflow) and withdrawals (outflow) through the Citrea trustless bridge."
      headerAction={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-xs text-muted-foreground">Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-xs text-muted-foreground">Outflow</span>
          </div>
        </div>
      }
    >
      <div className="h-[300px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={bridgeData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            stackOffset="sign"
          >
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
              tickFormatter={(value) => `${Math.abs(value)}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="#ef4444" radius={[0, 0, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
