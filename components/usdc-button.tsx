/**
 * USDC Button — Deposit/Withdraw
 * Testnet: opens Circle faucet for test USDC
 * Mainnet: would use Circle Ramp (currently mainnet-only)
 */
"use client";

import { type FunctionComponent, type HTMLProps } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Props extends HTMLProps<HTMLElement> {
  mode: "BUY" | "SELL";
  walletAddress: string;
}

export const USDCButton: FunctionComponent<Props> = ({ mode, className }) => {
  if (mode === "BUY") {
    return (
      <Button
        className={className as string}
        onClick={() => window.open("https://faucet.circle.com", "_blank")}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Get Testnet USDC
      </Button>
    );
  }

  return (
    <Button className={className as string} disabled variant="outline">
      Withdraw (mainnet)
    </Button>
  );
};
