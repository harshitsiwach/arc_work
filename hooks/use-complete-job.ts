"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { ResolveJobParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useCompleteJob() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: ResolveJobParams) => {
      tx.start("completeJob");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.completeJob(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "complete");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
