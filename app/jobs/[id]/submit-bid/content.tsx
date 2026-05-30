"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitBid } from "@/features/bids/hooks/use-submit-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";

export function SubmitBidPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const { execute, isLoading, isSuccess, state, reset } = useSubmitBid();

  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>This job is not yet onchain.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    await execute({ jobId: BigInt(job.onchain_job_id!), amount: num });
    if (isSuccess) setTimeout(() => router.push(`/jobs/${job.id}`), 1500);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
        <div>
          <p className="text-sm mb-1" style={{ color: "var(--color-fg-secondary)" }}>
            Bid on <strong style={{ color: "var(--color-fg)" }}>{job.title}</strong>
          </p>
          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
            Budget: {job.price_amount} USDC &middot; {job.delivery_days ? `${job.delivery_days} days` : "No deadline"}
          </p>
        </div>
        <div>
          <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Your Bid</label>
          <div className="flex items-center gap-2">
            <input type="number" step="0.01" min="0.01" required placeholder="100" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
          </div>
        </div>
        <button type="submit" disabled={isLoading || !amount}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
          {isLoading ? "Submitting..." : "Place Bid"}
        </button>
        {isSuccess && <p className="text-xs text-center" style={{ color: "var(--color-success)" }}>Bid submitted! Redirecting...</p>}
      </form>
      <TransactionModal state={state} onClose={reset} />
    </>
  );
}
