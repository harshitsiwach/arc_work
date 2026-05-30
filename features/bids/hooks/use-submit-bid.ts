"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { waitForTransaction } from "@/lib/contracts/wait";
import { decodeContractError } from "@/lib/contracts/errors";
import { useTransaction } from "@/features/shared/hooks/use-transaction";
import { usdcToUnits } from "@/lib/contracts/instance";
import type { SubmitBidInput } from "../types/bid";

export function useSubmitBid() {
  const tx = useTransaction();

  const execute = useCallback(
    async (input: SubmitBidInput) => {
      tx.start("submitBid");
      try {
        tx.setSignaturePending();
        const txHash = await writes.submitBid({
          jobId: input.jobId,
          amount: usdcToUnits(input.amount),
        });
        tx.setTransactionPending(txHash);

        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);

        if (receipt.status === "success") {
          tx.setTransactionSuccess(txHash);
        } else {
          tx.setTransactionFailed("Transaction reverted");
        }
      } catch (err: unknown) {
        const message = decodeContractError(err, "submitBid");
        tx.setTransactionFailed(message);
      }
    },
    [tx]
  );

  return {
    execute,
    state: tx.state,
    ...tx.state,
    isIdle: tx.isIdle,
    isLoading: tx.isLoading,
    isSuccess: tx.isSuccess,
    isError: tx.isError,
    txHash: tx.txHash,
    error: tx.error,
    reset: tx.reset,
  };
}
