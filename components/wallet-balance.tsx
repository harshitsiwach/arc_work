/**
 * Arc Work — Wallet Balance Display
 */

"use client";

import { useWalletBalance } from "@/app/hooks/useWalletBalance";
import { Skeleton } from "./ui/skeleton";

interface WalletBalanceProps {
  walletId?: string;
}

export function WalletBalance({ walletId }: WalletBalanceProps) {
  const { balance, loading } = useWalletBalance(walletId || "");

  if (!walletId) {
    return <span style={{ color: "var(--color-fg-muted)" }}>—</span>;
  }

  if (loading) {
    return <Skeleton className="w-[103px] h-[28px]" />;
  }

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  return <span>{formattedBalance}</span>;
}
