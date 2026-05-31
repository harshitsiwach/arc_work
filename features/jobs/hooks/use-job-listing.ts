"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { reads } from "@/lib/contracts/reads";
import type { JobRecord } from "../types/job";
import type { JobStatus } from "@/lib/contracts/types";

interface UseJobListingOptions {
  category?: string;
  status?: JobStatus | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface UseJobListingResult {
  jobs: JobRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PAGE_SIZE_DEFAULT = 12;
const STATUS_MAP: { [key: number]: JobRecord["status"] } = {
  0: "open", 1: "funded", 2: "submitted",
  3: "completed", 4: "rejected", 5: "expired",
};

export function useJobListing(options: UseJobListingOptions = {}): UseJobListingResult {
  const {
    category = "All",
    status = null,
    search = "",
    page = 1,
    pageSize = PAGE_SIZE_DEFAULT,
  } = options;

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("gigs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      if (search.trim()) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw new Error(queryError.message);

      let mapped: JobRecord[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        onchain_job_id: row.onchain_job_id as number | null,
        creator_profile_id: row.creator_profile_id as string,
        wallet_address: null,
        title: row.title as string,
        description: row.description as string,
        category: row.category as string,
        price_amount: Number(row.price_amount),
        price_currency: row.price_currency as string,
        delivery_days: row.delivery_days as number | null,
        status: row.status as JobRecord["status"],
        agent_only: row.agent_only as boolean,
        skills_required: (row.skills_required as string[]) ?? [],
        evaluator_address: null,
        hook_address: null,
        escrow_contract_address: (row.provident_address as string) ?? null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      }));

      // Override status with onchain data for jobs that have onchain_job_id
      await Promise.all(mapped.filter(j => j.onchain_job_id).map(async (j) => {
        try {
          const onchain = await reads.getJob(BigInt(j.onchain_job_id!));
          const onchainStatus = STATUS_MAP[onchain.status];
          if (onchainStatus) j.status = onchainStatus as JobRecord["status"];
        } catch {}
      }));

      // Apply status filter client-side using authoritative onchain status
      if (status !== null) {
        const statusStr = STATUS_MAP[status];
        mapped = mapped.filter(j => j.status === statusStr);
      }

      setJobs(mapped);
      setTotal(count ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load jobs";
      setError(message);
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, status, search, page, pageSize]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, total, loading, error, refetch: fetchJobs };
}
