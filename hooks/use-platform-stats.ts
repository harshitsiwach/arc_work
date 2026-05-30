"use client";

import { useState, useEffect, useCallback } from "react";
import { reads } from "@/lib/contracts/reads";
import type { PlatformStats } from "@/lib/contracts/types";

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reads.getPlatformStats();
      setStats(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load stats";
      setError(message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
