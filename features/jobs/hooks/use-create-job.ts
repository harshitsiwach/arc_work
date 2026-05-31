"use client";

import { useCallback, useState } from "react";
import { writes } from "@/lib/contracts/writes";
import { reads } from "@/lib/contracts/reads";
import { waitForTransaction } from "@/lib/contracts/wait";
import { decodeContractError } from "@/lib/contracts/errors";
import { AGENTIC_COMMERCE_ADDRESS } from "@/lib/contracts/instance";
import { useTransaction } from "@/features/shared/hooks/use-transaction";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { CreateJobInput } from "../types/job";

interface UseCreateJobReturn {
  execute: (input: CreateJobInput, profileId: string) => Promise<{ onchainJobId: number; dbId: string | null }>;
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

const JOB_CREATED_TOPIC = "0xb0f0239bfdd96453e24733e18bfc24b70d8fadf123dd977473518dd577ee79b9";

function extractJobIdFromLogs(logs: Array<{ address: string; topics: readonly `0x${string}`[] }>): number | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== AGENTIC_COMMERCE_ADDRESS.toLowerCase()) continue;
    if (log.topics[0] !== JOB_CREATED_TOPIC) continue;
    const jobIdHex = log.topics[1];
    if (jobIdHex) return Number(BigInt(jobIdHex));
  }
  return null;
}

export function useCreateJob(): UseCreateJobReturn {
  const tx = useTransaction();
  const [onchainSuccess, setOnchainSuccess] = useState(false);
  const [onchainJobId, setOnchainJobId] = useState<number | null>(null);

  const execute = useCallback(
    async (input: CreateJobInput, profileId: string): Promise<{ onchainJobId: number; dbId: string | null }> => {
      tx.start("createJob");

      try {
        tx.setSignaturePending();

        const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
        const oneDay = BigInt(86400);
        const defaultDuration = BigInt(30) * oneDay;
        const customDuration = input.delivery_days ? BigInt(input.delivery_days) * oneDay : defaultDuration;
        const expiredAt = nowSeconds + customDuration;
        const evaluatorAddress = (input.evaluator_address as `0x${string}`) || "0x0000000000000000000000000000000000000000";

        const txHash = await writes.createJob({
          provider: "0x0000000000000000000000000000000000000000",
          evaluator: evaluatorAddress,
          expiredAt,
          description: input.title,
          hook: (input.hook_address as `0x${string}`) || "0x0000000000000000000000000000000000000000",
        });

        tx.setTransactionPending(txHash);
        tx.setTransactionConfirming(txHash);
        const receipt = await waitForTransaction(txHash);

        if (receipt.status === "success") {
          let onchainId = extractJobIdFromLogs(receipt.logs);

          if (onchainId === null) {
            try {
              const counter = await reads.jobCounter();
              onchainId = Number(counter) - 1;
            } catch {}
          }

          if (onchainId === null) throw new Error("Could not determine onchain job ID from event or contract");

          // Store minimal index record in DB for listing/search
          let dbId: string | null = null;
          try {
            const sb = createSupabaseBrowserClient();
            const { data } = await sb.from("gigs").insert({
              onchain_job_id: onchainId,
              creator_profile_id: profileId,
              title: input.title,
              description: input.description,
              category: input.category,
              price_amount: input.price_amount,
              price_currency: "USDC",
              delivery_days: input.delivery_days,
              status: "open",
              agent_only: input.agent_only ?? false,
              skills_required: input.skills_required ?? [],
            }).select("id").single();
            dbId = data?.id ?? null;
          } catch {}

          setOnchainJobId(onchainId);
          setOnchainSuccess(true);
          tx.setTransactionSuccess(txHash);

          return { onchainJobId: onchainId, dbId };
        } else {
          throw new Error("Transaction reverted");
        }
      } catch (err: unknown) {
        const message = decodeContractError(err, "createJob");
        tx.setTransactionFailed(message);
        throw err;
      }
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
