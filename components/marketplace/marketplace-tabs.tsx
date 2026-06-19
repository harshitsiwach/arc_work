"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TabKey = "services" | "endpoints" | "bundles";

interface MarketplaceTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "services", label: "Services" },
  { key: "endpoints", label: "Endpoints" },
  { key: "bundles", label: "Bundles" },
];

export function MarketplaceTabs({ active, onChange }: MarketplaceTabsProps) {
  return (
    <div className="flex gap-1">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative px-5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200",
              isActive
                ? "text-white/90"
                : "text-white/30 hover:text-white/60",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-0 rounded-lg bg-white/[0.06]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
