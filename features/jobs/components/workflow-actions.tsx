"use client";

import { useState, useEffect } from "react";
import { reads } from "@/lib/contracts/reads";
import { useFundJob, useSubmitWork, useCompleteJob, useRejectJob, useClaimRefund } from "../hooks/use-workflow-actions";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobStatus, Bid } from "@/lib/contracts/types";

interface WorkflowActionsProps {
  jobId: bigint;
  currentStatus: JobStatus;
  isCreator: boolean;
  activeAddress: string | null;
  provider: string;
  budget: bigint;
  priceAmount: bigint;
  onActionComplete: () => void;
}

function truncateAddress(address: string): string | null {
  if (!address || address === "0x0000000000000000000000000000000000000000") return null;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function findAcceptedBid(bids: Bid[], provider: string): Bid | undefined {
  return bids.find(
    (b) => b.accepted && b.provider.toLowerCase() === provider.toLowerCase()
  );
}

function FundJobPanel({ jobId, priceAmount, provider, onActionComplete }: {
  jobId: bigint;
  priceAmount: bigint;
  provider: string;
  onActionComplete: () => void;
}) {
  const { execute, isLoading, isSuccess, state, reset } = useFundJob();
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    reads.getBids(jobId).then(setBids).catch(() => {});
  }, [jobId]);

  const acceptedBid = findAcceptedBid(bids, provider);
  const fundAmount = acceptedBid?.amount ?? priceAmount;

  const handleFund = async () => {
    await execute(jobId, fundAmount);
    onActionComplete();
  };

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Lock Funds</h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-fg-secondary)" }}>
        Fund this job to lock the budget into escrow. This requires USDC approval.
      </p>
      {acceptedBid && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
          <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--color-fg-muted)" }}>
            Accepted Bid
          </p>
          <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>
            {truncateAddress(acceptedBid.provider)} — {acceptedBid.amount.toString()} USDC
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleFund}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          {isLoading ? "Funding..." : `Fund ${fundAmount.toString()} USDC`}
        </button>
        {isSuccess && <span className="text-xs" style={{ color: "var(--color-success)" }}>Funded!</span>}
      </div>
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}

function SubmitWorkPanel({ jobId, provider, activeAddress, onActionComplete }: {
  jobId: bigint;
  provider: string;
  activeAddress: string | null;
  onActionComplete: () => void;
}) {
  const { execute, isLoading, isSuccess, isError, error, txHash, state, reset } = useSubmitWork();
  const isAssignedProvider = activeAddress?.toLowerCase() === provider?.toLowerCase();

  if (!isAssignedProvider) {
    return (
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Work Submission</h3>
        <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
          Awaiting work submission from {truncateAddress(provider)}
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    await execute(jobId, "0x0000000000000000000000000000000000000000000000000000000000000000");
    onActionComplete();
  };

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Submit Work</h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-fg-secondary)" }}>
        Submit your completed work for this job. The creator will review and release payment.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          {isLoading ? "Submitting..." : "Submit Work"}
        </button>
        {isSuccess && <span className="text-xs" style={{ color: "var(--color-success)" }}>Submitted!</span>}
      </div>
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}

function CompleteRejectPanel({ jobId, provider, isCreator, onActionComplete }: {
  jobId: bigint;
  provider: string;
  isCreator: boolean;
  onActionComplete: () => void;
}) {
  const complete = useCompleteJob();
  const reject = useRejectJob();
  const isLoading = complete.isLoading || reject.isLoading;

  const handleComplete = async () => {
    await complete.execute(jobId);
    onActionComplete();
  };

  const handleReject = async () => {
    await reject.execute(jobId);
    onActionComplete();
  };

  if (!isCreator) {
    return (
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Work Review</h3>
        <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
          Work has been submitted. Awaiting review from the job creator.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Review Work</h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-fg-secondary)" }}>
        {truncateAddress(provider)} has submitted work. Review and release payment or reject.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-success)", color: "white" }}
        >
          {complete.isLoading ? "Completing..." : "Approve & Release"}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-error)", color: "white" }}
        >
          {reject.isLoading ? "Rejecting..." : "Reject"}
        </button>
      </div>
      <TransactionModal state={complete.state} onClose={complete.reset} />
      <TransactionModal state={reject.state} onClose={reject.reset} />
    </div>
  );
}

function ClaimRefundPanel({ jobId, isCreator, onActionComplete }: {
  jobId: bigint;
  isCreator: boolean;
  onActionComplete: () => void;
}) {
  const { execute, isLoading, isSuccess, isError, error, txHash, state, reset } = useClaimRefund();

  if (!isCreator) return null;

  const handleClaim = async () => {
    await execute(jobId);
    onActionComplete();
  };

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Claim Refund</h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-fg-secondary)" }}>
        This job has expired. You can claim a refund of the locked funds.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClaim}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-sm font-mono transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          {isLoading ? "Claiming..." : "Claim Refund"}
        </button>
        {isSuccess && <span className="text-xs" style={{ color: "var(--color-success)" }}>Claimed!</span>}
      </div>
      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}

export function WorkflowActions(props: WorkflowActionsProps) {
  const { currentStatus, isCreator, activeAddress, provider } = props;

  const hasProvider = provider && provider !== "0x0000000000000000000000000000000000000000";
  const isAssignedProvider = activeAddress?.toLowerCase() === provider?.toLowerCase();

  return (
    <div className="space-y-4">
      {currentStatus === 0 && hasProvider && isCreator && (
        <FundJobPanel {...props} />
      )}

      {currentStatus === 1 && (
        <SubmitWorkPanel {...props} />
      )}

      {currentStatus === 2 && (
        <CompleteRejectPanel {...props} />
      )}

      {currentStatus === 5 && (
        <ClaimRefundPanel {...props} />
      )}

      {currentStatus === 3 && isCreator && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-success)", backgroundColor: "var(--color-success-soft)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>Job Completed</h3>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Payment has been released to {truncateAddress(provider)}.
          </p>
        </div>
      )}

      {currentStatus === 4 && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-error)", backgroundColor: "var(--color-error-soft)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-error)" }}>Job Rejected</h3>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            The submitted work was rejected and funds refunded.
          </p>
        </div>
      )}

      {currentStatus === 5 && isAssignedProvider && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Job Expired</h3>
          <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
            This job has expired. The creator can claim a refund.
          </p>
        </div>
      )}
    </div>
  );
}
