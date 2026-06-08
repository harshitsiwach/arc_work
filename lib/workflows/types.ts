import type { WorkflowState, WorkflowNodeType, AgentNode, AgentEdge } from "@/components/workflow/workflow-types";

export type { WorkflowState, WorkflowNodeType, AgentNode, AgentEdge };

export interface ExecutionStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  nodeName: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: number;
  completedAt?: number;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  steps: ExecutionStep[];
  output?: Record<string, unknown>;
  error?: string;
}

export type NodeExecutor = (
  node: AgentNode,
  inputs: Record<string, unknown>
) => Promise<{ output: unknown }>;

export type OnStepUpdate = (step: ExecutionStep) => void;
