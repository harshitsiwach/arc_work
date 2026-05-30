"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useWallet } from "@/lib/web3/wallet-provider";
import type { JobRecord } from "@/features/jobs/types/job";

export default function ClientDashboardPage() {
  const { activeAddress } = useWallet();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).single();
      if (!profile) { setLoading(false); return; }
      const { data } = await supabase.from("gigs").select("*").eq("creator_profile_id", profile.id).order("created_at", { ascending: false });
      setJobs((data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        title: d.title as string,
        status: d.status as JobRecord["status"],
        price_amount: Number(d.price_amount),
        price_currency: d.price_currency as string,
        created_at: d.created_at as string,
        onchain_job_id: (d.onchain_job_id as number) ?? null,
      } as JobRecord)));
      setLoading(false);
    })();
  }, []);

  const activeStatuses: string[] = ["open", "funded", "submitted", "live"];
  const active = jobs.filter(j => activeStatuses.includes(j.status));
  const completedStatuses: string[] = ["completed", "rejected", "expired"];
  const completed = jobs.filter(j => completedStatuses.includes(j.status));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>Client Dashboard</h1>
        <Link href="/jobs/create" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>Post a Job</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{active.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Active</p>
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
      : active.length === 0 ? <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}><p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No active jobs</p></div>
      : <div className="space-y-3">{active.map(job => <JobRow key={job.id} job={job} />)}</div>}
    </div>
  );
}

function JobRow({ job }: { job: JobRecord }) {
  const statusLabels: Record<string, string> = { draft: "Draft", live: "Open", open: "Open", funded: "Funded", submitted: "Submitted", completed: "Completed", rejected: "Rejected", expired: "Expired" };
  const statusColors: Record<string, string> = { open: "var(--color-accent)", live: "var(--color-accent)", funded: "var(--color-warning)", submitted: "var(--color-warning)", completed: "var(--color-success)", rejected: "var(--color-error)", expired: "var(--color-fg-muted)" };
  return (
    <Link href={`/jobs/${job.id}`} className="block rounded-xl border p-4 transition-colors hover:opacity-80" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{job.title}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>{job.price_amount} {job.price_currency}</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ backgroundColor: statusColors[job.status] + "20", color: statusColors[job.status] ?? "var(--color-fg-muted)" }}>
          {statusLabels[job.status] ?? job.status}
        </span>
      </div>
    </Link>
  );
}
