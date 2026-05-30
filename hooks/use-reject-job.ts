"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { ResolveJobParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useRejectJob() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: ResolveJobParams) => {
      tx.start("rejectJob");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.rejectJob(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "reject");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
