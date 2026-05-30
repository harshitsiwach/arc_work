/**
 * AgenticCommerce — Transaction state machine
 * Reducer-based state management for contract transactions
 */

import type {
  TransactionState,
  TransactionStatus,
  TransactionType,
} from "./types";

export type TransactionAction =
  | { type: "START"; functionName: TransactionType }
  | { type: "WALLET_PROMPT" }
  | { type: "PENDING_SIGNATURE" }
  | { type: "SUBMITTING"; txHash: `0x${string}` }
  | { type: "CONFIRMING"; txHash: `0x${string}` }
  | { type: "SUCCESS"; txHash: `0x${string}` }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

export const INITIAL_STATE: TransactionState = {
  status: "idle",
  txHash: null,
  error: null,
  functionName: null,
};

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    case "START":
      return {
        ...INITIAL_STATE,
        status: "wallet_prompt",
        functionName: action.functionName,
      };

    case "WALLET_PROMPT":
      return { ...state, status: "wallet_prompt" };

    case "PENDING_SIGNATURE":
      return { ...state, status: "pending_signature" };

    case "SUBMITTING":
      return {
        ...state,
        status: "submitting",
        txHash: action.txHash,
      };

    case "CONFIRMING":
      return {
        ...state,
        status: "confirming",
        txHash: action.txHash,
      };

    case "SUCCESS":
      return {
        status: "success",
        txHash: action.txHash,
        error: null,
        functionName: state.functionName,
      };

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  idle: "Ready",
  wallet_prompt: "Confirm in wallet",
  pending_signature: "Awaiting signature",
  submitting: "Submitting transaction",
  confirming: "Waiting for confirmation",
  success: "Transaction confirmed",
  error: "Transaction failed",
};
