"use client";

import { StatusBadge } from "./status-badge";
import type { JobStatus } from "@/lib/contracts/types";
import type { JobRecord } from "../types/job";

interface JobHeaderProps {
  job: JobRecord;
  onchainStatus?: JobStatus;
}

export function JobHeader({ job, onchainStatus }: JobHeaderProps) {
  const status = onchainStatus ?? 0;

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} size="md" />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg-muted)" }}>
            {job.category}
          </span>
          {job.agent_only && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "oklch(0.55 0.15 300 / 0.12)", color: "oklch(0.60 0.15 300)" }}>
              Agent Only
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
          #{job.id}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-fg)" }}>
        {job.title}
      </h1>

      <p className="text-sm leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
        {job.description}
      </p>

      {/* Skills */}
      {job.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills_required.map((skill) => (
            <span
              key={skill}
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg-secondary)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
