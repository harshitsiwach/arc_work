"use client";

import { useEffect } from "react";
import { useTransaction } from "../hooks/use-transaction";
import { STATUS_LABELS } from "../types/transaction";

interface TransactionModalProps {
  state: ReturnType<typeof useTransaction>["state"];
  onClose: () => void;
}

export function TransactionModal({ state, onClose }: TransactionModalProps) {
  const isVisible = state.status !== "idle";

  useEffect(() => {
    if (state.status === "transaction_success" || state.status === "transaction_failed" || state.status === "wallet_rejected") {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.status, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={state.status === "transaction_success" || state.status === "transaction_failed" || state.status === "wallet_rejected" ? onClose : undefined}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Status indicator */}
          {state.status === "transaction_success" ? (
            <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-success-soft)" }}>
              <svg className="h-6 w-6" style={{ color: "var(--color-success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : state.status === "transaction_failed" || state.status === "wallet_rejected" ? (
            <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-error-soft)" }}>
              <svg className="h-6 w-6" style={{ color: "var(--color-error)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: "var(--color-accent-soft)" }}>
              <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            </div>
          )}

          {/* Status label */}
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-fg)" }}>
            {STATUS_LABELS[state.status as keyof typeof STATUS_LABELS] ?? "Processing..."}
          </h3>

          {/* Error message */}
          {state.error && (
            <p className="text-sm" style={{ color: "var(--color-error)" }}>
              {state.error}
            </p>
          )}

          {/* Tx hash link */}
          {state.txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${state.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono underline"
              style={{ color: "var(--color-accent)" }}
            >
              View on ArcScan
            </a>
          )}

          {/* Close button */}
          {(state.status === "transaction_success" || state.status === "transaction_failed" || state.status === "wallet_rejected") && (
            <button
              onClick={onClose}
              className="mt-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg)" }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
