"use client";

import { useState, useEffect, useCallback } from "react";
import { reads } from "@/lib/contracts/reads";
import type { Bid } from "@/lib/contracts/types";

export function useBids(jobId: bigint | null) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    if (jobId === null) {
      setBids([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await reads.getBids(jobId);
      setBids(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load bids";
      setError(message);
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return { bids, loading, error, refetch: fetchBids };
}
