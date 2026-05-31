"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { reads } from "@/lib/contracts/reads";
import { formatUSDC } from "@/lib/contracts/format";
import { useWallet } from "@/lib/web3/wallet-provider";
import { JOB_STATUS_MAP, JOB_STATUS_COLORS } from "@/lib/contracts/constants";

interface AssignedJob {
  dbId: string;
  onchainJobId: number;
  title: string;
  amount: bigint;
  status: number;
  client: string;
}

export default function ProviderDashboardPage() {
  const { activeAddress, isConnected } = useWallet();
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeAddress) { setLoading(false); return; }
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("gigs")
          .select("id, onchain_job_id, title")
          .not("onchain_job_id", "is", null)
          .order("created_at", { ascending: false });

        const jobs: AssignedJob[] = [];
        for (const row of (data ?? [])) {
          try {
            const j = await reads.getJob(BigInt(row.onchain_job_id!));
            if (j.provider.toLowerCase() !== activeAddress.toLowerCase()) continue;
            jobs.push({
              dbId: row.id,
              onchainJobId: row.onchain_job_id!,
              title: row.title,
              amount: j.budget,
              status: j.status,
              client: j.client,
            });
          } catch {}
        }
        setAssignedJobs(jobs);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [activeAddress]);

  const statusLabel = (s: number) => JOB_STATUS_MAP[s as keyof typeof JOB_STATUS_MAP] ?? "Unknown";
  const statusColor = (s: number) => JOB_STATUS_COLORS[s as keyof typeof JOB_STATUS_COLORS] ?? "var(--color-fg-muted)";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>Provider Dashboard</h1>
        <Link href="/jobs" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>Browse Jobs</Link>
      </div>

      {!isConnected || !activeAddress ? (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Connect your wallet to see your assigned jobs.</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }}>
              <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
            </div>
          ))}
        </div>
      ) : assignedJobs.length === 0 ? (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No assigned jobs yet. Place bids on available jobs to get started.</p>
          <Link href="/jobs" className="text-sm mt-2 inline-block hover:underline" style={{ color: "var(--color-accent)" }}>Browse available jobs &rarr;</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {assignedJobs.map(job => (
            <div key={job.onchainJobId} className="rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-fg)" }}>{job.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>#{job.onchainJobId}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--color-fg-secondary)" }}>{formatUSDC(job.amount)} USDC</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: statusColor(job.status), color: "white" }}>{statusLabel(job.status)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {job.status === 1 && (
                  <Link href={`/jobs/${job.dbId}/deliver`} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                    Submit Work
                  </Link>
                )}
                {job.status === 2 && (
                  <span className="text-xs px-3 py-1.5" style={{ color: "var(--color-fg-muted)" }}>Awaiting Review</span>
                )}
                {job.status === 3 && (
                  <span className="text-xs px-3 py-1.5" style={{ color: "var(--color-success)" }}>Completed</span>
                )}
                {job.status === 4 && (
                  <span className="text-xs px-3 py-1.5" style={{ color: "var(--color-error)" }}>Rejected</span>
                )}
                <Link href={`/jobs/${job.dbId}`} className="rounded-lg px-3 py-1.5 text-xs font-medium border" style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-secondary)" }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
