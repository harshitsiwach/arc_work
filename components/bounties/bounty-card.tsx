"use client";

import { Users, Clock, Zap, Shield, User, Bot, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bounty } from "@/components/listings/bounties-content";

function CollaborationBadge({ type }: { type: Bounty["collaborationType"] }) {
  const map = {
    "ai-agent": { label: "AI Agent", icon: Bot, className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    human: { label: "Human", icon: User, className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    hybrid: { label: "Hybrid Team", icon: GitMerge, className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  } as const;
  const c = map[type];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.className}`}>
      <Icon size={10} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Bounty["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    "in-review": { label: "In Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    completed: { label: "Completed", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    featured: { label: "Featured", className: "bg-[#CBF825]/10 text-[#CBF825] border-[#CBF825]/20" },
  };
  const c = map[status] ?? map.open;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.className}`}>
      {c.label}
    </span>
  );
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "oklch(0.65 0.18 155)",
  intermediate: "oklch(0.70 0.15 85)",
  advanced: "oklch(0.65 0.20 25)",
};

export function BountyCard({ bounty }: { bounty: Bounty }) {
  return (
    <div
      className="group rounded-xl border p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-bd)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={bounty.status} />
          <CollaborationBadge type={bounty.collaborationType} />
        </div>
        <span
          className="text-lg font-bold tabular-nums shrink-0"
          style={{ color: "var(--color-accent)" }}
        >
          {bounty.reward} USDC
        </span>
      </div>

      <h3
        className="font-semibold text-sm leading-snug mb-1.5 group-hover:brightness-110 transition-all"
        style={{ color: "var(--color-fg)" }}
      >
        {bounty.title}
      </h3>

      <p
        className="text-xs leading-relaxed mb-4 line-clamp-2"
        style={{ color: "var(--color-fg-muted)" }}
      >
        {bounty.description}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
          >
            {bounty.creator.charAt(0).toUpperCase()}
          </div>
          {bounty.creator}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2 mb-3">
        <Badge
          variant="outline"
          className="text-[10px] font-medium px-2 py-0.5"
          style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-secondary)" }}
        >
          {bounty.category}
        </Badge>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: `${DIFFICULTY_COLORS[bounty.difficulty]}20`,
            color: DIFFICULTY_COLORS[bounty.difficulty],
          }}
        >
          <Zap size={10} />
          {bounty.difficulty}
        </span>
      </div>

      <div
        className="flex items-center justify-between pt-3 border-t text-[11px]"
        style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-muted)" }}
      >
        <span className="inline-flex items-center gap-1">
          <Clock size={11} />
          {bounty.deadline}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users size={11} />
          {bounty.applicants} applicant{bounty.applicants !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
