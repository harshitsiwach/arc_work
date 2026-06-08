"use client";

import { type DragEvent } from "react";
import { NODE_STYLES, NODE_TYPES_LIST, type WorkflowNodeType } from "./workflow-types";

export function WorkflowSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className="flex flex-col overflow-y-auto shrink-0"
      style={{
        width: 220,
        borderRight: "1px solid var(--color-bd)",
        backgroundColor: "var(--color-bg-elevated)",
      }}
    >
      <div className="px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: "var(--color-fg-muted)" }}>
          Nodes
        </p>
        <div className="space-y-1.5">
          {NODE_TYPES_LIST.map((type) => {
            const style = NODE_STYLES[type];
            const Icon = style.icon;
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 hover-lift"
                style={{
                  backgroundColor: "var(--color-bg-inset)",
                  border: "1px solid var(--color-bd)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in oklch, ${style.color} 12%, transparent)` }}
                >
                  <Icon size={13} style={{ color: style.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
                    {style.label}
                  </p>
                  <p className="text-[9px] truncate" style={{ color: "var(--color-fg-muted)" }}>
                    {style.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-auto mx-3 mb-3 p-2.5 rounded-lg text-[10px] leading-relaxed"
        style={{
          backgroundColor: "var(--color-bg-inset)",
          border: "1px dashed var(--color-bd)",
          color: "var(--color-fg-muted)",
        }}
      >
        Drag nodes onto the canvas and connect them to build your workflow.
      </div>
    </aside>
  );
}
