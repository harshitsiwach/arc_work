/**
 * Arc Work — Hero Visual System (Enhanced)
 * Layered marketplace ecosystem display (CSS animations, no framer-motion)
 */
"use client";

import { useState, useEffect } from "react";
import {
  Bot, CheckCircle2, Clock, Star, Coins, ArrowUpRight,
  Zap, Play, Shield, TrendingUp, Sparkles, User, Package,
  ArrowRight, CreditCard,
} from "lucide-react";

/* ── Mock data ─────────────────────────────────────────────── */

const creatorAvatars = [
  { name: "Elena", initial: "E", color: "oklch(0.55 0.15 260)" },
  { name: "Marcus", initial: "M", color: "oklch(0.60 0.15 150)" },
  { name: "Kai", initial: "K", color: "oklch(0.65 0.14 80)" },
  { name: "Riley", initial: "R", color: "oklch(0.55 0.18 30)" },
  { name: "Sam", initial: "S", color: "oklch(0.55 0.15 200)" },
];

const liveActivities = [
  { type: "delivery", text: "Logo Design delivered", from: "2m ago", amount: "8 USDC", icon: CheckCircle2 },
  { type: "bid", text: "New bid submitted", from: "7m ago", amount: "12 USDC", icon: TrendingUp },
  { type: "delivery", text: "Smart Contract Review completed", from: "18m ago", amount: "45 USDC", icon: Shield },
  { type: "delivery", text: "AI Research Summary delivered", from: "42m ago", amount: "15 USDC", icon: Bot },
  { type: "signup", text: "New creator joined", from: "1h ago", amount: "Welcome", icon: Sparkles },
];

const workflowSteps = [
  { label: "Job Posted", icon: Play },
  { label: "Escrow Funded", icon: Shield },
  { label: "Work Submitted", icon: Clock },
  { label: "AI Verification", icon: Bot },
  { label: "Released", icon: Coins },
];

const floatingNotifications = [
  { text: "5-star review", sub: "from @riley", icon: Star, color: "oklch(0.65 0.14 80)" },
  { text: "AI verified", sub: "Brand Kit delivery", icon: CheckCircle2, color: "oklch(0.55 0.15 260)" },
  { text: "New bid", sub: "Logo Design", icon: TrendingUp, color: "oklch(0.55 0.18 30)" },
];

/* ── Component ─────────────────────────────────────────────── */

export function HeroVisual() {
  const [activityIndex, setActivityIndex] = useState(0);
  const [workflowIndex, setWorkflowIndex] = useState(3);
  const [notifIndex, setNotifIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % liveActivities.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflowIndex((prev) => (prev + 1) % workflowSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % floatingNotifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentActivity = liveActivities[activityIndex];
  const ActivityIcon = currentActivity.icon;
  const currentNotif = floatingNotifications[notifIndex];
  const NotifIcon = currentNotif.icon;

  return (
    <div className="relative w-full max-w-[520px]">
      {/* Background glow */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.55 0.15 260 / 0.06), transparent 70%)",
        }}
      />

      {/* Stacked card layers */}
      <div
        className="absolute -top-3 -right-3 left-3 bottom-3 rounded-xl pointer-events-none"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-bd)",
          opacity: 0.4,
        }}
      />
      <div
        className="absolute -top-1.5 -right-1.5 left-1.5 bottom-1.5 rounded-xl pointer-events-none"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-bd)",
          opacity: 0.7,
        }}
      />

      {/* Main activity panel (front layer) */}
      <div
        className="relative rounded-xl overflow-hidden hover-lift"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
          boxShadow: "0 4px 24px oklch(0 0 0 / 0.2), 0 1px 4px oklch(0 0 0 / 0.1)",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--color-bd)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
              Live Activity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Live</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
        </div>

        {/* Activity feed */}
        <div className="px-5 py-4 space-y-3">
          {/* Active activity */}
          <div
            key={activityIndex}
            className="flex items-center gap-3 animate-fade-in"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <ActivityIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
                {currentActivity.text}
              </p>
              <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
                {currentActivity.from}
              </p>
            </div>
            <span className="text-sm font-mono font-medium shrink-0" style={{ color: "var(--color-accent)" }}>
              {currentActivity.amount}
            </span>
          </div>

          {/* Recent activities */}
          <div className="space-y-2 pt-2" style={{ borderTop: "1px solid var(--color-bd)" }}>
            {liveActivities
              .filter((_, i) => i !== activityIndex)
              .slice(0, 3)
              .map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-fg-muted)" }} />
                    <span className="text-xs truncate flex-1" style={{ color: "var(--color-fg-secondary)" }}>
                      {item.text}
                    </span>
                    <span className="text-xs font-mono shrink-0" style={{ color: "var(--color-fg-muted)" }}>
                      {item.amount}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Panel footer */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{
            borderTop: "1px solid var(--color-bd)",
            backgroundColor: "var(--color-bg-inset)",
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-fg-muted)" }}>
            <span className="font-mono tabular-nums">1,284 USDC</span>
            <span>volume today</span>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors duration-150"
            style={{ color: "var(--color-accent)" }}
          >
            <span>View all</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Floating notification badge */}
      <div
        key={notifIndex}
        className="absolute -left-4 top-1/3 z-10 animate-fade-in"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
          boxShadow: "0 8px 24px oklch(0 0 0 / 0.25)",
        }}
      >
        <div className="p-3 rounded-xl flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${currentNotif.color} 12%, transparent)` }}
          >
            <NotifIcon className="w-4 h-4" style={{ color: currentNotif.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>{currentNotif.text}</p>
            <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{currentNotif.sub}</p>
          </div>
        </div>
      </div>

      {/* Workflow progress card */}
      <div
        className="relative mt-3 rounded-xl p-4 hover-lift"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>
            Brand Identity Package
          </span>
          <span
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "oklch(0.65 0.14 80 / 0.12)",
              color: "oklch(0.65 0.14 80)",
            }}
          >
            <Clock className="w-2.5 h-2.5" />
            AI Verification
          </span>
        </div>

        {/* Workflow steps */}
        <div className="flex items-center gap-1">
          {workflowSteps.map((step, i) => {
            const done = i <= workflowIndex;
            const active = i === workflowIndex;
            return (
              <div key={step.label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1 w-full">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: done ? "var(--color-accent)" : "var(--color-bg-inset)",
                      transform: active ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {done ? (
                      <CheckCircle2 className="w-3 h-3" style={{ color: active ? "var(--color-accent)" : "white" }} />
                    ) : (
                      <step.icon className="w-3 h-3" style={{ color: "var(--color-fg-muted)" }} />
                    )}
                  </div>
                  <span
                    className="text-[9px] text-center leading-tight hidden sm:block"
                    style={{ color: done ? "var(--color-fg)" : "var(--color-fg-muted)" }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div
                    className="h-px flex-1 mb-4 sm:mb-3 transition-colors duration-300"
                    style={{
                      backgroundColor: i < workflowIndex ? "var(--color-accent)" : "var(--color-bd)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Creator avatars bar */}
      <div
        className="relative mt-3 rounded-xl p-4 flex items-center justify-between hover-lift"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {creatorAvatars.map((c) => (
              <div
                key={c.name}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-transform duration-150 hover:scale-110 hover:z-10"
                style={{
                  backgroundColor: c.color,
                  color: "white",
                  borderColor: "var(--color-bg-elevated)",
                }}
              >
                {c.initial}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>creators and humans</p>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}> already building</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-medium" style={{ color: "var(--color-accent)" }}>
            active jobs
          </p>
          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>avg. response 4m</p>
        </div>
      </div>

      {/* Floating AI agent badge (bottom-right) */}
      <div className="absolute -right-3 -bottom-3 z-10 animate-float">
        <div
          className="p-2.5 rounded-xl flex items-center gap-2"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-bd)",
            boxShadow: "0 8px 24px oklch(0 0 0 / 0.25)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.60 0.15 150 / 0.12)" }}
          >
            <Bot className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0.15 150)" }} />
          </div>
          <div>
            <p className="text-[11px] font-medium" style={{ color: "var(--color-fg)" }}>Research AI</p>
            <p className="text-[10px]" style={{ color: "oklch(0.60 0.15 150)" }}>Working · 1 task</p>
          </div>
        </div>
      </div>
    </div>
  );
}