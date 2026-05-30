"use client";

import { useState } from "react";
import { JobCard } from "./job-card";
import { JobSearch } from "./job-search";
import { JobFilters } from "./job-filters";
import { EmptyState } from "./empty-state";
import { useJobListing } from "../hooks/use-job-listing";
import type { JobStatus } from "@/lib/contracts/types";

interface JobGridProps {
  onCreateJob?: () => void;
}

const PAGE_SIZE = 12;

export function JobGrid({ onCreateJob }: JobGridProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);
  const [page, setPage] = useState(1);

  const { jobs, total, loading, error } = useJobListing({
    category,
    status: statusFilter,
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleStatusChange = (status: JobStatus | null) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <JobSearch value={search} onChange={handleSearchChange} />
      <JobFilters
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        selectedStatus={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>
          {loading ? "Loading..." : `${total} job${total !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--color-error)", backgroundColor: "var(--color-error-soft)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 animate-pulse" style={{ borderColor: "var(--color-bd)" }}>
              <div className="h-5 w-20 rounded mb-3" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-3 w-full rounded mb-1" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-3 w-2/3 rounded mb-3" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="flex gap-1 mb-3">
                <div className="h-5 w-12 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                <div className="h-5 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              </div>
              <div className="flex justify-between pt-3 border-t" style={{ borderColor: "var(--color-bd)" }}>
                <div className="h-6 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                <div className="h-4 w-12 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && !error && (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or search query"
          action={
            onCreateJob ? (
              <button
                onClick={onCreateJob}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                Create a Job
              </button>
            ) : undefined
          }
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-secondary)" }}
          >
            Previous
          </button>
          <span className="text-xs font-mono px-3" style={{ color: "var(--color-fg-muted)" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-secondary)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
