"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { AcceptBidParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useAcceptBid() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: AcceptBidParams) => {
      tx.start("acceptBid");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.acceptBid(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "acceptBid");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
