/**
 * Job service
 * Handles all Supabase operations for gigs
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { JobRecord, CreateJobInput } from "../types/job";

interface GigRow {
  id: string;
  onchain_job_id: number | null;
  creator_profile_id: string;
  title: string;
  description: string;
  category: string;
  price_amount: number | string;
  price_currency: string;
  delivery_days: number | null;
  status: string;
  agent_only: boolean | null;
  skills_required: string[] | null;
  provident_address: string | null;
  created_at: string;
  updated_at: string;
}

function mapGigToJobRecord(row: GigRow): JobRecord {
  return {
    id: row.id,
    onchain_job_id: row.onchain_job_id ?? null,
    creator_profile_id: row.creator_profile_id,
    wallet_address: null,
    title: row.title,
    description: row.description,
    category: row.category,
    price_amount: Number(row.price_amount),
    price_currency: row.price_currency,
    delivery_days: row.delivery_days ?? null,
    status: row.status as JobRecord["status"],
    agent_only: row.agent_only ?? false,
    skills_required: row.skills_required ?? [],
    evaluator_address: null,
    hook_address: null,
    escrow_contract_address: row.provident_address ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const jobService = {
  async getJob(id: string): Promise<JobRecord | null> {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("gigs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapGigToJobRecord(data);
  },

  async getJobsByStatus(status: string): Promise<JobRecord[]> {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("gigs")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapGigToJobRecord);
  },

  async getJobsByCreator(creatorProfileId: string): Promise<JobRecord[]> {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("gigs")
      .select("*")
      .eq("creator_profile_id", creatorProfileId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapGigToJobRecord);
  },

  async createJob(input: CreateJobInput, creatorProfileId: string, _walletAddress: string): Promise<JobRecord> {
    const sb = createSupabaseBrowserClient();
    const insertData = {
      creator_profile_id: creatorProfileId,
      title: input.title,
      description: input.description,
      category: input.category,
      price_amount: input.price_amount,
      price_currency: "USDC",
      delivery_days: input.delivery_days,
      status: "open",
      agent_only: input.agent_only,
      skills_required: input.skills_required,
      provident_address: process.env.NEXT_PUBLIC_AGENTIC_COMMERCE_ADDRESS ?? "0x0000000000000000000000000000000000000000",
    };

    const { data, error } = await sb
      .from("gigs")
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapGigToJobRecord(data);
  },

  async updateOnchainJobId(gigId: string, onchainJobId: number): Promise<void> {
    const sb = createSupabaseBrowserClient();
    const { error } = await sb
      .from("gigs")
      .update({ onchain_job_id: onchainJobId })
      .eq("id", gigId);

    if (error) throw new Error(error.message);
  },

  async updateStatus(gigId: string, status: string): Promise<void> {
    const sb = createSupabaseBrowserClient();
    const { error } = await sb
      .from("gigs")
      .update({ status })
      .eq("id", gigId);

    if (error) throw new Error(error.message);
  },
} as const;
