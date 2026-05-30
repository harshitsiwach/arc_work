"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/web3/wallet-provider";
import { reads } from "@/lib/contracts/reads";
import { useFundJob } from "@/features/jobs/hooks/use-workflow-actions";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import type { JobRecord } from "@/features/jobs/types/job";

export function FundPageContent({ job }: { job: JobRecord }) {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const { execute, isLoading, isSuccess, state, reset } = useFundJob();
  const [feeConfig, setFeeConfig] = useState<{ platformFeeBP: bigint; evaluatorFeeBP: bigint } | null>(null);
  const [step, setStep] = useState<"review" | "approve" | "confirm">("review");
  const [onchainClientAddress, setOnchainClientAddress] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);

  const isCreator = activeAddress?.toLowerCase() === onchainClientAddress?.toLowerCase();
  const amount = BigInt(job.price_amount);

  useEffect(() => {
    reads.getFeeConfig().then(setFeeConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!job.onchain_job_id) return;
    reads.getJob(BigInt(job.onchain_job_id!)).then(j => { setOnchainClientAddress(j.client); setClientReady(true); }).catch(() => setClientReady(true));
  }, [job.onchain_job_id]);

  const platformFee = feeConfig ? (amount * feeConfig.platformFeeBP) / BigInt(10000) : BigInt(0);
  const evaluatorFee = feeConfig ? (amount * feeConfig.evaluatorFeeBP) / BigInt(10000) : BigInt(0);
  const total = amount + platformFee + evaluatorFee;

  if (!clientReady) return <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}><div className="h-20 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }} /></div>;
  if (!onchainClientAddress || !isCreator) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Only the job creator can fund escrow.</p>;
  if (!job.onchain_job_id) return <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Not deployed onchain.</p>;

  const handleFund = async () => {
    if (!job.onchain_job_id) return;
    setStep("approve");
    await execute(BigInt(job.onchain_job_id!), amount);
    if (isSuccess) {
      setStep("confirm");
      setTimeout(() => router.push(`/jobs/${job.id}`), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {step === "review" && (
        <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Review</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span style={{ color: "var(--color-fg-secondary)" }}>Budget</span><span className="font-mono" style={{ color: "var(--color-fg)" }}>{amount.toString()} USDC</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: "var(--color-fg-secondary)" }}>Platform Fee</span><span className="font-mono" style={{ color: "var(--color-fg-muted)" }}>{platformFee.toString()} USDC</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: "var(--color-fg-secondary)" }}>Evaluator Fee</span><span className="font-mono" style={{ color: "var(--color-fg-muted)" }}>{evaluatorFee.toString()} USDC</span></div>
            <div className="border-t pt-3" style={{ borderColor: "var(--color-bd)" }}>
              <div className="flex justify-between text-sm font-semibold"><span style={{ color: "var(--color-fg)" }}>Total Required</span><span className="font-mono" style={{ color: "var(--color-fg)" }}>{total.toString()} USDC</span></div>
            </div>
          </div>
          <button onClick={handleFund} className="w-full rounded-lg px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
            Approve & Fund
          </button>
        </div>
      )}

      {step === "approve" && (
        <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>Confirm the transaction in your wallet...</p>
        </div>
      )}

      {step === "confirm" && (
        <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--color-success)", backgroundColor: "var(--color-success-soft)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>Escrow Funded!</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-secondary)" }}>{amount.toString()} USDC locked. Redirecting...</p>
        </div>
      )}

      <TransactionModal state={state} onClose={reset} />
    </div>
  );
}
