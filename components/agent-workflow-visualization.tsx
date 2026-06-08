"use client";

import { ArrowDown } from "lucide-react";

interface WorkflowStep {
  label: string;
  description: string;
}

interface AgentWorkflowVisualizationProps {
  steps: WorkflowStep[];
}

const stepColors = [
  { bg: "oklch(0.55 0.15 120 / 0.1)", border: "oklch(0.55 0.15 120 / 0.3)", text: "oklch(0.65 0.18 120)" },
  { bg: "oklch(0.75 0.18 125 / 0.1)", border: "oklch(0.75 0.18 125 / 0.3)", text: "oklch(0.75 0.18 125)" },
  { bg: "oklch(0.60 0.16 240 / 0.1)", border: "oklch(0.60 0.16 240 / 0.3)", text: "oklch(0.65 0.18 240)" },
  { bg: "oklch(0.65 0.18 30 / 0.1)", border: "oklch(0.65 0.18 30 / 0.3)", text: "oklch(0.65 0.18 30)" },
  { bg: "oklch(0.65 0.16 80 / 0.1)", border: "oklch(0.65 0.16 80 / 0.3)", text: "oklch(0.65 0.16 80)" },
];

export function AgentWorkflowVisualization({ steps }: AgentWorkflowVisualizationProps) {
  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-full max-w-md rounded-xl p-4 relative"
            style={{
              backgroundColor: stepColors[i % stepColors.length].bg,
              border: `1px solid ${stepColors[i % stepColors.length].border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: stepColors[i % stepColors.length].border,
                  color: stepColors[i % stepColors.length].text,
                }}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
                  {step.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-fg-secondary)" }}>
                  {step.description}
                </p>
              </div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex flex-col items-center py-1">
              <div
                className="w-[2px] h-6"
                style={{ backgroundColor: stepColors[i % stepColors.length].border }}
              />
              <ArrowDown
                size={14}
                style={{ color: stepColors[i % stepColors.length].text, marginTop: -2 }}
              />
              <div
                className="w-[2px] h-6"
                style={{ backgroundColor: stepColors[(i + 1) % stepColors.length].border }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
