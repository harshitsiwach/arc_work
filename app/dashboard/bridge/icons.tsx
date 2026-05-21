import React from "react";
import { CircleDollarSign, Coins, Box, Link } from "lucide-react";

export function UsdcIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#2775CA" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.981 18.0061V17.0261C14.7171 16.8402 16.0355 15.6565 16.1415 14.1504H14.131C14.0041 14.8052 13.2536 15.3523 12.0006 15.3523C10.7476 15.3523 9.99723 14.8052 9.99723 14.0116C9.99723 13.0645 10.9996 12.7154 12.1818 12.4411C14.103 12.0016 16.2718 11.4501 16.2718 9.38075C16.2718 7.37123 14.7171 6.22359 12.981 6.03577V5H10.9904V6.02324C9.40058 6.2575 8.16327 7.34861 8.01255 8.82672H10.0212C10.1259 8.24354 10.7938 7.6974 12.0006 7.6974C13.2075 7.6974 13.9579 8.24354 13.9579 9.0371C13.9579 9.98424 12.9555 10.3333 11.7733 10.6075C9.85213 11.0471 7.68335 11.5986 7.68335 13.668C7.68335 15.6775 9.23803 16.8252 10.9904 17.013V18.0061H12.981Z"
        fill="white"
      />
    </svg>
  );
}

export function EurcIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#2775CA" />
      <path
        d="M15.5 8C14.5 6.5 13.0 5.5 11.5 5.5C8.0 5.5 5.5 8.5 5.5 12C5.5 15.5 8.0 18.5 11.5 18.5C13.0 18.5 14.5 17.5 15.5 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 11H13M4 13H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArcChainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="url(#arc-gradient)" />
      <path d="M7 16L12 8L17 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="arc-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EthChainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#627EEA" />
      <path d="M11.999 5L7 13.25L11.999 16.25L17 13.25L11.999 5Z" fill="white" fillOpacity="0.8" />
      <path d="M11.999 5L7 13.25L11.999 10.5V5Z" fill="white" />
      <path d="M11.999 17.25L7 14L11.999 21L17 14L11.999 17.25Z" fill="white" fillOpacity="0.8" />
      <path d="M11.999 21L7 14L11.999 17.25V21Z" fill="white" />
    </svg>
  );
}

export function BaseChainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  );
}

export function ArbitrumChainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#28A0F0" />
      <path d="M12 5.5L6.5 15.5H8.5L12 9.5L15.5 15.5H17.5L12 5.5Z" fill="white" />
      <path d="M12 11.5L9.5 15.5H14.5L12 11.5Z" fill="white" />
    </svg>
  );
}

export const getTokenIcon = (symbol: string) => {
  if (symbol === "USDC") return <UsdcIcon />;
  if (symbol === "EURC") return <EurcIcon />;
  return <CircleDollarSign />;
};

export const getChainIcon = (id: number | string) => {
  const chainId = Number(id);
  if (chainId === 11155111 || chainId === 1) return <EthChainIcon />;
  if (chainId === 84532 || chainId === 8453) return <BaseChainIcon />;
  if (chainId === 421614 || chainId === 42161) return <ArbitrumChainIcon />;
  if (chainId === 5042002) return <ArcChainIcon />;
  return <Box />;
};
