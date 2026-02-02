"use client";

import { useEffect, useState } from "react";

import { fetchGlobalTvl, GlobalTvlResponse } from "./api";

interface UseGlobalTvlState {
  data: GlobalTvlResponse | null;
  error: string | null;
  loading: boolean;
}

export function useGlobalTvl(refreshMs = 30_000): UseGlobalTvlState {
  const [data, setData] = useState<GlobalTvlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const load = async () => {
      try {
        const response = await fetchGlobalTvl();
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
