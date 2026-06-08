"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NODE_STYLES } from "./workflow-types";
import { NODE_CONFIG_DEFINITIONS, getDefaultConfig, getNodeSummary } from "./node-config-registry";
import type { AgentNode, WorkflowNodeType } from "./workflow-types";
import type { ConfigField } from "./node-config-registry";

interface WorkflowNodeConfigProps {
  node: AgentNode | null;
  onUpdateConfig: (nodeId: string, key: string, value: string) => void;
  onClose: () => void;
}

export function WorkflowNodeConfig({ node, onUpdateConfig, onClose }: WorkflowNodeConfigProps) {
  const [panelWidth, setPanelWidth] = useState(360);
  const resizing = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const newWidth = startWidth - (ev.clientX - startX);
      setPanelWidth(Math.max(280, Math.min(520, newWidth)));
    };

    const onMouseUp = () => {
      resizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth]);

  useEffect(() => {
    return () => { resizing.current = false; };
  }, []);

  if (!node) {
    return (
      <div
        className="flex flex-col items-center justify-center shrink-0 transition-all duration-300"
        style={{
          width: panelWidth,
          borderLeft: "1px solid var(--color-bd)",
          backgroundColor: "var(--color-bg-elevated)",
        }}
      >
        <div className="text-center px-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "var(--color-bg-inset)" }}
          >
            <GripVertical size={20} style={{ color: "var(--color-fg-muted)" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-fg)" }}>
            No node selected
          </p>
          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
            Click a node on the canvas to configure its settings.
          </p>
        </div>
      </div>
    );
  }

  const nodeData = node.data;
  const def = NODE_CONFIG_DEFINITIONS[nodeData.type];
  const style = NODE_STYLES[nodeData.type];
  const Icon = style.icon;
  const config = nodeData.config || {};
  const summary = getNodeSummary(nodeData);

  const renderField = (field: ConfigField) => {
    const value = config[field.key] ?? field.defaultValue ?? "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onUpdateConfig(node.id, field.key, e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg transition-all duration-150"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              border: "1px solid var(--color-bd)",
              color: "var(--color-fg)",
            }}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => onUpdateConfig(node.id, field.key, e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg resize-none transition-all duration-150"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              border: "1px solid var(--color-bd)",
              color: "var(--color-fg)",
              fontFamily: value.includes("{{") ? "monospace" : "inherit",
            }}
          />
        );

      case "toggle":
        return (
          <button
            onClick={() => onUpdateConfig(node.id, field.key, value === "true" ? "false" : "true")}
            className="relative w-10 h-5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: value === "true" ? style.color : "var(--color-bd)",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm"
              style={{ left: value === "true" ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onUpdateConfig(node.id, field.key, e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg transition-all duration-150"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              border: "1px solid var(--color-bd)",
              color: "var(--color-fg)",
            }}
          >
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={parseFloat(value) || 0}
              onChange={(e) => onUpdateConfig(node.id, field.key, e.target.value)}
              className="flex-1"
              style={{ accentColor: style.color }}
            />
            <span
              className="text-xs font-mono w-12 text-right"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              {field.step && field.step < 1 ? parseFloat(value).toFixed(1) : value}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex shrink-0 overflow-hidden transition-all duration-300"
      style={{ width: panelWidth, borderLeft: "1px solid var(--color-bd)" }}
    >
      <div
        className="w-1 shrink-0 cursor-col-resize hover:opacity-80 transition-opacity flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bd)", cursor: "col-resize" }}
        onMouseDown={onMouseDown}
      >
        <div className="w-0.5 h-8 rounded-full" style={{ backgroundColor: "var(--color-fg-muted)" }} />
      </div>

      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--color-bd)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `color-mix(in oklch, ${style.color} 12%, transparent)` }}
            >
              <Icon size={13} style={{ color: style.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--color-fg)" }}>
                {style.label} Node
              </p>
              <p className="text-[9px] truncate" style={{ color: "var(--color-fg-muted)" }}>
                {summary}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
            style={{ backgroundColor: "var(--color-bg-inset)" }}
          >
            <X size={12} style={{ color: "var(--color-fg-muted)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {def.fields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium" style={{ color: "var(--color-fg-secondary)" }}>
                  {field.label}
                </label>
                {field.type === "toggle" && (
                  <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                    {(config[field.key] ?? field.defaultValue) === "true" ? "On" : "Off"}
                  </span>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid var(--color-bd)" }}
        >
          <Button
            size="sm"
            className="w-full text-xs"
            style={{ backgroundColor: style.color, color: "#000" }}
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
