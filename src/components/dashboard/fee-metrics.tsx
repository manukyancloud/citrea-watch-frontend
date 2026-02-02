"use client";

import { GlassCard, Sparkline } from "./glass-card";
import { Fuel } from "lucide-react";
import { useExplorerSummary } from "@/lib/use-explorer-summary";
import { useGasTimeseries } from "@/lib/use-gas-timeseries";

const formatGas = (value: number | null | undefined) =>
  typeof value === "number"
    ? `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} Gwei`
    : "—";

export function FeeMetrics() {
  const { data } = useExplorerSummary();
  const { series } = useGasTimeseries();
  const sparklineData =
    series?.points?.map((point) => point.baseFee) ?? [];
  const hasSparkline = sparklineData.length > 1;

  const feeMetrics = [
    {
      label: "Slow",
      value: formatGas(data?.gasPrices?.slow),
      change: null as number | null,
      data: sparklineData,
      tooltip:
        "Slow tier gas price from Citrea Explorer stats. Values represent typical fees for slower inclusion.",
    },
    {
      label: "Average",
      value: formatGas(data?.gasPrices?.average),
      change: null as number | null,
      data: sparklineData,
      tooltip:
        "Average tier gas price from Citrea Explorer stats. Recommended for normal confirmation times.",
    },
    {
      label: "Fast",
      value: formatGas(data?.gasPrices?.fast),
      change: null as number | null,
      data: sparklineData,
      tooltip:
        "Fast tier gas price from Citrea Explorer stats. Higher fees for quicker inclusion.",
    },
  ];

  return (
    <GlassCard
      title="Gas Fee Metrics"
      icon={<Fuel className="w-4 h-4" />}
      tooltip="Gas price tiers sourced from Citrea Explorer statistics. Values update periodically."
    >
      <div className="space-y-4">
        {feeMetrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(239,143,54,0.05)] hover:border-[rgba(239,143,54,0.15)] transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm font-semibold text-white">
                  {metric.value}
                </span>
                {typeof metric.change === "number" ? (
                  <span
                    className={`text-xs font-mono ${
                      metric.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                ) : null}
              </div>
            </div>
            {hasSparkline ? (
              <div className="w-20 h-8">
                <Sparkline
                  data={metric.data}
                  color={"#EF8F36"}
                  height={32}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
