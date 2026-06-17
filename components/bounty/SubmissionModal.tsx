"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSubmitWork } from "@/hooks/useBounty";

interface SubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bountyId: string;
  onSuccess?: () => void;
}

export function SubmissionModal({ open, onOpenChange, bountyId, onSuccess }: SubmissionModalProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const { submitWork, isLoading, error } = useSubmitWork();

  const handleClose = (value: boolean) => {
    if (!isLoading) {
      onOpenChange(value);
      if (!value) {
        setProofUrl("");
        setNotes("");
      }
    }
  };

  const handleSubmit = async () => {
    if (!proofUrl.trim()) {
      toast.error("Please provide a proof URL or hash.");
      return;
    }
    try {
      await submitWork(bountyId, proofUrl.trim(), notes.trim() || undefined);
      toast.success("Work submitted!");
      handleClose(false);
      onSuccess?.();
    } catch {
      // error state in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[480px]"
        style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--color-fg)" }}>Submit Work</DialogTitle>
          <DialogDescription style={{ color: "var(--color-fg-muted)" }}>
            Provide a link to your work proof.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5" style={{ color: "var(--color-fg)" }}>
              <LinkIcon size={13} /> Proof URL
            </Label>
            <Input
              placeholder="https://... or IPFS CID"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
            />
            <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
              Link to your deliverable (Google Drive, GitHub, IPFS, etc.)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "var(--color-fg)" }}>Notes (optional)</Label>
            <textarea
              placeholder="Describe what you delivered..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg p-3 text-xs"
              style={{ backgroundColor: "color-mix(in srgb, oklch(0.65 0.22 25) 10%, transparent)", color: "oklch(0.65 0.22 25)" }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={isLoading || !proofUrl.trim()}
            onClick={handleSubmit}
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            {isLoading ? (
              <><Loader2 size={14} className="animate-spin mr-1.5" /> Submitting...</>
            ) : (
              <><Upload size={14} className="mr-1.5" /> Submit Work</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
