"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/wallet-provider";

interface WalletBalanceStatProps {
  walletId?: string | null;
}

export function WalletBalanceStat({ walletId }: WalletBalanceStatProps) {
  const { smartWallet, activeAddress, activeWalletType } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveWalletId = walletId ?? smartWallet?.walletId ?? null;

  useEffect(() => {
    let cancelled = false;
    const fetchBalance = async () => {
      if (!effectiveWalletId) {
        setBalance(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/wallet/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletId: effectiveWalletId }),
        });
        if (!res.ok) throw new Error("Failed to load balance");
        const data = await res.json();
        if (!cancelled) {
          const parsed = parseFloat(data.balance ?? "0");
          setBalance(Number.isFinite(parsed) ? parsed : 0);
        }
      } catch {
        if (!cancelled) setBalance(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [effectiveWalletId]);

  if (loading) {
    return (
      <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg-muted)" }}>
        —
      </span>
    );
  }

  if (balance !== null) {
    return (
      <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
        {balance.toFixed(2)} <span className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
      </span>
    );
  }

  return (
    <span className="text-sm font-medium" style={{ color: "var(--color-fg-muted)" }}>
      {activeAddress
        ? activeWalletType === "smart"
          ? "—"
          : "EOA"
        : "Connect wallet"}
    </span>
  );
}
