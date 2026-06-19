"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface AgentCardProps {
  service: ToolService;
  onViewService: (id: string) => void;
  index?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  Search: "🔍", Inference: "🧠", Data: "🗄️", Media: "🎬",
  Social: "🌐", Infra: "⚙️", Travel: "✈️", Storage: "💾",
  Trading: "🛒", Voice: "🎤", Automation: "⚡",
  Productivity: "📋", Blockchain: "🔒",
};

const ECOSYSTEM_SIGNALS: Record<string, { label: string; color: string }> = {
  Search: { label: "Popular in Analytics", color: "from-blue-500/20 to-blue-500/5" },
  Inference: { label: "Trending in Research", color: "from-violet-500/20 to-violet-500/5" },
  Data: { label: "Fast Growing", color: "from-emerald-500/20 to-emerald-500/5" },
  Media: { label: "Fast Growing", color: "from-orange-500/20 to-orange-500/5" },
  Social: { label: "Trending", color: "from-sky-500/20 to-sky-500/5" },
  Automation: { label: "Most Deployed", color: "from-lime-500/20 to-lime-500/5" },
  Trading: { label: "High Demand", color: "from-amber-500/20 to-amber-500/5" },
  Voice: { label: "New Integration", color: "from-pink-500/20 to-pink-500/5" },
};

function getPopularityBadge(category: string): { label: string; variant: "default" | "secondary" | "outline" } | null {
  const signal = ECOSYSTEM_SIGNALS[category];
  if (!signal) return null;
  return { label: signal.label, variant: "secondary" };
}

export function AgentCard({ service, onViewService, index = 0 }: AgentCardProps) {
  const priceLow = parseFloat(service.price_amount) || 0.001;
  const priceHigh = Math.max(priceLow * 5, 0.015);
  const epCount = service.endpoints?.length || 0;
  const badge = getPopularityBadge(service.category);
  const network = service.networks?.[0] || "Arc";

  const formatPrice = (val: number) => {
    if (val < 0.01) return `$${val.toFixed(4)}`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative rounded-3xl border border-white/5 bg-[#0A0A0A] hover:border-lime-400/30 transition-all duration-500 hover:shadow-[0_0_40px_-12px_rgba(183,255,60,0.2)]"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/5 border border-white/10"
            >
              {CATEGORY_ICONS[service.category] || "🧩"}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90">{service.name}</h3>
              {service.domain && (
                <p className="text-[11px] text-white/30 font-mono">{service.domain}</p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] border-white/10 text-white/40 font-normal"
          >
            {network}
          </Badge>
        </div>

        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-white/40">
              <span className="text-white/70 font-medium">{epCount}</span> {epCount === 1 ? "Endpoint" : "Endpoints"}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/40">
              <span className="text-lime-400/80 font-medium">{formatPrice(priceLow)}</span>
              {priceHigh > priceLow && (
                <span className="text-white/30"> – {formatPrice(priceHigh)}</span>
              )}
            </span>
          </div>
        </div>

        {badge && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-lime-400/10 to-transparent border border-lime-400/10">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400/60 animate-pulse" />
            <span className="text-[10px] text-lime-400/70 font-medium">{badge.label}</span>
          </div>
        )}

        <Button
          onClick={() => onViewService(service.id)}
          className="w-full bg-white/5 hover:bg-lime-400/10 border border-white/10 hover:border-lime-400/30 text-white/60 hover:text-lime-400/90 rounded-xl h-10 text-xs font-medium transition-all duration-300 group/btn"
        >
          <span>View Service</span>
          <ArrowRight className="h-3 w-3 ml-1.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
}
