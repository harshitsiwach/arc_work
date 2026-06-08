"use client";

import { ArrowLeft, Save, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import type { WorkflowState } from "./workflow-types";

interface WorkflowToolbarProps {
  workflow: WorkflowState;
  onClear: () => void;
  agentName: string;
  onAgentNameChange: (name: string) => void;
}

export function WorkflowToolbar({ workflow, onClear, agentName, onAgentNameChange }: WorkflowToolbarProps) {
  const handleSave = () => {
    try {
      localStorage.setItem("arcwork-workflow-state", JSON.stringify({ ...workflow, name: agentName }));
      toast.success("Workflow saved to local storage");
    } catch {
      toast.error("Failed to save workflow");
    }
  };

  const nodeCount = workflow.nodes.length;
  const edgeCount = workflow.edges.length;
  const hasInput = workflow.nodes.some((n) => n.type === "input");
  const hasOutput = workflow.nodes.some((n) => n.type === "output");

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 shrink-0 gap-4"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderBottom: "1px solid var(--color-bd)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard/my-agents">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft size={14} />
            Back
          </Button>
        </Link>
        <span className="w-px h-5 shrink-0" style={{ backgroundColor: "var(--color-bd)" }} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-fg)" }}>
            Workflow Builder
          </p>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
            <span>{nodeCount} node{nodeCount !== 1 ? "s" : ""}</span>
            <span>{edgeCount} connection{edgeCount !== 1 ? "s" : ""}</span>
            {!hasInput && (
              <span className="flex items-center gap-1" style={{ color: "oklch(0.70 0.19 50)" }}>
                <AlertTriangle size={10} />
                Missing Input Node
              </span>
            )}
            {!hasOutput && (
              <span className="flex items-center gap-1" style={{ color: "oklch(0.70 0.19 50)" }}>
                <AlertTriangle size={10} />
                Missing Output Node
              </span>
            )}
            {hasInput && hasOutput && nodeCount > 0 && (
              <span className="flex items-center gap-1" style={{ color: "oklch(0.75 0.18 125)" }}>
                <CheckCircle2 size={10} />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <input
          value={agentName}
          onChange={(e) => onAgentNameChange(e.target.value)}
          placeholder="Untitled Agent"
          className="text-xs px-3 py-1.5 rounded-lg w-40 transition-all duration-200"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            border: "1px solid var(--color-bd)",
            color: "var(--color-fg)",
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={onClear}
        >
          <Trash2 size={12} />
          Clear
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          style={{ backgroundColor: "var(--color-accent)" }}
          onClick={handleSave}
        >
          <Save size={12} />
          Save
        </Button>
      </div>
    </div>
  );
}
