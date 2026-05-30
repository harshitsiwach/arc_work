"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAcceptBid } from "@/features/bids/hooks/use-accept-bid";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";
import type { Bid } from "@/lib/contracts/types";

export function AcceptBidPageContent({ job, providerParam }: { job: JobRecord; providerParam?: string }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const { execute, isLoading, isSuccess, state, reset } = useAcceptBid();
  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();

  const fetchBids = useCallback(async () => {
    if (!job.onchain_job_id) return;
    try {
      const result = await reads.getBids(BigInt(job.onchain_job_id!));
      setBids(result);
      if (providerParam) {
        const match = result.find(b => b.provider.toLowerCase() === providerParam.toLowerCase());
        if (match) setSelectedBid(match);
      }
    } catch { /* ignore */ }
  }, [job.onchain_job_id, providerParam]);

  useEffect(() => { fetchBids(); }, [fetchBids]);
  useEffect(() => { if (isSuccess) setTimeout(() => router.push(`/jobs/${job.id}/fund`), 1500); }, [isSuccess]);

  useEffect(() => {
    if (!job.onchain_job_id) return;
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainClientAddress(j.client); setClientReady(true); }).catch(() => setClientReady(true));
  }, [job.onchain_job_id]);

  if (!clientReady) return <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}><div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }} /></div>;
  if (!onchainClientAddress || !isCreator) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Only the job creator can accept bids.</p>;
  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain.</p>;

  if (selectedBid) {
    return (
      <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
          <p className="text-xs font-mono mb-1" style={{ color: "var(--color-fg-muted)" }}>Provider</p>
          <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>{selectedBid.provider?.slice(0, 6) ?? "---"}...{selectedBid.provider?.slice(-4) ?? ""}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
          <p className="text-xs font-mono mb-1" style={{ color: "var(--color-fg-muted)" }}>Bid Amount</p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{selectedBid.amount.toString()} <span className="text-sm font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span></p>
        </div>
        <button onClick={async () => { await execute({ jobId: BigInt(job.onchain_job_id!), provider: selectedBid.provider }); }}
          disabled={isLoading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
          {isLoading ? "Confirming..." : "Accept Bid — Proceed to Fund"}
        </button>
        {isSuccess && <p className="text-xs text-center" style={{ color: "var(--color-success)" }}>Bid accepted! Redirecting to fund...</p>}
        <TransactionModal state={state} onClose={reset} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.filter(b => !b.accepted).map(bid => (
        <button key={bid.provider} onClick={() => setSelectedBid(bid)}
          className="w-full text-left rounded-xl border p-4 transition-colors hover:opacity-80"
          style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>{bid.provider?.slice(0, 6) ?? "---"}...{bid.provider?.slice(-4) ?? ""}</p>
          <p className="text-lg font-bold mt-1" style={{ color: "var(--color-fg)" }}>{bid.amount.toString()} USDC</p>
        </button>
      ))}
      {bids.filter(b => !b.accepted).length === 0 && <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No pending bids to accept.</p>}
    </div>
  );
}
