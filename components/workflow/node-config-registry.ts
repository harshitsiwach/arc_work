import type { WorkflowNodeType } from "./workflow-types";
import { NODE_STYLES } from "./workflow-types";

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "textarea" | "toggle" | "select" | "number";
  placeholder?: string;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface NodeConfigDefinition {
  type: WorkflowNodeType;
  fields: ConfigField[];
  color: string;
}

export const NODE_CONFIG_DEFINITIONS: Record<WorkflowNodeType, NodeConfigDefinition> = {
  input: {
    type: "input",
    color: NODE_STYLES.input.color,
    fields: [
      { key: "input_label", label: "Input Label", type: "text", placeholder: "Project Idea", defaultValue: "Input" },
      { key: "placeholder", label: "Placeholder", type: "text", placeholder: "Describe your project...", defaultValue: "" },
      { key: "required", label: "Required", type: "toggle", defaultValue: "true" },
    ],
  },
  prompt: {
    type: "prompt",
    color: NODE_STYLES.prompt.color,
    fields: [
      { key: "system_prompt", label: "System Prompt", type: "textarea", placeholder: "You are a Web3 NFT expert.", defaultValue: "" },
      { key: "prompt_template", label: "Prompt Template", type: "textarea", placeholder: "Generate NFT metadata for:\n\n{{user_input}}", defaultValue: "{{user_input}}" },
    ],
  },
  research: {
    type: "research",
    color: NODE_STYLES.research.color,
    fields: [
      {
        key: "provider", label: "Provider", type: "select", defaultValue: "Exa",
        options: [
          { label: "Exa", value: "Exa" },
          { label: "Tavily", value: "Tavily" },
          { label: "Custom", value: "Custom" },
        ],
      },
      { key: "search_query", label: "Search Query", type: "textarea", placeholder: "Latest NFT trends:\n{{user_input}}", defaultValue: "" },
      { key: "max_results", label: "Max Results", type: "number", defaultValue: "5", min: 1, max: 50 },
    ],
  },
  llm: {
    type: "llm",
    color: NODE_STYLES.llm.color,
    fields: [
      {
        key: "provider", label: "Provider", type: "select", defaultValue: "Claude",
        options: [
          { label: "OpenAI", value: "OpenAI" },
          { label: "Claude", value: "Claude" },
          { label: "Gemini", value: "Gemini" },
          { label: "Venice", value: "Venice" },
        ],
      },
      { key: "model", label: "Model Name", type: "text", placeholder: "claude-sonnet-4", defaultValue: "claude-sonnet-4" },
      { key: "temperature", label: "Temperature", type: "number", defaultValue: "0.7", min: 0, max: 2, step: 0.1 },
      { key: "max_tokens", label: "Max Tokens", type: "number", defaultValue: "4096", min: 1, max: 128000 },
    ],
  },
  image: {
    type: "image",
    color: NODE_STYLES.image.color,
    fields: [
      {
        key: "provider", label: "Provider", type: "select", defaultValue: "OpenAI",
        options: [
          { label: "OpenAI", value: "OpenAI" },
          { label: "Stability", value: "Stability" },
          { label: "Fal", value: "Fal" },
        ],
      },
      { key: "style", label: "Style", type: "text", placeholder: "photorealistic, cinematic, anime, ...", defaultValue: "" },
      {
        key: "image_size", label: "Image Size", type: "select", defaultValue: "1024x1024",
        options: [
          { label: "256×256", value: "256x256" },
          { label: "512×512", value: "512x512" },
          { label: "1024×1024", value: "1024x1024" },
          { label: "1792×1024", value: "1792x1024" },
        ],
      },
    ],
  },
  code: {
    type: "code",
    color: NODE_STYLES.code.color,
    fields: [
      {
        key: "language", label: "Language", type: "select", defaultValue: "Solidity",
        options: [
          { label: "Solidity", value: "Solidity" },
          { label: "TypeScript", value: "TypeScript" },
          { label: "JavaScript", value: "JavaScript" },
          { label: "Python", value: "Python" },
        ],
      },
      { key: "instructions", label: "Instructions", type: "textarea", placeholder: "Write a function that...", defaultValue: "" },
    ],
  },
  validation: {
    type: "validation",
    color: NODE_STYLES.validation.color,
    fields: [
      { key: "validation_rule", label: "Validation Rule", type: "textarea", placeholder: "Output must contain valid JSON.", defaultValue: "" },
      { key: "retry_count", label: "Retry Count", type: "number", defaultValue: "3", min: 0, max: 10 },
    ],
  },
  output: {
    type: "output",
    color: NODE_STYLES.output.color,
    fields: [
      { key: "output_title", label: "Output Title", type: "text", placeholder: "Generated Output", defaultValue: "Output" },
      {
        key: "output_format", label: "Output Format", type: "select", defaultValue: "Markdown",
        options: [
          { label: "Text", value: "Text" },
          { label: "Markdown", value: "Markdown" },
          { label: "JSON", value: "JSON" },
          { label: "Image", value: "Image" },
        ],
      },
    ],
  },
};

export function getDefaultConfig(type: WorkflowNodeType): Record<string, string> {
  const def = NODE_CONFIG_DEFINITIONS[type];
  const config: Record<string, string> = {};
  for (const field of def.fields) {
    if (field.defaultValue !== undefined) {
      config[field.key] = field.defaultValue;
    }
  }
  return config;
}

export function getNodeSummary(data: { type: WorkflowNodeType; config?: Record<string, string> }): string {
  const cfg = data.config || {};
  switch (data.type) {
    case "input":
      return `Label: ${cfg.input_label || "Input"}${cfg.required === "true" ? " · Required" : ""}`;
    case "prompt": {
      const sp = cfg.system_prompt || "";
      return sp ? sp.slice(0, 50) + (sp.length > 50 ? "…" : "") : "Prompt template ready";
    }
    case "research":
      return `${cfg.provider || "Exa"} · ${(cfg.search_query || "").slice(0, 30) || "query pending"}`;
    case "llm":
      return `${cfg.provider || "Claude"} · ${cfg.model || "claude-sonnet-4"} · ${cfg.temperature || "0.7"}t`;
    case "image":
      return `${cfg.provider || "OpenAI"}${cfg.style ? ` · ${cfg.style}` : ""} · ${cfg.image_size || "1024x1024"}`;
    case "code":
      return `${cfg.language || "Solidity"}${cfg.instructions ? ` · ${cfg.instructions.slice(0, 30)}` : ""}`;
    case "validation":
      return (cfg.validation_rule || "").slice(0, 50) + ((cfg.validation_rule || "").length > 50 ? "…" : "") || "No rule set";
    case "output":
      return `${cfg.output_title || "Output"} · ${cfg.output_format || "Markdown"}`;
    default:
      return "";
  }
}
