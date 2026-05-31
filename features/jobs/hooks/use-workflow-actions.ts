"use client";

import { useCallback } from "react";
import { writes } from "@/lib/contracts/writes";
import { waitForTransaction } from "@/lib/contracts/wait";
import { decodeContractError } from "@/lib/contracts/errors";
import { useTransaction } from "@/features/shared/hooks/use-transaction";

function hookResult<E extends (...args: never[]) => Promise<void>>(
  tx: ReturnType<typeof useTransaction>,
  execute: E
) {
  return {
    execute,
    state: tx.state,
    status: tx.state.status,
    txHash: tx.state.txHash,
    error: tx.state.error,
    functionName: tx.state.functionName,
    isIdle: tx.isIdle,
    isLoading: tx.isLoading,
    isSuccess: tx.isSuccess,
    isError: tx.isError,
    reset: tx.reset,
  } satisfies {
    execute: E;
    state: typeof tx.state;
    status: typeof tx.state.status;
    txHash: typeof tx.state.txHash;
    error: typeof tx.state.error;
    functionName: typeof tx.state.functionName;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    reset: () => void;
  };
}

export function useFundJob() {
  const tx = useTransaction();
  const execute = useCallback(
    async (jobId: bigint, amount: bigint) => {
      tx.start("fundJob");
      try {
        tx.setSignaturePending();
        const result = await writes.approveAndFund({ jobId, amount });
        if (result.approveHash) tx.setTransactionPending(result.approveHash);
        tx.setTransactionPending(result.fundHash);
        tx.setTransactionConfirming(result.fundHash);
        const receipt = await waitForTransaction(result.fundHash);
        if (receipt.status === "success") {
          tx.setTransactionSuccess(result.fundHash);
        } else {
          tx.setTransactionFailed("Transaction reverted");
        }
      } catch (err: unknown) {
        tx.setTransactionFailed(decodeContractError(err, "fund"));
      }
    },
    [tx]
  );
  return hookResult(tx, execute);
}

export function useSubmitWork() {
  const tx = useTransaction();
  const execute = useCallback(
    async (jobId: bigint, deliverable: `0x${string}`) => {
      tx.start("submitWork");
      try {
        tx.setSignaturePending();
        const txHash = await writes.submitWork({ jobId, deliverable });
        tx.setTransactionPending(txHash);
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);
        if (receipt.status === "success") tx.setTransactionSuccess(txHash);
        else tx.setTransactionFailed("Transaction reverted");
      } catch (err: unknown) {
        tx.setTransactionFailed(decodeContractError(err, "submit"));
      }
    },
    [tx]
  );
  return hookResult(tx, execute);
}

export function useCompleteJob() {
  const tx = useTransaction();
  const execute = useCallback(
    async (jobId: bigint, reason?: `0x${string}`) => {
      tx.start("completeJob");
      try {
        tx.setSignaturePending();
        const txHash = await writes.completeJob({ jobId, reason: reason ?? "0x0000000000000000000000000000000000000000000000000000000000000000" });
        tx.setTransactionPending(txHash);
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);
        if (receipt.status === "success") tx.setTransactionSuccess(txHash);
        else tx.setTransactionFailed("Transaction reverted");
      } catch (err: unknown) {
        tx.setTransactionFailed(decodeContractError(err, "complete"));
      }
    },
    [tx]
  );
  return hookResult(tx, execute);
}

export function useRejectJob() {
  const tx = useTransaction();
  const execute = useCallback(
    async (jobId: bigint, reason?: `0x${string}`) => {
      tx.start("rejectJob");
      try {
        tx.setSignaturePending();
        const txHash = await writes.rejectJob({ jobId, reason: reason ?? "0x0000000000000000000000000000000000000000000000000000000000000000" });
        tx.setTransactionPending(txHash);
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);
        if (receipt.status === "success") tx.setTransactionSuccess(txHash);
        else tx.setTransactionFailed("Transaction reverted");
      } catch (err: unknown) {
        tx.setTransactionFailed(decodeContractError(err, "reject"));
      }
    },
    [tx]
  );
  return hookResult(tx, execute);
}

export function useClaimRefund() {
  const tx = useTransaction();
  const execute = useCallback(
    async (jobId: bigint) => {
      tx.start("claimRefund");
      try {
        tx.setSignaturePending();
        const txHash = await writes.claimRefund({ jobId });
        tx.setTransactionPending(txHash);
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);
        if (receipt.status === "success") tx.setTransactionSuccess(txHash);
        else tx.setTransactionFailed("Transaction reverted");
      } catch (err: unknown) {
        tx.setTransactionFailed(decodeContractError(err, "claimRefund"));
      }
    },
    [tx]
  );
  return hookResult(tx, execute);
}
