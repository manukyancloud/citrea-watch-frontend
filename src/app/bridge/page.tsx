"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/dashboard/glass-card";
import { BridgeFlowChart } from "@/components/dashboard/charts/bridge-flow-chart";
import { GasFeesChart } from "@/components/dashboard/charts/gas-fees-chart";
import { GasHeatmap } from "@/components/dashboard/charts/gas-heatmap";
import { VaultBalances } from "@/components/dashboard/vault-balances";
import { useBridgeSummary } from "@/lib/use-bridge-summary";
import { useBridgeTimeseries } from "@/lib/use-bridge-timeseries";
import { useGasTimeseries } from "@/lib/use-gas-timeseries";
import { useGlobalTvl } from "@/lib/use-global-tvl";
import { ArrowUpRight, ArrowDownRight, Fuel, Coins, AlertTriangle } from "lucide-react";

export default function BridgePage() {
  const { data: bridgeData, loading: bridgeLoading } = useBridgeSummary();
  const { data: bridgeSeries } = useBridgeTimeseries();
  const { series: gasSeries, heatmap: gasHeatmap } = useGasTimeseries();
  const { data: tvlData } = useGlobalTvl();
  const cbtcToken = tvlData?.tokens.find(
    (token) => token.symbol.toLowerCase() === "cbtc"
  );
  const cbtcPriceUsd = cbtcToken?.priceUsd ?? null;
  const totalDepositedCbtc = bridgeData?.totalDepositedCbtc ?? null;
  const totalWithdrawnCbtc = bridgeData?.totalWithdrawnCbtc ?? null;
  const totalBridgeTxs = bridgeData
    ? bridgeData.depositCount +
      bridgeData.failedDepositCount +
      bridgeData.withdrawalCount
    : null;
  const vaults = (bridgeData?.vaults ?? []).map((vault) => ({
    ...vault,
    usdValue:
      cbtcPriceUsd === null ? null : vault.balanceCbtc * cbtcPriceUsd,
  }));
  const totalVaultUsd = vaults.reduce(
    (sum, vault) => sum + (vault.usdValue ?? 0),
    0
  );

  const bridgeFlowData = bridgeSeries?.points.map((point) => ({
    date: point.date,
    inflow: point.inflowCbtc,
    outflow: -point.outflowCbtc,
  }));

  const avgGasPrice = gasSeries?.points?.length
    ? gasSeries.points.reduce((sum, point) => sum + point.baseFee, 0) /
      gasSeries.points.length
    : null;

  const formatCbtc = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} cBTC`;
  };

  const formatUsd = (value: number | null) => {
    if (value === null) {
      return "—";
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Clementine Bridge & Fees
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep dive into Clementine Bridge activity, gas metrics and protocol vaults
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Bridge Inflow"
            value={bridgeLoading ? "—" : formatCbtc(totalDepositedCbtc)}
            icon={<ArrowUpRight className="w-5 h-5 text-[#22c55e]" />}
            tooltip="Cumulative Bitcoin deposited through the bridge since launch."
          />
          <MetricCard
            title="Total Bridge Outflow"
            value={bridgeLoading ? "—" : formatCbtc(totalWithdrawnCbtc)}
            icon={<ArrowDownRight className="w-5 h-5 text-[#ef4444]" />}
            tooltip="Cumulative Bitcoin withdrawn through the bridge since launch."
          />
          <MetricCard
            title="Avg Gas Price"
            value={
              avgGasPrice === null
                ? "—"
                : `${avgGasPrice.toFixed(2)} gwei`
            }
            icon={<Fuel className="w-5 h-5" />}
            tooltip="Average base fee over the last 24 hours."
          />
          <MetricCard
            title="Fixed Deposit Size"
            value={bridgeLoading ? "—" : formatCbtc(bridgeData?.depositAmountCbtc ?? null)}
            icon={<Coins className="w-5 h-5" />}
            tooltip="Fixed cBTC amount per bridge deposit as defined by the bridge contract."
          />
        </div>

        {/* Bridge Flow & Gas Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BridgeFlowChart
            data={bridgeFlowData}
            isPlaceholder={!bridgeFlowData || bridgeFlowData.length === 0}
          />
          <GasFeesChart
            data={gasSeries?.points}
            isPlaceholder={!gasSeries?.points?.length}
          />
        </div>

        {/* Gas Heatmap */}
        <GasHeatmap
          data={gasHeatmap?.rows}
          isPlaceholder={!gasHeatmap?.rows?.length}
        />

        {/* Vault Balances */}
        <VaultBalances vaults={vaults} />

        {/* Bridge Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Bridged"
            value={bridgeLoading ? "—" : formatCbtc(totalDepositedCbtc)}
            tooltip="Cumulative Bitcoin bridged to Citrea Network since launch."
          />
          <MetricCard
            title="Bridge TXs (All)"
            value={bridgeLoading ? "—" : totalBridgeTxs?.toLocaleString() ?? "—"}
            tooltip="Total number of bridge transactions since launch."
          />
          <MetricCard
            title="Vaults Total"
            value={vaults.length ? formatUsd(totalVaultUsd) : "—"}
            tooltip="Total value held across protocol fee vaults."
          />
          <MetricCard
            title="Failed Deposits"
            value={
              bridgeLoading
                ? "—"
                : bridgeData?.failedDepositCount?.toLocaleString() ?? "—"
            }
            tooltip="Total failed deposit transfers reported by the bridge contract."
            icon={<AlertTriangle className="w-5 h-5 text-[#f59e0b]" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
