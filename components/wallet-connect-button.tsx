/**
 * Wallet Connect Button - shown in nav bar
 */
"use client";

import { useWallet } from "@/lib/web3/wallet-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, LogOut } from "lucide-react";

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={connect} disabled={isConnecting}>
      {isConnecting ? (
        <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting</>
      ) : (
        <><Wallet className="mr-1 h-3 w-3" /> Connect Wallet</>
      )}
    </Button>
  );
}
