/**
 * Job feature types
 * Domain types for the jobs feature — distinct from contract types
 */

export type JobStatus = "open" | "funded" | "submitted" | "completed" | "rejected" | "expired" | "draft" | "live";

export interface JobRecord {
  id: string;
  onchain_job_id: number | null;
  creator_profile_id: string;
  wallet_address: string | null;
  title: string;
  description: string;
  category: string;
  price_amount: number;
  price_currency: string;
  delivery_days: number | null;
  status: JobStatus;
  agent_only: boolean;
  skills_required: string[];
  evaluator_address: string | null;
  hook_address: string | null;
  escrow_contract_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  category: string;
  price_amount: number;
  delivery_days: number | null;
  agent_only: boolean;
  skills_required: string[];
  evaluator_address: string;
  hook_address: string;
}

export interface CreateJobResult {
  gig: JobRecord;
  onchain_job_id: number | null;
  deployed: boolean;
}
