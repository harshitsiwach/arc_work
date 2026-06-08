"use client";

import { useState, useCallback, useEffect } from "react";
import { type NodeMouseHandler } from "@xyflow/react";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowSidebar } from "@/components/workflow/workflow-sidebar";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { WorkflowPreview } from "@/components/workflow/workflow-preview";
import { WorkflowNodeConfig } from "@/components/workflow/workflow-node-config";
import type { AgentNode, AgentEdge } from "@/components/workflow/workflow-types";

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<AgentNode[]>([]);
  const [edges, setEdges] = useState<AgentEdge[]>([]);
  const [agentName, setAgentName] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodesChange = useCallback(
    (updater: AgentNode[] | ((prev: AgentNode[]) => AgentNode[])) => {
      setNodes(updater);
    },
    []
  );

  const handleEdgesChange = useCallback(
    (updater: AgentEdge[] | ((prev: AgentEdge[]) => AgentEdge[])) => {
      setEdges(updater);
    },
    []
  );

  const handleNodeClick: NodeMouseHandler<AgentNode> = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleUpdateConfig = useCallback((nodeId: string, key: string, value: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        return {
          ...node,
          data: {
            ...node.data,
            config: { ...(node.data.config || {}), [key]: value },
          },
        };
      })
    );
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setAgentName("");
    setSelectedNodeId(null);
  }, []);

  useEffect(() => {
    if (selectedNodeId && !nodes.find((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null;

  return (
    <div
      style={{
        margin: "-2rem -1rem -6rem -1rem",
        height: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <WorkflowToolbar
        workflow={{ nodes, edges }}
        onClear={handleClear}
        agentName={agentName}
        onAgentNameChange={setAgentName}
      />

      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />

        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          />
        </div>

        <WorkflowNodeConfig
          node={selectedNode}
          onUpdateConfig={handleUpdateConfig}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <WorkflowPreview workflow={{ nodes, edges }} />
    </div>
  );
}
