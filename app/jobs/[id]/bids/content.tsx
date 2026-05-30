"use client";

import { useState, useEffect, useCallback } from "react";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAcceptBid } from "@/features/bids/hooks/use-accept-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";
import type { Bid } from "@/lib/contracts/types";

export function BidsPageContent({ job }: { job: JobRecord }) {
  const { activeAddress } = useWallet();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const { execute, isLoading, state, reset } = useAcceptBid();
  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();

  const fetchBids = useCallback(async () => {
    if (!job.onchain_job_id) return;
    setLoading(true);
    try {
      const result = await reads.getBids(BigInt(job.onchain_job_id!));
      setBids(result);
    } catch { /* ignore */ }
    setLoading(false);
  }, [job.onchain_job_id]);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  useEffect(() => {
    if (!job.onchain_job_id) return;
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainClientAddress(j.client); setClientReady(true); }).catch(() => setClientReady(true));
  }, [job.onchain_job_id]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-lg border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }} />)}</div>;
  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain yet.</p>;

  return (
    <div className="space-y-4">
      {bids.length === 0 ? (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No bids yet</p>
        </div>
      ) : (
        bids.map((bid, idx) => (
          <div key={bid.provider ?? `bid-${idx}`} className="rounded-xl border p-5" style={{ borderColor: bid.accepted ? "var(--color-success)" : "var(--color-bd)", backgroundColor: bid.accepted ? "var(--color-success-soft)" : "var(--color-bg-elevated)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>{bid.provider?.slice(0, 6) ?? "---"}...{bid.provider?.slice(-4) ?? ""}</p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--color-fg)" }}>{bid.amount.toString()} <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span></p>
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
