import React from "react";
import { Box } from "lucide-react";
import {
  TokenUSDC,
  TokenEURC,
  TokenCUSDC,
  NetworkArc,
  NetworkEthereum,
  NetworkBase,
  NetworkBaseSepolia,
  NetworkArbitrumOne,
  NetworkArbitrumSepolia,
  WalletMetamask,
  WalletCoinbase,
} from "@web3icons/react";

export {
  TokenUSDC as UsdcIcon,
  TokenEURC as EurcIcon,
  TokenCUSDC as CUsdcIcon,
  NetworkArc as ArcChainIcon,
  NetworkEthereum as EthChainIcon,
  NetworkBase as BaseChainIcon,
  NetworkBaseSepolia as BaseSepoliaChainIcon,
  NetworkArbitrumOne as ArbitrumChainIcon,
  NetworkArbitrumSepolia as ArbitrumSepoliaChainIcon,
  WalletMetamask as MetamaskIcon,
  WalletCoinbase as CoinbaseIcon,
};

export type IconVariant = "branded" | "mono" | "background";

export const getTokenIcon = (
  symbol: string,
  size: number = 20,
  variant: IconVariant = "branded"
): React.ReactNode => {
  if (symbol === "USDC" || symbol === "CUSDC") return <TokenUSDC size={size} variant={variant} />;
  if (symbol === "EURC") return <TokenEURC size={size} variant={variant} />;
  return <Box size={size} />;
};

export const getChainIcon = (
  id: number | string,
  size: number = 20,
  variant: IconVariant = "branded"
): React.ReactNode => {
  const chainId = Number(id);
  if (chainId === 11155111 || chainId === 1) return <NetworkEthereum size={size} variant={variant} />;
  if (chainId === 8453) return <NetworkBase size={size} variant={variant} />;
  if (chainId === 84532) return <NetworkBaseSepolia size={size} variant={variant} />;
  if (chainId === 42161) return <NetworkArbitrumOne size={size} variant={variant} />;
  if (chainId === 421614) return <NetworkArbitrumSepolia size={size} variant={variant} />;
  if (chainId === 5042002) return <NetworkArc size={size} variant={variant} />;
  return <Box size={size} />;
};
