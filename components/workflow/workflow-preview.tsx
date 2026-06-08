"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkflowState } from "./workflow-types";

interface WorkflowPreviewProps {
  workflow: WorkflowState;
}

export function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(workflow, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="shrink-0 transition-all duration-200"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderTop: "1px solid var(--color-bd)",
      }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold" style={{ color: "var(--color-fg-secondary)" }}>
            Workflow JSON
          </span>
          <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
            {new Blob([json]).size} bytes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            >
              {copied ? <Check size={11} style={{ color: "oklch(0.75 0.18 125)" }} /> : <Copy size={11} />}
            </Button>
          )}
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 overflow-auto" style={{ maxHeight: 200 }}>
          <pre
            className="text-[11px] leading-relaxed p-3 rounded-lg overflow-x-auto"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              border: "1px solid var(--color-bd)",
              color: "var(--color-fg-secondary)",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
