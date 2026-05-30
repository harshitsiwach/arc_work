"use client";

import { useReducer, useCallback } from "react";
import { transactionReducer, INITIAL_STATE } from "@/lib/contracts/transaction";
import type { TransactionType } from "@/lib/contracts/types";

export function useTransaction() {
  const [state, dispatch] = useReducer(transactionReducer, INITIAL_STATE);

  const start = useCallback((functionName: TransactionType) => {
    dispatch({ type: "START", functionName });
  }, []);

  const setWalletPrompt = useCallback(() => {
    dispatch({ type: "WALLET_PROMPT" });
  }, []);

  const setPendingSignature = useCallback(() => {
    dispatch({ type: "PENDING_SIGNATURE" });
  }, []);

  const setSubmitting = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "SUBMITTING", txHash });
  }, []);

  const setConfirming = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "CONFIRMING", txHash });
  }, []);

  const setSuccess = useCallback((txHash: `0x${string}`) => {
    dispatch({ type: "SUCCESS", txHash });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: "ERROR", error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    start,
    setWalletPrompt,
    setPendingSignature,
    setSubmitting,
    setConfirming,
    setSuccess,
    setError,
    reset,
  };
}
