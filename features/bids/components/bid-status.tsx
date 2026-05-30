"use client";

interface BidStatusProps {
  accepted: boolean;
}

export function BidStatus({ accepted }: BidStatusProps) {
  return (
    <span
      className="text-[10px] font-mono px-2 py-0.5 rounded"
      style={{
        backgroundColor: accepted ? "var(--color-success-soft)" : "var(--color-bg-hover)",
        color: accepted ? "var(--color-success)" : "var(--color-fg-muted)",
      }}
    >
      {accepted ? "Accepted" : "Pending"}
    </span>
  );
}
