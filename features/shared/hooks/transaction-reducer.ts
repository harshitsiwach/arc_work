/**
 * Transaction state machine
 * Reducer-based state management for all contract writes
 */

import type { TransactionState, TransactionType } from "../types/transaction";
import { INITIAL_TRANSACTION_STATE } from "../types/transaction";

export type TransactionAction =
  | { type: "START"; functionName: TransactionType }
  | { type: "WALLET_CONNECT_REQUIRED" }
  | { type: "SIGNATURE_PENDING" }
  | { type: "WALLET_REJECTED" }
  | { type: "TRANSACTION_PENDING"; txHash: `0x${string}` }
  | { type: "TRANSACTION_CONFIRMING"; txHash: `0x${string}` }
  | { type: "TRANSACTION_SUCCESS"; txHash: `0x${string}` }
  | { type: "TRANSACTION_FAILED"; error: string }
  | { type: "RESET" };

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    case "START":
      return {
        ...INITIAL_TRANSACTION_STATE,
        status: "wallet_connect_required",
        functionName: action.functionName,
      };

    case "WALLET_CONNECT_REQUIRED":
      return { ...state, status: "wallet_connect_required" };

    case "SIGNATURE_PENDING":
      return { ...state, status: "signature_pending" };

    case "WALLET_REJECTED":
      return {
        ...state,
        status: "wallet_rejected",
        error: "Transaction rejected by user",
      };

    case "TRANSACTION_PENDING":
      return {
        ...state,
        status: "transaction_pending",
        txHash: action.txHash,
      };

    case "TRANSACTION_CONFIRMING":
      return {
        ...state,
        status: "transaction_confirming",
        txHash: action.txHash,
      };

    case "TRANSACTION_SUCCESS":
      return {
        status: "transaction_success",
        txHash: action.txHash,
        error: null,
        functionName: state.functionName,
      };

    case "TRANSACTION_FAILED":
      return {
        ...state,
        status: "transaction_failed",
        error: action.error,
      };

    case "RESET":
      return INITIAL_TRANSACTION_STATE;

    default:
      return state;
  }
}
