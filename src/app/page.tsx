"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/dashboard/glass-card";
import { NetworkStats } from "@/components/dashboard/network-stats";
import { FeeMetrics } from "@/components/dashboard/fee-metrics";
import { TVLChart } from "@/components/dashboard/charts/tvl-chart";
import { CBTCSupplyChart } from "@/components/dashboard/charts/cbtc-supply-chart";
import { TVLBreakdownPie } from "@/components/dashboard/charts/tvl-breakdown-pie";
import { TransparencyCard } from "@/components/dashboard/TransparencyCard";
import { useGlobalTvl } from "@/lib/use-global-tvl";
import { useTvlHistory } from "@/lib/use-tvl-history";
import { useExplorerSummary } from "@/lib/use-explorer-summary";
import { Wallet } from "lucide-react";

export default function OverviewPage() {
  const { data, loading } = useGlobalTvl();
  const { data: tvlHistory } = useTvlHistory();
  const { data: explorerData } = useExplorerSummary();
  const tokens = data?.tokens ?? [];
  const totalTvlUsd = data?.totalTvlUsd ?? null;
  const cbtcSupply =
    tokens.find((token) => token.symbol.toLowerCase() === "cbtc")?.supply ??
    null;
  const stablecoinSupplyUsd = tokens
    .filter((token) => token.symbol.toLowerCase().includes("usd"))
    .reduce((sum, token) => sum + token.tvlUsd, 0);

  const formatUsd = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return value.toLocaleString();
  };

  const formatCbtc = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "—";
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 6 })} cBTC`;
  };

  const formatPct = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "—";
    }
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatUpdatedAgo = (timestamp: number | null | undefined) => {
    if (!timestamp) {
      return "—";
    }
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Network Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time analytics for Citrea Network performance and metrics
          </p>
        </div>

        {/* Hero TVL Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <MetricCard
              title="Global TVL"
              value={loading ? "—" : formatUsd(totalTvlUsd)}
              tooltip={
                "Aggregate value of all tracked assets on Citrea.\nIncludes Native cBTC, Bridged BTC (syBTC, WBTC.e) and Stablecoins (JUSD, ctUSD, USDC.e, USDT.e).\nNote: Wrapped cBTC (wBTC) supply is excluded to prevent double-counting native cBTC."
              }
              icon={<Wallet className="w-5 h-5" />}
              isLive
              variant="hero"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Last updated: {formatUpdatedAgo(data?.lastUpdated ?? null)}
            </div>
          </div>
          <MetricCard
            title="24h Change"
            value={formatPct(data?.change24hPct ?? null)}
            tooltip="Percentage change in Global TVL over the last 24 hours based on historical snapshots."
          />
          <MetricCard
            title="7d Change"
            value={formatPct(data?.change7dPct ?? null)}
            tooltip="Percentage change in Global TVL over the last 7 days based on historical snapshots."
          />
        </div>

        {/* Network Stats Grid */}
        <NetworkStats
          cbtcSupply={cbtcSupply}
          stablecoinSupplyUsd={tokens.length ? stablecoinSupplyUsd : null}
          tps={explorerData?.tps ?? null}
          averageBlockTimeSec={explorerData?.averageBlockTimeSec ?? null}
          blockHeight={explorerData?.totalBlocks ?? null}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TVLChart currentTvl={totalTvlUsd} history={tvlHistory?.points ?? []} />
          </div>
          <div>
            <FeeMetrics />
          </div>
        </div>

        {/* TVL Breakdown + On-chain Verification */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TVLBreakdownPie tokens={tokens} totalTvlUsd={totalTvlUsd} />
          <TransparencyCard />
        </div>

        {/* cBTC Supply Chart */}
        <CBTCSupplyChart
          currentSupply={cbtcSupply}
          history={tvlHistory?.points ?? []}
        />

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="TOTAL TOKENS"
            value={formatNumber(explorerData?.totalTokens ?? tokens.length)}
            tooltip="Total number of ERC-20 tokens on the network." 
          />
          <MetricCard
            title="TOTAL ADDRESSES"
            value={formatNumber(explorerData?.totalAddresses ?? null)}
            tooltip="Total unique addresses observed on the network."
          />
          <MetricCard
            title="Total Transactions"
            value={formatNumber(explorerData?.totalTransactions ?? null)}
            tooltip="Cumulative number of transactions processed on Citrea."
          />
          <MetricCard
            title="24h Txns fees"
            value={formatCbtc(explorerData?.txFees24hCbtc ?? null)}
            tooltip="Estimated 24h transaction fees (native cBTC)."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
