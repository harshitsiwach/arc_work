/**
 * AgenticCommerce — Read service
 * All contract read operations go through this layer
 */

import { getPublicClient, AGENTIC_COMMERCE_ADDRESS, ABI } from "./instance";
import { parseJob, parseBids, parsePlatformStats } from "./parser";
import type { Job, Bid, PlatformStats, FeeConfig } from "./types";

const ADDR = AGENTIC_COMMERCE_ADDRESS;

export const reads = {
  async getJob(jobId: bigint): Promise<Job> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "getJob",
      args: [jobId],
    });
    return parseJob(result as readonly unknown[]);
  },

  async getBids(jobId: bigint): Promise<Bid[]> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "getBids",
      args: [jobId],
    });
    return parseBids(result as readonly unknown[]);
  },

  async getPlatformStats(): Promise<PlatformStats> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "getPlatformStats",
    });
    return parsePlatformStats(result as readonly unknown[]);
  },

  async getFeeConfig(): Promise<FeeConfig> {
    const client = getPublicClient();
    const [platformFeeBP, evaluatorFeeBP, treasury] = await Promise.all([
      client.readContract({
        address: ADDR,
        abi: ABI,
        functionName: "platformFeeBP",
      }),
      client.readContract({
        address: ADDR,
        abi: ABI,
        functionName: "evaluatorFeeBP",
      }),
      client.readContract({
        address: ADDR,
        abi: ABI,
        functionName: "platformTreasury",
      }),
    ]);
    return {
      platformFeeBP: platformFeeBP as bigint,
      evaluatorFeeBP: evaluatorFeeBP as bigint,
      treasury: treasury as `0x${string}`,
    };
  },

  async jobHasBudget(jobId: bigint): Promise<boolean> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "jobHasBudget",
      args: [jobId],
    });
    return result as boolean;
  },

  async jobCounter(): Promise<bigint> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "jobCounter",
    });
    return result as bigint;
  },

  async paymentToken(): Promise<`0x${string}`> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDR,
      abi: ABI,
      functionName: "paymentToken",
    });
    return result as `0x${string}`;
  },
} as const;
