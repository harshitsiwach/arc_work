/**
 * Web3 Wallet Provider - raw wallet connection (no viem/wagmi)
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

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  isConnecting: false,
  switchChain: async () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

function checksumAddress(address: string): string {
  return address.toLowerCase();
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;

      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(checksumAddress(accounts[0]));
          return eth.request({ method: "eth_chainId" });
        }
      }).then((id: string | undefined) => {
        if (id) setChainId(parseInt(id, 16));
      }).catch(() => {});

      eth.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(checksumAddress(accounts[0]));
        } else {
          setAddress(null);
          setChainId(null);
        }
      });

      eth.on("chainChanged", (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast.error("No wallet found. Install MetaMask or Rabby.");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      setAddress(checksumAddress(accounts[0]));
      const chainIdHex = await eth.request({ method: "eth_chainId" });
      setChainId(parseInt(chainIdHex, 16));
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      setChainId(targetChainId);
    } catch (err: any) {
      toast.error("Failed to switch chain");
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        connect,
        disconnect,
        switchChain,
        isConnected: !!address,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
