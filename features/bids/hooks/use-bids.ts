"use client";

import { useState, useEffect, useCallback } from "react";
import { reads } from "@/lib/contracts/reads";
import { bigintToUsdc } from "@/lib/contracts/instance";
import type { BidRecord } from "../types/bid";

export function useBids(jobId: bigint | null) {
  const [bids, setBids] = useState<BidRecord[]>([]);
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
      const rawBids = await reads.getBids(jobId);
      const mapped: BidRecord[] = rawBids.map((b) => ({
        provider: b.provider,
        amount: bigintToUsdc(b.amount),
        accepted: b.accepted,
      }));
      setBids(mapped);
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
