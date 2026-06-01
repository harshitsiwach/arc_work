"use client";

import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  loading?: boolean;
  href?: string;
  trend?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "var(--color-accent)",
  loading = false,
  href,
  trend,
}: StatCardProps) {
  const inner = (
    <div
      className="rounded-xl border p-4 transition-all duration-200"
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        ) : (
          <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
            {value}
          </p>
        )}
        {trend && !loading && (
          <span className="text-[10px] font-medium" style={{ color: "var(--color-fg-muted)" }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </a>
    );
  }
  return inner;
}
