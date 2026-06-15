import React from "react";
import { Box } from "lucide-react";

type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: string;
  [key: string]: any;
};

/* ── Token Icons ───────────────────────────────────────────── */

function UsdcIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path d="M20 18c0-2.2-1.3-3-3.5-3.2-1.8-.2-2.2-.8-2.2-1.7 0-.9.6-1.5 2-1.5 1.2 0 1.9.4 2.2 1.4h2.2c-.3-1.7-1.5-2.8-3.5-3V8h-2v2.2c-2.2.3-3.5 1.7-3.5 3.5 0 2.1 1.2 3 3.4 3.2 1.7.2 2.2.6 2.2 1.6 0 1-.7 1.7-2.1 1.7-1.4 0-2.2-.5-2.5-1.5h-2.2c.3 2 1.5 3.3 3.8 3.6V24h2v-2.1c2.2-.3 3.5-1.8 3.5-3.9z" fill="white" />
      <path d="M11 22.5c-3.5-1.5-5.5-5-5-8.5.5-3.5 3-6 6.5-7v2.5c-2.5 1-4 3-4 5.5s1.5 4.5 4 5.5v2z" fill="white" opacity="0.3" />
      <path d="M21 9.5c3.5 1.5 5.5 5 5 8.5-.5 3.5-3 6-6.5 7v-2.5c2.5-1 4-3 4-5.5s-1.5-4.5-4-5.5v-2z" fill="white" opacity="0.3" />
    </svg>
  );
}

function EurcIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#0A5F9E" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">€</text>
    </svg>
  );
}

function CUsdcIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">cUSDC</text>
    </svg>
  );
}

/* ── Chain Icons ──────────────────────────────────────────── */

function ArcChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 6 L26 22 L6 22 Z" fill="currentColor" opacity="0.2" />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  );
}

function EthChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M15.5 4v8.9l7.5 3.3L15.5 4z" fill="white" opacity="0.6" />
      <path d="M15.5 4L8 16.2l7.5-3.3V4z" fill="white" />
      <path d="M15.5 21.6V28L23 17.7l-7.5 3.9z" fill="white" opacity="0.6" />
      <path d="M15.5 28v-6.4L8 17.7 15.5 28z" fill="white" />
      <path d="M15.5 20.1l7.5-4.3-7.5-3.4v7.7z" fill="white" opacity="0.2" />
      <path d="M8 15.8l7.5 4.3v-7.7L8 15.8z" fill="white" opacity="0.6" />
    </svg>
  );
}

function BaseChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <circle cx="16" cy="16" r="7" fill="white" />
    </svg>
  );
}

function BaseSepoliaChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#0052FF" opacity="0.6" />
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.8" />
    </svg>
  );
}

function ArbitrumChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#2D374B" />
      <path d="M16 6l10 6v8l-10 6-10-6v-8l10-6z" fill="#96BEDC" opacity="0.3" />
      <path d="M16 9l7 4v6l-7 4-7-4v-6l7-4z" fill="#2D374B" />
      <path d="M16 11l5 3v4l-5 3-5-3v-4l5-3z" fill="#28A0F0" />
    </svg>
  );
}

function ArbitrumSepoliaChainIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#2D374B" opacity="0.7" />
      <path d="M16 11l5 3v4l-5 3-5-3v-4l5-3z" fill="#28A0F0" opacity="0.7" />
    </svg>
  );
}

/* ── Wallet Icons ──────────────────────────────────────────── */

function MetamaskIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#E2761B" />
      <path d="M25 9l-7 5 1-3 6-2z" fill="#E2761B" />
      <path d="M7 9l7 5-1-3-6-2z" fill="#E4761B" />
      <path d="M24 20l-2 4-7-3 9-1z" fill="#E4761B" />
      <path d="M8 20l2 4 7-3-9-1z" fill="#E4761B" />
      <path d="M10 26l1-2 5 1-5 1z" fill="#D7C1B3" />
      <path d="M22 26l-1-2-5 1 6-1z" fill="#D7C1B3" />
    </svg>
  );
}

function CoinbaseIcon({ size = 20, variant: _v, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <circle cx="16" cy="16" r="6" fill="white" />
    </svg>
  );
}

/* ── Exports ───────────────────────────────────────────────── */

export {
  UsdcIcon,
  EurcIcon,
  CUsdcIcon,
  ArcChainIcon,
  EthChainIcon,
  BaseChainIcon,
  BaseSepoliaChainIcon,
  ArbitrumChainIcon,
  ArbitrumSepoliaChainIcon,
  MetamaskIcon,
  CoinbaseIcon,
};

export type IconVariant = "branded" | "mono" | "background";

export const getTokenIcon = (
  symbol: string,
  size: number = 20,
  variant: IconVariant = "branded"
): React.ReactNode => {
  if (symbol === "USDC" || symbol === "CUSDC") return <UsdcIcon size={size} />;
  if (symbol === "EURC") return <EurcIcon size={size} />;
  return <Box size={size} />;
};

export const getChainIcon = (
  id: number | string,
  size: number = 20,
  variant: IconVariant = "branded"
): React.ReactNode => {
  const chainId = Number(id);
  if (chainId === 11155111 || chainId === 1) return <EthChainIcon size={size} />;
  if (chainId === 8453) return <BaseChainIcon size={size} />;
  if (chainId === 84532) return <BaseSepoliaChainIcon size={size} />;
  if (chainId === 42161) return <ArbitrumChainIcon size={size} />;
  if (chainId === 421614) return <ArbitrumSepoliaChainIcon size={size} />;
  if (chainId === 5042002) return <ArcChainIcon size={size} />;
  return <Box size={size} />;
};
