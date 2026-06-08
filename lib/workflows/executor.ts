import type {
  WorkflowState,
  WorkflowNodeType,
  AgentNode,
  AgentEdge,
  ExecutionStep,
  ExecutionResult,
  NodeExecutor,
  OnStepUpdate,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getExecutionOrder(nodes: AgentNode[], edges: AgentEdge[]): AgentNode[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const ordered: AgentNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodes.find((n) => n.id === id);
    if (node) ordered.push(node);

    for (const neighbor of adjacency.get(id) || []) {
      const deg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  return ordered;
}

function resolveTemplate(template: string, inputs: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = inputs[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

const NODE_EXECUTORS: Record<string, NodeExecutor> = {
  input: async (node, inputs) => {
    const label = node.data.config?.input_label || "Input";
    const value = inputs[label] || inputs.default || "";
    return { output: value };
  },

  prompt: async (node, inputs) => {
    const systemPrompt = node.data.config?.system_prompt || "";
    const template = node.data.config?.prompt_template || "{{user_input}}";
    const rendered = resolveTemplate(template, inputs);
    return {
      output: {
        systemPrompt,
        prompt: rendered,
      },
    };
  },

  research: async (node, inputs) => {
    const rawQuery = node.data.config?.search_query || "";
    const query = resolveTemplate(rawQuery, inputs);
    const maxResults = parseInt(node.data.config?.max_results || "5", 10);
    await delay(800);

    const results = Array.from({ length: Math.min(maxResults, 3) }, (_, i) => ({
      title: `Mock Result ${i + 1} for "${query.slice(0, 30)}"`,
      snippet: `Simulated research finding #${i + 1}. This contains relevant information about the query.`,
      url: `https://example.com/result-${i + 1}`,
    }));

    return { output: { query, results } };
  },

  llm: async (node, inputs) => {
    const provider = node.data.config?.provider || "Claude";
    const model = node.data.config?.model || "claude-sonnet-4";
    const temperature = node.data.config?.temperature || "0.7";
    const maxTokens = parseInt(node.data.config?.max_tokens || "4096", 10);
    await delay(1500);

    return {
      output: {
        provider,
        model,
        temperature: parseFloat(temperature),
        maxTokens,
        content: `[Mock ${provider} ${model} response]\n\nThis is a simulated AI response generated at temperature ${temperature}.\n\nIn production, this would call the actual ${provider} API with the provided prompt and configuration.`,
        usage: { promptTokens: 150, completionTokens: 200, totalTokens: 350 },
      },
    };
  },

  image: async (node, _inputs) => {
    const provider = node.data.config?.provider || "OpenAI";
    const style = node.data.config?.style || "";
    const imageSize = node.data.config?.image_size || "1024x1024";
    await delay(1000);

    return {
      output: {
        provider,
        style,
        imageSize,
        url: `https://mock-image-server.arcwork.ai/generated/${Date.now()}.png`,
        alt: style ? `Generated image in ${style} style` : "Generated image",
      },
    };
  },

  code: async (node, inputs) => {
    const language = node.data.config?.language || "Solidity";
    const instructions = node.data.config?.instructions || "";
    await delay(500);

    const codeTemplates: Record<string, string> = {
      Solidity: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract Generated {\n    address public owner;\n\n    constructor() {\n        owner = msg.sender;\n    }\n\n    function execute() external returns (bool) {\n        return true;\n    }\n}`,
      TypeScript: `// Generated TypeScript\ninterface Config {\n  name: string;\n  version: string;\n}\n\nasync function execute(config: Config): Promise<void> {\n  console.log(\"Executing:\", config.name);\n}\n\nexport { execute, type Config };`,
      JavaScript: `// Generated JavaScript\nasync function execute(input) {\n  return {\n    success: true,\n    data: input,\n    timestamp: Date.now(),\n  };\n}\n\nmodule.exports = { execute };`,
      Python: `# Generated Python\ndef execute(data: dict) -> dict:\n    return {\n        "success": True,\n        "data": data,\n        "timestamp": __import__('time').time()\n    }`,
    };

    return {
      output: {
        language,
        instructions,
        code: codeTemplates[language] || `// ${language} code generated by Arcwork Agent`,
      },
    };
  },

  validation: async (node, inputs) => {
    const rule = node.data.config?.validation_rule || "";
    const retryCount = parseInt(node.data.config?.retry_count || "3", 10);
    const previousOutput = inputs.previousOutput;

    const passed = previousOutput !== undefined && previousOutput !== null && previousOutput !== "";

    return {
      output: {
        passed,
        rule,
        retriesLeft: passed ? 0 : Math.max(0, retryCount - 1),
        error: passed ? null : "Validation check triggered — retrying with adjusted parameters",
        validatedValue: passed ? previousOutput : null,
      },
    };
  },

  output: async (node, inputs) => {
    const title = node.data.config?.output_title || "Output";
    const format = node.data.config?.output_format || "Markdown";
    const content = inputs.previousOutput ?? inputs;

    return {
      output: {
        title,
        format,
        content,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export async function executeWorkflow(
  workflow: WorkflowState,
  userInput: Record<string, string>,
  onStepUpdate?: OnStepUpdate
): Promise<ExecutionResult> {
  const order = getExecutionOrder(workflow.nodes, workflow.edges);
  const steps: ExecutionStep[] = [];
  const nodeOutputs: Record<string, unknown> = {};

  if (order.length === 0) {
    return { success: false, steps: [], error: "Workflow has no nodes to execute" };
  }

  for (const node of order) {
    const nodeType = node.type as WorkflowNodeType;
    const step: ExecutionStep = {
      nodeId: node.id,
      nodeType,
      nodeName: node.data.label || nodeType,
      status: "running",
      startedAt: Date.now(),
      input: { ...userInput, ...nodeOutputs },
    };

    steps.push(step);
    onStepUpdate?.({ ...step });

    try {
      const executor = NODE_EXECUTORS[nodeType];
      if (!executor) {
        throw new Error(`No executor registered for node type: ${nodeType}`);
      }

      const result = await executor(node, { ...userInput, ...nodeOutputs });

      step.status = "completed";
      step.completedAt = Date.now();
      step.output = result.output;
      onStepUpdate?.({ ...step });

      nodeOutputs[node.id] = result.output;
      nodeOutputs.previousOutput = result.output;
    } catch (err) {
      step.status = "failed";
      step.completedAt = Date.now();
      step.error = (err as Error).message;
      onStepUpdate?.({ ...step });

      return {
        success: false,
        steps,
        error: `Node "${node.data.label || nodeType}" failed: ${(err as Error).message}`,
      };
    }
  }

  return { success: true, steps, output: nodeOutputs };
}
