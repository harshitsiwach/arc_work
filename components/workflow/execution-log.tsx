"use client";

import { CheckCircle2, XCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { NODE_STYLES } from "./workflow-types";
import type { ExecutionStep } from "@/lib/workflows/types";

interface ExecutionLogProps {
  steps: ExecutionStep[];
}

const statusConfig = {
  pending: { icon: Clock, color: "var(--color-fg-muted)", label: "Pending" },
  running: { icon: Loader2, color: "oklch(0.60 0.16 240)", label: "Running" },
  completed: { icon: CheckCircle2, color: "oklch(0.75 0.18 125)", label: "Completed" },
  failed: { icon: XCircle, color: "oklch(0.60 0.18 30)", label: "Failed" },
};

function formatTime(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", { minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
}

function duration(start?: number, end?: number): string {
  if (!start || !end) return "—";
  const diff = end - start;
  return diff < 1000 ? `${diff}ms` : `${(diff / 1000).toFixed(1)}s`;
}

function formatOutput(output: unknown): string {
  try {
    const s = JSON.stringify(output, null, 2);
    return s ?? "";
  } catch {
    return String(output ?? "");
  }
}

export function ExecutionLog({ steps }: ExecutionLogProps) {
  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Clock size={32} style={{ color: "var(--color-fg-muted)" }} />
        <p className="text-sm mt-3" style={{ color: "var(--color-fg-muted)" }}>
          Run the workflow to see execution logs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const style = NODE_STYLES[step.nodeType];
        const isRunning = step.status === "running";
        const isFailed = step.status === "failed";
        const isLast = i === steps.length - 1;
        const outputStr = step.status === "completed" && step.output ? formatOutput(step.output) : null;

        return (
          <div key={step.nodeId}>
            <div
              className="rounded-xl p-3 transition-all duration-300"
              style={{
                backgroundColor: isRunning
                  ? `color-mix(in oklch, ${config.color} 8%, transparent)`
                  : "var(--color-bg-inset)",
                border: `1px solid ${
                  isFailed ? config.color : isRunning ? config.color : "var(--color-bd)"
                }`,
                opacity: step.status === "pending" ? 0.4 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${style.color} 12%, transparent)`,
                  }}
                >
                  <Icon
                    size={13}
                    style={{
                      color: config.color,
                      animation: isRunning ? "spin 1s linear infinite" : undefined,
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
                      {step.nodeName}
                    </span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${style.color} 10%, transparent)`,
                        color: style.color,
                      }}
                    >
                      {step.nodeType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                    <span>
                      {config.label} · {duration(step.startedAt, step.completedAt)}
                    </span>
                    {step.startedAt && (
                      <span>started {formatTime(step.startedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono shrink-0" style={{ color: "var(--color-fg-muted)" }}>
                  #{i + 1}
                </div>
              </div>

              {outputStr && (
                <div
                  className="mt-2 text-[10px] p-2 rounded-lg overflow-x-auto"
                  style={{ backgroundColor: "var(--color-bg)", color: "var(--color-fg-secondary)" }}
                >
                  <pre style={{ fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}>
                    {outputStr.slice(0, 300)}
                    {outputStr.length > 300 ? "…" : ""}
                  </pre>
                </div>
              )}

              {step.error && (
                <div
                  className="mt-2 text-[10px] p-2 rounded-lg"
                  style={{ backgroundColor: "oklch(0.60 0.18 30 / 0.1)", color: config.color }}
                >
                  {step.error}
                </div>
              )}
            </div>

            {!isLast && (
              <div className="flex justify-center py-1">
                <ArrowRight size={12} style={{ color: "var(--color-fg-muted)" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
