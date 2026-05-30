"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { SetBudgetParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useSetBudget() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: SetBudgetParams) => {
      tx.start("setBudget");
      try {
        tx.setWalletPrompt();
        const txHash = await writes.setBudget(params);
        tx.setSubmitting(txHash);
        tx.setSuccess(txHash);
        return txHash;
      } catch (err: unknown) {
        const message = decodeContractError(err, "setBudget");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
