"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Users, CheckCircle, Briefcase, TrendingUp } from "lucide-react";
import { BountyCard } from "@/components/bounties/bounty-card";
import { BountyFilters } from "@/components/bounties/bounty-filters";
import { BountySidebar } from "@/components/bounties/bounty-sidebar";
import type { CollaborationFilter, CategoryFilter } from "@/components/bounties/bounty-filters";

/* ── Types ────────────────────────────────────────────────── */

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

/* ── Mock Data ────────────────────────────────────────────── */

const BOUNTIES: Bounty[] = [
  {
    id: "b-001",
    title: "Build AI-Powered Video Editor Plugin",
    description: "Design and develop a plugin that uses AI to automate video trimming, scene detection, and caption generation for the OpenReel editor.",
    reward: 15000,
    creator: "alchemist",
    category: "Development",
    difficulty: "advanced",
    deadline: "14 days left",
    applicants: 12,
    status: "featured",
    collaborationType: "hybrid",
  },
  {
    id: "b-002",
    title: "Multi-Agent Coordination Framework",
    description: "Create a framework that enables multiple AI agents to collaborate on complex tasks with human oversight and intervention.",
    reward: 12000,
    creator: "agentic",
    category: "Development",
    difficulty: "advanced",
    deadline: "21 days left",
    applicants: 8,
    status: "open",
    collaborationType: "ai-agent",
  },
  {
    id: "b-003",
    title: "Design System Component Library",
    description: "Build a comprehensive set of reusable UI components following the existing design tokens and dark-first philosophy.",
    reward: 8500,
    creator: "designlab",
    category: "Design",
    difficulty: "intermediate",
    deadline: "10 days left",
    applicants: 15,
    status: "open",
    collaborationType: "human",
  },
  {
    id: "b-004",
    title: "Real-Time Sentiment Analysis Dashboard",
    description: "Build a dashboard that analyzes social media sentiment in real-time using AI models with customizable alert thresholds.",
    reward: 7500,
    creator: "dataforge",
    category: "Research",
    difficulty: "intermediate",
    deadline: "7 days left",
    applicants: 6,
    status: "in-review",
    collaborationType: "hybrid",
  },
  {
    id: "b-005",
    title: "Autonomous Trading Bot Strategy",
    description: "Research and implement a trading strategy bot that executes DeFi arbitrage opportunities across multiple DEXes.",
    reward: 10000,
    creator: "cryptonaut",
    category: "Development",
    difficulty: "advanced",
    deadline: "30 days left",
    applicants: 9,
    status: "open",
    collaborationType: "ai-agent",
  },
  {
    id: "b-006",
    title: "Content Generation Workflow Engine",
    description: "Design a workflow engine that chains AI content generation tasks with human review checkpoints.",
    reward: 6000,
    creator: "contentops",
    category: "Content",
    difficulty: "intermediate",
    deadline: "5 days left",
    applicants: 18,
    status: "open",
    collaborationType: "hybrid",
  },
  {
    id: "b-007",
    title: "Decentralized Identity Verification",
    description: "Implement a privacy-preserving identity verification system using zero-knowledge proofs and on-chain attestations.",
    reward: 14000,
    creator: "zkpioneer",
    category: "Development",
    difficulty: "advanced",
    deadline: "28 days left",
    applicants: 5,
    status: "featured",
    collaborationType: "hybrid",
  },
  {
    id: "b-008",
    title: "Social Media Growth Automation",
    description: "Create an AI agent that automates content scheduling, posting, and engagement across Twitter, LinkedIn, and Farcaster.",
    reward: 4500,
    creator: "growthhack",
    category: "Marketing",
    difficulty: "beginner",
    deadline: "6 days left",
    applicants: 22,
    status: "open",
    collaborationType: "ai-agent",
  },
  {
    id: "b-009",
    title: "Video Thumbnail A/B Testing UI",
    description: "Design and implement an A/B testing interface for video thumbnails with analytics and performance metrics.",
    reward: 5500,
    creator: "designlab",
    category: "Design",
    difficulty: "beginner",
    deadline: "8 days left",
    applicants: 14,
    status: "open",
    collaborationType: "human",
  },
  {
    id: "b-010",
    title: "AI Model Fine-Tuning Pipeline",
    description: "Build a pipeline for fine-tuning open-source LLMs on domain-specific data with automated evaluation benchmarks.",
    reward: 11000,
    creator: "mlworks",
    category: "Research",
    difficulty: "advanced",
    deadline: "18 days left",
    applicants: 7,
    status: "open",
    collaborationType: "ai-agent",
  },
  {
    id: "b-011",
    title: "Product Hunt Launch Kit",
    description: "Create a reusable launch kit template with social proof widgets, email capture, and analytics for Product Hunt launches.",
    reward: 3500,
    creator: "makerdao",
    category: "Marketing",
    difficulty: "beginner",
    deadline: "3 days left",
    applicants: 25,
    status: "completed",
    collaborationType: "human",
  },
  {
    id: "b-012",
    title: "Onchain Reputation Scoring System",
    description: "Design a scoring algorithm that evaluates contributor reputation based on completed bounties, reviews, and social verification.",
    reward: 9500,
    creator: "trustlab",
    category: "Research",
    difficulty: "intermediate",
    deadline: "12 days left",
    applicants: 11,
    status: "open",
    collaborationType: "hybrid",
  },
  {
    id: "b-013",
    title: "Interactive 3D Product Viewer",
    description: "Build a WebGL-based 3D viewer for digital products with rotation, zoom, and material swapping capabilities.",
    reward: 7000,
    creator: "pixelcraft",
    category: "Design",
    difficulty: "intermediate",
    deadline: "9 days left",
    applicants: 13,
    status: "open",
    collaborationType: "human",
  },
  {
    id: "b-014",
    title: "Cross-Chain Bridge Monitoring Agent",
    description: "Develop an AI monitoring agent that tracks bridge transactions, detects anomalies, and alerts on suspicious activity.",
    reward: 13000,
    creator: "bridgewatch",
    category: "Development",
    difficulty: "advanced",
    deadline: "16 days left",
    applicants: 4,
    status: "in-review",
    collaborationType: "ai-agent",
  },
  {
    id: "b-015",
    title: "Community Newsletter Generator",
    description: "Build an AI-powered newsletter generator that curates community content, summarizes discussions, and generates digest emails.",
    reward: 4000,
    creator: "contentops",
    category: "Content",
    difficulty: "beginner",
    deadline: "4 days left",
    applicants: 20,
    status: "completed",
    collaborationType: "hybrid",
  },
];

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

const METRICS = [
  { label: "Open Bounties", value: "156", icon: Briefcase },
  { label: "Total Rewards", value: "$845K", icon: DollarSign },
  { label: "Active Participants", value: "2,847", icon: Users },
  { label: "Completed Tasks", value: "12.4K", icon: CheckCircle },
];

/* ── Component ────────────────────────────────────────────── */

export function BountiesContent() {
  const [search, setSearch] = useState("");
  const [collaboration, setCollaboration] = useState<CollaborationFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    return BOUNTIES.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      }
      if (category !== "all" && b.category.toLowerCase() !== category) return false;
      if (collaboration !== "all" && b.collaborationType !== collaboration) return false;
      return true;
    });
  }, [search, collaboration, category]);

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

      {/* ── Metrics ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {METRICS.map((m) => {
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
              {filtered.length} bounty{filtered.length !== 1 ? "ies" : "y"} found
            </p>
          </div>

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

          {filtered.length === 0 && (
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
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-px shrink-0" style={{ backgroundColor: "var(--color-bd)" }} />
        <BountySidebar contributors={CONTRIBUTORS} winners={RECENT_WINNERS} />
      </div>
    </div>
  );
}
