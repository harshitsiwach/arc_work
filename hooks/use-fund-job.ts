"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { useTransaction } from "./use-transaction";
import type { FundJobParams } from "@/lib/contracts/types";
import { decodeContractError } from "@/lib/contracts/errors";

export function useFundJob() {
  const tx = useTransaction();

  const execute = useCallback(
    async (params: FundJobParams) => {
      tx.start("fundJob");
      try {
        tx.setWalletPrompt();
        const result = await writes.approveAndFund(params);
        tx.setSubmitting(result.fundHash);
        tx.setSuccess(result.fundHash);
        return result;
      } catch (err: unknown) {
        const message = decodeContractError(err, "fund");
        tx.setError(message);
        throw new Error(message);
      }
    },
    [tx]
  );

  return { execute, ...tx.state, reset: tx.reset };
}
