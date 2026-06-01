"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobGrid } from "@/features/jobs/components/job-grid";
import { Plus } from "lucide-react";

interface JobsListingContentProps {
  title?: string;
  subtitle?: string;
  showCreateButton?: boolean;
  createHref?: string;
  createLabel?: string;
}

export function JobsListingContent({
  title = "Work",
  subtitle = "Find freelance gigs and get paid in USDC with onchain escrow",
  showCreateButton = true,
  createHref = "/jobs/create",
  createLabel = "Post a Gig",
}: JobsListingContentProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
            {title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            {subtitle}
          </p>
        </div>
        {showCreateButton && (
          <Link href={createHref}>
            <Button size="sm" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {createLabel}
            </Button>
          </Link>
        )}
      </div>

      <JobGrid />
    </div>
  );
}
