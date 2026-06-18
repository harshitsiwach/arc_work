"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Users, CheckCircle, Briefcase, TrendingUp, AlertCircle } from "lucide-react";
import { BountyCard } from "@/components/bounties/bounty-card";
import { BountyFilters } from "@/components/bounties/bounty-filters";
import { BountySidebar } from "@/components/bounties/bounty-sidebar";
import { useMarketplaceBounties } from "@/hooks/useMarketplaceBounties";
import type { CollaborationFilter, CategoryFilter } from "@/components/bounties/bounty-filters";

export type BountyStatus = "open" | "in-review" | "completed" | "featured";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type CollaborationType = "ai-agent" | "human" | "hybrid";

export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  creator: string;
  category: string;
  difficulty: Difficulty;
  deadline: string;
  applicants: number;
  status: BountyStatus;
  collaborationType: CollaborationType;
}

export interface Contributor {
  name: string;
  completed: number;
  earned: number;
}

export interface RecentWinner {
  name: string;
  reward: number;
  bounty: string;
}

const STATUS_MAP: Record<string, BountyStatus> = {
  OPEN: "open",
  FUNDED: "open",
  SUBMITTED: "in-review",
  COMPLETED: "completed",
  REFUNDED: "completed",
  DISPUTED: "in-review",
};

const COLLAB_MAP: Record<string, CollaborationType> = {
  HUMAN: "human",
  AGENT: "ai-agent",
  BOTH: "hybrid",
};

function deriveDifficulty(reward: number): Difficulty {
  if (reward >= 10000) return "advanced";
  if (reward >= 5000) return "intermediate";
  return "beginner";
}

function getRelativeDeadline(deadline: string): string {
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const diff = dl - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m left`;
}

function truncateId(id: string): string {
  if (!id || id.length < 10) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

const CONTRIBUTORS: Contributor[] = [
  { name: "0xVega", completed: 47, earned: 185000 },
  { name: "cryptodesigner", completed: 38, earned: 142000 },
  { name: "agentforge", completed: 31, earned: 124500 },
  { name: "pixelwizard", completed: 28, earned: 98000 },
  { name: "datasage", completed: 24, earned: 87500 },
];

const RECENT_WINNERS: RecentWinner[] = [
  { name: "0xVega", reward: 15000, bounty: "AI Video Editor" },
  { name: "agentforge", reward: 12000, bounty: "Multi-Agent Framework" },
  { name: "pixelwizard", reward: 8500, bounty: "Design System Library" },
  { name: "datasage", reward: 7500, bounty: "Sentiment Dashboard" },
];

export function BountiesContent() {
  const [search, setSearch] = useState("");
  const [collaboration, setCollaboration] = useState<CollaborationFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const { bounties, isLoading, error } = useMarketplaceBounties();

  const metrics = useMemo(() => {
    const openCount = bounties.filter((r) => r.status === "open").length;
    const totalRewards = bounties.reduce((sum, r) => sum + r.reward, 0);
    const completedCount = bounties.filter((r) => r.status === "completed").length;
    return [
      { label: "Open Bounties", value: openCount.toString(), icon: Briefcase },
      { label: "Total Rewards", value: `${totalRewards.toLocaleString()}`, icon: DollarSign },
      { label: "Active Participants", value: "0", icon: Users },
      { label: "Completed Tasks", value: completedCount.toString(), icon: CheckCircle },
    ];
  }, [bounties]);

  const filtered = useMemo(() => {
    return bounties.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      }
      if (category !== "all" && b.category.toLowerCase() !== category) return false;
      if (collaboration !== "all" && b.collaborationType !== collaboration) return false;
      return true;
    });
  }, [bounties, search, collaboration, category]);

  return (
    <div className="animate-page-enter">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: "var(--color-fg)" }}
        >
          Bounties
        </h1>
        <p
          className="text-sm max-w-xl"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          Discover opportunities where humans and AI agents collaborate to create value.
        </p>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-xl border p-4 mb-6 text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, oklch(0.65 0.22 25) 10%, transparent)",
            borderColor: "color-mix(in srgb, oklch(0.65 0.22 25) 20%, transparent)",
            color: "oklch(0.65 0.22 25)",
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Metrics ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border p-4"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-bd)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: "var(--color-accent)" }} />
                <span
                  className="text-[11px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  {m.label}
                </span>
              </div>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--color-fg)" }}
              >
                {m.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Layout ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0 space-y-6">
          <BountyFilters
            search={search}
            onSearchChange={setSearch}
            collaboration={collaboration}
            onCollaborationChange={setCollaboration}
            category={category}
            onCategoryChange={setCategory}
          />

          <div className="flex items-center justify-between">
            <p
              className="text-xs"
              style={{ color: "var(--color-fg-muted)" }}
            >
              {isLoading ? "Loading..." : `${filtered.length} bounty${filtered.length !== 1 ? "ies" : ""} found`}
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5 animate-pulse"
                  style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}
                >
                  <div className="flex justify-between mb-3">
                    <div className="h-4 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                    <div className="h-4 w-12 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                  </div>
                  <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                  <div className="h-4 w-1/2 rounded mb-3" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                  <div className="h-6 w-20 rounded mb-3" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                    <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border"
              style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}
            >
              <Briefcase
                size={32}
                className="mx-auto mb-3"
                style={{ color: "var(--color-fg-muted)" }}
              />
              <p className="text-sm font-medium" style={{ color: "var(--color-fg-secondary)" }}>
                No bounties match your filters
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((bounty, i) => (
                  <motion.div
                    key={bounty.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                  >
                    <BountyCard bounty={bounty} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-px shrink-0" style={{ backgroundColor: "var(--color-bd)" }} />
        <BountySidebar contributors={CONTRIBUTORS} winners={RECENT_WINNERS} />
      </div>
    </div>
  );
}
