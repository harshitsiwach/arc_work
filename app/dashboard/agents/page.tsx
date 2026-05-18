/**
 * Arc Work - AI Agent registration & management
 * Shows real agents from Supabase, not just placeholders
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, Plus, FileText, CheckCircle2, Star, Briefcase, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const AGENT_CONTRACTS = {
  identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
  validationRegistry: "0x8004Cb1BF31DAf7788923b405b754f57acEB4272",
};

export default function AgentsPage() {
  const supabase = createSupabaseBrowserClient();
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    agentName: "",
    description: "",
    capabilities: "",
  });

  const fetchAgents = useCallback(async () => {
    setFetching(true);
    const { data: agents } = await supabase
      .from("agent_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setAgents(agents || []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: form.agentName,
          description: form.description,
          capabilities: form.capabilities.split(",").map((s: string) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Agent registered!");
      setShowRegister(false);
      setForm({ agentName: "", description: "", capabilities: "" });
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Register and manage AI agent identities (ERC-8004)
          </p>
        </div>
        {!showRegister && (
          <Button onClick={() => setShowRegister(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Agent
          </Button>
        )}
      </div>

      {/* Register form */}
      {showRegister && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Register New Agent</CardTitle>
                <CardDescription>
                  Create an onchain identity for your AI agent via ERC-8004
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowRegister(false)}>Cancel</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Agent Name</Label>
              <Input
                placeholder="e.g., CodeReviewBot v2"
                value={form.agentName}
                onChange={e => setForm({ ...form, agentName: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="What does this agent do?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Capabilities (comma separated)</Label>
              <Input
                placeholder="Smart contract audit, Code review, Testing"
                value={form.capabilities}
                onChange={e => setForm({ ...form, capabilities: e.target.value })}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold">Onchain Contracts (Arc Testnet)</p>
              <div className="text-xs text-muted-foreground space-y-1 font-mono">
                <p>Identity: {AGENT_CONTRACTS.identityRegistry}</p>
                <p>Reputation: {AGENT_CONTRACTS.reputationRegistry}</p>
                <p>Validation: {AGENT_CONTRACTS.validationRegistry}</p>
              </div>
            </div>

            <Button onClick={handleRegister} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" /> Register on Arc</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Agent list */}
      {fetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg text-muted-foreground">No agents registered yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Register your first AI agent to start participating in the agent economy
          </p>
          <Button onClick={() => setShowRegister(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-5 w-5 text-purple-500" />
                  <Badge variant="secondary">
                    {agent.agent_type === "ai" ? "AI Agent" : agent.agent_type}
                  </Badge>
                  {agent.erc8004_agent_id && (
                    <Badge variant="outline" className="text-xs">
                      ID #{agent.erc8004_agent_id}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                {agent.description && (
                  <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{agent.reputation_score || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{agent.total_jobs_completed || 0} jobs</span>
                  </div>
                </div>

                {/* Capabilities */}
                {agent.capabilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 4).map((cap: string) => (
                      <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                    ))}
                    {agent.capabilities.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{agent.capabilities.length - 4}</Badge>
                    )}
                  </div>
                )}

                {/* Onchain status */}
                <div className="flex items-center gap-2 text-xs">
                  {agent.erc8004_identity_address ? (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      Registered onchain
                    </span>
                  ) : (
                    <span className="text-muted-foreground">DB only (not onchain)</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`https://testnet.arcscan.app/address/${agent.erc8004_identity_address || AGENT_CONTRACTS.identityRegistry}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Explorer
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
