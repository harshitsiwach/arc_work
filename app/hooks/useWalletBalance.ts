/**
 * Arc Work — Wallet Balance Hook
 */

"use client";

import type { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";

import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useAppKitProvider } from "@reown/appkit/react";

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
  
  // Safely grab the EOA provider if the user is connected
  const appKitContext = useAppKitProvider("eip155");
  const walletProvider = appKitContext?.walletProvider;

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      let developerBalance = 0;
      let eoaBalance = 0;

      // 1. Fetch Developer Wallet Balance from Server API (Aggregated across chains)
      if (walletId) {
        try {
          const balanceResponse = await fetch('/api/wallet/balance', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletId })
          });
          if (balanceResponse.ok) {
            const parsedBalance = await balanceResponse.json();
            if (parsedBalance.balance) {
              developerBalance = parseFloat(parsedBalance.balance);
            }
          }
        } catch (e) {
          console.error("Error fetching developer wallet balance:", e);
        }
      }

      // 2. Fetch EOA Unified Balance using Client SDK
      if (walletProvider) {
        try {
          const kit = new AppKit();
          const viemAdapter = await createViemAdapterFromProvider({ provider: walletProvider as any });
          const balances = await kit.unifiedBalance.getBalances({
            sources: [{ adapter: viemAdapter }],
            networkType: "testnet", // Using testnet based on Arc environment
            includePending: true,
          });
          if (balances.totalConfirmedBalance) {
            eoaBalance = parseFloat(balances.totalConfirmedBalance);
          }
        } catch (e) {
          console.error("Error fetching EOA unified balance:", e);
        }

        // FALLBACK: If unified balance is 0 or failed, fetch directly from Arc Testnet
        if (eoaBalance === 0) {
          try {
            // Use dynamic import so it doesn't break SSR
            const { createPublicClient, http, parseAbi } = await import('viem');
            const { arcTestnet } = await import('@/lib/web3/appkit-provider');
            const { createWalletClient, custom } = await import('viem');

            const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
            const walletClient = createWalletClient({ transport: custom(walletProvider as any) });
            const [address] = await walletClient.getAddresses();

            if (address) {
              const usdcBalance = await publicClient.readContract({
                address: "0x3600000000000000000000000000000000000000",
                abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
                functionName: "balanceOf",
                args: [address]
              });
              eoaBalance = Number(usdcBalance) / 1_000_000;
            }
          } catch (fallbackError) {
            console.error("Viem fallback failed:", fallbackError);
          }
        }
      }

      setBalance(developerBalance + eoaBalance);
    } catch (error) {
      console.error("Error fetching unified balance:", error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [walletId, walletProvider]);

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
