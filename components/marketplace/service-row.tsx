"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ServiceRowProps {
  service: ToolService;
  index: number;
  onClick: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Inference: "Inference",
  Search: "Search",
  Data: "Data",
  Media: "Media",
  Social: "Social",
  Infra: "Infrastructure",
  Travel: "Travel",
  Storage: "Storage",
  Trading: "Trading",
  Voice: "Voice",
  Automation: "Automation",
  Productivity: "Productivity",
  Blockchain: "Blockchain",
};

function getFaviconUrl(domain: string): string {
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function LogoImage({ service }: { service: ToolService }) {
  const [failed, setFailed] = useState(false);

  const domain = service.domain || `${service.name.toLowerCase().replace(/\s+/g, "")}.com`;
  const faviconUrl = getFaviconUrl(domain);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={faviconUrl}
        alt=""
        className="w-6 h-6 rounded flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 flex-shrink-0">
      {service.name.charAt(0).toUpperCase()}
    </div>
  );
}

export const ServiceRow = memo(function ServiceRow({ service, index, onClick }: ServiceRowProps) {
  const price = parseFloat(service.price_amount) || 0.001;
  const epCount = service.endpoints?.length || 0;
  const network = service.networks?.[0] || "Arc";
  const categoryLabel = CATEGORY_LABELS[service.category] || service.category;

  const formatPrice = (val: number) => {
    if (val < 0.01) return `$${val.toFixed(4)}`;
    return `$${val.toFixed(2)}`;
  };

  const domain = service.domain || `${service.name.toLowerCase().replace(/\s+/g, "")}.com`;

  const priceDisplay = formatPrice(price);
  const isFixedPrice = price > 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      onClick={() => onClick(service.id)}
      className="group cursor-pointer transition-all duration-200 border-b border-white/[0.03] hover:bg-[rgba(183,255,60,0.03)] hover:border-lime-400/20"
      style={{ borderLeft: "2px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
      onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = "#B7FF3C"}
      onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = "transparent"}
    >
      {/* Service */}
      <td className="py-3.5 pl-4">
        <div className="flex items-center gap-3">
          <LogoImage service={service} />
          <div>
            <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              {service.name}
            </div>
            <div className="text-[11px] text-white/30 font-mono">{domain}</div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3.5 px-4">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.06]">
          {categoryLabel}
        </span>
      </td>

      {/* Endpoints */}
      <td className="py-3.5 px-4 text-center">
        <span className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors tabular-nums">
          {epCount}
        </span>
      </td>

      {/* Price */}
      <td className="py-3.5 px-4">
        <span className={cn(
          "text-sm font-medium",
          isFixedPrice ? "text-lime-400/80" : "text-white/40"
        )}>
          {priceDisplay}
        </span>
      </td>

      {/* Network */}
      <td className="py-3.5 px-4">
        <span className="text-xs text-white/50 font-mono">{network}</span>
      </td>

      {/* Verification */}
      <td className="py-3.5 pr-4 text-right">
        <CheckCircle className="inline-block h-4 w-4 text-lime-400/40" />
      </td>
    </motion.tr>
  );
});
