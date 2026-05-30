"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { SubmitBidParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useSubmitBid() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: SubmitBidParams) => {
      tx.start("submitBid");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.submitBid(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "submitBid");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
