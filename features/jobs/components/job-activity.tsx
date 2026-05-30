"use client";

import type { JobRecord } from "../types/job";

interface JobActivityProps {
  job: JobRecord;
}

const INITIAL_STATUSES = ["draft", "live", "open"];

export function JobActivity({ job }: JobActivityProps) {
  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>Activity</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--color-accent)" }} />
          <div>
            <p className="text-xs font-mono" style={{ color: "var(--color-fg-secondary)" }}>Job created</p>
            <p className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
              {new Date(job.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        {!INITIAL_STATUSES.includes(job.status) && (
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--color-success)" }} />
            <div>
              <p className="text-xs font-mono" style={{ color: "var(--color-fg-secondary)" }}>Status changed to {job.status}</p>
              <p className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
                {new Date(job.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
