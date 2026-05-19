/**
 * Web3 Wallet Provider - supports both MetaMask (EOA) and Smart Wallets (passkey)
 */
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppKitAccount, useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react';

export type SupportedChain = {
  id: number;
  name: string;
  arcName: string;
};

export const SUPPORTED_SOURCE_CHAINS: SupportedChain[] = [
  { id: 11155111, name: "Ethereum Sepolia", arcName: "Ethereum_Sepolia" },
  { id: 84532, name: "Base Sepolia", arcName: "Base_Sepolia" },
  { id: 421614, name: "Arbitrum Sepolia", arcName: "Arbitrum_Sepolia" },
];

export type WalletType = "none" | "metamask" | "smart";

export interface SmartWalletInfo {
  address: string;
  userId: string;
  walletId: string | null;
}

interface WalletContextType {
  // MetaMask/EOA
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  // Smart wallet
  smartWallet: SmartWalletInfo | null;
  setSmartWallet: (info: SmartWalletInfo | null) => void;
  // Active wallet
  activeWalletType: WalletType;
  setActiveWalletType: (type: WalletType) => void;
  // Unified
  activeAddress: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null, chainId: null, connect: async () => {}, disconnect: () => {},
  isConnected: false, isConnecting: false,
  smartWallet: null, setSmartWallet: () => {},
  activeWalletType: "none", setActiveWalletType: () => {},
  activeAddress: null,
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [smartWallet, setSmartWallet] = useState<SmartWalletInfo | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<WalletType>("none");

  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();
  const { chainId: appKitChainId, caipNetwork } = useAppKitNetwork();
  const { disconnect: disconnectAppKit } = useDisconnect();

  // Sync AppKit
  useEffect(() => {
    if (isAppKitConnected && appKitAddress) {
      setAddress(appKitAddress.toLowerCase());
      setActiveWalletType("metamask");
    } else if (activeWalletType === "metamask" && !isAppKitConnected && address) {
      setAddress(null);
      setActiveWalletType("none");
    }
    
    const rawChainId = appKitChainId || (caipNetwork?.id ? String(caipNetwork.id).split(':')[1] : null);
    if (rawChainId) {
      setChainId(typeof rawChainId === 'string' ? parseInt(rawChainId.replace('eip155:', ''), 10) : rawChainId);
    }
  }, [isAppKitConnected, appKitAddress, activeWalletType, address, appKitChainId, caipNetwork]);

  // Read MetaMask accounts on mount
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0].toLowerCase());
          return eth.request({ method: "eth_chainId" });
        }
      }).then((id: string | undefined) => {
        if (id) setChainId(parseInt(id, 16));
      }).catch(() => {});

      eth.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) setAddress(accounts[0].toLowerCase());
        else { setAddress(null); setChainId(null); }
      });
      eth.on("chainChanged", (chainIdHex: string) => setChainId(parseInt(chainIdHex, 16)));
    }

    // Restore from localStorage
    const savedWallet = localStorage.getItem("arc_work_wallet_type");
    if (savedWallet === "smart") setActiveWalletType("smart");
    const savedSmartWallet = localStorage.getItem("arc_work_smart_wallet");
    if (savedSmartWallet) {
      try { setSmartWallet(JSON.parse(savedSmartWallet)); } catch {}
    }
  }, []);

  const { open } = useAppKit();

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await open();
    } catch (err: any) {
      toast.error(err.message || "Failed to open AppKit modal");
    } finally { setIsConnecting(false); }
  }, [open]);

  const disconnect = useCallback(() => {
    setAddress(null); setChainId(null); setActiveWalletType("none");
    localStorage.removeItem("arc_work_wallet_type");
    if (disconnectAppKit) disconnectAppKit();
  }, [disconnectAppKit]);

  const handleSetSmartWallet = useCallback((info: SmartWalletInfo | null) => {
    setSmartWallet(info);
    if (info) {
      setActiveWalletType("smart");
      localStorage.setItem("arc_work_wallet_type", "smart");
      localStorage.setItem("arc_work_smart_wallet", JSON.stringify(info));
    } else {
      localStorage.removeItem("arc_work_smart_wallet");
    }
  }, []);

  // Determine the active address
  const activeAddress = activeWalletType === "smart"
    ? smartWallet?.address || null
    : address;

  return (
    <WalletContext.Provider
      value={{
        address, chainId, connect, disconnect,
        isConnected: !!address, isConnecting,
        smartWallet, setSmartWallet: handleSetSmartWallet,
        activeWalletType, setActiveWalletType,
        activeAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
