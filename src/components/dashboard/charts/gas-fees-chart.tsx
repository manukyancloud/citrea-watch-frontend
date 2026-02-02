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
import { Fuel } from "lucide-react";

const sampleGasData = [
  { time: "00:00", baseFee: 12, l1Fee: 8, priorityFee: 2 },
  { time: "04:00", baseFee: 8, l1Fee: 6, priorityFee: 1 },
  { time: "08:00", baseFee: 18, l1Fee: 10, priorityFee: 4 },
  { time: "12:00", baseFee: 25, l1Fee: 12, priorityFee: 5 },
  { time: "16:00", baseFee: 22, l1Fee: 11, priorityFee: 4 },
  { time: "20:00", baseFee: 15, l1Fee: 9, priorityFee: 3 },
  { time: "24:00", baseFee: 10, l1Fee: 7, priorityFee: 2 },
];

interface GasDataPoint {
  time: string;
  baseFee: number;
  l1Fee: number;
  priorityFee: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
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
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {entry.dataKey.replace("Fee", " Fee")}:
            </span>
            <span className="text-sm font-mono font-semibold text-foreground">
              {entry.value} gwei
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

interface GasFeesChartProps {
  data?: GasDataPoint[];
  isPlaceholder?: boolean;
}

export function GasFeesChart({ data, isPlaceholder }: GasFeesChartProps) {
  if (isPlaceholder) {
    return (
      <GlassCard
        title="Gas Fees Over Time"
        icon={<Fuel className="w-4 h-4" />}
        tooltip="24-hour gas fee trends broken down by type. Total fee = Base Fee + L1 Fee + Priority Fee."
        headerAction={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-xs text-muted-foreground">Base</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-xs text-muted-foreground">L1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
              <span className="text-xs text-muted-foreground">Priority</span>
            </div>
          </div>
        }
      >
        <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
          Gas fee data not available yet.
        </div>
      </GlassCard>
    );
  }

  const gasData = data ?? sampleGasData;

  return (
    <GlassCard
      title="Gas Fees Over Time"
      icon={<Fuel className="w-4 h-4" />}
      tooltip="24-hour gas fee trends broken down by type. Total fee = Base Fee + L1 Fee + Priority Fee."
      headerAction={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span className="text-xs text-muted-foreground">Base</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs text-muted-foreground">L1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-xs text-muted-foreground">Priority</span>
          </div>
        </div>
      }
    >
      <div className="h-[250px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={gasData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <filter id="gasGlow">
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
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(value) => `${value}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="baseFee"
              stroke="#F97316"
              strokeWidth={2}
              dot={false}
              filter="url(#gasGlow)"
            />
            <Line
              type="monotone"
              dataKey="l1Fee"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              filter="url(#gasGlow)"
            />
            <Line
              type="monotone"
              dataKey="priorityFee"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              filter="url(#gasGlow)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
