"use client";

import { useEffect, useState } from "react";

import { fetchTvlHistory, TvlHistoryResponse } from "./api";

interface UseTvlHistoryState {
  data: TvlHistoryResponse | null;
  error: string | null;
  loading: boolean;
}

export function useTvlHistory(hours = 24 * 30, refreshMs = 60_000): UseTvlHistoryState {
  const [data, setData] = useState<TvlHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const load = async () => {
      try {
        const response = await fetchTvlHistory(hours);
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
  }, [hours, refreshMs]);

  return { data, error, loading };
}
