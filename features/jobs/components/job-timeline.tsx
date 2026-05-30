"use client";

import type { JobStatus } from "@/lib/contracts/types";

interface JobTimelineProps {
  currentStatus: JobStatus;
}

const TIMELINE_STEPS: { status: JobStatus; label: string }[] = [
  { status: 0, label: "Open" },
  { status: 1, label: "Funded" },
  { status: 2, label: "Submitted" },
  { status: 3, label: "Completed" },
];

export function JobTimeline({ currentStatus }: JobTimelineProps) {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Timeline</h3>
      <div className="flex items-center justify-between">
        {TIMELINE_STEPS.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--color-accent)" : "var(--color-bg-hover)",
                  color: isActive ? "white" : "var(--color-fg-muted)",
                  boxShadow: isCurrent ? "0 0 0 3px var(--color-accent-soft)" : "none",
                }}
              >
                {i + 1}
              </div>
              <span
                className="text-[10px] font-mono"
                style={{ color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)" }}
              >
                {step.label}
              </span>
              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className="absolute h-0.5 w-full"
                  style={{
                    backgroundColor: i < currentIndex ? "var(--color-accent)" : "var(--color-bg-hover)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
