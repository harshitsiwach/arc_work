/**
 * Transaction state types
 * Reusable across all write operations
 */

export type TransactionStatus =
  | "idle"
  | "wallet_connect_required"
  | "signature_pending"
  | "wallet_rejected"
  | "transaction_pending"
  | "transaction_confirming"
  | "transaction_success"
  | "transaction_failed";

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

export const INITIAL_TRANSACTION_STATE: TransactionState = {
  status: "idle",
  txHash: null,
  error: null,
  functionName: null,
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  idle: "Ready",
  wallet_connect_required: "Connect your wallet",
  signature_pending: "Confirm in your wallet",
  wallet_rejected: "Transaction rejected",
  transaction_pending: "Transaction submitted",
  transaction_confirming: "Waiting for confirmation",
  transaction_success: "Transaction confirmed",
  transaction_failed: "Transaction failed",
};
