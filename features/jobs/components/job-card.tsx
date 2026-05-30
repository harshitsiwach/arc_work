"use client";

import { memo } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { JobStatus } from "@/lib/contracts/types";
import type { JobRecord } from "../types/job";

interface JobCardProps {
  job: JobRecord;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function JobCardComponent({ job }: JobCardProps) {
  const statusMap: Record<string, JobStatus> = {
    open: 0, funded: 1, submitted: 2, completed: 3, rejected: 4, expired: 5,
  };
  const onchainStatus = statusMap[job.status] ?? 0;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div
        className="rounded-xl border p-4 transition-all duration-200 hover:shadow-md"
        style={{
          borderColor: "var(--color-bd)",
          backgroundColor: "var(--color-bg-elevated)",
        }}
      >
        {/* Header: Status + Category */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={onchainStatus} />
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg-muted)" }}
          >
            {job.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: "var(--color-fg)" }}>
          {job.title}
        </h3>

        {/* Description */}
        <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--color-fg-secondary)" }}>
          {job.description}
        </p>

        {/* Skills */}
        {job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {job.skills_required.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg-muted)" }}
              >
                {skill}
              </span>
            ))}
            {job.skills_required.length > 3 && (
              <span className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
                +{job.skills_required.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Price + Time + Onchain ID */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--color-bd)" }}>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold" style={{ color: "var(--color-fg)" }}>
              {job.price_amount}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>
              USDC
            </span>
          </div>
          <div className="flex items-center gap-2">
            {job.onchain_job_id !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-success-soft)", color: "var(--color-success)" }}>
                #{job.onchain_job_id}
              </span>
            )}
            <span className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
              {timeAgo(job.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const JobCard = memo(JobCardComponent);
