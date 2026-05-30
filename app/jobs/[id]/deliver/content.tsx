"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useSubmitWork } from "@/features/jobs/hooks/use-workflow-actions";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";

export function DeliverPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const [onchainStatus, setOnchainStatus] = useState<number | null>(null);
  const [onchainProvider, setOnchainProvider] = useState<string>("");
  const { execute, isLoading, isSuccess, state, reset } = useSubmitWork();

  useEffect(() => {
    if (!job.onchain_job_id) return;
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainStatus(j.status); setOnchainProvider(j.provider); }).catch(() => {});
  }, [job.onchain_job_id]);

  const isAssignedProvider = activeAddress?.toLowerCase() === onchainProvider.toLowerCase();

  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain.</p>;
  if (onchainStatus !== null && onchainStatus !== 1) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>This job is not in a fundable state.</p>;
  if (!isAssignedProvider) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Only the assigned provider can submit work.</p>;

  const handleDeliver = async () => {
    await execute(BigInt(job.onchain_job_id!));
    if (isSuccess) setTimeout(() => router.push(`/jobs/${job.id}`), 1500);
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
      {isSuccess && <p className="text-xs text-center" style={{ color: "var(--color-success)" }}>Work submitted!</p>}
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}
