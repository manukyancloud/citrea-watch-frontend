"use client";

import { useEffect, useState } from "react";

import { ExplorerSummaryResponse, fetchExplorerSummary } from "./api";

interface UseExplorerSummaryState {
  data: ExplorerSummaryResponse | null;
  error: string | null;
  loading: boolean;
}

export function useExplorerSummary(
  refreshMs = 5 * 1000
): UseExplorerSummaryState {
  const [data, setData] = useState<ExplorerSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const load = async () => {
      try {
        const response = await fetchExplorerSummary();
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
