"use client";

import { GlassCard } from "./glass-card";
import { Database, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface VaultBalanceItem {
  name: string;
  address: string;
  balanceCbtc: number;
  usdValue: number | null;
  description?: string;
}

interface VaultBalancesProps {
  vaults: VaultBalanceItem[];
}

const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const formatCbtc = (value: number) =>
  `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} cBTC`;

const formatUsd = (value: number | null) => {
  if (value === null) {
    return "—";
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export function VaultBalances({ vaults }: VaultBalancesProps) {
  const maxBalance = vaults.reduce(
    (max, vault) => Math.max(max, vault.balanceCbtc),
    0
  );

  return (
    <GlassCard
      title="System Vault Balances"
      icon={<Database className="w-4 h-4" />}
      tooltip="Technical breakdown of protocol system vaults. These addresses hold fees and reserves for various network operations."
    >
      {vaults.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Vault data is not available yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {vaults.map((vault) => (
            <div key={vault.name} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm text-white font-medium tracking-wide">
                      {vault.name}
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs font-mono text-gray-500 ml-2 cursor-help hover:text-orange-400 transition-colors">
                            {formatAddress(vault.address)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground text-left text-pretty break-all"
                        >
                          <p>{vault.description ?? vault.address}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <a
                      href={`https://explorer.mainnet.citrea.xyz/address/${vault.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex"
                      aria-label={`Open ${vault.name} in explorer`}
                    >
                      <ExternalLink className="w-3 h-3 text-gray-600 hover:text-orange-400 cursor-pointer transition-colors" />
                    </a>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-lg font-bold text-white tracking-tight">
                      {formatCbtc(vault.balanceCbtc)}
                    </span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {formatUsd(vault.usdValue)}
                    </span>
                  </div>
                </div>
                <div className="w-28">
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: maxBalance
                          ? `${Math.max(
                              10,
                              (vault.balanceCbtc / maxBalance) * 100
                            )}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
