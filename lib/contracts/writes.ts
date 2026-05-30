/**
 * AgenticCommerce — Write service
 * All contract write operations go through this layer
 */

import {
  getWalletClient,
  getPublicClient,
  AGENTIC_COMMERCE_ADDRESS,
  ABI,
} from "./instance";
import { usdc } from "./usdc";
import type {
  CreateJobParams,
  FundJobParams,
  SubmitBidParams,
  AcceptBidParams,
  SetBudgetParams,
  SubmitWorkParams,
  ResolveJobParams,
  ClaimRefundParams,
} from "./types";

const ADDR = AGENTIC_COMMERCE_ADDRESS;

async function getAccountAddress(): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  if (!walletClient) throw new Error("Wallet not connected");
  const addresses = await walletClient.getAddresses();
  const account = addresses[0];
  if (!account) throw new Error("No active address");
  return account;
}

async function executeWrite(
  functionName: string,
  args: readonly unknown[]
): Promise<`0x${string}`> {
  console.log(`[write] ${functionName} starting`, { args: JSON.stringify(args.map(a => typeof a === 'bigint' ? a.toString() : a)) });

  const walletClient = getWalletClient();
  if (!walletClient) {
    console.error("[write] No wallet client — AppKit provider may not be initialized");
    throw new Error("Wallet not connected");
  }

  const addresses = await walletClient.getAddresses();
  console.log("[write] wallet addresses:", addresses);
  const account = addresses[0];
  if (!account) {
    console.error("[write] No active address in wallet");
    throw new Error("No active address");
  }

  const publicClient = getPublicClient();
  console.log(`[write] simulating ${functionName} on ${ADDR} with account ${account}`);

  try {
    const { request } = await publicClient.simulateContract({
      address: ADDR,
      abi: ABI,
      functionName,
      args,
      account,
    });
    console.log(`[write] simulation succeeded, sending transaction...`);
    const txHash = await walletClient.writeContract(request);
    console.log(`[write] transaction broadcasted: ${txHash}`);
    return txHash;
  } catch (err: unknown) {
    console.error(`[write] ${functionName} failed:`, err);
    throw err;
  }
}

const ZERO = "0x0000000000000000000000000000000000000000";

export const writes = {
  async createJob(params: CreateJobParams): Promise<`0x${string}`> {
    const evaluator = params.evaluator === ZERO ? await getAccountAddress() : params.evaluator;
    console.log("[write] createJob evaluator resolved to:", evaluator);
    return executeWrite("createJob", [
      params.provider,
      evaluator,
      params.expiredAt,
      params.description,
      params.hook,
    ]);
  },

  async approveAndFund(params: FundJobParams): Promise<{
    approveHash: `0x${string}` | null;
    fundHash: `0x${string}`;
  }> {
    const approveHash = await usdc.approveIfNeeded(ADDR, params.amount);
    const fundHash = await executeWrite("fund", [params.jobId, "0x"]);
    return { approveHash, fundHash };
  },

  async submitBid(params: SubmitBidParams): Promise<`0x${string}`> {
    return executeWrite("submitBid", [params.jobId, params.amount]);
  },

  async acceptBid(params: AcceptBidParams): Promise<`0x${string}`> {
    return executeWrite("acceptBid", [params.jobId, params.provider]);
  },

  async setBudget(params: SetBudgetParams): Promise<`0x${string}`> {
    return executeWrite("setBudget", [params.jobId, params.amount, "0x"]);
  },

  async submitWork(params: SubmitWorkParams): Promise<`0x${string}`> {
    return executeWrite("submit", [params.jobId, params.deliverable, "0x"]);
  },

  async completeJob(params: ResolveJobParams): Promise<`0x${string}`> {
    return executeWrite("complete", [params.jobId, params.reason, "0x"]);
  },

  async rejectJob(params: ResolveJobParams): Promise<`0x${string}`> {
    return executeWrite("reject", [params.jobId, params.reason, "0x"]);
  },

  async claimRefund(params: ClaimRefundParams): Promise<`0x${string}`> {
    return executeWrite("claimRefund", [params.jobId]);
  },
} as const;
