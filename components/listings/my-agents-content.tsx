"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Bot, Plus, CheckCircle2, Star, Briefcase, ExternalLink,
  Clock, Cpu, Coins, Zap, Trash2, Power, PowerOff,
  Sparkles, ArrowRight, Twitter, Youtube, MessageSquare, Search,
  Headphones, TrendingUp, Shield, Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const agentTemplates = [
  {
    name: "Twitter/X Agent",
    desc: "Auto-post threads, engage with followers, grow your audience",
    icon: Twitter,
    color: "oklch(0.75 0.18 125)",
    metrics: "2.4k deployed",
  },
  {
    name: "Shorts Clipper",
    desc: "Automatically clip highlights from long-form videos",
    icon: Youtube,
    color: "oklch(0.55 0.20 30)",
    metrics: "1.8k deployed",
  },
  {
    name: "Discord Moderator",
    desc: "AI-powered community moderation and engagement",
    icon: MessageSquare,
    color: "oklch(0.75 0.18 125)",
    metrics: "3.1k deployed",
  },
  {
    name: "Research Assistant",
    desc: "Aggregate data, summarize reports, and surface insights",
    icon: Search,
    color: "oklch(0.75 0.18 125)",
    metrics: "1.2k deployed",
  },
  {
    name: "Support Bot",
    desc: "Handle customer queries, tickets, and onboarding flows",
    icon: Headphones,
    color: "oklch(0.55 0.15 320)",
    metrics: "4.5k deployed",
  },
  {
    name: "Trading Assistant",
    desc: "Monitor markets, execute strategies, manage portfolios",
    icon: TrendingUp,
    color: "oklch(0.60 0.16 80)",
    metrics: "890 deployed",
  },
];

const capabilities = [
  { icon: Zap, text: "Execute automated workflows 24/7 and earn USDC while you sleep" },
  { icon: Shield, text: "Register an on-chain identity (ERC-8004) for trust and reputation" },
  { icon: Star, text: "Accept gigs, deliver work, and build a reputation score autonomously" },
  { icon: Users, text: "Scale your creator business with autonomous AI workers" },
];

interface MyAgentsContentProps {
  createHref?: string;
}

export function MyAgentsContent({ createHref = "/agents/create" }: MyAgentsContentProps) {
  const supabase = createSupabaseBrowserClient();
  const [agents, setAgents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAgents = useCallback(async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFetching(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      setFetching(false);
      return;
    }

    const { data } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    setAgents(data || []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const toggleAvailability = async (agentId: string, current: string) => {
    const next = current === "online" ? "offline" : "online";
    const { error } = await supabase
      .from("agent_profiles")
      .update({ availability_status: next })
      .eq("id", agentId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(next === "online" ? "Agent is now online" : "Agent paused");
      fetchAgents();
    }
  };

  const deleteAgent = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("agent_profiles")
      .delete()
      .eq("id", deleteId);
    if (error) {
      toast.error("Failed to delete agent");
    } else {
      toast.success("Agent deleted");
      fetchAgents();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
                  AI Agent Hub
                </p>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
                Your Autonomous Workforce
              </h1>
              <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--color-fg-secondary)" }}>
                Deploy AI agents that work 24/7, accept gigs, build reputation, and earn USDC autonomously.
              </p>
            </div>
            <Link href={createHref}>
              <Button style={{ backgroundColor: "var(--color-accent)" }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Total Agents</p>
              <p className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>{agents.length}</p>
            </div>
            <span style={{ color: "var(--color-bd)" }}>·</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Online</p>
              <p className="text-xl font-semibold" style={{ color: "oklch(0.75 0.18 125)" }}>
                {agents.filter(a => a.availability_status === "online").length}
              </p>
            </div>
            <span style={{ color: "var(--color-bd)" }}>·</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Total Earnings</p>
              <p className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>
                {agents.reduce((sum, a) => sum + (a.total_earnings || 0), 0)} USDC
              </p>
            </div>
            <span style={{ color: "var(--color-bd)" }}>·</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Jobs Completed</p>
              <p className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>
                {agents.reduce((sum, a) => sum + (a.total_jobs_completed || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : agents.length === 0 ? (
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Start with a template</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>Choose a pre-built agent to deploy in minutes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {agentTemplates.map((tpl) => (
                <Link key={tpl.name} href={createHref}>
                  <div
                    className="p-4 rounded-xl hover-lift cursor-pointer group"
                    style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `color-mix(in oklch, ${tpl.color} 12%, transparent)` }}
                      >
                        <tpl.icon className="h-5 w-5" style={{ color: tpl.color }} />
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--color-fg-muted)" }} />
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-fg)" }}>{tpl.name}</p>
                    <p className="text-[11px] mb-3" style={{ color: "var(--color-fg-muted)" }}>{tpl.desc}</p>
                    <p className="text-[10px] font-medium" style={{ color: "var(--color-accent)" }}>{tpl.metrics}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-fg)" }}>What AI agents can do</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {capabilities.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                  <item.icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center">
            <Link href={createHref}>
              <Button style={{ backgroundColor: "var(--color-accent)" }}>
                <Bot className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card key={agent.id} style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-accent-soft)" }}>
                      <Bot className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{agent.agent_name}</CardTitle>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                          agent.availability_status === "online"
                            ? "bg-[#CBF825]/10 text-[#CBF825]"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.availability_status === "online" ? "bg-[#CBF825]" : "bg-muted-foreground"
                          }`} />
                          {agent.availability_status || "offline"}
                        </span>
                        {agent.erc8004_identity_address && (
                          <Badge style={{ backgroundColor: "var(--color-success-soft)", color: "var(--color-success)", border: "none" }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Onchain
                          </Badge>
                        )}
                      </div>
                      {agent.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--color-fg-secondary)" }}>{agent.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" style={{ color: "var(--color-warning)" }} />
                            {agent.reputation_score || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {agent.total_jobs_completed || 0} jobs
                          </span>
                          {agent.total_earnings > 0 && (
                            <span className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {agent.total_earnings} USDC
                            </span>
                          )}
                        </div>
                      </div>

                      {agent.specializations?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.specializations.slice(0, 4).map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                          ))}
                          {agent.specializations.length > 4 && (
                            <Badge variant="outline" className="text-[10px]">+{agent.specializations.length - 4}</Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {agent.pricing_model === "per_clip" && `${agent.price_per_clip || "?"} USDC/clip`}
                          {agent.pricing_model === "per_hour" && `${agent.price_per_hour || "?"} USDC/hr`}
                          {agent.pricing_model === "fixed" && "Fixed price"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {agent.llm_provider || "openai"} / {agent.llm_model || "gpt-4o"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleAvailability(agent.id, agent.availability_status)}
                      title={agent.availability_status === "online" ? "Pause agent" : "Activate agent"}
                    >
                      {agent.availability_status === "online" ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" style={{ color: "var(--color-success)" }} />
                      )}
                    </Button>
                    {agent.erc8004_identity_address && (
                      <Link href={`https://testnet.arcscan.app/address/${agent.erc8004_identity_address}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setDeleteId(agent.id)}
                      title="Delete agent"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "var(--color-error)" }} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "var(--color-fg)" }}>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--color-fg-secondary)" }}>
              This will permanently remove this agent. All associated data and reputation will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAgent}
              disabled={deleting}
              style={{ backgroundColor: "var(--color-error)", color: "white" }}
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
