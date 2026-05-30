"use client";

import { JOB_STATUS_MAP } from "@/lib/contracts/constants";
import type { JobStatus } from "@/lib/contracts/types";

const CATEGORIES = [
  "All",
  "Development",
  "Design",
  "Writing",
  "Marketing",
  "AI/ML",
  "Blockchain",
  "Video & Animation",
  "Music & Audio",
  "Consulting",
  "Other",
];

interface JobFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: JobStatus | null;
  onStatusChange: (status: JobStatus | null) => void;
}

export function JobFilters({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
}: JobFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className="rounded-full border px-3 py-1.5 text-xs font-mono transition-all"
            style={{
              backgroundColor: selectedCategory === cat ? "var(--color-accent)" : "transparent",
              borderColor: selectedCategory === cat ? "var(--color-accent)" : "var(--color-bd)",
              color: selectedCategory === cat ? "white" : "var(--color-fg-secondary)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange(null)}
          className="rounded-full border px-3 py-1.5 text-xs font-mono transition-all"
          style={{
            backgroundColor: selectedStatus === null ? "var(--color-accent)" : "transparent",
            borderColor: selectedStatus === null ? "var(--color-accent)" : "var(--color-bd)",
            color: selectedStatus === null ? "white" : "var(--color-fg-secondary)",
          }}
        >
          All Status
        </button>
        {(Object.entries(JOB_STATUS_MAP) as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onStatusChange(Number(key) as JobStatus)}
            className="rounded-full border px-3 py-1.5 text-xs font-mono transition-all"
            style={{
              backgroundColor: selectedStatus === Number(key) ? "var(--color-accent)" : "transparent",
              borderColor: selectedStatus === Number(key) ? "var(--color-accent)" : "var(--color-bd)",
              color: selectedStatus === Number(key) ? "white" : "var(--color-fg-secondary)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
