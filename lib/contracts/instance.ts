/**
 * AgenticCommerce — Contract client factory
 * Provides typed viem clients for reading and writing
 */

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { arcTestnet } from "@/lib/web3/appkit-provider";
import { AGENTIC_COMMERCE_ADDRESS } from "./constants";
import AGENTIC_COMMERCE_ABI from "./abi.json";

export const ABI = AGENTIC_COMMERCE_ABI.abi;

let _publicClient: PublicClient | null = null;

export function getPublicClient(chain: any = arcTestnet): any {
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0], {
      batch: true,
      retryCount: 2,
    }),
  });
}

// EIP-1193 provider reference (set by WalletProvider from AppKit)
let _walletProvider: any = null;

export function setWalletProvider(provider: unknown) {
  _walletProvider = provider;
  console.log("[instance] AppKit wallet provider set:", !!provider);
}

export function getWalletClient(chain: any = arcTestnet): any {
  if (typeof window === "undefined") return null;

  if (_walletProvider) {
    console.log("[instance] using AppKit wallet provider");
    return createWalletClient({
      chain,
      transport: custom(_walletProvider),
    });
  }

  console.log("[instance] AppKit provider not found, trying window.ethereum");
  const ethereum = (window as unknown as { ethereum?: unknown })["ethereum"];
  if (!ethereum) {
    console.log("[instance] window.ethereum not found either");
    return null;
  }

  return createWalletClient({
    chain,
    transport: custom(ethereum as Parameters<typeof custom>[0]),
  });
}

export async function getActiveAddress(): Promise<`0x${string}` | null> {
  const client = getWalletClient();
  if (!client) return null;
  const addresses = await client.getAddresses();
  return addresses[0] ?? null;
}

export { AGENTIC_COMMERCE_ADDRESS };

export function usdcToUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** 6));
}

export function bigintToUsdc(units: bigint): number {
  return Number(units) / 10 ** 6;
}
