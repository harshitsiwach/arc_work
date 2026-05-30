/**
 * Arc Work - ERC-8183 Gig Detail — Provider View
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Bot, Users, Calendar, Clock, Wallet, Zap, Shield,
  FileText, DollarSign, Hash, CheckCircle2, AlertTriangle, User, Briefcase,
} from "lucide-react";
import { GigApplyButton } from "./apply-button";

function truncateAddress(address: string) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "0x0000000000000000000000000000000000000000";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default async function GigDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: gig } = await supabase
    .from("gigs")
    .select(`*, creator_profile:profiles!gigs_creator_profile_id_fkey(name)`)
    .eq("id", params.id)
    .single();

  if (!gig) {
    return (
      <div className="text-center py-12 animate-fade-in-up">
        <div className="empty-state inline-block">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--color-warning)" }} />
          <h3 className="heading-sm mb-2">Gig Not Found</h3>
          <p className="body-sm mb-4">This gig may have been removed or filled.</p>
          <Link href="/dashboard/marketplace">
            <Button className="btn-secondary">Back to Gigs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single();

  const isCreator = profile?.id === gig.creator_profile_id;
  const isZeroAddress = !gig.provident_address || gig.provident_address === "0x0000000000000000000000000000000000000000";

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in-up">
      <Link href="/dashboard/marketplace">
        <Button variant="ghost" className="btn-ghost gap-2 text-[13px]">
          <ArrowLeft className="h-4 w-4" />
          Back to Gigs
        </Button>
      </Link>

      {/* Info Bar */}
      <div className="erc-provider-info-bar">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Gig Details</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="erc-status-badge">{gig.status}</span>
          <span className="text-[10px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
            {gig.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="erc-detail-card">
            <div className="erc-detail-header">
              <div className="flex items-center gap-2 mb-3">
                <span className="erc-category-badge">{gig.category}</span>
                {gig.agent_only ? (
                  <span className="erc-type-badge erc-type-badge--agent">
                    <Bot className="h-3 w-3" />
                    AGENT ONLY
                  </span>
                ) : (
                  <span className="erc-type-badge erc-type-badge--open">
                    <Users className="h-3 w-3" />
                    OPEN TO ALL
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--color-fg)" }}>{gig.title}</h1>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" style={{ color: "var(--color-fg-muted)" }} />
                <span className="body-sm">posted by {gig.creator_profile?.name || "unknown"}</span>
              </div>
            </div>

            <div className="erc-detail-section">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                <span className="caption font-semibold uppercase tracking-wider">Description</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                {gig.description}
              </p>
            </div>

            {gig.skills_required?.length > 0 && (
              <div className="erc-detail-section">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                  <span className="caption font-semibold uppercase tracking-wider">Required Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gig.skills_required.map((skill: string) => (
                    <span key={skill} className="erc-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="erc-detail-card">
            <div className="erc-detail-section">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--color-success)" }} />
                <span className="caption font-semibold uppercase tracking-wider">Provider Checklist</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Review gig requirements", done: true },
                  { label: "Verify escrow funding", done: !isZeroAddress },
                  { label: "Check delivery deadline", done: !!gig.delivery_days },
                  { label: "Submit application", done: false },
                ].map((item, i) => (
                  <div key={i} className="erc-checklist-item">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "border-[var(--color-success)] bg-[var(--color-success-soft)]" : "border-[var(--color-bd)]"}`}>
                      {item.done && <CheckCircle2 className="h-3 w-3" style={{ color: "var(--color-success)" }} />}
                    </div>
                    <span className={`text-xs ${item.done ? "" : ""}`} style={{ color: item.done ? "var(--color-fg)" : "var(--color-fg-muted)" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="erc-detail-card">
            <div className="erc-detail-section">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                <span className="caption font-semibold uppercase tracking-wider">Payment</span>
              </div>
              <div className="erc-payment-display mb-4">
                <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>
                  {gig.price_amount}
                </span>
                <span className="text-sm ml-1" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
              </div>
              <div className="space-y-2">
                {gig.delivery_days && (
                  <div className="flex items-center justify-between">
                    <span className="caption">deadline</span>
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--color-fg)" }}>
                      <Calendar className="h-3 w-3" />
                      {gig.delivery_days} days
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="caption">currency</span>
                  <span className="badge-premium text-[10px]">USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption">posted</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-fg)" }}>
                    <Clock className="h-3 w-3" style={{ color: "var(--color-fg-muted)" }} />
                    {new Date(gig.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow */}
          <div className="erc-detail-card">
            <div className="erc-detail-section">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                <span className="caption font-semibold uppercase tracking-wider">Escrow</span>
              </div>
              <div className="erc-address-display mb-3">
                <Wallet className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-mono mb-0.5" style={{ color: "var(--color-fg-muted)" }}>provident_address</p>
                  <p className="text-[11px] font-mono font-semibold break-all" style={{ color: "var(--color-fg)" }}>
                    {gig.provident_address || "0x0000000000000000000000000000000000000000"}
                  </p>
                </div>
              </div>
              {isZeroAddress ? (
                <div className="erc-escrow-warning">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-warning)" }} />
                  <span className="text-[10px]">Escrow not yet funded — verify before applying.</span>
                </div>
              ) : (
                <div className="erc-escrow-ok">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-success)" }} />
                  <span className="text-[10px]">Escrow funded — payment secured.</span>
                </div>
              )}
            </div>
          </div>

          {/* Apply */}
          <div className="erc-detail-card">
            <div className="p-4">
              {isCreator ? (
                <p className="text-center text-xs" style={{ color: "var(--color-fg-muted)" }}>
                  You posted this gig
                </p>
              ) : (
                <GigApplyButton gigId={gig.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
