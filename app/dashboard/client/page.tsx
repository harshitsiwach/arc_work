"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useWallet } from "@/lib/web3/wallet-provider";
import { reads } from "@/lib/contracts/reads";
import type { JobRecord } from "@/features/jobs/types/job";

export default function ClientDashboardPage() {
  const { activeAddress } = useWallet();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [onchainStatuses, setOnchainStatuses] = useState<Record<string, { client: string; status: number; hasProvider: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).single();
      if (!profile) { setLoading(false); return; }
      const { data } = await supabase.from("gigs").select("*").eq("creator_profile_id", profile.id).order("created_at", { ascending: false });
      const mapped = (data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        title: d.title as string,
        status: d.status as JobRecord["status"],
        price_amount: Number(d.price_amount),
        price_currency: d.price_currency as string,
        created_at: d.created_at as string,
        onchain_job_id: (d.onchain_job_id as number) ?? null,
      } as JobRecord));
      setJobs(mapped);

      // Fetch onchain status for jobs with onchain_job_id
      const statuses: Record<string, { client: string; status: number; hasProvider: boolean }> = {};
      await Promise.all(mapped.filter(j => j.onchain_job_id).map(async (j) => {
        try {
          const job = await reads.getJob(BigInt(j.onchain_job_id!));
          const bids = await reads.getBids(BigInt(j.onchain_job_id!));
          const acceptedBid = bids.find(b => b.accepted);
          statuses[j.id] = {
            client: job.client,
            status: job.status,
            hasProvider: acceptedBid !== undefined || (job.provider !== "0x0000000000000000000000000000000000000000"),
          };
        } catch { /* ignore */ }
      }));
      setOnchainStatuses(statuses);
      setLoading(false);
    })();
  }, []);

  const isMyJob = (job: JobRecord) => {
    const s = onchainStatuses[job.id];
    if (!s) return false;
    return activeAddress?.toLowerCase() === s.client?.toLowerCase();
  };

  const needsFunding = (job: JobRecord) => {
    const s = onchainStatuses[job.id];
    return s && s.hasProvider && s.status === 0;
  };

  const activeStatuses: string[] = ["open", "funded", "submitted", "live"];
  const completedStatuses: string[] = ["completed", "rejected", "expired"];
  const active = jobs.filter(j => activeStatuses.includes(j.status));
  const completed = jobs.filter(j => completedStatuses.includes(j.status));
  const pendingFunding = jobs.filter(j => needsFunding(j));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>Client Dashboard</h1>
        <Link href="/jobs/create" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>Post a Job</Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{active.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Active</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-2xl font-bold" style={{ color: pendingFunding.length > 0 ? "var(--color-warning)" : "var(--color-fg)" }}>{pendingFunding.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Need Funding</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{completed.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Completed</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{jobs.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Total</p>
        </div>
      </div>

      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-lg border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }} />)}</div>
      : (
        <>
          {pendingFunding.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-warning)" }}>Pending Funding</h2>
              <div className="space-y-2">
                {jobs.filter(j => needsFunding(j)).map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}/fund`}
                    className="block rounded-xl border p-4 transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--color-warning)", backgroundColor: "color-mix(in srgb, var(--color-warning) 8%, var(--color-bg-elevated))" }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{job.title}</p>
                      <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--color-warning-soft)", color: "var(--color-warning)" }}>Fund Escrow</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Bid accepted — {job.price_amount} USDC needs to be locked</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-fg)" }}>Active Jobs</h2>
            {active.length === 0 ? (
              <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
                <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No active jobs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {active.map(job => <JobRow key={job.id} job={job} needsFunding={needsFunding(job)} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function JobRow({ job, needsFunding }: { job: JobRecord; needsFunding: boolean }) {
  const statusLabels: Record<string, string> = { draft: "Draft", live: "Open", open: "Open", funded: "Funded", submitted: "Submitted", completed: "Completed", rejected: "Rejected", expired: "Expired" };
  const statusColors: Record<string, string> = { open: "var(--color-accent)", live: "var(--color-accent)", funded: "var(--color-warning)", submitted: "var(--color-warning)", completed: "var(--color-success)", rejected: "var(--color-error)", expired: "var(--color-fg-muted)" };
  const href = needsFunding ? `/jobs/${job.id}/fund` : `/jobs/${job.id}`;
  return (
    <Link href={href} className="block rounded-xl border p-4 transition-colors hover:opacity-80" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{job.title}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>{job.price_amount} {job.price_currency}{needsFunding ? " — Bid accepted, fund escrow" : ""}</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ backgroundColor: (statusColors[job.status] ?? "var(--color-fg-muted)") + "20", color: statusColors[job.status] ?? "var(--color-fg-muted)" }}>
          {statusLabels[job.status] ?? job.status}
        </span>
      </div>
    </Link>
  );
}
