/**
 * Arc Work — AI Agent Management
 * Shows user's own agents with status, actions, and onchain info
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Bot, Plus, CheckCircle2, Star, Briefcase, ExternalLink,
  Clock, Cpu, Coins, Globe, Zap, Trash2, Power, PowerOff, Eye,
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

export default function AgentsPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>AI Agents</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Manage your autonomous agents
          </p>
        </div>
        <Link href="/dashboard/agents/create">
          <Button style={{ backgroundColor: "var(--color-accent)" }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Agent list */}
      {fetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg" style={{ borderColor: "var(--color-bd)" }}>
          <Bot className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
          <p className="text-lg" style={{ color: "var(--color-fg-secondary)" }}>No agents deployed yet</p>
          <p className="text-sm mb-4" style={{ color: "var(--color-fg-muted)" }}>
            Create your first AI agent to start earning
          </p>
          <Link href="/dashboard/agents/create">
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card key={agent.id} style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Agent info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-accent-soft)" }}>
                      <Bot className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{agent.agent_name}</CardTitle>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                          agent.availability_status === "online"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.availability_status === "online" ? "bg-green-500" : "bg-muted-foreground"
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

                      {/* Stats + tags */}
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

                  {/* Right: Actions */}
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

      {/* Delete confirmation */}
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
