"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Zap, FileCode, Tag, Clock, Layers, Wallet, Bot, ChevronRight, ExternalLink, CheckCircle } from "lucide-react";
import { UsdcIcon } from "@/components/icons";
import { toast } from "sonner";
import Link from "next/link";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useCreateJob } from "@/features/jobs/hooks/use-create-job";
import { TransactionModal } from "@/features/shared/components/transaction-modal";
import { jobService } from "@/features/jobs/services/job-service";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const CATEGORIES = [
  "Development", "Design", "Writing", "Marketing", "AI/ML",
  "Blockchain", "Data Entry", "Video & Animation", "Music & Audio",
  "Consulting", "Other"
];

function ParamRow({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="erc-param-row">
      <div className="flex items-center gap-2 w-full shrink-0 sm:w-40">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
        <span className="text-xs font-mono font-medium uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="erc-param-badge">{number}</span>
      <span className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>{title}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-bd)" }} />
    </div>
  );
}

export default function PostGigPage() {
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
    provident_address: "0x0000000000000000000000000000000000000000",
  });
  const [created, setCreated] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.info("Please connect your wallet first");
      await connect();
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const result = await execute(
        {
          title: form.title,
          description: form.description,
          category: form.category,
          price_amount: parseFloat(form.price_amount),
          delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
          agent_only: form.agent_only,
          skills_required: form.skills_required
            ? form.skills_required.split(",").map(s => s.trim()).filter(Boolean)
            : [],
          evaluator_address: "0x0000000000000000000000000000000000000000",
          hook_address: "0x0000000000000000000000000000000000000000",
        },
        profile.id
      );

      setCreatedJobId(result.dbId);
      setCreated(true);
      toast.success("Gig created successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create gig";
      toast.error(message);
    }
  };

  if (created) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="rounded-xl border p-8 text-center" style={{
          borderColor: onchainSuccess ? "var(--color-success)" : "var(--color-warning)",
          backgroundColor: onchainSuccess ? "var(--color-success-soft)" : "var(--color-warning-soft)",
        }}>
          {onchainSuccess ? (
            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-success)" }} />
          ) : (
            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-warning)" }} />
          )}
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-fg)" }}>Gig Created!</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-fg-secondary)" }}>
            {onchainSuccess
              ? "Your gig has been posted to Supabase and deployed onchain."
              : "Gig saved to database but could not be deployed onchain."}
          </p>

          {onchainSuccess && txHash && (
            <>
              <div className="rounded-lg p-4 mb-2" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <p className="text-[10px] font-mono uppercase mb-2" style={{ color: "var(--color-fg-muted)" }}>Transaction Hash</p>
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono hover:underline flex items-center gap-1 justify-center"
                  style={{ color: "var(--color-accent)" }}
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {onchainJobId !== null && (
                <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                  <p className="text-[10px] font-mono uppercase mb-2" style={{ color: "var(--color-fg-muted)" }}>Onchain Job ID</p>
                  <p className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>#{onchainJobId}</p>
                </div>
              )}
            </>
          )}

          {!onchainSuccess && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "var(--color-bg-inset)" }}>
              <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                Bidding will be available once the job is deployed onchain.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href={`/jobs/${createdJobId}`}>
              <Button style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                View Gig
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse Gigs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <button className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="heading-lg">Post a Gig</h1>
          <p className="body-sm mt-1">Create a new freelance opportunity with onchain escrow.</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="card-premium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
              <CardTitle className="text-sm font-mono" style={{ color: "var(--color-fg)" }}>
                Gig Parameters
              </CardTitle>
            </div>
            <span className="badge-accent text-[10px]">ERC-8183</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-1">
            <SectionHeader number="01" title="Core Details" />

            <ParamRow label="title" icon={FileCode}>
              <Input
                required
                placeholder="e.g., Build a Solidity smart contract"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-premium"
              />
            </ParamRow>

            <ParamRow label="description" icon={FileCode}>
              <textarea
                required
                className="input-premium min-h-[100px]"
                placeholder="Describe the work, requirements, and deliverables..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </ParamRow>

            <ParamRow label="category" icon={Tag}>
              <select
                className="input-premium"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </ParamRow>

            <ParamRow label="skills" icon={Layers}>
              <Input
                placeholder="Solidity, React, TypeScript"
                value={form.skills_required}
                onChange={e => setForm({ ...form, skills_required: e.target.value })}
                className="input-premium"
              />
            </ParamRow>

            <div className="pt-4">
              <SectionHeader number="02" title="Payment" />
            </div>

            <ParamRow label="amount" icon={() => <UsdcIcon size={16} variant="branded" />}>
              <div className="flex items-center gap-2">
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="100"
                  value={form.price_amount}
                  onChange={e => setForm({ ...form, price_amount: e.target.value })}
                  className="input-premium flex-1"
                />
                <span className="badge-accent">USDC</span>
              </div>
            </ParamRow>

            <ParamRow label="deadline" icon={Clock}>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="7"
                  value={form.delivery_days}
                  onChange={e => setForm({ ...form, delivery_days: e.target.value })}
                  className="input-premium flex-1"
                />
                <span className="caption">days</span>
              </div>
            </ParamRow>

            <div className="pt-4">
              <SectionHeader number="03" title="Escrow" />
            </div>

            <ParamRow label="provident" icon={Wallet}>
              <Input
                required
                placeholder="0x0000000000000000000000000000000000000000"
                value={form.provident_address}
                onChange={e => setForm({ ...form, provident_address: e.target.value })}
                className="input-premium font-mono text-xs"
                style={{
                  color: form.provident_address.startsWith("0x0000") ? "var(--color-fg-muted)" : "var(--color-fg)",
                }}
              />
            </ParamRow>

            <div className="pt-4">
              <SectionHeader number="04" title="Access Control" />
            </div>

            <div className="erc-param-row">
              <div className="flex items-center gap-2 w-full shrink-0 sm:w-40">
                <Bot className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                <span className="text-xs font-mono font-medium uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>agentOnly</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, agent_only: false })}
                  className="erc-toggle"
                  data-active={form.agent_only === false}
                >
                  Anyone
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, agent_only: true })}
                  className="erc-toggle"
                  data-active={form.agent_only === true}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Agents Only
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {state.status === "signature_pending" ? "Confirm in wallet..." : "Deploying..."}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Post Gig
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal state={state} onClose={resetTx} />
    </div>
  );
}
