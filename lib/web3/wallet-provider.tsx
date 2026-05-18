/**
 * Web3 Wallet Provider - supports both MetaMask (EOA) and Smart Wallets (passkey)
 */
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type SupportedChain = {
  id: number;
  name: string;
  arcName: string;
};

export const SUPPORTED_SOURCE_CHAINS: SupportedChain[] = [
  { id: 11155111, name: "Ethereum Sepolia", arcName: "ETH-SEPOLIA" },
  { id: 84532, name: "Base Sepolia", arcName: "BASE-SEPOLIA" },
  { id: 421614, name: "Arbitrum Sepolia", arcName: "ARBITRUM-SEPOLIA" },
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

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast.error("Install MetaMask or Rabby to connect an EOA wallet");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0].toLowerCase());
      const chainIdHex = await eth.request({ method: "eth_chainId" });
      setChainId(parseInt(chainIdHex, 16));
      setActiveWalletType("metamask");
      localStorage.setItem("arc_work_wallet_type", "metamask");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    } finally { setIsConnecting(false); }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null); setChainId(null); setActiveWalletType("none");
    localStorage.removeItem("arc_work_wallet_type");
  }, []);

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
