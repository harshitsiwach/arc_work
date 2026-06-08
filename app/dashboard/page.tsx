"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useWallet } from "@/lib/web3/wallet-provider";
import { reads } from "@/lib/contracts/reads";
import { StatCard } from "@/components/ui/stat-card";
import { WalletBalanceStat } from "@/components/wallet-balance-stat";
import {
  Wallet, Briefcase, Bot, Package, Plus, ArrowRight, Sparkles,
  Activity, Globe, AlertCircle, CheckCircle2, Clock, Zap,
  TrendingUp, Users, FileText,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "job_created" | "product_listed" | "agent_deployed";
  title: string;
  subtitle?: string;
  timestamp: string;
  href?: string;
}

interface AttentionItem {
  id: string;
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
  severity: "warning" | "info" | "success";
}

const STAT_ICONS = {
  wallet: Wallet,
  jobs: Briefcase,
  agents: Bot,
  products: Package,
} as const;

export default function DashboardOverviewPage() {
  const { activeAddress, smartWallet } = useWallet();
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [agentCount, setAgentCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [marketplaceSnapshot, setMarketplaceSnapshot] = useState<{
    openJobs: number;
    activeAgents: number;
    productsListed: number;
  }>({ openJobs: 0, activeAgents: 0, productsListed: 0 });
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      if (!profile) {
        setLoading(false);
        return;
      }

      const activity: ActivityItem[] = [];
      const attention: AttentionItem[] = [];

      // 1. Fetch user's created jobs
      const { data: gigs } = await supabase
        .from("gigs")
        .select("id, title, status, price_amount, onchain_job_id, created_at")
        .eq("creator_profile_id", profile.id)
        .order("created_at", { ascending: false });

      const createdJobs = gigs ?? [];
      let activeJobs = 0;

      // Fetch onchain statuses for user's jobs
      const onchainMap: Record<string, { status: number; hasProvider: boolean }> = {};
      await Promise.all(
        createdJobs
          .filter((g: { id: string; onchain_job_id: number | null }) => g.onchain_job_id)
          .map(async (g: { id: string; onchain_job_id: number | null }) => {
            try {
              const job = await reads.getJob(BigInt(g.onchain_job_id!));
              const bids = await reads.getBids(BigInt(g.onchain_job_id!));
              const accepted = bids.find((b) => b.accepted);
              onchainMap[g.id] = {
                status: job.status,
                hasProvider:
                  accepted !== undefined ||
                  job.provider !== "0x0000000000000000000000000000000000000000",
              };
              if (job.status <= 2) activeJobs++;
            } catch {
              /* ignore */
            }
          })
      );

      // Recent activity from created jobs
      for (const g of createdJobs.slice(0, 5)) {
        activity.push({
          id: g.id,
          type: "job_created",
          title: g.title,
          subtitle: `${g.price_amount} USDC`,
          timestamp: g.created_at,
          href: `/jobs/${g.id}`,
        });
      }

      // 2. Fetch user's agents
      const { data: agents } = await supabase
        .from("agent_profiles")
        .select("id, agent_name, created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });
      const agentList = agents ?? [];
      setAgentCount(agentList.length);
      for (const a of agentList.slice(0, 3)) {
        activity.push({
          id: a.id,
          type: "agent_deployed",
          title: a.agent_name,
          subtitle: "AI agent",
          timestamp: a.created_at,
          href: "/dashboard/my-agents",
        });
      }

      // 3. Fetch user's products
      const { data: products } = await supabase
        .from("products")
        .select("id, title, price_amount, created_at")
        .eq("creator_profile_id", profile.id)
        .order("created_at", { ascending: false });
      const productList = products ?? [];
      setProductCount(productList.length);
      for (const p of productList.slice(0, 3)) {
        activity.push({
          id: p.id,
          type: "product_listed",
          title: p.title,
          subtitle: `${p.price_amount} USDC`,
          timestamp: p.created_at,
          href: "/dashboard/my-products",
        });
      }

      // 4. Attention items: jobs needing funding, awaiting review, etc.
      for (const g of createdJobs) {
        const s = onchainMap[g.id];
        if (s && s.hasProvider && s.status === 0) {
          attention.push({
            id: g.id,
            title: g.title,
            subtitle: "A bid has been accepted — fund the escrow to start work",
            cta: "Fund Escrow",
            href: `/jobs/${g.id}/fund`,
            severity: "warning",
          });
        } else if (s && s.status === 2) {
          attention.push({
            id: g.id,
            title: g.title,
            subtitle: "Work has been submitted — review and release payment",
            cta: "Review Submission",
            href: `/jobs/${g.id}/review`,
            severity: "info",
          });
        }
      }

      // 5. Marketplace snapshot (lightweight counts)
      const { count: openJobsCount } = await supabase
        .from("gigs")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");

      const { count: agentCountSnapshot } = await supabase
        .from("agent_profiles")
        .select("id", { count: "exact", head: true })
        .eq("availability_status", "online");

      const { count: productCountSnapshot } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      setMarketplaceSnapshot({
        openJobs: openJobsCount ?? 0,
        activeAgents: agentCountSnapshot ?? 0,
        productsListed: productCountSnapshot ?? 0,
      });

      setActiveJobCount(activeJobs);
      setAttentionItems(attention);

      // Sort activity by timestamp desc and limit
      activity.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRecentActivity(activity.slice(0, 6));
      setLoading(false);
    })();
  }, [activeAddress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-accent)" }}
          >
            Workspace
          </p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Your operational command center.
        </p>
      </div>

      {/* Section 1: Workspace Summary */}
      <section>
        <SectionHeader label="Workspace Summary" icon={Activity} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                Wallet Balance
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                }}
              >
                <Wallet size={14} style={{ color: "var(--color-accent)" }} />
              </div>
            </div>
            <WalletBalanceStat walletId={smartWallet?.walletId} />
          </div>
          <StatCard
            label="Active Jobs"
            value={activeJobCount}
            icon={Briefcase}
            color="var(--color-warning)"
            loading={loading}
            href="/dashboard/work-center"
          />
          <StatCard
            label="My Agents"
            value={agentCount}
            icon={Bot}
            color="var(--color-primary)"
            loading={loading}
            href="/dashboard/my-agents"
          />
          <StatCard
            label="My Products"
            value={productCount}
            icon={Package}
            color="var(--color-success)"
            loading={loading}
            href="/dashboard/my-products"
          />
        </div>
      </section>

      {/* Section 2: Quick Actions */}
      <section>
        <SectionHeader label="Quick Actions" icon={Zap} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickActionCard
            href="/create/agent"
            icon={Bot}
            title="Create Agent"
            description="Deploy an autonomous AI agent with onchain identity"
            color="var(--color-accent)"
          />
          <QuickActionCard
            href="/create/product"
            icon={Package}
            title="Create Product"
            description="List a digital product and start earning USDC"
            color="oklch(0.60 0.16 80)"
          />
          <QuickActionCard
            href="/create/job"
            icon={Briefcase}
            title="Post Job"
            description="Hire talent with onchain escrow protection"
            color="var(--color-accent)"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 3: Recent Activity */}
        <section className="lg:col-span-2">
          <SectionHeader label="Recent Activity" icon={Clock} />
          <div
            className="rounded-xl border"
            style={{
              borderColor: "var(--color-bd)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded animate-pulse"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                  />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No activity yet"
                description="Your jobs, agents, and products will appear here."
              />
            ) : (
              <ul>
                {recentActivity.map((item, idx) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className={
                      idx < recentActivity.length - 1
                        ? "border-b"
                        : ""
                    }
                    style={{ borderColor: "var(--color-bd)" }}
                  >
                    <ActivityRow item={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Section 4: Marketplace Snapshot */}
        <section>
          <SectionHeader label="Marketplace" icon={Globe} />
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--color-bd)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            <p
              className="text-[11px] mb-3"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Live ecosystem activity
            </p>
            <div className="space-y-3">
              <SnapshotRow
                icon={Briefcase}
                label="Open Jobs"
                value={marketplaceSnapshot.openJobs}
                color="var(--color-warning)"
                href="/marketplace/jobs"
              />
              <SnapshotRow
                icon={Bot}
                label="Active Agents"
                value={marketplaceSnapshot.activeAgents}
                color="var(--color-primary)"
                href="/marketplace/agents"
              />
              <SnapshotRow
                icon={Package}
                label="Products Listed"
                value={marketplaceSnapshot.productsListed}
                color="var(--color-success)"
                href="/marketplace/products"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Section 5: Attention Required */}
      <section>
        <SectionHeader label="Attention Required" icon={AlertCircle} />
        {loading ? (
          <div
            className="rounded-xl border p-4 h-20 animate-pulse"
            style={{
              borderColor: "var(--color-bd)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          />
        ) : attentionItems.length === 0 ? (
          <div
            className="rounded-xl border p-5 flex items-center gap-3"
            style={{
              borderColor: "var(--color-bd)",
              backgroundColor: "var(--color-bg-elevated)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-success) 12%, transparent)",
              }}
            >
              <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                Everything is up to date.
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                No actions required from you right now.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {attentionItems.map((item) => (
              <AttentionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ElementType;
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

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at 100% 0%, color-mix(in oklch, ${color} 12%, transparent) 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
            {title}
          </p>
          <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--color-fg-muted)" }}>
            {description}
          </p>
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--color-fg-muted)" }}
        />
      </div>
    </Link>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon =
    item.type === "job_created" ? Briefcase : item.type === "agent_deployed" ? Bot : Package;
  const color =
    item.type === "job_created"
      ? "var(--color-warning)"
      : item.type === "agent_deployed"
        ? "var(--color-primary)"
        : "var(--color-success)";
  const label =
    item.type === "job_created"
      ? "Job Created"
      : item.type === "agent_deployed"
        ? "Agent Deployed"
        : "Product Listed";

  return (
    <Link
      href={item.href ?? "#"}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg-hover)]"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
          {item.title}
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
          {label}
          {item.subtitle ? ` · ${item.subtitle}` : ""}
        </p>
      </div>
      <span className="text-[10px] shrink-0" style={{ color: "var(--color-fg-muted)" }}>
        {formatRelativeTime(item.timestamp)}
      </span>
    </Link>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-2.5 -mx-1 rounded-lg transition-colors hover:bg-[var(--color-bg-hover)]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
          {label}
        </span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-fg)" }}>
        {value}
      </span>
    </Link>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const severityColor =
    item.severity === "warning"
      ? "var(--color-warning)"
      : item.severity === "info"
        ? "var(--color-primary)"
        : "var(--color-success)";

  return (
    <div
      className="rounded-xl border p-4 flex items-center gap-4"
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${severityColor} 12%, transparent)` }}
      >
        <AlertCircle size={15} style={{ color: severityColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
          {item.title}
        </p>
        {item.subtitle && (
          <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--color-fg-muted)" }}>
            {item.subtitle}
          </p>
        )}
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
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-10 px-6">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: "var(--color-bg-hover)" }}
      >
        <Icon size={16} style={{ color: "var(--color-fg-muted)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
        {title}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
        {description}
      </p>
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
