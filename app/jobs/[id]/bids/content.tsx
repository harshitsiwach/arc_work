"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAcceptBid } from "@/features/bids/hooks/use-accept-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import { formatUSDC } from "@/lib/contracts/format";
import type { JobRecord } from "@/features/jobs/types/job";
import type { Bid } from "@/lib/contracts/types";

export function BidsPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const { execute, isLoading, isSuccess, state, reset } = useAcceptBid();
  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();

  const fetchBids = useCallback(async () => {
    if (!job.onchain_job_id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      console.log("[BidsPage] fetching bids for job", job.onchain_job_id);
      const result = await reads.getBids(BigInt(job.onchain_job_id!));
      console.log("[BidsPage] got bids:", result);
      setBids(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("[BidsPage] fetchBids error:", msg);
      setError(msg);
    }
    setLoading(false);
  }, [job.onchain_job_id]);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  useEffect(() => {
    if (!job.onchain_job_id) { setClientReady(true); return; }
    reads.getJob(BigInt(job.onchain_job_id!))
      .then(j => {
        console.log("[BidsPage] onchain job client:", j.client);
        console.log("[BidsPage] active address:", activeAddress);
        setOnchainClientAddress(j.client);
        setClientReady(true);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[BidsPage] getJob error:", msg);
        setClientError(msg);
        setClientReady(true);
      });
  }, [job.onchain_job_id]);

  useEffect(() => { if (isSuccess) setTimeout(() => router.push(`/jobs/${job.id}/fund`), 1500); }, [isSuccess]);

  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain yet.</p>;
  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-lg border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }} />)}</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--color-error)", backgroundColor: "var(--color-error-soft)" }}>
          <p style={{ color: "var(--color-error)" }}>Failed to fetch bids: {error}</p>
          <button onClick={fetchBids} className="text-xs underline mt-1" style={{ color: "var(--color-error)" }}>Retry</button>
        </div>
      )}
      {clientError && (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--color-warning)", backgroundColor: "var(--color-warning-soft)" }}>
          <p style={{ color: "var(--color-warning)" }}>Could not verify onchain job owner: {clientError}</p>
        </div>
      )}

      {bids.length === 0 ? (
        !error && (
          <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
            <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No bids yet</p>
            <p className="text-xs mt-2" style={{ color: "var(--color-fg-muted)" }}>Connect a different wallet to submit a bid at /jobs/{job.id}/submit-bid</p>
          </div>
        )
      ) : (
        bids.map((bid, idx) => (
          <div key={bid.provider ?? `bid-${idx}`} className="rounded-xl border p-5" style={{ borderColor: bid.accepted ? "var(--color-success)" : "var(--color-bd)", backgroundColor: bid.accepted ? "var(--color-success-soft)" : "var(--color-bg-elevated)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>{bid.provider?.slice(0, 6) ?? "---"}...{bid.provider?.slice(-4) ?? ""}</p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--color-fg)" }}>{formatUSDC(bid.amount)} <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: bid.accepted ? "var(--color-success-soft)" : "var(--color-bg-hover)", color: bid.accepted ? "var(--color-success)" : "var(--color-fg-muted)" }}>
                  {bid.accepted ? "Accepted" : "Pending"}
                </span>
                {clientReady && isCreator && !bid.accepted && (
                  <button onClick={async () => { await execute({ jobId: BigInt(job.onchain_job_id!), provider: bid.provider }); fetchBids(); }}
                    disabled={isLoading}
                    className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                    {isLoading ? "Accepting..." : "Accept"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}
