"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarketplaceFiltersProps {
  categories: string[];
  active: string;
  onChange: (filter: string) => void;
}

export function MarketplaceFilters({
  categories,
  active,
  onChange,
}: MarketplaceFiltersProps) {
  const filters = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = active === filter || (filter === "All" && !active);
        return (
          <button
            key={filter}
            onClick={() => onChange(filter === "All" ? "" : filter)}
            className={cn(
              "relative px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200",
              isActive
                ? "text-black"
                : "text-white/50 hover:text-white/80 hover:bg-white/5",
            )}
            style={isActive ? { backgroundColor: "#B7FF3C" } : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#B7FF3C" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </button>
        );
      })}
    </div>
  );
}
