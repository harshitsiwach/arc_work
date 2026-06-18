"use client";

import { useState, useEffect } from "react";
import { bountyReads } from "@/lib/bounty/reads";
import { bigintToUsdc } from "@/lib/contracts/instance";
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
        // Single RPC call — fetches all bounties with title/description from on-chain
        const contractBounties = await bountyReads.getAllBounties();

        const results: Bounty[] = contractBounties.map((contract) => {
          const reward = bigintToUsdc(contract.reward);
          return {
            id: contract.id.toString(),
            title: contract.title || `Bounty #${contract.id.toString()}`,
            description: contract.description || "Complete this bounty to earn USDC rewards on Arc Testnet.",
            reward,
            creator: truncateAddress(contract.creator),
            category: "development",
            difficulty: deriveDifficulty(reward) as "beginner" | "intermediate" | "advanced",
            deadline: getRelativeDeadline(contract.deadline),
            applicants: Number(contract.submissionCount),
            status: (CONTRACT_STATUS_MAP[contract.status] ?? "open") as "open" | "in-review" | "completed",
            collaborationType: (WORKER_TYPE_MAP[contract.workerType] ?? "hybrid") as "ai-agent" | "human" | "hybrid",
          };
        });

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
