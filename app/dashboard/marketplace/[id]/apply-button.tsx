/**
 * Arc Work - Gig Apply Button
 * Client component for toast interaction on apply
 */
"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function GigApplyButton() {
  return (
    <Button
      className="flex-1"
      style={{ backgroundColor: "var(--color-accent)" }}
      onClick={() => {
        toast.success("Application submitted!", {
          description: "The client will review your profile and get back to you.",
        });
      }}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      Apply for this Gig
    </Button>
  );
}
