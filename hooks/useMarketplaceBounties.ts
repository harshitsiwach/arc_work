"use client";

import { useState, useEffect } from "react";
import { bountyReads } from "@/lib/bounty/reads";
import { bigintToUsdc } from "@/lib/contracts/instance";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { Bounty } from "@/components/listings/bounties-content";

const CONTRACT_STATUS_MAP: Record<number, string> = {
  0: "open",
  1: "open",
  2: "in-review",
  3: "completed",
  4: "completed",
  5: "in-review",
};

const WORKER_TYPE_MAP: Record<number, string> = {
  0: "human",
  1: "ai-agent",
  2: "hybrid",
};

function deriveDifficulty(reward: number): string {
  if (reward >= 10000) return "advanced";
  if (reward >= 5000) return "intermediate";
  return "beginner";
}

function getRelativeDeadline(deadline: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const dl = Number(deadline);
  const diff = dl - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / 60);
  return `${mins}m left`;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface MarketplaceBountyResult {
  bounties: Bounty[];
  isLoading: boolean;
  error: string | null;
}

export function useMarketplaceBounties(): MarketplaceBountyResult {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch total bounty count from contract
        const total = await bountyReads.nextBountyId();

        // 2. Try Supabase enrichment (non-fatal if fails)
        let supabaseMap = new Map<string, {
          title: string;
          description: string;
          reward_usdc: number;
          deadline: string;
          creator_id: string;
        }>();
        try {
          const supabase = createSupabaseBrowserClient();
          const { data } = await supabase
            .from("bounties")
            .select("id, title, description, reward_usdc, deadline, creator_id, contract_bounty_id");
          if (data) {
            for (const row of data) {
              const key = row.contract_bounty_id ?? row.id;
              supabaseMap.set(key, {
                title: row.title,
                description: row.description,
                reward_usdc: Number(row.reward_usdc),
                deadline: row.deadline,
                creator_id: row.creator_id,
              });
            }
          }
        } catch {
          // Supabase unavailable — use contract-only data
        }

        // 3. Fetch each bounty from contract
        if (total > 200n) {
          setError("Too many bounties to fetch. Narrow your search.");
          setIsLoading(false);
          return;
        }

        const results: Bounty[] = [];
        for (let i = 0n; i < total; i++) {
          try {
            const contract = await bountyReads.getBounty(i);
            const contractId = i.toString();
            const enriched = supabaseMap.get(contractId);

            results.push({
              id: contractId,
              title: enriched?.title ?? `Bounty #${contractId}`,
              description: enriched?.description ?? "Complete this bounty to earn USDC rewards on Arc Testnet.",
              reward: enriched?.reward_usdc ?? bigintToUsdc(contract.reward),
              creator: enriched?.creator_id
                ? truncateAddress(enriched.creator_id)
                : truncateAddress(contract.creator),
              category: "development",
              difficulty: deriveDifficulty(
                enriched?.reward_usdc ?? bigintToUsdc(contract.reward)
              ) as "beginner" | "intermediate" | "advanced",
              deadline: enriched?.deadline
                ? getRelativeDeadline(BigInt(Math.floor(new Date(enriched.deadline).getTime() / 1000)))
                : getRelativeDeadline(contract.deadline),
              applicants: Number(contract.submissionCount),
              status: (CONTRACT_STATUS_MAP[contract.status] ?? "open") as "open" | "in-review" | "completed",
              collaborationType: (WORKER_TYPE_MAP[contract.workerType] ?? "hybrid") as "ai-agent" | "human" | "hybrid",
            });
          } catch {
            // skip — bounty may not exist
          }
        }

        if (!cancelled) {
          setBounties(results);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load bounties";
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { bounties, isLoading, error };
}
