"use client";

import { useWallet } from "@/lib/web3/wallet-provider";

type UserRole = "viewer" | "client" | "provider";

interface UseRoleResult {
  role: UserRole;
  isViewer: boolean;
  isClient: boolean;
  isProvider: boolean;
}

export function useRole(walletAddress: string | null | undefined): UseRoleResult {
  const { activeAddress } = useWallet();

  const isConnected = !!activeAddress;
  const isOwner = isConnected && activeAddress?.toLowerCase() === walletAddress?.toLowerCase();

  const role: UserRole = !isConnected
    ? "viewer"
    : isOwner
    ? "client"
    : "provider";

  return {
    role,
    isViewer: role === "viewer",
    isClient: role === "client",
    isProvider: role === "provider",
  };
}
