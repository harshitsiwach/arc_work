/**
 * Wallet Connect Button - supports MetaMask + Smart Wallets
 */
"use client";

import { useState } from "react";
import { useWallet } from "@/lib/web3/wallet-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, Fingerprint, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";
import { SmartWalletButton } from "@/components/smart-wallet";

export function WalletConnectButton() {
  const {
    address, isConnected, isConnecting, connect, disconnect,
    smartWallet, activeWalletType, activeAddress,
  } = useWallet();
  const [showOptions, setShowOptions] = useState(false);

  const hasActiveWallet = activeWalletType !== "none";
  const displayAddress = activeAddress;

  if (hasActiveWallet) {
    return (
      <div className="flex items-center gap-2">
        {activeWalletType === "smart" ? (
          <Fingerprint className="h-3 w-3 text-green-500" />
        ) : (
          <Wallet className="h-3 w-3 text-blue-500" />
        )}
        <span className="text-xs text-muted-foreground font-mono">
          {displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}
        </span>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {activeWalletType === "smart" ? "Passkey" : "EOA"}
        </span>
        <Button variant="ghost" size="sm" onClick={disconnect} className="h-6 w-6 p-0">
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting</>
        ) : (
          <><Wallet className="mr-1 h-3 w-3" /> Connect Wallet <ChevronDown className="ml-1 h-3 w-3" /></>
        )}
      </Button>

      {showOptions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-popover border rounded-lg shadow-lg p-2 space-y-1">
            <button
              onClick={() => { connect(); setShowOptions(false); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <Wallet className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Connect Wallet</p>
                <p className="text-xs text-muted-foreground">AppKit / Web3 Wallets</p>
              </div>
            </button>

            <div className="border-t my-1" />

            <div className="p-3">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Smart Wallet (Passkey)</p>
                  <p className="text-xs text-muted-foreground">Face ID / fingerprint — no extension</p>
                </div>
              </div>
              <div className="mt-2">
                <SmartWalletButton />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
