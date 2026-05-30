"use client";

import { Search } from "lucide-react";

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function JobSearch({ value, onChange, placeholder = "Search jobs..." }: JobSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm font-mono outline-none transition-colors"
        style={{
          backgroundColor: "var(--color-bg-inset)",
          borderColor: "var(--color-bd)",
          color: "var(--color-fg)",
        }}
      />
    </div>
  );
}
