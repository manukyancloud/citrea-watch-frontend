"use client";

import { useEffect, useState } from "react";
import { GlassCard, Sparkline } from "./glass-card";
import { Coins, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TokenRow {
  symbol: string;
  price: number | null;
  supply: number;
  marketCap: number;
  priceSource: string;
}

type SortField = "price" | "marketCap";
type SortDirection = "asc" | "desc";

export function TokenTable({ tokens }: { tokens: TokenRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [txnTrend, setTxnTrend] = useState<number[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTrend = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL ??
          "https://explorer-stats.mainnet.citrea.xyz/api/v1/pages/main";
        const response = await fetch(apiUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to fetch Blockscout stats");
        }
        const payload = (await response.json()) as {
          data?: {
            daily_new_transactions?: Array<{
              date?: string | number;
              value?: number | string;
              count?: number | string;
              transactions?: number | string;
            }>;
          };
          daily_new_transactions?: Array<{
            date?: string | number;
            value?: number | string;
            count?: number | string;
            transactions?: number | string;
          }>;
        };

        const daily = payload.data?.daily_new_transactions ?? payload.daily_new_transactions ?? [];
        const normalized = daily
          .map((entry) => {
            const rawValue =
              entry.value ?? entry.count ?? entry.transactions;
            const value = typeof rawValue === "string" ? Number(rawValue) : rawValue;
            const dateRaw = entry.date;
            const date =
              typeof dateRaw === "string" || typeof dateRaw === "number"
                ? new Date(dateRaw).getTime()
                : Number.NaN;
            return {
              value,
              date,
              hasDate: Number.isFinite(date),
            };
          })
          .filter(
            (entry) => typeof entry.value === "number" && Number.isFinite(entry.value)
          );

        const ordered = normalized.every((entry) => entry.hasDate)
          ? [...normalized].sort((a, b) => a.date - b.date)
          : normalized;
        const lastSeven = ordered.slice(-7).map((entry) => entry.value as number);

        if (isMounted) {
          setTxnTrend(lastSeven.length >= 2 ? lastSeven : null);
        }
      } catch {
        if (isMounted) {
          setTxnTrend(null);
        }
      }
    };

    loadTrend();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredTokens = tokens
    .filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case "price":
          aValue = a.price ?? 0;
          bValue = b.price ?? 0;
          break;
        case "marketCap":
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <GlassCard
      title="Token Analytics"
      icon={<Coins className="w-4 h-4" />}
      tooltip="Tracked tokens on Citrea Network with real-time supply and market data."
      headerAction={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-48 h-8 bg-[rgba(255,255,255,0.03)] border-[rgba(239,143,54,0.1)] text-sm focus:border-[rgba(239,143,54,0.3)]"
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[rgba(239,143,54,0.2)]">
              <th className="text-left py-3 px-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </span>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center gap-1 ml-auto text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Price
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supply
                </span>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("marketCap")}
                  className="flex items-center gap-1 ml-auto text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Market Cap
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  7D Txn Trend
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.map((token) => (
              <tr
                key={token.symbol}
                className="border-b border-[rgba(239,143,54,0.05)] hover:bg-[rgba(239,143,54,0.03)] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EF8F36] to-[#EB582A] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0a0a14]">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {token.symbol}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {token.symbol}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-sm text-foreground">
                    {token.price === null
                      ? "—"
                      : `$${token.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-sm text-muted-foreground">
                    {token.supply.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-sm text-foreground">
                    ${token.marketCap.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="w-20 h-8 ml-auto">
                    <Sparkline
                      data={
                        txnTrend && txnTrend.length >= 2
                          ? txnTrend
                          : Array.from({ length: 10 }, (_, i) =>
                              (token.price ?? 0) * (1 + (i - 5) * 0.001)
                            )
                      }
                      color="#EF8F36"
                      height={32}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
