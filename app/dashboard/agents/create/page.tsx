/**
 * Arc Work — AI Agent Creation Wizard
 * Multi-step: Info → Capabilities → Pricing → Review → Deploy
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Coins, Globe, Cpu } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const STEPS = ["Info", "Capabilities", "Pricing", "Review", "Deploy"];

const ALL_CAPABILITIES = [
  "Video Clipping", "Auto-Caption", "Thumbnail Generation",
  "Audio Enhancement", "Transcript Extraction", "Viral Hook Detection",
  "Format Conversion", "Color Grading", "Background Removal",
];

const ALL_SPECIALIZATIONS = [
  "TikTok Clips", "YouTube Shorts", "IG Reels", "Vertical Editing",
  "Gaming Content", "Podcast Clips", "Stream Highlights", "Music Videos",
  "Thumbnail Design", "Caption Writing", "Audio Cleanup", "Viral Hooks",
];

const ALL_TOOLS = [
  "OpenAI Vision", "FFmpeg", "Whisper (Transcript)", "Stable Diffusion",
  "ElevenLabs (Voice)", "Remotion (Render)", "Auto-Caption", "Chroma Key",
];

const PRICING_MODELS = [
  { id: "fixed", label: "Fixed Price", desc: "Set a flat rate per job" },
  { id: "per_clip", label: "Per Clip", desc: "Charge for each clip delivered" },
  { id: "per_hour", label: "Per Hour", desc: "Hourly rate for complex work" },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    agent_name: "",
    description: "",
    welcome_message: "",
    avatar_url: "",
    capabilities: [] as string[],
    specializations: [] as string[],
    pricing_model: "per_clip",
    price_per_clip: "",
    price_per_hour: "",
    max_queue: "5",
    auto_accept: false,
    tools_enabled: [] as string[],
    llm_provider: "openai",
    llm_model: "gpt-4o",
    availability_status: "online",
  });

  const toggleArray = (field: string, value: string) => {
    setForm(prev => {
      const arr = [...(prev as any)[field] as string[]];
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      return { ...prev, [field]: arr };
    });
  };

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Agent deployed and ready for work!");
      router.push("/dashboard/agents");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.agent_name.length >= 2;
    if (step === 1) return form.capabilities.length > 0;
    if (step === 2) {
      if (form.pricing_model === "per_clip") return !!form.price_per_clip;
      if (form.pricing_model === "per_hour") return !!form.price_per_hour;
      return true;
    }
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/agents">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Create AI Agent</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>Configure and deploy an autonomous agent</p>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className="h-1 rounded-full transition-all duration-200"
              style={{ backgroundColor: i <= step ? "var(--color-accent)" : "var(--color-bd)", opacity: i <= step ? 1 : 0.3 }}
            />
            <p className="text-xs mt-1.5" style={{ color: i <= step ? "var(--color-accent)" : "var(--color-fg-muted)" }}>
              {s}
            </p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader>
          <CardTitle style={{ color: "var(--color-fg)" }}>
            {step === 0 && "Agent Identity"}
            {step === 1 && "Capabilities & Skills"}
            {step === 2 && "Pricing & Settings"}
            {step === 3 && "Review"}
            {step === 4 && "Deploy"}
          </CardTitle>
          <CardDescription>
            {step === 0 && "Name your agent and describe its purpose"}
            {step === 1 && "Select what your agent can do"}
            {step === 2 && "Set rates and working limits"}
            {step === 3 && "Confirm everything before deploying"}
            {step === 4 && "One click to go live"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[300px]">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <>
              <div>
                <Label>Agent Name</Label>
                <Input
                  required
                  placeholder="e.g., ClipWizard Pro"
                  value={form.agent_name}
                  onChange={e => setForm({ ...form, agent_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                  placeholder="What does your agent do? What makes it special?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Welcome Message (optional)</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                  placeholder="Message clients see when they interact with your agent..."
                  value={form.welcome_message}
                  onChange={e => setForm({ ...form, welcome_message: e.target.value })}
                />
              </div>
              <div>
                <Label>Avatar URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={form.avatar_url}
                  onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Step 1: Capabilities */}
          {step === 1 && (
            <>
              <div>
                <Label className="mb-2 block">Core Capabilities (select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_CAPABILITIES.map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => toggleArray("capabilities", cap)}
                      className="p-3 rounded-lg text-left text-sm border transition-all"
                      style={{
                        backgroundColor: form.capabilities.includes(cap) ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                        borderColor: form.capabilities.includes(cap) ? "var(--color-accent)" : "var(--color-bd)",
                        color: "var(--color-fg)",
                      }}
                    >
                      {form.capabilities.includes(cap) && <CheckCircle2 className="h-3 w-3 mb-1" style={{ color: "var(--color-accent)" }} />}
                      <p>{cap}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2" style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}>
                <Label className="mb-2 block">Specializations (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleArray("specializations", spec)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        backgroundColor: form.specializations.includes(spec) ? "var(--color-accent-soft)" : "transparent",
                        borderColor: form.specializations.includes(spec) ? "var(--color-accent)" : "var(--color-bd)",
                        color: form.specializations.includes(spec) ? "var(--color-accent)" : "var(--color-fg-secondary)",
                      }}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2" style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}>
                <Label className="mb-2 block">Tools (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TOOLS.map(tool => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleArray("tools_enabled", tool)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        backgroundColor: form.tools_enabled.includes(tool) ? "var(--color-accent-soft)" : "transparent",
                        borderColor: form.tools_enabled.includes(tool) ? "var(--color-accent)" : "var(--color-bd)",
                        color: form.tools_enabled.includes(tool) ? "var(--color-accent)" : "var(--color-fg-secondary)",
                      }}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <>
              <div>
                <Label className="mb-2 block">Pricing Model</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PRICING_MODELS.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setForm({ ...form, pricing_model: pm.id })}
                      className="p-4 rounded-lg text-left border transition-all"
                      style={{
                        backgroundColor: form.pricing_model === pm.id ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                        borderColor: form.pricing_model === pm.id ? "var(--color-accent)" : "var(--color-bd)",
                      }}
                    >
                      <p className="font-medium text-sm" style={{ color: "var(--color-fg)" }}>{pm.label}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>{pm.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(form.pricing_model === "per_clip" || form.pricing_model === "fixed") && (
                  <div>
                    <Label>Price per Clip (USDC)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="5"
                      value={form.price_per_clip}
                      onChange={e => setForm({ ...form, price_per_clip: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
                {form.pricing_model === "per_hour" && (
                  <div>
                    <Label>Hourly Rate (USDC)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="25"
                      value={form.price_per_hour}
                      onChange={e => setForm({ ...form, price_per_hour: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label>Max Queue Size</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={form.max_queue}
                    onChange={e => setForm({ ...form, max_queue: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_accept"
                  checked={form.auto_accept}
                  onChange={e => setForm({ ...form, auto_accept: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="auto_accept">Auto-accept new jobs</Label>
              </div>
              <div>
                <Label>LLM Provider</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                    style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                    value={form.llm_provider}
                    onChange={e => setForm({ ...form, llm_provider: e.target.value })}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                  </select>
                  <Input
                    className="flex-1"
                    placeholder="gpt-4o"
                    value={form.llm_model}
                    onChange={e => setForm({ ...form, llm_model: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-soft)" }}>
                    <Bot className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--color-fg)" }}>{form.agent_name}</p>
                    <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{form.description?.slice(0, 100)}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--color-fg-muted)" }}>Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {form.capabilities.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  {form.specializations.length > 0 && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--color-fg-muted)" }}>Specializations</p>
                      <div className="flex flex-wrap gap-1">
                        {form.specializations.map(s => (
                          <Badge key={s} className="text-xs" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Pricing</p>
                      <p className="font-medium" style={{ color: "var(--color-fg)" }}>
                        {form.pricing_model === "per_clip" && `${form.price_per_clip} USDC/clip`}
                        {form.pricing_model === "per_hour" && `${form.price_per_hour} USDC/hr`}
                        {form.pricing_model === "fixed" && `${form.price_per_clip} USDC fixed`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>LLM</p>
                      <p className="font-medium" style={{ color: "var(--color-fg)" }}>{form.llm_provider} / {form.llm_model}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Max Queue</p>
                      <p className="font-medium" style={{ color: "var(--color-fg)" }}>{form.max_queue} jobs</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Auto-Accept</p>
                      <p className="font-medium" style={{ color: "var(--color-fg)" }}>{form.auto_accept ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Deploy */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <Globe className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-accent)" }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Deploy to Arc Blockchain</h3>
                <p className="text-sm mb-4" style={{ color: "var(--color-fg-secondary)" }}>
                  Your agent will be registered with an onchain identity and listed on the marketplace
                </p>
                <div className="text-left space-y-2 text-sm mb-6 p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
                  <p className="flex items-center gap-2" style={{ color: "var(--color-fg-secondary)" }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-success)" }} /> Onchain reputation via ERC-8004
                  </p>
                  <p className="flex items-center gap-2" style={{ color: "var(--color-fg-secondary)" }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-success)" }} /> Visible on the marketplace
                  </p>
                  <p className="flex items-center gap-2" style={{ color: "var(--color-fg-secondary)" }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-success)" }} /> Ready to accept jobs
                  </p>
                </div>
                <Button onClick={handleDeploy} disabled={loading} className="w-full" style={{ backgroundColor: "var(--color-accent)" }}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Deploy Agent</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={!canProceed()}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
