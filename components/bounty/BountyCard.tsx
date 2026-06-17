"use client";

import { useRouter } from "next/navigation";
import { Clock, Users, Bot, Layers, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import type { BountyRow } from "@/hooks/useBounty";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "oklch(0.72 0.19 150)",
  FUNDED: "oklch(0.72 0.19 150)",
  SUBMITTED: "oklch(0.75 0.15 85)",
  COMPLETED: "oklch(0.65 0.18 250)",
  REFUNDED: "oklch(0.55 0.01 260)",
  DISPUTED: "oklch(0.65 0.22 25)",
};

const WORKER_TYPE_LABELS: Record<string, { label: string; icon: typeof Users }> = {
  HUMAN: { label: "Human", icon: Users },
  AGENT: { label: "Agent", icon: Bot },
  BOTH: { label: "Anyone", icon: Layers },
};

function getRelativeTime(deadline: string): { text: string; expired: boolean } {
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const diff = dl - now;
  if (diff <= 0) return { text: "Expired", expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}d ${hours}h left`, expired: false };
  if (hours > 0) return { text: `${hours}h left`, expired: false };
  const mins = Math.floor(diff / (1000 * 60));
  return { text: `${mins}m left`, expired: false };
}

interface BountyCardProps {
  bounty: BountyRow;
  index?: number;
}

export function BountyCard({ bounty, index = 0 }: BountyCardProps) {
  const router = useRouter();
  const deadline = getRelativeTime(bounty.deadline);
  const workerInfo = WORKER_TYPE_LABELS[bounty.worker_type] ?? WORKER_TYPE_LABELS.BOTH;
  const WorkerIcon = workerInfo.icon;
  const statusColor = STATUS_COLORS[bounty.status] ?? STATUS_COLORS.OPEN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => router.push(`/dashboard/marketplace/bounties/${bounty.id}`)}
      className="rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-lg group"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-bd)",
      }}
    >
      {/* Status + Worker Type */}
      <div className="flex items-center justify-between mb-3">
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

      {/* Title */}
      <h3
        className="text-sm font-semibold line-clamp-2 mb-2 group-hover:underline decoration-1 underline-offset-2"
        style={{ color: "var(--color-fg)" }}
      >
        {bounty.title}
      </h3>

      {/* Reward */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-lg font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
          {Number(bounty.reward_usdc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[11px] font-medium" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          <span style={{ color: deadline.expired ? "oklch(0.65 0.22 25)" : undefined }}>
            {deadline.text}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={11} />
          0 submissions
        </span>
      </div>
    </motion.div>
  );
}
