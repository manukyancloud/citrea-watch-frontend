"use client";

import { useEffect, useState } from "react";

import { BridgeSummaryResponse, fetchBridgeSummary } from "./api";

interface UseBridgeSummaryState {
  data: BridgeSummaryResponse | null;
  error: string | null;
  loading: boolean;
}

export function useBridgeSummary(refreshMs = 60_000): UseBridgeSummaryState {
  const [data, setData] = useState<BridgeSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const load = async () => {
      try {
        const response = await fetchBridgeSummary();
        if (isMounted) {
          setData(response);
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

  return { data, error, loading };
}
