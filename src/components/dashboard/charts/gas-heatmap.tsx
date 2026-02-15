"use client";

import { GlassCard } from "../glass-card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeatmapCell {
  hour: number;
  value: number;
}

interface HeatmapRow {
  day: string;
  hours: HeatmapCell[];
}

const getHeatColor = (value: number) => {
  if (value < 20) return "bg-[rgba(34,197,94,0.2)]";
  if (value < 40) return "bg-[rgba(34,197,94,0.4)]";
  if (value < 60) return "bg-[rgba(239,143,54,0.4)]";
  if (value < 80) return "bg-[rgba(239,143,54,0.7)]";
  return "bg-[rgba(239,68,68,0.7)]";
};

const getHeatGlow = (value: number) => {
  if (value < 40) return "";
  if (value < 70) return "shadow-[0_0_8px_rgba(239,143,54,0.3)]";
  return "shadow-[0_0_8px_rgba(239,68,68,0.4)]";
};

interface GasHeatmapProps {
  data?: HeatmapRow[];
  isPlaceholder?: boolean;
}

export function GasHeatmap({ data, isPlaceholder }: GasHeatmapProps) {
  const hasData = data?.some((row) => row.hours.length > 0);

  if (isPlaceholder || !hasData) {
    return (
      <GlassCard
        title="Gas Fees Heatmap"
        icon={<Flame className="w-4 h-4" />}
        tooltip="Hourly gas fee distribution across the week. Darker colors indicate higher fees. Use this to find optimal transaction times."
      >
        <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
          Gas heatmap data not available yet.
        </div>
      </GlassCard>
    );
  }

  const heatmapData = data ?? [];

  return (
    <GlassCard
      title="Gas Fees Heatmap"
      icon={<Flame className="w-4 h-4" />}
      tooltip="Hourly gas fee distribution across the week. Darker colors indicate higher fees. Use this to find optimal transaction times."
      headerAction={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[rgba(34,197,94,0.3)]" />
            <span className="text-[10px] text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[rgba(239,143,54,0.5)]" />
            <span className="text-[10px] text-muted-foreground">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[rgba(239,68,68,0.7)]" />
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-2 ml-12">
            {[0, 4, 8, 12, 16, 20].map((hour) => (
              <div
                key={hour}
                className="text-[10px] text-muted-foreground"
                style={{ width: `${(100 / 6)}%` }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {heatmapData.map((row, rowIndex) => (
              <div key={`${row.day}-${rowIndex}`} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-10 shrink-0 whitespace-nowrap">
                  {row.day}
                </span>
                <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const cell = row.hours.find((c) => c.hour === i);
                    if (cell) {
                      return (
                        <div
                          key={`${row.day}-${rowIndex}-${i}`}
                          className={cn(
                            "h-6 rounded-sm transition-all cursor-pointer hover:scale-110",
                            getHeatColor(cell.value),
                            getHeatGlow(cell.value)
                          )}
                          title={`${row.day} ${i}:00 - ${cell.value.toFixed(0)} gwei`}
                        />
                      );
                    }
                    return (
                      <div
                        key={`${row.day}-${rowIndex}-${i}`}
                        className="h-6 rounded-sm bg-muted/20"
                        title={`${row.day} ${i}:00 - no data`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
