"use client";

import { useAcceptBid } from "../hooks/use-accept-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { BidRecord } from "../types/bid";

interface BidCardProps {
  bid: BidRecord;
  jobId: bigint;
  isCreator: boolean;
  onAccepted?: () => void;
}

function truncateAddress(address: string | null | undefined): string | null {
  if (!address || address === "0x0000000000000000000000000000000000000000") return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function BidCard({ bid, jobId, isCreator, onAccepted }: BidCardProps) {
  const { execute, isLoading, error, reset } = useAcceptBid();

  const handleAccept = async () => {
    await execute({ jobId, provider: bid.provider });
    onAccepted?.();
  };

  return (
    <>
      <div
        className="rounded-lg border p-4 transition-colors"
        style={{
          borderColor: bid.accepted ? "var(--color-success)" : "var(--color-bd)",
          backgroundColor: bid.accepted ? "var(--color-success-soft)" : "var(--color-bg-inset)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: "var(--color-fg-secondary)" }}>
            {truncateAddress(bid.provider)}
          </span>
          <span className="text-lg font-bold" style={{ color: "var(--color-fg)" }}>
            {bid.amount} <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{
              backgroundColor: bid.accepted ? "var(--color-success-soft)" : "var(--color-bg-hover)",
              color: bid.accepted ? "var(--color-success)" : "var(--color-fg-muted)",
            }}
          >
            {bid.accepted ? "Accepted" : "Pending"}
          </span>

          {isCreator && !bid.accepted && (
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="text-xs font-mono px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              {isLoading ? "Accepting..." : "Accept"}
            </button>
          )}
        </div>
      </div>

      <TransactionModal
        state={{ status: isLoading ? "signature_pending" : error ? "transaction_failed" : "idle", txHash: null, error, functionName: "acceptBid" }}
        onClose={reset}
      />
    </>
  );
}
