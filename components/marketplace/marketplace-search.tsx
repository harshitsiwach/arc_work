"use client";

import { Search } from "lucide-react";

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarketplaceSearch({ value, onChange }: MarketplaceSearchProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-lime-400/10 via-lime-400/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div
        className="relative flex items-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 group-focus-within:border-lime-400/30 group-focus-within:bg-black/60 group-focus-within:shadow-[0_0_30px_-5px_rgba(183,255,60,0.15)]"
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-lime-400/60 transition-colors duration-300" />
        <input
          placeholder="Search by service, domain, capability..."
          className="w-full bg-transparent pl-14 pr-6 py-4 text-sm text-white/80 placeholder:text-white/25 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
