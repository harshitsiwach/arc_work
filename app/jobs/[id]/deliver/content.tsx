"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useSubmitWork } from "@/features/jobs/hooks/use-workflow-actions";
import { jobService } from "@/features/jobs/services/job-service";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";

export function DeliverPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const [onchainStatus, setOnchainStatus] = useState<number | null>(null);
  const [onchainProvider, setOnchainProvider] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const { execute, isLoading, isSuccess, state, reset } = useSubmitWork();

  const isAssignedProvider = activeAddress?.toLowerCase() === onchainProvider.toLowerCase();

  useEffect(() => {
    if (!job.onchain_job_id) { setLoaded(true); return; }
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainStatus(j.status); setOnchainProvider(j.provider); setLoaded(true); }).catch(() => setLoaded(true));
  }, [job.onchain_job_id]);

  useEffect(() => {
    if (!isSuccess) return;
    jobService.updateStatus(job.id, "submitted").catch(() => {});
    const t = setTimeout(() => router.push(`/jobs/${job.id}`), 1500);
    return () => clearTimeout(t);
  }, [isSuccess]);

  if (!loaded) return <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}><div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }} /></div>;
  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain.</p>;
  if (onchainStatus !== null && onchainStatus !== 1) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>This job is not in a submittable state (must be Funded).</p>;
  if (!isAssignedProvider) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Only the assigned provider can submit work.</p>;

  const handleDeliver = async () => {
    await execute(BigInt(job.onchain_job_id!));
  };

  return (
    <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
        Submit your completed work for <strong style={{ color: "var(--color-fg)" }}>{job.title}</strong>.
      </p>
      <button onClick={handleDeliver} disabled={isLoading}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
        {isLoading ? "Submitting..." : "Submit Work"}
      </button>
      {isSuccess && <p className="text-xs text-center" style={{ color: "var(--color-success)" }}>Work submitted! Redirecting...</p>}
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}
