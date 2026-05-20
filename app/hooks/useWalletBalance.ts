/**
 * Arc Work — Wallet Balance Hook
 */

"use client";

import type { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";

interface UseWalletBalanceResult {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

export function useWalletBalance(walletId: string): UseWalletBalanceResult {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const fetchBalance = useCallback(async () => {
    if (!walletId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const balanceResponse = await fetch('/api/wallet/balance', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId })
      });

      if (!balanceResponse.ok) {
        const err = await balanceResponse.json().catch(() => ({}));
        console.error("Error fetching wallet balance:", err.error);
        setBalance(0);
        return;
      }

      const parsedBalance = await balanceResponse.json();

      if (parsedBalance.balance === null || parsedBalance.balance === undefined) {
        setBalance(0);
        return;
      }

      setBalance(parseFloat(parsedBalance.balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!walletId) return;

    const supabase = createSupabaseBrowserClient();
    const walletSubscription = supabase
      .channel(`wallet-${walletId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `circle_wallet_id=eq.${walletId}`,
        },
        (payload) => {
          const newBalance = parseFloat(payload.new.balance || "0");
          if (newBalance !== balanceRef.current) {
            setBalance(newBalance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletSubscription);
    };
  }, [walletId]);

  return {
    balance,
    loading,
    refreshBalance: fetchBalance,
  };
}
