"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useCompleteJob, useRejectJob } from "@/features/jobs/hooks/use-workflow-actions";
import { jobService } from "@/features/jobs/services/job-service";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";

export function ReviewPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const [onchainStatus, setOnchainStatus] = useState<number | null>(null);
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const complete = useCompleteJob();
  const reject = useRejectJob();
  const isLoading = complete.isLoading || reject.isLoading;

  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();

  useEffect(() => {
    if (!job.onchain_job_id) { setLoaded(true); return; }
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainStatus(j.status); setOnchainClientAddress(j.client); setLoaded(true); }).catch(() => setLoaded(true));
  }, [job.onchain_job_id]);

  useEffect(() => {
    if (!complete.isSuccess) return;
    jobService.updateStatus(job.id, "completed").catch(() => {});
    const t = setTimeout(() => router.push(`/jobs/${job.id}`), 1500);
    return () => clearTimeout(t);
  }, [complete.isSuccess]);

  useEffect(() => {
    if (!reject.isSuccess) return;
    jobService.updateStatus(job.id, "rejected").catch(() => {});
    const t = setTimeout(() => router.push(`/jobs/${job.id}`), 1500);
    return () => clearTimeout(t);
  }, [reject.isSuccess]);

  if (!loaded) return <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}><div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }} /></div>;
  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain.</p>;
  if (onchainStatus !== null && onchainStatus !== 2) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No work to review yet.</p>;
  if (!onchainClientAddress || !isCreator) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Only the job creator can review work.</p>;

  const handleComplete = async () => { await complete.execute(BigInt(job.onchain_job_id!)); };
  const handleReject = async () => { await reject.execute(BigInt(job.onchain_job_id!)); };

  return (
    <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
        Review the work submitted for <strong style={{ color: "var(--color-fg)" }}>{job.title}</strong>.
      </p>
      <div className="flex gap-3">
        <button onClick={handleComplete} disabled={isLoading}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-success)", color: "white" }}>
          {complete.isLoading ? "Processing..." : "Approve & Release"}
        </button>
        <button onClick={handleReject} disabled={isLoading}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-error)", color: "white" }}>
          {reject.isLoading ? "Processing..." : "Reject"}
        </button>
      </div>
      <TransactionModal state={complete.state} onClose={complete.reset} />
      <TransactionModal state={reject.state} onClose={reject.reset} />
    </div>
  );
}
