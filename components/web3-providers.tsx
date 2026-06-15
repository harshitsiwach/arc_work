"use client";

import { AppKitProvider } from "@/lib/web3/appkit-provider";
import { WalletProvider } from "@/lib/web3/wallet-provider";

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppKitProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AppKitProvider>
  );
}
