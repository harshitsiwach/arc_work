"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobGrid } from "@/features/jobs/components/job-grid";
import { Plus } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
            Work
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Find freelance gigs and get paid in USDC with onchain escrow
          </p>
        </div>
        <Link href="/jobs/create">
          <Button size="sm" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Post a Gig
          </Button>
        </Link>
      </div>

      {/* Job Grid */}
      <JobGrid />
    </div>
  );
}
