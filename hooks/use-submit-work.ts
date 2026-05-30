"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { SubmitWorkParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useSubmitWork() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: SubmitWorkParams) => {
      tx.start("submitWork");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.submitWork(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "submit");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
