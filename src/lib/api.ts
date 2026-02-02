export interface TokenTvlItem {
  symbol: string;
  supply: number;
  priceUsd: number | null;
  tvlUsd: number;
  priceSource: string;
}

export interface GlobalTvlResponse {
  totalTvlUsd: number;
  tokens: TokenTvlItem[];
  generatedAt: string;
  lastUpdated: number;
  change24hUsd?: number | null;
  change24hPct?: number | null;
  change7dUsd?: number | null;
  change7dPct?: number | null;
}

export interface TvlHistoryPoint {
  timestamp: number;
  blockNumber: number;
  totalTvlUsd: number;
  cbtcSupply: number;
}

export interface TvlHistoryResponse {
  points: TvlHistoryPoint[];
  generatedAt: string;
}

export interface BridgeVaultItem {
  name: string;
  address: string;
  balanceCbtc: number;
}

export interface BridgeSummaryResponse {
  depositAmountCbtc: number;
  depositCount: number;
  failedDepositCount: number;
  withdrawalCount: number;
  totalDepositedCbtc: number;
  totalWithdrawnCbtc: number;
  currentSupplyCbtc: number;
  vaults: BridgeVaultItem[];
  generatedAt: string;
}

export interface BridgeTimeseriesPoint {
  date: string;
  inflowCbtc: number;
  outflowCbtc: number;
}

export interface BridgeTimeseriesResponse {
  points: BridgeTimeseriesPoint[];
  generatedAt: string;
}

export interface GasTimeseriesPoint {
  time: string;
  baseFee: number;
  l1Fee: number;
  priorityFee: number;
}

export interface GasTimeseriesResponse {
  points: GasTimeseriesPoint[];
  generatedAt: string;
}

export interface GasHeatmapCell {
  hour: number;
  value: number;
}

export interface GasHeatmapRow {
  day: string;
  hours: GasHeatmapCell[];
}

export interface GasHeatmapResponse {
  rows: GasHeatmapRow[];
  generatedAt: string;
}

export interface ExplorerSummaryResponse {
  totalTransactions: number | null;
  totalAddresses: number | null;
  totalBlocks: number | null;
  txCount24h: number | null;
  txCount7d: number | null;
  tps: number | null;
  averageBlockTimeSec: number | null;
  totalTokens: number | null;
  txFees24hCbtc: number | null;
  gasPrices: {
    slow: number | null;
    average: number | null;
    fast: number | null;
  } | null;
  gasPriceUpdatedAt: string | null;
  generatedAt: string;
  source: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const apiUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

export async function fetchGlobalTvl(): Promise<GlobalTvlResponse> {
  const response = await fetch(apiUrl("/api/tvl/global"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TVL: ${response.status}`);
  }

  return response.json() as Promise<GlobalTvlResponse>;
}

export async function fetchBridgeSummary(): Promise<BridgeSummaryResponse> {
  const response = await fetch(apiUrl("/api/bridge/summary"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bridge summary: ${response.status}`);
  }

  return response.json() as Promise<BridgeSummaryResponse>;
}

export async function fetchBridgeTimeseries(): Promise<BridgeTimeseriesResponse> {
  const response = await fetch(apiUrl("/api/bridge/timeseries"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bridge timeseries: ${response.status}`);
  }

  return response.json() as Promise<BridgeTimeseriesResponse>;
}

export async function fetchGasTimeseries(): Promise<GasTimeseriesResponse> {
  const response = await fetch(apiUrl("/api/gas/timeseries"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gas timeseries: ${response.status}`);
  }

  return response.json() as Promise<GasTimeseriesResponse>;
}

export async function fetchGasHeatmap(): Promise<GasHeatmapResponse> {
  const response = await fetch(apiUrl("/api/gas/heatmap"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gas heatmap: ${response.status}`);
  }

  return response.json() as Promise<GasHeatmapResponse>;
}

export async function fetchExplorerSummary(): Promise<ExplorerSummaryResponse> {
  const response = await fetch(apiUrl("/api/explorer/summary"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch explorer summary: ${response.status}`);
  }

  return response.json() as Promise<ExplorerSummaryResponse>;
}

export async function fetchTvlHistory(hours = 24 * 30): Promise<TvlHistoryResponse> {
  const response = await fetch(apiUrl(`/api/tvl/history?hours=${hours}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TVL history: ${response.status}`);
  }

  return response.json() as Promise<TvlHistoryResponse>;
}
