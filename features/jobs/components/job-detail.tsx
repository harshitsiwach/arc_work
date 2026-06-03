"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { JobHeader } from "./job-header";
import { JobTimeline } from "./job-timeline";
import { JobActivity } from "./job-activity";
import { useWallet } from "@/lib/web3/wallet-provider";
import { reads } from "@/lib/contracts/reads";
import { useClaimRefund } from "@/features/jobs/hooks/use-workflow-actions";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobStatus } from "@/lib/contracts/types";
import type { JobRecord } from "../types/job";
import { AGENTIC_COMMERCE_ADDRESS } from "@/lib/contracts/instance";
import { formatUSDC } from "@/lib/contracts/format";

interface JobDetailProps {
  job: JobRecord;
}

export function JobDetail({ job }: JobDetailProps) {
  const { activeAddress } = useWallet();
  const [onchainStatus, setOnchainStatus] = useState<JobStatus | null>(null);
  const [onchainProvider, setOnchainProvider] = useState<string>("");
  const [onchainBudget, setOnchainBudget] = useState<bigint>(BigInt(0));
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const claimRefund = useClaimRefund();

  const fetchOnchainStatus = useCallback(async () => {
    if (!job.onchain_job_id) return;
    try {
      const onchainJob = await reads.getJob(BigInt(job.onchain_job_id!));
      setOnchainStatus(onchainJob.status);
      setOnchainProvider(onchainJob.provider);
      setOnchainBudget(onchainJob.budget);
      setOnchainClientAddress(onchainJob.client);
    } catch {
      const statusMap: Record<string, JobStatus> = { open: 0, funded: 1, submitted: 2, completed: 3, rejected: 4, expired: 5 };
      setOnchainStatus(statusMap[job.status] ?? 0);
    }
  }, [job.onchain_job_id, job.status]);

  useEffect(() => { fetchOnchainStatus(); }, [fetchOnchainStatus]);

  const currentStatus = onchainStatus ?? 0;
  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();
  const hasProvider = onchainProvider && onchainProvider !== "0x0000000000000000000000000000000000000000";
  const isAssignedProvider = activeAddress?.toLowerCase() === onchainProvider?.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <JobHeader job={job} onchainStatus={currentStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--color-fg-muted)" }}>Budget</p>
                <p className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>{job.price_amount} <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span></p>
              </div>
              {job.delivery_days && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                  <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--color-fg-muted)" }}>Deadline</p>
                  <p className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>{job.delivery_days} <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>days</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Description</h3>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-fg-secondary)" }}>{job.description}</p>
          </div>

          {/* Actions — role-based workflow links */}
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Actions</h3>
            <div className="flex flex-wrap gap-3">
              {job.onchain_job_id ? (
                <>
                  {/* ── Primary: creator actions ── */}
                  {isCreator && currentStatus === 0 && !hasProvider && (
                    <Link href={`/jobs/${job.id}/bids`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                      Review Bids
                    </Link>
                  )}
                  {isCreator && currentStatus === 0 && hasProvider && (
                    <Link href={`/jobs/${job.id}/fund`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                      Fund Escrow
                    </Link>
                  )}
                  {isCreator && currentStatus === 2 && (
                    <Link href={`/jobs/${job.id}/review`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-success)", color: "white" }}>
                      Review Work
                    </Link>
                  )}
                  {isCreator && (currentStatus === 4 || currentStatus === 5) && (
                    <button onClick={async () => { await claimRefund.execute(BigInt(job.onchain_job_id!)); }}
                      disabled={claimRefund.isLoading}
                      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "var(--color-warning)", color: "white" }}>
                      {claimRefund.isLoading ? "Processing..." : "Claim Refund"}
                    </button>
                  )}

                  {/* ── Primary: provider actions ── */}
                  {!isCreator && currentStatus === 0 && !hasProvider && (
                    <Link href={`/jobs/${job.id}/submit-bid`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                      Submit Bid
                    </Link>
                  )}
                  {isAssignedProvider && currentStatus === 1 && (
                    <Link href={`/jobs/${job.id}/deliver`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                      Submit Work
                    </Link>
                  )}

                  {/* ── Secondary: view bids (hide if primary already links to bids) ── */}
                  {!isCreator && (
                    <Link href={`/jobs/${job.id}/bids`} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-secondary)" }}>
                      View Bids
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Waiting for onchain deployment...</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Onchain</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase" style={{ color: "var(--color-fg-muted)" }}>Job ID</span>
                <span className="text-xs font-mono" style={{ color: "var(--color-fg)" }}>{job.onchain_job_id ?? "Not deployed"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase" style={{ color: "var(--color-fg-muted)" }}>Status</span>
                <span className="text-xs font-mono" style={{ color: "var(--color-fg)" }}>
                  {["Open", "Funded", "Submitted", "Completed", "Rejected", "Expired"][currentStatus] ?? "Unknown"}
                </span>
              </div>
              {hasProvider && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase" style={{ color: "var(--color-fg-muted)" }}>Provider</span>
                  <span className="text-xs font-mono" style={{ color: "var(--color-fg)" }}>{onchainProvider?.slice(0, 6)}...{onchainProvider?.slice(-4)}</span>
                </div>
              )}
              {onchainBudget > BigInt(0) && (
                <div className="flex items-center justify-between" style={{ color: "var(--color-fg)" }}>
                  <span className="text-[10px] font-mono uppercase" style={{ color: "var(--color-fg-muted)" }}>Budget</span>
                  <span className="text-xs font-mono">{formatUSDC(onchainBudget)} USDC</span>
                </div>
              )}
              {job.onchain_job_id && (
                <a href={`https://testnet.arcscan.app/address/${AGENTIC_COMMERCE_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono hover:underline" style={{ color: "var(--color-accent)" }}>
                  View on ArcScan
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
            </div>
          </div>

          <JobTimeline currentStatus={currentStatus} />
          <JobActivity job={job} />
        </div>
      </div>

      <TransactionModal state={claimRefund.state} onClose={claimRefund.reset} />
    </div>
  );
}
