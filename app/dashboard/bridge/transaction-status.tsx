/**
 * Arc Work — Transaction Status
 * Polished transaction state display
 */
"use client";

import { Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";

interface TransactionStatusProps {
  status: "idle" | "pending" | "confirming" | "completed" | "failed";
  txHash: string | null;
  explorerUrl?: string;
}

const STATUS_CONFIG = {
  idle: null,
  pending: {
    icon: Loader2,
    label: "Preparing transaction...",
    sub: "Please wait while we set up your transfer",
    color: "oklch(0.65 0.14 80)",
    bgColor: "oklch(0.65 0.14 80 / 0.1)",
    animate: true,
  },
  confirming: {
    icon: Clock,
    label: "Confirming in wallet...",
    sub: "Approve the transaction in your wallet",
    color: "oklch(0.55 0.15 260)",
    bgColor: "oklch(0.55 0.15 260 / 0.1)",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Transaction complete!",
    sub: "Your transfer has been processed",
    color: "oklch(0.60 0.15 150)",
    bgColor: "oklch(0.60 0.15 150 / 0.1)",
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: "Transaction failed",
    sub: "Please try again or check your wallet",
    color: "oklch(0.55 0.18 30)",
    bgColor: "oklch(0.55 0.18 30 / 0.1)",
    animate: false,
  },
};

export function TransactionStatus({ status, txHash, explorerUrl }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className="rounded-lg p-3 flex items-start gap-3"
      style={{ backgroundColor: config.bgColor }}
    >
      <Icon
        className={`h-4 w-4 shrink-0 mt-0.5 ${config.animate ? "animate-spin" : ""}`}
        style={{ color: config.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: config.color }}>{config.label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>{config.sub}</p>
        {txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs mt-1.5 font-medium transition-colors duration-150"
            style={{ color: config.color }}
          >
            View on explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
