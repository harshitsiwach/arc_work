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
    color: "var(--color-accent)",
    bgColor: "var(--color-accent-soft)",
    animate: true,
  },
  confirming: {
    icon: Clock,
    label: "Confirming in wallet...",
    sub: "Approve the transaction in your wallet",
    color: "var(--color-accent)",
    bgColor: "var(--color-accent-soft)",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Transaction complete!",
    sub: "Your transfer has been processed",
    color: "#10b981", // Soft emerald green
    bgColor: "rgba(16, 185, 129, 0.1)",
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: "Transaction failed",
    sub: "Please try again or check your wallet",
    color: "#ef4444", // Soft red
    bgColor: "rgba(239, 68, 68, 0.1)",
    animate: false,
  },
};

export function TransactionStatus({ status, txHash, explorerUrl }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-4 transition-all duration-300"
      style={{ backgroundColor: config.bgColor, border: `1px solid ${config.color}20` }}
    >
      <div className="mt-0.5">
        <Icon
          className={`h-5 w-5 ${config.animate ? "animate-spin" : ""}`}
          style={{ color: config.color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>{config.label}</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>{config.sub}</p>
        {txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs mt-2.5 font-medium transition-opacity duration-150 hover:opacity-80"
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
