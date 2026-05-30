"use client";

import { useCallback, useState } from "react";
import { writes } from "@/lib/contracts/writes";
import { reads } from "@/lib/contracts/reads";
import { waitForTransaction } from "@/lib/contracts/wait";
import { decodeContractError } from "@/lib/contracts/errors";
import { AGENTIC_COMMERCE_ADDRESS } from "@/lib/contracts/instance";
import { useTransaction } from "@/features/shared/hooks/use-transaction";
import { jobService } from "../services/job-service";
import type { CreateJobInput, JobRecord } from "../types/job";

interface UseCreateJobReturn {
  execute: (input: CreateJobInput, profileId: string, walletAddress: string) => Promise<JobRecord>;
  state: ReturnType<typeof useTransaction>["state"];
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  txHash: `0x${string}` | null;
  error: string | null;
  reset: () => void;
  onchainSuccess: boolean;
  onchainJobId: number | null;
}

// keccak256("JobCreated(uint256,address,address,address,uint256,address)")
const JOB_CREATED_TOPIC = "0xb0f0239bfdd96453e24733e18bfc24b70d8fadf123dd977473518dd577ee79b9";

function extractJobIdFromLogs(logs: Array<{ address: string; topics: readonly `0x${string}`[] }>): number | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== AGENTIC_COMMERCE_ADDRESS.toLowerCase()) continue;
    if (log.topics[0] !== JOB_CREATED_TOPIC) continue;
    const jobIdHex = log.topics[1];
    if (jobIdHex) {
      return Number(BigInt(jobIdHex));
    }
  }
  return null;
}

export function useCreateJob(): UseCreateJobReturn {
  const tx = useTransaction();
  const [onchainSuccess, setOnchainSuccess] = useState(false);
  const [onchainJobId, setOnchainJobId] = useState<number | null>(null);

  const execute = useCallback(
    async (input: CreateJobInput, profileId: string, walletAddress: string): Promise<JobRecord> => {
      console.log("[createJob] step 1: creating gig in Supabase");
      tx.start("createJob");
      const gig = await jobService.createJob(input, profileId, walletAddress);
      console.log("[createJob] Supabase gig created:", gig.id);

      try {
        console.log("[createJob] step 2: calling writes.createJob()");
        tx.setSignaturePending();

        const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
        const oneDay = BigInt(86400);
        const defaultDuration = BigInt(30) * oneDay;
        const customDuration = input.delivery_days ? BigInt(input.delivery_days) * oneDay : defaultDuration;
        const expiredAt = nowSeconds + customDuration;
        console.log("[createJob] deploy params:", {
          provider: "0x0000...0000",
          evaluator: input.evaluator_address || "(auto: wallet address)",
          expiredAt: expiredAt.toString(),
          description: input.title,
          hook: input.hook_address || "0x0000...0000",
        });

        const evaluatorAddress = (input.evaluator_address as `0x${string}`) || "0x0000000000000000000000000000000000000000";

        const txHash = await writes.createJob({
          provider: "0x0000000000000000000000000000000000000000",
          evaluator: evaluatorAddress,
          expiredAt,
          description: input.title,
          hook: (input.hook_address as `0x${string}`) || "0x0000000000000000000000000000000000000000",
        });

        console.log("[createJob] step 3: transaction broadcasted:", txHash);
        tx.setTransactionPending(txHash);

        console.log("[createJob] step 4: waiting for confirmation...");
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);
        console.log("[createJob] receipt status:", receipt.status, "logs count:", receipt.logs.length);

        if (receipt.status === "success") {
          // Log all logs for debugging
          receipt.logs.forEach((log, i) => {
            console.log(`[createJob] log ${i}: address=${log.address}, topic0=${log.topics[0]}, topic1=${log.topics[1]}`);
          });

          let onchainId = extractJobIdFromLogs(receipt.logs);
          console.log("[createJob] extracted onchainJobId from logs:", onchainId);

          // Always try jobCounter as reliable fallback
          if (onchainId === null) {
            try {
              const counter = await reads.jobCounter();
              onchainId = Number(counter) - 1;
              console.log("[createJob] fallback: jobCounter gave:", onchainId);
            } catch (e) {
              console.warn("[createJob] fallback jobCounter failed:", e);
            }
          }

          if (onchainId !== null) {
            console.log("[createJob] step 5: storing onchain_job_id in Supabase:", onchainId);
            try {
              await jobService.updateOnchainJobId(gig.id, onchainId);
              console.log("[createJob] Supabase updated successfully");
            } catch (e) {
              console.error("[createJob] failed to update Supabase:", e);
            }
            gig.onchain_job_id = onchainId;
            setOnchainJobId(onchainId);
            setOnchainSuccess(true);
          } else {
            console.warn("[createJob] could not determine onchain_job_id from event or fallback");
          }

          tx.setTransactionSuccess(txHash);
        } else {
          console.error("[createJob] transaction reverted onchain");
          tx.setTransactionFailed("Transaction reverted onchain");
        }
      } catch (err: unknown) {
        console.error("[createJob] onchain deployment failed:", err);
        const message = decodeContractError(err, "createJob");
        console.log("[createJob] decoded error:", message);
        tx.setTransactionFailed(message);
      }

      return gig;
    },
    [tx]
  );

  const reset = useCallback(() => {
    tx.reset();
    setOnchainSuccess(false);
    setOnchainJobId(null);
  }, [tx]);

  return {
    execute,
    ...tx.state,
    ...tx,
    reset,
    onchainSuccess,
    onchainJobId,
  };
}
