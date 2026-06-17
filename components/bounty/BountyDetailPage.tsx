"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, Users, Bot, Layers, DollarSign, AlertCircle,
  CheckCircle2, Loader2, ExternalLink, MessageSquare, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useBountyById, useApproveSubmission, useRefundCreator } from "@/hooks/useBounty";
import { SubmissionModal } from "./SubmissionModal";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { BountySubmissionRow } from "@/hooks/useBounty";

interface BountyDetailPageProps {
  bountyId: string;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "oklch(0.72 0.19 150)",
  FUNDED: "oklch(0.72 0.19 150)",
  SUBMITTED: "oklch(0.75 0.15 85)",
  COMPLETED: "oklch(0.65 0.18 250)",
  REFUNDED: "oklch(0.55 0.01 260)",
  DISPUTED: "oklch(0.65 0.22 25)",
};

const WORKER_LABELS: Record<string, { label: string; icon: typeof Users }> = {
  HUMAN: { label: "Human Only", icon: Users },
  AGENT: { label: "Agent Only", icon: Bot },
  BOTH: { label: "Anyone", icon: Layers },
};

function getScoreColor(score: number): string {
  if (score >= 0.7) return "oklch(0.72 0.19 150)";
  if (score >= 0.4) return "oklch(0.75 0.15 85)";
  return "oklch(0.65 0.22 25)";
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function BountyDetailPage({ bountyId }: BountyDetailPageProps) {
  const { bounty, submissions, isLoading, error, refresh } = useBountyById(bountyId);
  const { approve, isLoading: approving } = useApproveSubmission();
  const { refund, isLoading: refunding } = useRefundCreator();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    }
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        <div className="h-8 w-32 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
        <div className="h-48 rounded-xl" style={{ backgroundColor: "var(--color-bg-hover)" }} />
        <div className="h-32 rounded-xl" style={{ backgroundColor: "var(--color-bg-hover)" }} />
      </div>
    );
  }

  if (error || !bounty) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={40} className="mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
        <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-fg)" }}>Bounty not found</h3>
        <p className="text-sm mb-4" style={{ color: "var(--color-fg-muted)" }}>{error ?? "This bounty may have been removed."}</p>
        <Link href="/dashboard/marketplace?tab=bounties">
          <Button variant="outline" style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)" }}>
            <ArrowLeft size={14} className="mr-1.5" /> Back to Bounties
          </Button>
        </Link>
      </div>
    );
  }

  const isCreator = currentUserId === bounty.creator_id;
  const hasSubmitted = submissions.some((s) => s.submitter_id === currentUserId);
  const deadlinePassed = new Date(bounty.deadline).getTime() < Date.now();
  const canSubmit = !isCreator && !hasSubmitted && (bounty.status === "FUNDED" || bounty.status === "SUBMITTED") && !deadlinePassed;
  const canRefund = isCreator && deadlinePassed && bounty.status !== "COMPLETED" && bounty.status !== "REFUNDED";
  const statusColor = STATUS_COLORS[bounty.status] ?? STATUS_COLORS.OPEN;
  const workerInfo = WORKER_LABELS[bounty.worker_type] ?? WORKER_LABELS.BOTH;
  const WorkerIcon = workerInfo.icon;

  const handleApprove = async (sub: BountySubmissionRow) => {
    try {
      await approve(bountyId, sub.id, bounty.contract_bounty_id ?? undefined, undefined);
      toast.success("Submission approved! Funds released.");
      refresh();
    } catch {
      toast.error("Failed to approve submission.");
    }
  };

  const handleRefund = async () => {
    try {
      await refund(bountyId, bounty.contract_bounty_id ?? undefined);
      toast.success("Refund processed!");
      refresh();
    } catch {
      toast.error("Failed to refund.");
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back */}
      <Link href="/dashboard/marketplace?tab=bounties">
        <Button variant="ghost" className="gap-2 text-[13px]" style={{ color: "var(--color-fg-muted)" }}>
          <ArrowLeft size={14} /> Back to Bounties
        </Button>
      </Link>

      {/* Header Card */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `color-mix(in srgb, ${statusColor} 16%, transparent)`, color: statusColor }}
          >
            {bounty.status}
          </span>
          <span
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg-muted)" }}
          >
            <WorkerIcon size={11} />
            {workerInfo.label}
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--color-fg)" }}>
          {bounty.title}
        </h1>

        <div className="flex items-baseline gap-2 mb-4">
          <DollarSign size={18} style={{ color: "var(--color-accent)" }} />
          <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
            {Number(bounty.reward_usdc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-fg-secondary)" }}>
          {bounty.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--color-fg-muted)" }}>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Deadline: {new Date(bounty.deadline).toLocaleString()}
            {deadlinePassed && <span style={{ color: "oklch(0.65 0.22 25)" }}> (Expired)</span>}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-5">
          {canSubmit && (
            <Button
              size="sm"
              onClick={() => setSubmitOpen(true)}
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              Submit Work
            </Button>
          )}
          {canRefund && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefund}
              disabled={refunding}
              style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
            >
              {refunding ? <><Loader2 size={13} className="animate-spin mr-1" /> Refunding...</> : "Claim Refund"}
            </Button>
          )}
        </div>
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
          <Trophy size={14} /> Submissions ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}
          >
            <MessageSquare size={28} className="mx-auto mb-2" style={{ color: "var(--color-fg-muted)" }} />
            <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const scoreColor = sub.ai_validation_score !== null ? getScoreColor(sub.ai_validation_score) : undefined;
              return (
                <div
                  key={sub.id}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>
                      {truncateAddress(sub.submitter_id)}
                    </span>
                    <div className="flex items-center gap-2">
                      {sub.ai_validation_score !== null && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `color-mix(in srgb, ${scoreColor} 16%, transparent)`, color: scoreColor }}
                        >
                          AI: {Math.round(sub.ai_validation_score * 100)}%
                        </span>
                      )}
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: sub.status === "APPROVED"
                            ? "color-mix(in srgb, oklch(0.72 0.19 150) 16%, transparent)"
                            : sub.status === "REJECTED"
                              ? "color-mix(in srgb, oklch(0.65 0.22 25) 16%, transparent)"
                              : "var(--color-bg-hover)",
                          color: sub.status === "APPROVED"
                            ? "oklch(0.72 0.19 150)"
                            : sub.status === "REJECTED"
                              ? "oklch(0.65 0.22 25)"
                              : "var(--color-fg-muted)",
                        }}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  {sub.proof_url && (
                    <a
                      href={sub.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mb-1.5 hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <ExternalLink size={11} /> View Proof
                    </a>
                  )}

                  {sub.notes && (
                    <p className="text-xs mb-2" style={{ color: "var(--color-fg-secondary)" }}>{sub.notes}</p>
                  )}

                  {sub.ai_validation_notes && (
                    <p className="text-[11px] italic mb-2" style={{ color: "var(--color-fg-muted)" }}>
                      AI: {sub.ai_validation_notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
                      {new Date(sub.created_at).toLocaleString()}
                    </span>

                    {/* Moderator actions */}
                    {isCreator && sub.status === "PENDING" && bounty.status !== "COMPLETED" && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2"
                          onClick={() => handleApprove(sub)}
                          disabled={approving}
                          style={{ borderColor: "oklch(0.72 0.19 150)", color: "oklch(0.72 0.19 150)" }}
                        >
                          <CheckCircle2 size={11} className="mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SubmissionModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        bountyId={bountyId}
        onSuccess={refresh}
      />
    </motion.div>
  );
}
