/**
 * Arc Work - Premium Wallet Connect Button
 * Minimal, compact, trustworthy
 */
"use client";

import { useState } from "react";
import { useWallet } from "@/lib/web3/wallet-provider";
import { Loader2, Wallet, Fingerprint, ChevronDown } from "lucide-react";
import { SmartWalletButton } from "@/components/smart-wallet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletConnectButton() {
  const {
    address, isConnected, isConnecting, connect, disconnect,
    smartWallet, activeWalletType, activeAddress,
  } = useWallet();

  const hasActiveWallet = activeWalletType !== "none";
  const displayAddress = activeAddress;

  if (hasActiveWallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid",
              borderColor: "var(--color-bd)",
              color: "var(--color-fg-secondary)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: activeWalletType === "smart" ? "var(--color-success)" : "var(--color-accent)",
              }}
            />
            <span className="font-mono text-[12px] tracking-wide">
              {displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}
            </span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              {activeWalletType === "smart" ? (
                <Fingerprint size={14} style={{ color: "var(--color-success)" }} />
              ) : (
                <Wallet size={14} style={{ color: "var(--color-accent)" }} />
              )}
              <span className="text-[12px] font-medium" style={{ color: "var(--color-fg)" }}>
                {activeWalletType === "smart" ? "Smart Wallet" : "Connected Wallet"}
              </span>
            </div>
            <p className="font-mono text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
              {displayAddress}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer">
            <span className="text-[13px]" style={{ color: "var(--color-error)" }}>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isConnecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          {isConnecting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Connecting
            </>
          ) : (
            <>
              <Wallet size={13} />
              Connect
              <ChevronDown size={12} className="opacity-70" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => connect()} className="cursor-pointer">
            <div className="flex items-center gap-3 w-full">
              <Wallet size={16} style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-[13px] font-medium">Wallet</p>
                <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>MetaMask, Rainbow, etc.</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-3 py-2">
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint size={16} style={{ color: "var(--color-success)" }} />
            <div>
              <p className="text-[13px] font-medium">Smart Wallet</p>
              <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>Passkey, no extension needed</p>
            </div>
          </div>
          <SmartWalletButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
