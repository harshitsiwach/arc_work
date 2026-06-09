/**
 * USDC Service
 * All USDC token interactions go through this layer
 */

import { getPublicClient, getWalletClient, AGENTIC_COMMERCE_ADDRESS, ABI } from "./instance";

const ERC20_ABI = [
  {
    type: "function" as const,
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable" as const,
  },
  {
    type: "function" as const,
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view" as const,
  },
] as const;

let _usdcAddress: `0x${string}` | null = null;

async function getUSDCAddress(): Promise<`0x${string}`> {
  if (_usdcAddress) return _usdcAddress;

  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: AGENTIC_COMMERCE_ADDRESS,
      abi: ABI,
      functionName: "paymentToken",
    });
    _usdcAddress = result as `0x${string}`;
  } catch (error) {
    console.warn("[USDC] Failed to fetch USDC address from AgenticCommerce contract, using fallback:", error);
    _usdcAddress = (process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`) || "0x3600000000000000000000000000000000000000";
  }
  return _usdcAddress;
}

async function getAccount(): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  if (!walletClient) throw new Error("Wallet not connected");
  const addresses = await walletClient.getAddresses();
  const account = addresses[0];
  if (!account) throw new Error("No active address");
  return account;
}

export const usdc = {
  async getAddress(): Promise<`0x${string}`> {
    return getUSDCAddress();
  },

  async getBalance(address: `0x${string}`): Promise<bigint> {
    const publicClient = getPublicClient();
    const usdcAddress = await getUSDCAddress();
    const result = await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return result as bigint;
  },

  async getAllowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
    const publicClient = getPublicClient();
    const usdcAddress = await getUSDCAddress();
    const result = await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    });
    return result as bigint;
  },

  async approve(spender: `0x${string}`, amount: bigint): Promise<`0x${string}`> {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error("Wallet not connected");

    const account = await getAccount();
    const usdcAddress = await getUSDCAddress();
    const publicClient = getPublicClient();

    const { request } = await publicClient.simulateContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
      account,
    });

    return walletClient.writeContract(request);
  },

  async approveIfNeeded(spender: `0x${string}`, amount: bigint): Promise<`0x${string}` | null> {
    const account = await getAccount();
    const allowance = await usdc.getAllowance(account, spender);

    if (allowance >= amount) {
      return null;
    }

    return usdc.approve(spender, amount);
  },
} as const;
