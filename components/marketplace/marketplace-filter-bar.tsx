"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface MarketplaceFilterBarProps {
  categories: string[];
  networks: string[];
  categoryActive: string;
  networkActive: string;
  verificationActive: string;
  onCategoryChange: (val: string) => void;
  onNetworkChange: (val: string) => void;
  onVerificationChange: (val: string) => void;
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all",
          value
            ? "bg-white/[0.04] border-white/[0.10] text-white/60"
            : "bg-white/[0.02] border-white/[0.06] text-white/35 hover:text-white/50 hover:bg-white/[0.04]",
        )}
      >
        {activeLabel}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 py-1.5 rounded-xl bg-[#0C0C0C] border border-white/10 shadow-2xl z-20">
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3.5 py-2 text-[12px] text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              All
            </button>
            {options.filter((o) => o.value).map((option) => (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className="w-full text-left px-3.5 py-2 text-[12px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MarketplaceFilterBar({
  categories,
  networks,
  categoryActive,
  networkActive,
  verificationActive,
  onCategoryChange,
  onNetworkChange,
  onVerificationChange,
}: MarketplaceFilterBarProps) {
  const categoryOptions: FilterOption[] = categories.map((c) => ({ value: c, label: c }));
  const networkOptions: FilterOption[] = networks.map((n) => ({ value: n, label: n }));
  const verificationOptions: FilterOption[] = [
    { value: "verified", label: "Verified Only" },
    { value: "unverified", label: "Unverified" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterDropdown
        label="Category"
        options={categoryOptions}
        value={categoryActive}
        onChange={onCategoryChange}
      />
      <FilterDropdown
        label="Network"
        options={networkOptions}
        value={networkActive}
        onChange={onNetworkChange}
      />
      <FilterDropdown
        label="Verification"
        options={verificationOptions}
        value={verificationActive}
        onChange={onVerificationChange}
      />
    </div>
  );
}
