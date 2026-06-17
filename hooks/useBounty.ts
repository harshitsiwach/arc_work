"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicClient, getWalletClient, usdcToUnits } from "@/lib/contracts/instance";
import { usdc } from "@/lib/contracts/usdc";
import { BOUNTY_ESCROW_ABI, BOUNTY_ESCROW_ADDRESS } from "@/constants/BountyEscrowABI";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ---- Types ----

export interface BountyRow {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  reward_usdc: number;
  deadline: string;
  worker_type: "HUMAN" | "AGENT" | "BOTH";
  status: "OPEN" | "FUNDED" | "SUBMITTED" | "COMPLETED" | "REFUNDED" | "DISPUTED";
  winner_id: string | null;
  contract_bounty_id: string | null;
  escrow_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface BountySubmissionRow {
  id: string;
  bounty_id: string;
  submitter_id: string;
  proof_hash: string;
  proof_url: string | null;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  ai_validation_score: number | null;
  ai_validation_notes: string | null;
  created_at: string;
}

interface BountyFilters {
  status?: string;
  workerType?: string;
  minReward?: number;
  maxReward?: number;
}

interface CreateBountyParams {
  title: string;
  description: string;
  rewardUsdc: string;
  deadline: Date;
  workerType: "HUMAN" | "AGENT" | "BOTH";
}

const WORKER_TYPE_MAP: Record<string, number> = { HUMAN: 0, AGENT: 1, BOTH: 2 };

// ---- Helper: execute a write against the BountyEscrow contract ----

async function bountyWrite(
  functionName: string,
  args: readonly unknown[]
): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  if (!walletClient) throw new Error("Wallet not connected");
  const addresses = await walletClient.getAddresses();
  const account = addresses[0];
  if (!account) throw new Error("No active address");

  const publicClient = getPublicClient();
  const { request } = await publicClient.simulateContract({
    address: BOUNTY_ESCROW_ADDRESS,
    abi: BOUNTY_ESCROW_ABI,
    functionName,
    args,
    account,
  });
  return walletClient.writeContract(request);
}

// ---- useCreateBounty ----

export function useCreateBounty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const createBounty = useCallback(async (params: CreateBountyParams) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const rewardFloat = parseFloat(params.rewardUsdc);
      if (isNaN(rewardFloat) || rewardFloat <= 0) throw new Error("Invalid reward amount");

      const rewardUnits = usdcToUnits(rewardFloat);
      const deadlineUnix = BigInt(Math.floor(params.deadline.getTime() / 1000));
      const workerTypeNum = WORKER_TYPE_MAP[params.workerType] ?? 2;

      // 1. Approve USDC spend
      const approveTxHash = await usdc.approveIfNeeded(BOUNTY_ESCROW_ADDRESS, rewardUnits);
      if (approveTxHash) {
        const publicClient = getPublicClient();
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      }

      // 2. Call createBounty on-chain
      const hash = await bountyWrite("createBounty", [
        params.description,
        rewardUnits,
        deadlineUnix,
        workerTypeNum,
      ]);
      setTxHash(hash);

      // 3. Wait for receipt & extract on-chain bountyId from BountyCreated event
      let contractBountyId: string | null = null;
      try {
        const publicClient = getPublicClient();
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        // BountyCreated event: bountyId is the first indexed topic
        const bountyCreatedTopic = "0x" + "BountyCreated".split("").reduce(
          () => "", "" // We'll match by event name pattern below
        );
        // Find the BountyCreated log — it has 3 indexed topics (event sig, bountyId, creator)
        for (const log of receipt.logs) {
          // BountyCreated has 3 topics: [eventSig, bountyId, creator] and 3 non-indexed args
          if (log.address.toLowerCase() === BOUNTY_ESCROW_ADDRESS.toLowerCase() && log.topics.length === 3) {
            const bountyIdHex = log.topics[1];
            if (bountyIdHex) {
              contractBountyId = BigInt(bountyIdHex).toString();
              break;
            }
          }
        }
      } catch {
        // Receipt parsing is best-effort — the tx still succeeded
        console.warn("[useBounty] Could not parse BountyCreated event from receipt");
      }

      // 4. Insert row into Supabase
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: insertError } = await supabase.from("bounties").insert({
          creator_id: user.id,
          title: params.title,
          description: params.description,
          reward_usdc: rewardFloat,
          deadline: params.deadline.toISOString(),
          worker_type: params.workerType,
          status: "FUNDED",
          escrow_tx_hash: hash,
          contract_bounty_id: contractBountyId,
        });
        if (insertError) {
          console.error("[useCreateBounty] Database insert error:", insertError);
          throw new Error(`Failed to save bounty to database: ${insertError.message}`);
        }
      }

      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create bounty";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createBounty, isLoading, error, txHash };
}

// ---- useSubmitWork ----

export function useSubmitWork() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submitWork = useCallback(async (
    bountyId: string,
    proofUrl: string,
    notes?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch the bounty to get its contract_bounty_id
      const { data: bounty } = await supabase
        .from("bounties")
        .select("contract_bounty_id")
        .eq("id", bountyId)
        .single();

      // Create proof hash from URL
      const encoder = new TextEncoder();
      const data = encoder.encode(proofUrl);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = new Uint8Array(hashBuffer);
      const proofHash = ("0x" + Array.from(hashArray).map(b => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;

      // Submit on-chain if contract bounty ID exists
      let hash: string | null = null;
      if (bounty?.contract_bounty_id) {
        const contractBountyId = BigInt(bounty.contract_bounty_id);
        hash = await bountyWrite("submitWork", [contractBountyId, proofHash]);
        setTxHash(hash);
      }

      // Insert submission into Supabase
      const { data: submission, error: submitError } = await supabase.from("bounty_submissions").insert({
        bounty_id: bountyId,
        submitter_id: user.id,
        proof_hash: proofHash,
        proof_url: proofUrl,
        notes: notes ?? null,
        status: "PENDING",
      }).select("id").single();

      if (submitError) {
        console.error("[useSubmitWork] Database insert error:", submitError);
        throw new Error(`Failed to save submission to database: ${submitError.message}`);
      }

      // Update bounty status to SUBMITTED
      const { error: updateError } = await supabase.from("bounties").update({ status: "SUBMITTED" }).eq("id", bountyId);
      if (updateError) {
        console.error("[useSubmitWork] Database update error:", updateError);
        throw new Error(`Failed to update bounty status: ${updateError.message}`);
      }

      // Fire-and-forget: AI validation
      if (submission?.id) {
        fetch("/api/bounties/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proofUrl,
            bountyId,
            submissionId: submission.id,
          }),
        }).catch(() => { /* fire and forget */ });
      }

      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit work";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submitWork, isLoading, error, txHash };
}

// ---- useBounties ----

export function useBounties(filters?: BountyFilters) {
  const [bounties, setBounties] = useState<BountyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel | null = null;

    const fetchBounties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("bounties")
          .select("*")
          .order("created_at", { ascending: false });

        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.workerType) {
          query = query.eq("worker_type", filters.workerType);
        }
        if (filters?.minReward !== undefined) {
          query = query.gte("reward_usdc", filters.minReward);
        }
        if (filters?.maxReward !== undefined) {
          query = query.lte("reward_usdc", filters.maxReward);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setBounties((data as BountyRow[]) ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load bounties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBounties();

    // Realtime subscription
    channel = supabase
      .channel("bounties-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bounties" },
        () => {
          fetchBounties();
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [filters?.status, filters?.workerType, filters?.minReward, filters?.maxReward]);

  return { bounties, isLoading, error };
}

// ---- useBountyById ----

export function useBountyById(id: string) {
  const [bounty, setBounty] = useState<BountyRow | null>(null);
  const [submissions, setSubmissions] = useState<BountySubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    setIsLoading(true);
    setError(null);
    try {
      const [bountyRes, subsRes] = await Promise.all([
        supabase.from("bounties").select("*").eq("id", id).single(),
        supabase.from("bounty_submissions").select("*").eq("bounty_id", id).order("created_at", { ascending: false }),
      ]);

      if (bountyRes.error) throw bountyRes.error;
      setBounty(bountyRes.data as BountyRow);
      setSubmissions((subsRes.data as BountySubmissionRow[]) ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bounty");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bounty, submissions, isLoading, error, refresh };
}

// ---- useApproveSubmission ----

export function useApproveSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (bountyId: string, submissionId: string, contractBountyId?: string, contractSubmissionIndex?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // On-chain approval if contract IDs exist
      if (contractBountyId !== undefined && contractSubmissionIndex !== undefined) {
        await bountyWrite("approveSubmission", [
          BigInt(contractBountyId),
          BigInt(contractSubmissionIndex),
        ]);
      }

      // Update Supabase
      const supabase = createSupabaseBrowserClient();

      // Get the submitter
      const { data: sub } = await supabase
        .from("bounty_submissions")
        .select("submitter_id")
        .eq("id", submissionId)
        .single();

      await supabase
        .from("bounty_submissions")
        .update({ status: "APPROVED" })
        .eq("id", submissionId);

      await supabase
        .from("bounties")
        .update({
          status: "COMPLETED",
          winner_id: sub?.submitter_id ?? null,
        })
        .eq("id", bountyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve submission";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { approve, isLoading, error };
}

// ---- useRefundCreator ----

export function useRefundCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refund = useCallback(async (bountyId: string, contractBountyId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (contractBountyId !== undefined) {
        await bountyWrite("refundCreator", [BigInt(contractBountyId)]);
      }

      const supabase = createSupabaseBrowserClient();
      await supabase
        .from("bounties")
        .update({ status: "REFUNDED" })
        .eq("id", bountyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refund";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { refund, isLoading, error };
}
