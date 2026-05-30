"use client";

import { useState } from "react";
import { useSubmitBid } from "../hooks/use-submit-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";

interface BidFormProps {
  jobId: bigint;
  disabled: boolean;
}

export function BidForm({ jobId, disabled }: BidFormProps) {
  const [amount, setAmount] = useState("");
  const { execute, isLoading, isSuccess, error, reset } = useSubmitBid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await execute({ jobId, amount: numAmount });
    if (isSuccess) {
      setAmount("");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Your bid amount"
            disabled={disabled || isLoading}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              borderColor: "var(--color-bd)",
              color: "var(--color-fg)",
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>
            USDC
          </span>
        </div>
        <button
          type="submit"
          disabled={disabled || isLoading || !amount}
          className="rounded-lg px-4 py-2 text-sm font-mono font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          {isLoading ? "Submitting..." : "Place Bid"}
        </button>
      </form>

      {error && (
        <p className="text-xs font-mono mt-2" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      <TransactionModal
        state={{ status: isLoading ? "signature_pending" : error ? "transaction_failed" : "idle", txHash: null, error, functionName: "submitBid" }}
        onClose={reset}
      />
    </>
  );
}
