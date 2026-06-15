"use client";

import { Trophy, Award, Medal, TrendingUp, DollarSign, Users, CheckCircle } from "lucide-react";
import type { Contributor, RecentWinner } from "@/components/listings/bounties-content";

function TopBounties() {
  const items = [
    { title: "Build AI-Powered Video Editor Plugin", reward: 15000, applicants: 12 },
    { title: "Multi-Agent Coordination Framework", reward: 12000, applicants: 8 },
    { title: "Real-Time Sentiment Analysis Dashboard", reward: 8500, applicants: 15 },
    { title: "Autonomous Trading Bot Strategy", reward: 7500, applicants: 6 },
    { title: "Decentralized Identity Verification", reward: 6000, applicants: 10 },
  ];
  return (
    <div>
      <h4
        className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5"
        style={{ color: "var(--color-fg-muted)" }}
      >
        <TrendingUp size={12} />
        Top Bounties
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: "var(--color-bg)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg)"}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="text-[10px] font-bold tabular-nums w-4 text-center shrink-0"
                style={{ color: i < 3 ? "var(--color-accent)" : "var(--color-fg-muted)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p
                  className="text-[12px] font-medium truncate"
                  style={{ color: "var(--color-fg)" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  {item.applicants} applicants
                </p>
              </div>
            </div>
            <span
              className="text-[12px] font-bold tabular-nums shrink-0 ml-2"
              style={{ color: "var(--color-accent)" }}
            >
              {item.reward.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopContributors({ contributors }: { contributors: Contributor[] }) {
  return (
    <div>
      <h4
        className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5"
        style={{ color: "var(--color-fg-muted)" }}
      >
        <Award size={12} />
        Top Contributors
      </h4>
      <div className="space-y-2">
        {contributors.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "var(--color-fg)" }}
              >
                {c.name}
              </p>
              <p
                className="text-[10px]"
                style={{ color: "var(--color-fg-muted)" }}
              >
                {c.completed} completed · {c.earned.toLocaleString()} earned
              </p>
            </div>
            {i < 3 && (
              <Medal size={12} style={{ color: "var(--color-accent)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentWinners({ winners }: { winners: RecentWinner[] }) {
  return (
    <div>
      <h4
        className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5"
        style={{ color: "var(--color-fg-muted)" }}
      >
        <Trophy size={12} />
        Recent Winners
      </h4>
      <div className="space-y-2">
        {winners.map((w) => (
          <div
            key={w.name + w.bounty}
            className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: "oklch(0.65 0.20 25 / 0.15)", color: "oklch(0.65 0.20 25)" }}
            >
              {w.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "var(--color-fg)" }}
              >
                {w.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--color-fg-muted)" }}
              >
                Won <span style={{ color: "var(--color-accent)" }}>{w.reward.toLocaleString()}</span> — {w.bounty}
              </p>
            </div>
            <CheckCircle size={12} style={{ color: "var(--color-accent)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BountySidebar({
  contributors,
  winners,
}: {
  contributors: Contributor[];
  winners: RecentWinner[];
}) {
  return (
    <aside
      className="w-full lg:w-80 shrink-0 space-y-5"
    >
      <TopBounties />
      <div
        className="h-px"
        style={{ backgroundColor: "var(--color-bd)" }}
      />
      <TopContributors contributors={contributors} />
      <div
        className="h-px"
        style={{ backgroundColor: "var(--color-bd)" }}
      />
      <RecentWinners winners={winners} />
    </aside>
  );
}
