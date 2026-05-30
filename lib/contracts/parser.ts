/**
 * AgenticCommerce — Parser service
 * Converts raw contract return values to typed objects
 */

import type { Job, Bid, PlatformStats, JobStatus } from "./types";

export function parseJob(raw: readonly unknown[]): Job {
  return {
    id: raw[0] as bigint,
    client: raw[1] as `0x${string}`,
    provider: raw[2] as `0x${string}`,
    evaluator: raw[3] as `0x${string}`,
    description: raw[4] as string,
    budget: raw[5] as bigint,
    expiredAt: raw[6] as bigint,
    status: raw[7] as JobStatus,
    hook: raw[8] as `0x${string}`,
  };
}

export function parseBid(raw: unknown): Bid {
  if (raw && typeof raw === "object" && "provider" in (raw as Record<string, unknown>)) {
    const obj = raw as Record<string, unknown>;
    return {
      provider: obj.provider as `0x${string}`,
      amount: obj.amount as bigint,
      accepted: obj.accepted as boolean,
    };
  }
  const arr = raw as readonly unknown[];
  return {
    provider: arr[0] as `0x${string}`,
    amount: arr[1] as bigint,
    accepted: arr[2] as boolean,
  };
}

export function parseBids(raw: unknown): Bid[] {
  const arr = raw as readonly unknown[];
  return arr.map((item) => parseBid(item));
}

export function parsePlatformStats(raw: readonly unknown[]): PlatformStats {
  return {
    totalJobs: raw[0] as bigint,
    totalEscrowed: raw[1] as bigint,
  };
}
