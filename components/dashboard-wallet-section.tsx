"use client";

import { Wallet, AlertCircle } from "lucide-react";
import { WalletBalance } from "./wallet-balance";
import { WalletInformationDialog } from "./wallet-information-dialog";
import { USDCButton } from "./usdc-button";
import { RequestUsdcButton } from "./request-usdc-button";
import { useWallet } from "@/lib/web3/wallet-provider";

export function DashboardWalletSection({ serverWallet }: { serverWallet: any }) {
  const { address, isConnected } = useWallet();
  const hasWallet = !!serverWallet || isConnected;

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Account balance</h2>
        </div>
        {serverWallet && <WalletInformationDialog wallet={serverWallet} />}
      </div>
      
      {hasWallet ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
              <WalletBalance walletId={serverWallet?.circle_wallet_id} />
            </h2>
            <p className="text-xs mt-1 font-mono" style={{ color: "var(--color-fg-muted)" }}>
              {serverWallet?.wallet_address 
                ? `${serverWallet.wallet_address.slice(0, 10)}...${serverWallet.wallet_address.slice(-6)}`
                : address
                ? `${address.slice(0, 10)}...${address.slice(-6)}`
                : "Connected"}
            </p>
          </div>
          <div className="flex gap-2">
            <USDCButton className="flex-1" mode="BUY" walletAddress={serverWallet?.wallet_address || address} />
            <USDCButton className="flex-1" mode="SELL" walletAddress={serverWallet?.wallet_address || address} />
          </div>
        </div>
      ) : (
        <div className="py-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-warning)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>No wallet found</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
            Connect a wallet or sign up to get started
          </p>
        </div>
      )}
    </div>
  );
}
