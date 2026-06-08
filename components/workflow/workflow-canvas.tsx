"use client";

import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkflowNode } from "./workflow-node";
import {
  NODE_STYLES, SAVE_KEY,
  type WorkflowNodeType,
  type AgentNode,
  type AgentEdge,
} from "./workflow-types";

interface WorkflowCanvasProps {
  nodes: AgentNode[];
  edges: AgentEdge[];
  onNodesChange: (updater: AgentNode[] | ((prev: AgentNode[]) => AgentNode[])) => void;
  onEdgesChange: (updater: AgentEdge[] | ((prev: AgentEdge[]) => AgentEdge[])) => void;
  onNodeClick?: NodeMouseHandler<AgentNode>;
  onPaneClick?: () => void;
}

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: "var(--color-bd)", strokeWidth: 2 },
  markerEnd: { type: "arrowclosed" as const, color: "var(--color-bd)" },
};

const nodeTypes: NodeTypes = {
  input: WorkflowNode as any,
  prompt: WorkflowNode as any,
  research: WorkflowNode as any,
  llm: WorkflowNode as any,
  image: WorkflowNode as any,
  code: WorkflowNode as any,
  validation: WorkflowNode as any,
  output: WorkflowNode as any,
};

export function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onNodeClick, onPaneClick }: WorkflowCanvasProps) {
  const rfInstance = useRef<ReactFlowInstance<AgentNode, AgentEdge> | null>(null);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange((prev: AgentNode[]) => applyNodeChanges(changes, prev) as AgentNode[]);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange((prev: AgentEdge[]) => applyEdgeChanges(changes, prev) as AgentEdge[]);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      onEdgesChange((prev: AgentEdge[]) => addEdge(connection, prev) as AgentEdge[]);
    },
    [onEdgesChange]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow") as WorkflowNodeType;
      if (!type || !NODE_STYLES[type] || !rfInstance.current) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const style = NODE_STYLES[type];
      const newNode: AgentNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: style.label, description: style.description, type },
      };

      onNodesChange((prev: AgentNode[]) => [...prev, newNode]);
    },
    [onNodesChange]
  );

  const onInit = useCallback((instance: ReactFlowInstance<AgentNode, AgentEdge>) => {
    rfInstance.current = instance;
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes?.length) {
          onNodesChange(parsed.nodes as AgentNode[]);
          onEdgesChange(parsed.edges as AgentEdge[]);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode="Backspace"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="var(--color-bd)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node: any) => {
            const s = NODE_STYLES[node.type as WorkflowNodeType];
            return s ? s.color : "var(--color-fg-muted)";
          }}
          maskColor="var(--color-bg)"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-bd)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
