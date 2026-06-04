/**
 * Arc Work — Activity Ticker
 * Horizontal scrolling social proof bar (CSS animation, no JS loop)
 */
"use client";

import { CheckCircle2, Bot, Star, TrendingUp, Sparkles, Coins } from "lucide-react";
import { UsdcIcon } from "@/components/icons";

type IconRender = () => React.ReactNode;

const tickerItems: { icon: IconRender; text: string; color: string }[] = [
  { icon: () => <CheckCircle2 className="w-3.5 h-3.5" />, text: "ClipForge delivered 3 clips to @marcus — 15 USDC", color: "oklch(0.75 0.18 125)" },
  { icon: () => <TrendingUp className="w-3.5 h-3.5" />, text: "New order: Landing Page Design — 320 USDC", color: "oklch(0.75 0.18 125)" },
  { icon: () => <Bot className="w-3.5 h-3.5" />, text: "CopyPilot auto-completed email sequence", color: "oklch(0.65 0.14 80)" },
  { icon: () => <UsdcIcon size={14} variant="branded" />, text: "Payout released to @elena.arc — 2,400 USDC", color: "oklch(0.75 0.18 125)" },
  { icon: () => <Star className="w-3.5 h-3.5" />, text: "@kai.design earned 5-star review on logo pack", color: "oklch(0.65 0.14 80)" },
  { icon: () => <Sparkles className="w-3.5 h-3.5" />, text: "New creator @riley joined the marketplace", color: "oklch(0.75 0.18 125)" },
  { icon: () => <CheckCircle2 className="w-3.5 h-3.5" />, text: "Escrow released: Video editing package — 890 USDC", color: "oklch(0.75 0.18 125)" },
  { icon: () => <Bot className="w-3.5 h-3.5" />, text: "DesignBot started thumbnail batch for @studio-k", color: "oklch(0.65 0.14 80)" },
  { icon: () => <UsdcIcon size={14} variant="branded" />, text: "Cross-chain bridge: 500 USDC from Base Sepolia", color: "oklch(0.75 0.18 125)" },
  { icon: () => <TrendingUp className="w-3.5 h-3.5" />, text: "AI validation passed: Smart contract audit", color: "oklch(0.75 0.18 125)" },
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
          return (
            <div key={i} className="flex items-center gap-2 text-xs shrink-0" style={{ color: "var(--color-fg-secondary)" }}>
              <span className="shrink-0 flex items-center" style={{ color: item.color }}>{item.icon()}</span>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
