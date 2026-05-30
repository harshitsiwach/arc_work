"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Zap, ChevronRight, CheckCircle, ExternalLink } from "lucide-react";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useCreateJob } from "@/features/jobs/hooks/use-create-job";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const CATEGORIES = ["Development", "Design", "Writing", "Marketing", "AI/ML", "Blockchain", "Data Entry", "Video & Animation", "Music & Audio", "Consulting", "Other"];

export default function CreateJobPage() {
  const router = useRouter();
  const { isConnected, connect, activeAddress } = useWallet();
  const { execute, txHash, isLoading, state, reset: resetTx, onchainSuccess, onchainJobId } = useCreateJob();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    price_amount: "",
    delivery_days: "",
    agent_only: false,
    skills_required: "",
  });
  const [created, setCreated] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) { toast.info("Connect your wallet first"); await connect(); return; }
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return; }
      const { data: profile } = await supabase.from("profiles").select("id").eq("auth_user_id", user.id).single();
      if (!profile) { toast.error("Profile not found"); return; }

      const gig = await execute({
        title: form.title,
        description: form.description,
        category: form.category,
        price_amount: parseFloat(form.price_amount),
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        agent_only: form.agent_only,
        skills_required: form.skills_required ? form.skills_required.split(",").map(s => s.trim()).filter(Boolean) : [],
        evaluator_address: "0x0000000000000000000000000000000000000000",
        hook_address: "0x0000000000000000000000000000000000000000",
      }, profile.id, activeAddress || "");

      setCreatedJobId(gig.id);
      setCreated(true);
      toast.success("Job created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create job");
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up pt-12">
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--color-success)", backgroundColor: "var(--color-success-soft)" }}>
          <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-success)" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-fg)" }}>Job Created</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-fg-secondary)" }}>
            {onchainSuccess ? "Deployed onchain and ready for bids." : "Saved to database."}
          </p>
          {onchainSuccess && txHash && (
            <>
              <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <p className="text-[10px] font-mono uppercase mb-1" style={{ color: "var(--color-fg-muted)" }}>Tx</p>
                <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono hover:underline flex items-center gap-1 justify-center" style={{ color: "var(--color-accent)" }}>
                  {txHash.slice(0, 10)}...{txHash.slice(-8)} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {onchainJobId !== null && (
                <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: "var(--color-fg-muted)" }}>Job ID</p>
                  <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>#{onchainJobId}</p>
                </div>
              )}
            </>
          )}
          <div className="flex gap-3 justify-center">
            <Link href={`/jobs/${createdJobId}`} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
              View Job
            </Link>
            <Link href="/jobs" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-bg-hover)", color: "var(--color-fg)" }}>
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/jobs"><button className="p-2 hover:opacity-70"><ArrowLeft className="h-5 w-5" style={{ color: "var(--color-fg)" }} /></button></Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>Post a Job</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>Create a new freelance opportunity with onchain escrow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Details</h3>
          <div>
            <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Title</label>
            <input required placeholder="e.g., Build a Solidity smart contract" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
          </div>
          <div>
            <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Description</label>
            <textarea required placeholder="Describe the work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none min-h-[100px]" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Skills (comma separated)</label>
              <input placeholder="Solidity, React" value={form.skills_required} onChange={e => setForm({ ...form, skills_required: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Payment & Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Budget</label>
              <div className="flex items-center gap-2">
                <input required type="number" step="0.01" min="1" placeholder="100" value={form.price_amount} onChange={e => setForm({ ...form, price_amount: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
                <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono mb-1 block" style={{ color: "var(--color-fg-muted)" }}>Delivery (days)</label>
              <input type="number" min="1" placeholder="7" value={form.delivery_days} onChange={e => setForm({ ...form, delivery_days: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> {state.status === "signature_pending" ? "Confirm in wallet..." : "Deploying..."}</> : <><Zap className="h-4 w-4" /> Post Job <ChevronRight className="h-4 w-4" /></>}
        </button>
      </form>

      <TransactionModal state={state} onClose={resetTx} />
    </div>
  );
}
