/**
 * AgenticCommerce — Type definitions
 * Generated from contract/abi.json
 */

export type JobStatus = 0 | 1 | 2 | 3 | 4 | 5;

export type JobStatusName =
  | "Open"
  | "Funded"
  | "Submitted"
  | "Completed"
  | "Rejected"
  | "Expired";

export interface Job {
  id: bigint;
  client: `0x${string}`;
  provider: `0x${string}`;
  evaluator: `0x${string}`;
  description: string;
  budget: bigint;
  expiredAt: bigint;
  status: JobStatus;
  hook: `0x${string}`;
}

export interface Bid {
  provider: `0x${string}`;
  amount: bigint;
  accepted: boolean;
}

export interface PlatformStats {
  totalJobs: bigint;
  totalEscrowed: bigint;
}

export interface FeeConfig {
  platformFeeBP: bigint;
  evaluatorFeeBP: bigint;
  treasury: `0x${string}`;
}

export interface CreateJobParams {
  provider: `0x${string}`;
  evaluator: `0x${string}`;
  expiredAt: bigint;
  description: string;
  hook: `0x${string}`;
}

export interface FundJobParams {
  jobId: bigint;
  amount: bigint;
}

export interface SubmitBidParams {
  jobId: bigint;
  amount: bigint;
}

export interface AcceptBidParams {
  jobId: bigint;
  provider: `0x${string}`;
}

export interface SetBudgetParams {
  jobId: bigint;
  amount: bigint;
}

export interface SubmitWorkParams {
  jobId: bigint;
  deliverable: `0x${string}`;
}

export interface ResolveJobParams {
  jobId: bigint;
  reason: `0x${string}`;
}

export interface ClaimRefundParams {
  jobId: bigint;
}

// ── Transaction State ──────────────────────────────────────

export type TransactionStatus =
  | "idle"
  | "wallet_prompt"
  | "pending_signature"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export type TransactionType =
  | "createJob"
  | "fundJob"
  | "submitBid"
  | "acceptBid"
  | "setBudget"
  | "submitWork"
  | "completeJob"
  | "rejectJob"
  | "claimRefund";

export interface TransactionState {
  status: TransactionStatus;
  txHash: `0x${string}` | null;
  error: string | null;
  functionName: TransactionType | null;
}

export interface TransactionActions {
  setWalletPrompt: () => void;
  setPendingSignature: () => void;
  setSubmitting: (txHash: `0x${string}`) => void;
  setConfirming: (txHash: `0x${string}`) => void;
  setSuccess: (txHash: `0x${string}`) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const INITIAL_TRANSACTION_STATE: TransactionState = {
  status: "idle",
  txHash: null,
  error: null,
  functionName: null,
};
