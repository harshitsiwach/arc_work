"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play, Square, Download, ArrowLeft, RefreshCw,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ExecutionLog } from "@/components/workflow/execution-log";
import { executeWorkflow } from "@/lib/workflows/executor";
import type { ExecutionStep } from "@/lib/workflows/types";

const DEFAULT_WORKFLOW = JSON.stringify(
  {
    nodes: [
      { id: "input-1", type: "input", position: { x: 250, y: 0 }, data: { label: "Input", description: "Define input parameters", type: "input", config: { input_label: "Project Idea", placeholder: "Describe your project...", required: "true" } } },
      { id: "prompt-1", type: "prompt", position: { x: 250, y: 120 }, data: { label: "Prompt", description: "Prompt template", type: "prompt", config: { system_prompt: "You are a Web3 expert.", prompt_template: "Analyze this project: {{user_input}}" } } },
      { id: "llm-1", type: "llm", position: { x: 250, y: 260 }, data: { label: "LLM", description: "Call language model", type: "llm", config: { provider: "Claude", model: "claude-sonnet-4", temperature: "0.7", max_tokens: "4096" } } },
      { id: "validation-1", type: "validation", position: { x: 250, y: 400 }, data: { label: "Validation", description: "Validate outputs", type: "validation", config: { validation_rule: "Output must be non-empty", retry_count: "3" } } },
      { id: "output-1", type: "output", position: { x: 250, y: 540 }, data: { label: "Output", description: "Final output", type: "output", config: { output_title: "Analysis Result", output_format: "Markdown" } } },
    ],
    edges: [
      { id: "e-input-prompt", source: "input-1", target: "prompt-1" },
      { id: "e-prompt-llm", source: "prompt-1", target: "llm-1" },
      { id: "e-llm-validation", source: "llm-1", target: "validation-1" },
      { id: "e-validation-output", source: "validation-1", target: "output-1" },
    ],
  },
  null,
  2
);

export default function WorkflowTestPage() {
  const [workflowJson, setWorkflowJson] = useState(DEFAULT_WORKFLOW);
  const [userInput, setUserInput] = useState("A decentralized NFT marketplace on Arc");
  const [running, setRunning] = useState(false);
  const [abort, setAbort] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [finalOutput, setFinalOutput] = useState<Record<string, unknown> | undefined>(undefined);
  const [parseError, setParseError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const handleStepUpdate = useCallback((step: ExecutionStep) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.nodeId === step.nodeId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = step;
        return next;
      }
      return [...prev, step];
    });
  }, []);

  const handleRun = useCallback(async () => {
    setSteps([]);
    setFinalOutput(undefined);
    setParseError(null);
    setAbort(false);

    let parsed: any;
    try {
      parsed = JSON.parse(workflowJson);
      if (!parsed.nodes || !parsed.edges) {
        throw new Error("Workflow must contain 'nodes' and 'edges' arrays");
      }
    } catch (err: any) {
      setParseError(err.message);
      toast.error("Invalid workflow JSON");
      return;
    }

    const hasInput = parsed.nodes.some((n: any) => n.type === "input");
    const hasOutput = parsed.nodes.some((n: any) => n.type === "output");
    if (!hasInput || !hasOutput) {
      toast.error("Workflow must have both an Input and Output node");
      return;
    }

    setRunning(true);
    try {
      const result = await executeWorkflow(
        { nodes: parsed.nodes, edges: parsed.edges },
        { default: userInput, user_input: userInput },
        handleStepUpdate
      );

      if (abort) {
        toast.info("Execution aborted");
        setRunning(false);
        return;
      }

      if (result.success) {
        setFinalOutput(result.output);
        toast.success("Workflow completed successfully");
      } else {
        toast.error(result.error || "Workflow execution failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setRunning(false);
    }
  }, [workflowJson, userInput, handleStepUpdate, abort]);

  const handleAbort = useCallback(() => {
    setAbort(true);
    setRunning(false);
  }, []);

  const handleLoadSample = useCallback(() => {
    setWorkflowJson(DEFAULT_WORKFLOW);
    toast.info("Sample workflow loaded");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/my-agents">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs mb-2">
              <ArrowLeft size={14} />
              Back to My Agents
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            Workflow Test Runner
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Execute workflows with mock data to validate your agent logic
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleLoadSample}>
          <RefreshCw size={12} />
          Load Sample
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
                Workflow JSON
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={workflowJson}
                onChange={(e) => { setWorkflowJson(e.target.value); setParseError(null); }}
                className="w-full rounded-lg text-xs font-mono leading-relaxed resize-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-bg-inset)",
                  border: `1px solid ${parseError ? "oklch(0.60 0.18 30)" : "var(--color-bd)"}`,
                  color: "var(--color-fg)",
                  minHeight: 280,
                  padding: 12,
                }}
                spellCheck={false}
              />
              {parseError && (
                <p className="text-[11px] mt-1" style={{ color: "oklch(0.60 0.18 30)" }}>
                  {parseError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
                User Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter input for the workflow..."
                className="w-full rounded-lg text-xs px-3 py-2 resize-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-bg-inset)",
                  border: "1px solid var(--color-bd)",
                  color: "var(--color-fg)",
                  minHeight: 60,
                }}
                rows={2}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            {!running ? (
              <Button
                className="gap-2"
                style={{ backgroundColor: "oklch(0.75 0.18 125)", color: "#000" }}
                onClick={handleRun}
              >
                <Play size={14} />
                Run Workflow
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                style={{ color: "oklch(0.60 0.18 30)", borderColor: "oklch(0.60 0.18 30)" }}
                onClick={handleAbort}
              >
                <Square size={14} />
                Stop
              </Button>
            )}
            {steps.length > 0 && !running && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setSteps([]);
                  setFinalOutput(undefined);
                }}
              >
                <RefreshCw size={12} />
                Clear Logs
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
                  Execution Log
                </CardTitle>
                {running && (
                  <span className="text-[10px] flex items-center gap-1" style={{ color: "oklch(0.60 0.16 240)" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "oklch(0.60 0.16 240)" }} />
                    Running
                  </span>
                )}
                {!running && steps.length > 0 && (
                  <span className="text-[10px] flex items-center gap-1" style={{ color: "oklch(0.75 0.18 125)" }}>
                    <CheckCircle2 size={10} />
                    {steps.every((s) => s.status === "completed") ? "Completed" : "Stopped"}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div ref={logRef} className="max-h-[400px] overflow-y-auto">
                <ExecutionLog steps={steps} />
              </div>
            </CardContent>
          </Card>

          {finalOutput && (
            <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                  <CheckCircle2 size={12} style={{ color: "oklch(0.75 0.18 125)" }} />
                  Final Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(finalOutput, null, 2));
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Download size={10} />
                    Copy
                  </Button>
                </div>
                <pre
                  className="text-[10px] leading-relaxed p-3 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto"
                  style={{
                    backgroundColor: "var(--color-bg-inset)",
                    border: "1px solid var(--color-bd)",
                    color: "var(--color-fg-secondary)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {JSON.stringify(finalOutput, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {steps.length > 0 && !finalOutput && !running && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: "oklch(0.60 0.18 30 / 0.1)",
                border: "1px solid oklch(0.60 0.18 30 / 0.3)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "oklch(0.60 0.18 30)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "oklch(0.60 0.18 30)" }}>
                  Execution failed or incomplete
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                  Check the log above for details on which node failed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
