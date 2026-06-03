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
        <DropdownMenuContent align="end" className="w-72 p-1.5">
          <div className="px-3 pt-1.5 pb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: activeWalletType === "smart"
                    ? "color-mix(in srgb, var(--color-success) 12%, transparent)"
                    : "var(--color-accent-soft)",
                }}
              >
                {activeWalletType === "smart" ? (
                  <Fingerprint size={16} style={{ color: "var(--color-success)" }} />
                ) : (
                  <Wallet size={16} style={{ color: "var(--color-accent)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
                  {activeWalletType === "smart" ? "Smart Wallet" : "Connected Wallet"}
                </p>
                <p className="font-mono text-xs mt-0.5 truncate" style={{ color: "var(--color-fg-muted)" }}>
                  {displayAddress}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer px-3 py-2.5">
            <span className="text-sm font-medium" style={{ color: "var(--color-error)" }}>Disconnect</span>
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
      <DropdownMenuContent align="end" className="w-[340px] p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => connect()}
            className="cursor-pointer rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-bg-hover)] focus-visible:bg-[var(--color-bg-hover)]"
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-accent-soft)" }}
              >
                <Wallet size={18} style={{ color: "var(--color-accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>Wallet</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>MetaMask, Rainbow, Coinbase Wallet</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 12%, transparent)" }}
            >
              <Fingerprint size={18} style={{ color: "var(--color-success)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>Smart Wallet</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>Passkey, email, social login</p>
            </div>
          </div>
          <SmartWalletButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
