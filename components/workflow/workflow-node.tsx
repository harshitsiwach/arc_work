"use client";

import { memo, type FC } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AgentNode } from "./workflow-types";
import { NODE_STYLES } from "./workflow-types";
import { getNodeSummary } from "./node-config-registry";

const WorkflowNodeComponent: FC<NodeProps<AgentNode>> = ({ data, selected }) => {
  const d = data as AgentNode["data"];
  const style = NODE_STYLES[d.type];
  const Icon = style.icon;
  const isInput = d.type === "input";
  const isOutput = d.type === "output";
  const config = d.config || {};
  const hasConfig = Object.keys(config).length > 0;
  const summary = hasConfig ? getNodeSummary(d) : null;

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-200"
      style={{
        width: 220,
        backgroundColor: "var(--color-bg-elevated)",
        border: `1px solid ${selected ? style.color : "var(--color-bd)"}`,
        boxShadow: selected ? `0 0 0 2px ${style.color}40` : "none",
        minWidth: 200,
      }}
    >
      {!isInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 10,
            height: 10,
            border: `2px solid ${style.color}`,
            backgroundColor: "var(--color-bg)",
          }}
        />
      )}

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: `color-mix(in oklch, ${style.color} 12%, transparent)`,
          borderBottom: `1px solid color-mix(in oklch, ${style.color} 20%, transparent)`,
        }}
      >
        <Icon size={14} style={{ color: style.color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: style.color }}>
          {style.label}
        </span>
      </div>

      <div className="px-3 py-2.5 space-y-1">
        <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
          {d.label}
        </p>
        {summary ? (
          <p className="text-[10px] leading-relaxed font-mono" style={{ color: style.color }}>
            {summary}
          </p>
        ) : (
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--color-fg-muted)" }}>
            {d.description}
          </p>
        )}
        {hasConfig && d.type === "prompt" && config.prompt_template?.includes("{{") && (
          <div
            className="text-[9px] px-2 py-1 rounded mt-1"
            style={{ backgroundColor: `color-mix(in oklch, ${style.color} 8%, transparent)`, color: "var(--color-fg-muted)" }}
          >
            Uses template variables
          </div>
        )}
      </div>

      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            width: 10,
            height: 10,
            border: `2px solid ${style.color}`,
            backgroundColor: "var(--color-bg)",
          }}
        />
      )}
    </div>
  );
};

export const WorkflowNode = memo(WorkflowNodeComponent);
