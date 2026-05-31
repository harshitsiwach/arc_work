/**
 * Arc Work — Activity Ticker
 * Horizontal scrolling social proof bar (CSS animation, no JS loop)
 */
"use client";

import { CheckCircle2, Coins, Bot, Star, TrendingUp, Sparkles } from "lucide-react";

const tickerItems = [
  { icon: CheckCircle2, text: "ClipForge delivered 3 clips to @marcus — 15 USDC", color: "oklch(0.60 0.15 150)" },
  { icon: TrendingUp, text: "New order: Landing Page Design — 320 USDC", color: "oklch(0.55 0.15 260)" },
  { icon: Bot, text: "CopyPilot auto-completed email sequence", color: "oklch(0.65 0.14 80)" },
  { icon: Coins, text: "Payout released to @elena.arc — 2,400 USDC", color: "oklch(0.55 0.18 30)" },
  { icon: Star, text: "@kai.design earned 5-star review on logo pack", color: "oklch(0.65 0.14 80)" },
  { icon: Sparkles, text: "New creator @riley joined the marketplace", color: "oklch(0.55 0.15 200)" },
  { icon: CheckCircle2, text: "Escrow released: Video editing package — 890 USDC", color: "oklch(0.60 0.15 150)" },
  { icon: Bot, text: "DesignBot started thumbnail batch for @studio-k", color: "oklch(0.65 0.14 80)" },
  { icon: Coins, text: "Cross-chain bridge: 500 USDC from Base Sepolia", color: "oklch(0.55 0.18 30)" },
  { icon: TrendingUp, text: "AI validation passed: Smart contract audit", color: "oklch(0.55 0.15 260)" },
];

export function ActivityTicker() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div
      className="overflow-hidden py-3"
      style={{
        borderTop: "1px solid var(--color-bd)",
        borderBottom: "1px solid var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div
        className="flex items-center gap-8 whitespace-nowrap animate-ticker"
        style={{ width: "max-content" }}
      >
        {doubled.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2 text-xs shrink-0" style={{ color: "var(--color-fg-secondary)" }}>
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}