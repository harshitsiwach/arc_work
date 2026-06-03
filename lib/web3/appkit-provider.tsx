"use client";

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork, sepolia, baseSepolia, arbitrumSepolia, defineChain } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = 'b56e18d47c72ab683b10814fe9495694'; // default test projectId

export const arcTestnet = defineChain({
  id: 5042002,
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:5042002',
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [
      'https://rpc.quicknode.testnet.arc.network',
      'https://rpc.drpc.testnet.arc.network',
      'https://5042002.rpc.thirdweb.com',
      'https://rpc.testnet.arc.network'
    ] },
    public: { http: [
      'https://rpc.quicknode.testnet.arc.network',
      'https://rpc.drpc.testnet.arc.network',
      'https://5042002.rpc.thirdweb.com',
      'https://rpc.testnet.arc.network'
    ] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
});

export const customSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
    public: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
  }
} as AppKitNetwork;

const networks = [customSepolia, baseSepolia, arbitrumSepolia, arcTestnet] as [AppKitNetwork, ...AppKitNetwork[]];

// Custom transports with batching to reduce individual RPC calls and avoid rate limits
const transports = {
  [customSepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com', { 
    batch: true, 
    retryCount: 1,
  }),
  [baseSepolia.id]: http('https://sepolia.base.org', { 
    batch: true, 
    retryCount: 1, 
  }),
  [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc', { 
    batch: true, 
    retryCount: 1, 
  }),
  [arcTestnet.id]: http('https://rpc.quicknode.testnet.arc.network', { 
    batch: true, 
    retryCount: 1, 
  }),
};

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports,
  // Poll every 30s instead of every block — prevents MetaMask rate limiting
  // on fast chains like Arc Testnet where blocks arrive every ~1s
  pollingInterval: 30_000,
});

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
  defaultNetwork: arcTestnet,
  features: { analytics: true }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Slow down background polling to reduce RPC pressure
      refetchInterval: 30_000,
      staleTime: 15_000,
    },
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
