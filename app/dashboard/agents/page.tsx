/**
 * ClipArc — AI Agent Management
 * Detailed agent cards with capabilities, pricing, onchain status
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, Plus, CheckCircle2, Star, Briefcase, ExternalLink, Clock, Cpu, Coins, Globe, Zap } from "lucide-react";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  tiktok_clips: "rgba(59,130,246,0.15)",
  youtube_shorts: "rgba(239,68,68,0.15)",
  ig_reels: "rgba(168,85,247,0.15)",
  general: "rgba(34,197,94,0.15)",
};

export default function AgentsPage() {
  const supabase = createSupabaseBrowserClient();
  const [agents, setAgents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchAgents = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from("agent_profiles")
      .select("*")
      .order("featured", { ascending: false })
      .order("reputation_score", { ascending: false });
    setAgents(data || []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>AI Agents</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Autonomous clipping agents with onchain reputation
          </p>
        </div>
        <Link href="/dashboard/agents/create">
          <Button style={{ backgroundColor: "var(--color-accent)" }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Agent grid */}
      {fetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg" style={{ borderColor: "var(--color-bd)" }}>
          <Bot className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
          <p className="text-lg" style={{ color: "var(--color-fg-secondary)" }}>No agents deployed yet</p>
          <p className="text-sm mb-4" style={{ color: "var(--color-fg-muted)" }}>
            Create your first AI clipping agent to start earning onchain
          </p>
          <Link href="/dashboard/agents/create">
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: agent.featured ? "var(--color-accent-soft)" : "var(--color-bg-inset)" }}>
                      <Bot className="h-4 w-4" style={{ color: agent.featured ? "var(--color-accent)" : "var(--color-fg-secondary)" }} />
                    </div>
                    <div>
                      <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{agent.agent_name}</CardTitle>
                      {agent.erc8004_agent_id && (
                        <p className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>ID #{agent.erc8004_agent_id}</p>
                      )}
                    </div>
                  </div>
                  {agent.featured && (
                    <Badge style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)", border: "none" }}>
                      Featured
                    </Badge>
                  )}
                </div>
                {agent.description && (
                  <CardDescription className="line-clamp-2 text-xs mt-1">{agent.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats row */}
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1" style={{ color: "var(--color-fg-secondary)" }}>
                    <Star className="h-3.5 w-3.5" style={{ color: "var(--color-warning)" }} />
                    <span>{agent.reputation_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-fg-secondary)" }}>
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{agent.total_jobs_completed || 0} jobs</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-fg-secondary)" }}>
                    <Coins className="h-3.5 w-3.5" />
                    <span>{agent.total_earnings || 0} USDC</span>
                  </div>
                </div>

                {/* Specializations */}
                {agent.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {agent.specializations.slice(0, 3).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                    {agent.specializations.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{agent.specializations.length - 3}</Badge>
                    )}
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                  <Coins className="h-3 w-3" />
                  <span>
                    {agent.pricing_model === "per_clip" && `${agent.price_per_clip || "?"} USDC/clip`}
                    {agent.pricing_model === "per_hour" && `${agent.price_per_hour || "?"} USDC/hr`}
                    {agent.pricing_model === "fixed" && "Fixed price"}
                    {agent.pricing_model === "subscription" && "Subscription"}
                  </span>
                  <span className="mx-1">·</span>
                  <Cpu className="h-3 w-3" />
                  <span>{agent.llm_provider || "openai"}</span>
                </div>

                {/* Onchain status + availability */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-bd)" }}>
                  <div className="flex items-center gap-2 text-xs">
                    {agent.erc8004_identity_address ? (
                      <span className="flex items-center gap-1" style={{ color: "var(--color-success)" }}>
                        <CheckCircle2 className="h-3 w-3" />
                        Onchain
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-fg-muted)" }}>Not registered</span>
                    )}
                    <span className={`flex items-center gap-1 ${agent.availability_status === "online" ? "text-green-500" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.availability_status === "online" ? "bg-green-500" : "bg-muted-foreground"}`} />
                      {agent.availability_status || "offline"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`https://testnet.arcscan.app/address/${agent.erc8004_identity_address || "0x8004A818BFB912233c491871b3d84c89A494BD9e"}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
