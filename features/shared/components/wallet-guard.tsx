"use client";

import { useWallet } from "@/lib/web3/wallet-provider";
import { Button } from "@/components/ui/button";

interface WalletGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { isConnected, connect, isConnecting } = useWallet();

  if (isConnected) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-xl border" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
      <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-soft)" }}>
        <svg className="h-6 w-6" style={{ color: "var(--color-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
        Connect your wallet to continue
      </p>
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="rounded-lg px-4 py-2 text-sm font-medium"
        style={{ backgroundColor: "var(--color-accent)", color: "white" }}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    </div>
  );
}
