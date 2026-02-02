"use client";

import { useEffect, useState } from "react";

import {
  fetchGasHeatmap,
  fetchGasTimeseries,
  GasHeatmapResponse,
  GasTimeseriesResponse,
} from "./api";

interface UseGasTimeseriesState {
  series: GasTimeseriesResponse | null;
  heatmap: GasHeatmapResponse | null;
  error: string | null;
  loading: boolean;
}

export function useGasTimeseries(
  refreshMs = 10 * 60_000
): UseGasTimeseriesState {
  const [series, setSeries] = useState<GasTimeseriesResponse | null>(null);
  const [heatmap, setHeatmap] = useState<GasHeatmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const load = async () => {
      try {
        const [seriesResponse, heatmapResponse] = await Promise.all([
          fetchGasTimeseries(),
          fetchGasHeatmap(),
        ]);
        if (isMounted) {
          setSeries(seriesResponse);
          setHeatmap(heatmapResponse);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    if (refreshMs > 0) {
      intervalId = setInterval(load, refreshMs);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshMs]);

  return { series, heatmap, error, loading };
}
