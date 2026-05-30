/**
 * AgenticCommerce — Contract constants
 * Addresses, chain config, and contract metadata
 */

export const AGENTIC_COMMERCE_ADDRESS = process.env.NEXT_PUBLIC_AGENTIC_COMMERCE_ADDRESS as `0x${string}`;

export const USDC_DECIMALS = 6;
export const USDC_SYMBOL = "USDC";

export const ARC_TESTNET_CHAIN_ID = 5042002;

export const JOB_STATUS_MAP = {
  0: "Open",
  1: "Funded",
  2: "Submitted",
  3: "Completed",
  4: "Rejected",
  5: "Expired",
} as const;

export const JOB_STATUS_COLORS = {
  0: "oklch(0.65 0.15 250)",
  1: "oklch(0.70 0.15 85)",
  2: "oklch(0.60 0.18 265)",
  3: "oklch(0.65 0.18 155)",
  4: "oklch(0.60 0.20 25)",
  5: "oklch(0.55 0.01 260)",
} as const;
