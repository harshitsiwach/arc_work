"use client";

import { Search, Bot, User, GitMerge, Palette, Code, FileText, BrainCircuit, Megaphone } from "lucide-react";

export type CollaborationFilter = "all" | "ai-agent" | "human" | "hybrid";
export type CategoryFilter = "all" | "design" | "development" | "content" | "research" | "marketing";

interface BountyFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  collaboration: CollaborationFilter;
  onCollaborationChange: (v: CollaborationFilter) => void;
  category: CategoryFilter;
  onCategoryChange: (v: CategoryFilter) => void;
}

const COLLAB_FILTERS: { value: CollaborationFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: Search },
  { value: "ai-agent", label: "AI Only", icon: Bot },
  { value: "human", label: "Human Only", icon: User },
  { value: "hybrid", label: "Human + AI", icon: GitMerge },
];

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "content", label: "Content" },
  { value: "research", label: "Research" },
  { value: "marketing", label: "Marketing" },
];

export function BountyFilters({
  search, onSearchChange,
  collaboration, onCollaborationChange,
  category, onCategoryChange,
}: BountyFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-fg-muted)" }}
        />
        <input
          type="text"
          placeholder="Search bounties..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm outline-none transition-all"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            borderColor: "var(--color-bd)",
            color: "var(--color-fg)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--color-accent-soft)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-bd)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {COLLAB_FILTERS.map((f) => {
          const active = collaboration === f.value;
          const Icon = f.icon;
          return (
            <button
              key={f.value}
              onClick={() => onCollaborationChange(f.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                backgroundColor: active ? "var(--color-accent-soft)" : "transparent",
                borderColor: active ? "var(--color-accent)" : "var(--color-bd)",
                color: active ? "var(--color-accent)" : "var(--color-fg-secondary)",
              }}
            >
              <Icon size={13} />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((f) => {
          const active = category === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onCategoryChange(f.value)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: active ? "var(--color-accent-soft)" : "transparent",
                color: active ? "var(--color-accent)" : "var(--color-fg-muted)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
