import type { Node, Edge } from "@xyflow/react";

export type WorkflowNodeType =
  | "input"
  | "prompt"
  | "research"
  | "llm"
  | "image"
  | "code"
  | "validation"
  | "output";

export interface WorkflowNodeData {
  label: string;
  description: string;
  type: WorkflowNodeType;
  config?: Record<string, string>;
  [key: string]: unknown;
}

export type AgentNode = Node<WorkflowNodeData>;
export type AgentEdge = Edge;

export interface WorkflowState {
  nodes: AgentNode[];
  edges: AgentEdge[];
}

import {
  Terminal, MessageSquare, Search, Brain, Image, Code2, Shield, FileOutput,
  type LucideIcon,
} from "lucide-react";

export const NODE_STYLES: Record<WorkflowNodeType, { color: string; icon: LucideIcon; label: string; description: string }> = {
  input:      { color: "oklch(0.55 0.15 120)", icon: Terminal,      label: "Input",      description: "Define input parameters" },
  prompt:     { color: "oklch(0.60 0.16 240)", icon: MessageSquare, label: "Prompt",     description: "Prompt template" },
  research:   { color: "oklch(0.65 0.18 30)",  icon: Search,        label: "Research",   description: "Fetch and analyze data" },
  llm:        { color: "oklch(0.55 0.15 280)", icon: Brain,         label: "LLM",        description: "Call language model" },
  image:      { color: "oklch(0.60 0.12 320)", icon: Image,         label: "Image",      description: "Generate or process images" },
  code:       { color: "oklch(0.65 0.16 80)",  icon: Code2,         label: "Code",       description: "Execute code" },
  validation: { color: "oklch(0.75 0.18 125)", icon: Shield,        label: "Validation", description: "Validate outputs" },
  output:     { color: "oklch(0.55 0 0)",       icon: FileOutput,    label: "Output",     description: "Final output" },
};

export const NODE_TYPES_LIST: WorkflowNodeType[] = [
  "input", "prompt", "research", "llm", "image", "code", "validation", "output",
];

export const SAVE_KEY = "arcwork-workflow-state";
