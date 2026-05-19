"use client";

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia, baseSepolia, arbitrumSepolia } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = 'b56e18d47c72ab683b10814fe9495694'; // default test projectId
const networks = [sepolia, baseSepolia, arbitrumSepolia]; 

export const wagmiAdapter = new WagmiAdapter({ networks, projectId, ssr: true });

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Arc Work',
    description: 'Decentralized freelance marketplace on Arc blockchain',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://arc-work.dev',
    icons: ['https://arc-work.dev/favicon.ico']
  },
  features: { analytics: true }
});

const queryClient = new QueryClient();

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
