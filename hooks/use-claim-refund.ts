"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { ClaimRefundParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useClaimRefund() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: ClaimRefundParams) => {
      tx.start("claimRefund");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.claimRefund(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "claimRefund");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
