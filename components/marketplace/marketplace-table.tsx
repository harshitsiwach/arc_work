"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { ServiceRow } from "@/components/marketplace/service-row";

interface ToolService {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  price_amount: string;
  price_currency: string;
  endpoints: { url: string; method: string; description: string; price: string }[];
  source: string;
  networks: string[];
}

export type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "endpoints";

interface MarketplaceTableProps {
  services: ToolService[];
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onRowClick: (id: string) => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-asc", label: "Price Low-High" },
  { value: "price-desc", label: "Price High-Low" },
  { value: "endpoints", label: "Most Endpoints" },
];

function sortServices(services: ToolService[], sort: SortKey): ToolService[] {
  const sorted = [...services];
  switch (sort) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => parseFloat(a.price_amount || "0.001") - parseFloat(b.price_amount || "0.001"));
      break;
    case "price-desc":
      sorted.sort((a, b) => parseFloat(b.price_amount || "0.001") - parseFloat(a.price_amount || "0.001"));
      break;
    case "endpoints":
      sorted.sort((a, b) => (b.endpoints?.length || 0) - (a.endpoints?.length || 0));
      break;
  }
  return sorted;
}

export function MarketplaceTable({ services, sort, onSortChange, onRowClick }: MarketplaceTableProps) {
  const sorted = useMemo(() => sortServices(services, sort), [services, sort]);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-white/30">No services match your filters</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="min-w-[700px]">
        {/* Table Header */}
        <div className="flex items-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/20 border-b border-white/[0.06]">
          <div className="flex-[2]">Service</div>
          <div className="flex-1">Category</div>
          <div className="flex-1 text-center">Endpoints</div>
          <div className="flex-1">Price</div>
          <div className="flex-1">Network</div>
          <div className="flex-1 text-right">Verified</div>
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-end px-4 py-2 border-b border-white/[0.03]">
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/40 cursor-pointer hover:text-white/60 hover:bg-white/[0.05] transition-all">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label || "Sort"}
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="absolute right-0 top-full mt-1 w-44 py-1.5 rounded-xl bg-[#0C0C0C] border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className="w-full text-left px-3.5 py-2 text-[12px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table body */}
        <table className="w-full border-collapse">
          <tbody>
            {sorted.map((svc, i) => (
              <ServiceRow
                key={svc.id}
                service={svc}
                index={i}
                onClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
