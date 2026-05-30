import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { JobRecord } from "../types/job";

export interface JobPageData {
  job: JobRecord;
  creatorWalletAddress: string | null;
}

export async function fetchJobPageData(id: string): Promise<JobPageData | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const job: JobRecord = {
    id: data.id,
    onchain_job_id: data.onchain_job_id ?? null,
    creator_profile_id: data.creator_profile_id,
    wallet_address: null,
    title: data.title,
    description: data.description,
    category: data.category,
    price_amount: Number(data.price_amount),
    price_currency: data.price_currency,
    delivery_days: data.delivery_days ?? null,
    status: data.status as JobRecord["status"],
    agent_only: data.agent_only ?? false,
    skills_required: data.skills_required ?? [],
    evaluator_address: null,
    hook_address: null,
    escrow_contract_address: data.provident_address ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return { job, creatorWalletAddress: null };
}
