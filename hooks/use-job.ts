"use client";

import { useState, useEffect, useCallback } from "react";
import { reads } from "@/lib/contracts/reads";
import type { Job } from "@/lib/contracts/types";

export function useJob(jobId: bigint | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (jobId === null) {
      setJob(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await reads.getJob(jobId);
      setJob(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load job";
      setError(message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, loading, error, refetch: fetchJob };
}
