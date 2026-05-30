"use client";

import { useBids } from "../hooks/use-bids";
import { BidCard } from "./bid-card";

interface BidListProps {
  jobId: bigint;
  isCreator: boolean;
  onBidAccepted?: () => void;
}

export function BidList({ jobId, isCreator, onBidAccepted }: BidListProps) {
  const { bids, loading, error, refetch } = useBids(jobId);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }}>
            <div className="flex justify-between mb-2">
              <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-5 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
            </div>
            <div className="h-4 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4 text-xs font-mono" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
        {error}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No bids yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Be the first to bid on this job</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <BidCard
          key={bid.provider}
          bid={bid}
          jobId={jobId}
          isCreator={isCreator}
          onAccepted={() => {
            refetch();
            onBidAccepted?.();
          }}
        />
      ))}
    </div>
  );
}
