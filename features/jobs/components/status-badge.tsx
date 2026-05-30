"use client";

import { JOB_STATUS_MAP, JOB_STATUS_COLORS } from "@/lib/contracts/constants";
import type { JobStatus } from "@/lib/contracts/types";

interface StatusBadgeProps {
  status: JobStatus;
  size?: "sm" | "md";
}

const STATUS_BG: Record<JobStatus, string> = {
  0: "oklch(0.65 0.15 250 / 0.12)",
  1: "oklch(0.70 0.15 85 / 0.12)",
  2: "oklch(0.60 0.18 265 / 0.12)",
  3: "oklch(0.65 0.18 155 / 0.12)",
  4: "oklch(0.60 0.20 25 / 0.12)",
  5: "oklch(0.55 0.01 260 / 0.12)",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const label = JOB_STATUS_MAP[status] ?? "Unknown";
  const color = JOB_STATUS_COLORS[status] ?? "var(--color-fg-muted)";
  const bg = STATUS_BG[status] ?? "var(--color-bg-hover)";

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[10px]"
    : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold uppercase tracking-wider ${sizeClasses}`}
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
