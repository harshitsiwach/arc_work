"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import { cn } from "@/lib/utils";
import {
  Briefcase, Activity, Clock, CheckCircle2, AlertCircle, ArrowRight,
  ChevronRight, Wallet, FileText, ListChecks, Sparkles, Eye,
  Send, DollarSign,
} from "lucide-react";

type Tab = "created" | "applied" | "assigned" | "submitted" | "completed";

interface JobWithOnchain {
  id: string;
  title: string;
  onchain_job_id: number | null;
  onchainStatus?: number;
  hasProvider?: boolean;
  price_amount?: number;
  price_currency?: string;
  created_at?: string;
  deadline?: string | null;
  role: "client" | "provider";
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "created", label: "Created", icon: Briefcase },
  { key: "applied", label: "Applied", icon: Send },
  { key: "assigned", label: "Assigned", icon: Activity },
  { key: "submitted", label: "Submitted", icon: FileText },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const STATUS_MAP: Record<number, string> = {
  0: "open", 1: "funded", 2: "submitted", 3: "completed", 4: "rejected", 5: "expired",
};
const STATUS_LABELS: Record<number, string> = {
  0: "Open", 1: "Funded", 2: "Submitted", 3: "Completed", 4: "Rejected", 5: "Expired",
};
const STATUS_COLORS: Record<number, string> = {
  0: "var(--color-accent)",
  1: "var(--color-warning)",
  2: "var(--color-primary)",
  3: "var(--color-success)",
  4: "var(--color-error)",
  5: "var(--color-fg-muted)",
};

const PIPELINE_STAGES = [
  { key: "open", label: "Open", color: "var(--color-accent)", icon: Briefcase },
  { key: "funded", label: "Funded", color: "var(--color-warning)", icon: Wallet },
  { key: "assigned", label: "Assigned", color: "var(--color-primary)", icon: Activity },
  { key: "submitted", label: "Submitted", color: "var(--color-primary)", icon: FileText },
  { key: "completed", label: "Completed", color: "var(--color-success)", icon: CheckCircle2 },
] as const;

interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

export default function WorkCenterPage() {
  const { activeAddress } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>("created");
  const [createdJobs, setCreatedJobs] = useState<JobWithOnchain[]>([]);
  const [providerJobs, setProviderJobs] = useState<JobWithOnchain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeAddress) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        if (!profile) { setLoading(false); return; }

        const { data: gigData } = await supabase
          .from("gigs")
          .select("*")
          .eq("creator_profile_id", profile.id)
          .order("created_at", { ascending: false });

        const created: JobWithOnchain[] = (gigData ?? []).map(
          (d: Record<string, unknown>) => ({
            id: d.id as string,
            title: d.title as string,
            onchain_job_id: (d.onchain_job_id as number) ?? null,
            price_amount: Number(d.price_amount) || 0,
            price_currency: (d.price_currency as string) ?? "USDC",
            created_at: d.created_at as string,
            deadline: (d.deadline as string) ?? null,
            role: "client",
          })
        );

        await Promise.all(
          created
            .filter((j) => j.onchain_job_id)
            .map(async (j) => {
              try {
                const job = await reads.getJob(BigInt(j.onchain_job_id!));
                const bids = await reads.getBids(BigInt(j.onchain_job_id!));
                const accepted = bids.find((b) => b.accepted);
                j.onchainStatus = job.status;
                j.hasProvider =
                  accepted !== undefined ||
                  job.provider !== "0x0000000000000000000000000000000000000000";
              } catch {
                /* ignore */
              }
            })
        );
        setCreatedJobs(created);

        // Provider-side: scan all gigs for ones where onchain provider = current wallet
        const { data: allGigs } = await supabase
          .from("gigs")
          .select("id, onchain_job_id, title, price_amount, price_currency, created_at, deadline")
          .not("onchain_job_id", "is", null)
          .order("created_at", { ascending: false });

        const assigned: JobWithOnchain[] = [];
        for (const row of allGigs ?? []) {
          try {
            const j = await reads.getJob(BigInt(row.onchain_job_id!));
            if (j.provider.toLowerCase() === activeAddress.toLowerCase()) {
              assigned.push({
                id: row.id,
                title: row.title,
                onchain_job_id: row.onchain_job_id!,
                onchainStatus: j.status,
                price_amount: Number(row.price_amount) || 0,
                price_currency: row.price_currency || "USDC",
                created_at: row.created_at,
                deadline: row.deadline ?? null,
                role: "provider",
              });
            }
          } catch {
            /* ignore */
          }
        }
        setProviderJobs(assigned);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [activeAddress]);

  // Pipeline counts
  const pipeline = useMemo(() => {
    const all = [...createdJobs, ...providerJobs];
    return {
      open: all.filter((j) => (j.onchainStatus ?? 0) === 0 && !j.hasProvider).length,
      funded: all.filter((j) => (j.onchainStatus ?? 0) === 0 && j.hasProvider).length,
      assigned: providerJobs.filter(
        (j) => (j.onchainStatus ?? 0) === 1 || (j.onchainStatus ?? 0) === 0
      ).length,
      submitted: all.filter((j) => (j.onchainStatus ?? 0) === 2).length,
      completed: all.filter((j) => (j.onchainStatus ?? 0) === 3).length,
    };
  }, [createdJobs, providerJobs]);

  // Action items
  const actionItems = useMemo(() => {
    const items: { id: string; title: string; subtitle: string; cta: string; href: string; severity: "warning" | "info" | "success" }[] = [];
    for (const j of createdJobs) {
      const s = j.onchainStatus;
      if (s === 0 && j.hasProvider) {
        items.push({
          id: j.id,
          title: j.title,
          subtitle: "Bid accepted — fund the escrow to start work",
          cta: "Fund Escrow",
          href: `/jobs/${j.id}/fund`,
          severity: "warning",
        });
      } else if (s === 2) {
        items.push({
          id: j.id,
          title: j.title,
          subtitle: "Work submitted — review and release payment",
          cta: "Review Submission",
          href: `/jobs/${j.id}/review`,
          severity: "info",
        });
      }
    }
    for (const j of providerJobs) {
      if ((j.onchainStatus ?? 0) === 1) {
        items.push({
          id: j.id,
          title: j.title,
          subtitle: "Escrow funded — start work and submit deliverable",
          cta: "Submit Work",
          href: `/jobs/${j.id}/deliver`,
          severity: "info",
        });
      }
    }
    return items;
  }, [createdJobs, providerJobs]);

  // Activity feed
  const activityFeed = useMemo<ActivityFeedItem[]>(() => {
    const items: ActivityFeedItem[] = [];
    for (const j of createdJobs) {
      const s = j.onchainStatus ?? 0;
      if (j.created_at) {
        items.push({
          id: `${j.id}-created`,
          type: "created",
          title: j.title,
          subtitle: `Job created`,
          timestamp: j.created_at,
          icon: Briefcase,
          color: "var(--color-accent)",
          href: `/jobs/${j.id}`,
        });
      }
      if (j.hasProvider && s === 0) {
        items.push({
          id: `${j.id}-accepted`,
          type: "bid_accepted",
          title: j.title,
          subtitle: "Bid accepted — awaiting funding",
          timestamp: j.created_at ?? new Date().toISOString(),
          icon: CheckCircle2,
          color: "var(--color-warning)",
          href: `/jobs/${j.id}/fund`,
        });
      }
      if (s === 1) {
        items.push({
          id: `${j.id}-funded`,
          type: "funded",
          title: j.title,
          subtitle: "Escrow funded",
          timestamp: j.created_at ?? new Date().toISOString(),
          icon: Wallet,
          color: "var(--color-primary)",
          href: `/jobs/${j.id}`,
        });
      }
      if (s === 2) {
        items.push({
          id: `${j.id}-submitted`,
          type: "submitted",
          title: j.title,
          subtitle: "Work delivered by provider",
          timestamp: j.created_at ?? new Date().toISOString(),
          icon: FileText,
          color: "var(--color-primary)",
          href: `/jobs/${j.id}/review`,
        });
      }
      if (s === 3) {
        items.push({
          id: `${j.id}-completed`,
          type: "completed",
          title: j.title,
          subtitle: "Payment released",
          timestamp: j.created_at ?? new Date().toISOString(),
          icon: DollarSign,
          color: "var(--color-success)",
          href: `/jobs/${j.id}`,
        });
      }
    }
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return items.slice(0, 10);
  }, [createdJobs]);

  // Tab counts
  const tabCounts: Record<Tab, number> = {
    created: createdJobs.length,
    applied: 0,
    assigned: providerJobs.length,
    submitted: providerJobs.filter((j) => (j.onchainStatus ?? 0) === 2).length,
    completed: [...createdJobs, ...providerJobs].filter(
      (j) => (j.onchainStatus ?? 0) === 3
    ).length,
  };

  // Filter jobs by tab
  const tabJobs = (): JobWithOnchain[] => {
    switch (activeTab) {
      case "created":
        return createdJobs;
      case "applied":
        return [];
      case "assigned":
        return providerJobs;
      case "submitted":
        return providerJobs.filter((j) => (j.onchainStatus ?? 0) === 2);
      case "completed":
        return [...createdJobs, ...providerJobs].filter(
          (j) => (j.onchainStatus ?? 0) === 3
        );
      default:
        return [];
    }
  };

  const activeJobs = tabJobs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={14} style={{ color: "var(--color-accent)" }} />
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-accent)" }}
          >
            Operations
          </p>
        </div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-fg)" }}
        >
          Work Center
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Your operational command center for jobs, bids, and work.
        </p>
      </div>

      {/* Stats row */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBlock label="Active Work" value={pipeline.funded + pipeline.submitted} accent="var(--color-accent)" icon={Activity} />
          <StatBlock label="Open Jobs" value={pipeline.open} accent="var(--color-warning)" icon={Briefcase} />
          <StatBlock
            label="Pending Actions"
            value={actionItems.length}
            accent={actionItems.length > 0 ? "var(--color-warning)" : "var(--color-success)"}
            icon={ListChecks}
          />
          <StatBlock label="Completed" value={pipeline.completed} accent="var(--color-success)" icon={CheckCircle2} />
        </div>
      </section>

      {/* Work Pipeline */}
      <section>
        <SectionLabel icon={Activity} label="Work Pipeline" />
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--color-bd)",
            backgroundColor: "var(--color-bg-elevated)",
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const count =
                stage.key === "open" ? pipeline.open :
                stage.key === "funded" ? pipeline.funded :
                stage.key === "assigned" ? pipeline.assigned :
                stage.key === "submitted" ? pipeline.submitted :
                pipeline.completed;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center gap-3 sm:gap-2">
                  <div className="flex-1 min-w-0 p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={12} style={{ color: stage.color }} />
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider truncate"
                        style={{ color: "var(--color-fg-muted)" }}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <p
                      className="text-xl font-bold tabular-nums"
                      style={{ color: count > 0 ? stage.color : "var(--color-fg-muted)" }}
                    >
                      {count}
                    </p>
                  </div>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight
                      size={14}
                      className="hidden sm:block shrink-0"
                      style={{ color: "var(--color-bd)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Tabs + Job Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Required */}
          {actionItems.length > 0 && (
            <section>
              <SectionLabel icon={AlertCircle} label="Action Required" />
              <div className="space-y-2">
                {actionItems.map((item) => {
                  const severityColor =
                    item.severity === "warning"
                      ? "var(--color-warning)"
                      : "var(--color-primary)";
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border p-3.5 flex items-center gap-3"
                      style={{
                        borderColor: "var(--color-bd)",
                        backgroundColor: "var(--color-bg-elevated)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${severityColor} 12%, transparent)`,
                        }}
                      >
                        <AlertCircle size={14} style={{ color: severityColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
                          {item.title}
                        </p>
                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--color-fg-muted)" }}>
                          {item.subtitle}
                        </p>
                      </div>
                      <Link
                        href={item.href}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: severityColor, color: "white" }}
                      >
                        {item.cta}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tabs */}
          <div className="flex items-center justify-between border-b" style={{ borderColor: "var(--color-bd)" }}>
            <div className="flex gap-0.5 overflow-x-auto">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-3.5 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap",
                      active ? "border-current" : "border-transparent"
                    )}
                    style={{
                      color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
                    }}
                  >
                    <Icon size={13} />
                    {tab.label}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{
                        backgroundColor: active
                          ? "color-mix(in srgb, var(--color-accent) 16%, transparent)"
                          : "var(--color-bg-hover)",
                        color: active ? "var(--color-accent)" : "var(--color-fg-muted)",
                      }}
                    >
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-4 animate-pulse"
                  style={{ borderColor: "var(--color-bd)" }}
                >
                  <div
                    className="h-4 w-3/4 rounded mb-2"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                  />
                  <div
                    className="h-3 w-1/3 rounded"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                  />
                </div>
              ))}
            </div>
          ) : activeJobs.length === 0 ? (
            <EmptyTabState tab={activeTab} />
          ) : (
            <div className="space-y-2.5">
              {activeJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <section>
          <SectionLabel icon={Clock} label="Activity Feed" />
          <div
            className="rounded-xl border"
            style={{
              borderColor: "var(--color-bd)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded animate-pulse"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                  />
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Sparkles size={16} className="mx-auto mb-2" style={{ color: "var(--color-fg-muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                  No activity yet
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                  Activity will appear as your jobs progress.
                </p>
              </div>
            ) : (
              <ul>
                {activityFeed.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.id}
                      className={idx < activityFeed.length - 1 ? "border-b" : ""}
                      style={{ borderColor: "var(--color-bd)" }}
                    >
                      <Link
                        href={item.href ?? "#"}
                        className="flex items-start gap-2.5 px-3.5 py-3 transition-colors hover:bg-[var(--color-bg-hover)]"
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                          }}
                        >
                          <Icon size={11} style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: "var(--color-fg)" }}>
                            {item.title}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                            {item.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={13} style={{ color: "var(--color-fg-muted)" }} />
      <h2
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-fg-muted)" }}
      >
        {label}
      </h2>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          }}
        >
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: "var(--color-fg)" }}>
        {value}
      </p>
    </div>
  );
}

function JobCard({ job }: { job: JobWithOnchain }) {
  const status = job.onchainStatus ?? 0;
  const statusLabel = STATUS_LABELS[status] ?? "Unknown";
  const statusColor = STATUS_COLORS[status] ?? "var(--color-fg-muted)";

  // Determine quick action based on status and role
  let actionLabel: string | null = null;
  let actionHref: string | null = null;
  let actionIcon: React.ElementType | null = null;
  if (status === 0 && job.hasProvider && job.role === "client") {
    actionLabel = "Fund Escrow";
    actionHref = `/jobs/${job.id}/fund`;
    actionIcon = Wallet;
  } else if (status === 1 && job.role === "provider") {
    actionLabel = "Submit Work";
    actionHref = `/jobs/${job.id}/deliver`;
    actionIcon = Send;
  } else if (status === 2 && job.role === "client") {
    actionLabel = "Review";
    actionHref = `/jobs/${job.id}/review`;
    actionIcon = CheckCircle2;
  } else if (status === 4) {
    actionLabel = "View Details";
    actionHref = `/jobs/${job.id}`;
    actionIcon = Eye;
  }
  if (!actionLabel) {
    actionLabel = "View Job";
    actionHref = `/jobs/${job.id}`;
    actionIcon = Eye;
  }

  const ActionIcon = actionIcon!;

  // Escrow state
  let escrowLabel = "No escrow";
  let escrowColor = "var(--color-fg-muted)";
  if (status === 0 && job.hasProvider) {
    escrowLabel = "Pending funding";
    escrowColor = "var(--color-warning)";
  } else if (status === 1) {
    escrowLabel = "Funded";
    escrowColor = "var(--color-primary)";
  } else if (status === 2) {
    escrowLabel = "Work submitted";
    escrowColor = "var(--color-primary)";
  } else if (status === 3) {
    escrowLabel = "Released";
    escrowColor = "var(--color-success)";
  } else if (status === 4) {
    escrowLabel = "Refunded";
    escrowColor = "var(--color-error)";
  }

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <Link href={`/jobs/${job.id}`} className="block">
            <p
              className="text-sm font-semibold truncate hover:underline"
              style={{ color: "var(--color-fg)" }}
            >
              {job.title}
            </p>
          </Link>
          <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
            {job.onchain_job_id !== null && (
              <span className="font-mono">#{job.onchain_job_id}</span>
            )}
            <span>·</span>
            <span>{job.role === "client" ? "Client" : "Provider"}</span>
            {job.created_at && (
              <>
                <span>·</span>
                <span>Created {formatRelativeTime(job.created_at)}</span>
              </>
            )}
            {job.deadline && (
              <>
                <span>·</span>
                <span>Due {formatRelativeTime(job.deadline)}</span>
              </>
            )}
          </div>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-1 rounded shrink-0 font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: "var(--color-bd)" }}>
        <div className="flex items-center gap-3 text-[11px]">
          {(job.price_amount ?? 0) > 0 && (
            <span className="font-mono font-semibold" style={{ color: "var(--color-fg)" }}>
              {job.price_amount} {job.price_currency}
            </span>
          )}
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `color-mix(in srgb, ${escrowColor} 10%, transparent)`,
              color: escrowColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: escrowColor }}
            />
            {escrowLabel}
          </span>
        </div>
        <Link
          href={actionHref ?? `/jobs/${job.id}`}
          className="text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--color-bg-hover)",
            color: "var(--color-fg)",
          }}
        >
          <ActionIcon size={12} />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

function EmptyTabState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { title: string; description: string; cta?: { href: string; label: string } }> = {
    created: {
      title: "No jobs created yet",
      description: "Post a job to start receiving bids.",
      cta: { href: "/create/job", label: "Post a Job" },
    },
    applied: {
      title: "No bids placed yet",
      description: "Browse open jobs to start applying.",
      cta: { href: "/marketplace/jobs", label: "Browse Jobs" },
    },
    assigned: {
      title: "No jobs assigned to you",
      description: "Once you win a bid, it will show up here.",
    },
    submitted: {
      title: "No work submitted yet",
      description: "When you submit deliverables, they appear here.",
    },
    completed: {
      title: "No completed work yet",
      description: "Finished jobs will be archived here.",
    },
  };
  const m = messages[tab];
  return (
    <div
      className="text-center py-12 rounded-xl border"
      style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{m.title}</p>
      <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>{m.description}</p>
      {m.cta && (
        <Link
          href={m.cta.href}
          className="inline-flex items-center gap-1 text-sm mt-3 font-medium hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          {m.cta.label}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d`;
  return date.toLocaleDateString();
}
