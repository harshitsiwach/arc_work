/**
 * AgenticCommerce — Parser service
 * Converts raw contract return values to typed objects
 */

import type { Job, Bid, PlatformStats, JobStatus } from "./types";

export function parseJob(raw: unknown): Job {
  if (raw && typeof raw === "object" && "client" in (raw as Record<string, unknown>)) {
    const obj = raw as Record<string, unknown>;
    return {
      id: obj.id as bigint,
      client: obj.client as `0x${string}`,
      provider: obj.provider as `0x${string}`,
      evaluator: obj.evaluator as `0x${string}`,
      description: obj.description as string,
      budget: obj.budget as bigint,
      expiredAt: obj.expiredAt as bigint,
      status: obj.status as JobStatus,
      hook: obj.hook as `0x${string}`,
    };
  }
  const arr = raw as readonly unknown[];
  return {
    id: arr[0] as bigint,
    client: arr[1] as `0x${string}`,
    provider: arr[2] as `0x${string}`,
    evaluator: arr[3] as `0x${string}`,
    description: arr[4] as string,
    budget: arr[5] as bigint,
    expiredAt: arr[6] as bigint,
    status: arr[7] as JobStatus,
    hook: arr[8] as `0x${string}`,
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
