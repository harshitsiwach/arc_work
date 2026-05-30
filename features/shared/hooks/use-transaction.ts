"use client";

import { useReducer, useCallback, useMemo } from "react";
import { transactionReducer } from "./transaction-reducer";
import { INITIAL_TRANSACTION_STATE } from "../types/transaction";
import type { TransactionType } from "../types/transaction";

export function useTransaction() {
  const [state, dispatch] = useReducer(transactionReducer, INITIAL_TRANSACTION_STATE);

  const start = useCallback((functionName: TransactionType) => {
    dispatch({ type: "START", functionName });
  }, []);

  const setWalletConnectRequired = useCallback(() => {
    dispatch({ type: "WALLET_CONNECT_REQUIRED" });
  }, []);

  const setSignaturePending = useCallback(() => {
    dispatch({ type: "SIGNATURE_PENDING" });
  }, []);

  const setWalletRejected = useCallback(() => {
    dispatch({ type: "WALLET_REJECTED" });
  }, []);

  const setTransactionPending = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "TRANSACTION_PENDING", txHash });
  }, []);

  const setTransactionConfirming = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "TRANSACTION_CONFIRMING", txHash });
  }, []);

  const setTransactionSuccess = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "TRANSACTION_SUCCESS", txHash });
  }, []);

  const setTransactionFailed = useCallback((error: string) => {
    dispatch({ type: "TRANSACTION_FAILED", error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const derived = useMemo(() => ({
    isIdle: state.status === "idle",
    isLoading: ["wallet_connect_required", "signature_pending", "transaction_pending", "transaction_confirming"].includes(state.status),
    isSuccess: state.status === "transaction_success",
    isError: state.status === "transaction_failed" || state.status === "wallet_rejected",
    txHash: state.txHash,
    error: state.error,
  }), [state]);

  return {
    state,
    ...derived,
    start,
    setWalletConnectRequired,
    setSignaturePending,
    setWalletRejected,
    setTransactionPending,
    setTransactionConfirming,
    setTransactionSuccess,
    setTransactionFailed,
    reset,
  };
}
