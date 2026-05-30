"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { waitForTransaction } from "@/lib/contracts/wait";
import { decodeContractError } from "@/lib/contracts/errors";
import { useTransaction } from "@/features/shared/hooks/use-transaction";
import type { AcceptBidInput } from "../types/bid";

export function useAcceptBid() {
  const tx = useTransaction();

  const execute = useCallback(
    async (input: AcceptBidInput) => {
      tx.start("acceptBid");
      try {
        tx.setSignaturePending();
        const txHash = await writes.acceptBid({
          jobId: input.jobId,
          provider: input.provider as `0x${string}`,
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
        const message = decodeContractError(err, "acceptBid");
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
