/**
 * ClipArc — Tools & APIs Marketplace
 * All 50+ services from Agentic Market + our own tools
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ExternalLink, Zap, Globe, Cpu, Database, Image, Music, Plane, Bot, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, any> = {
  Search: Search, Inference: Cpu, Data: Database, Media: Image,
  Social: Globe, Infra: Cpu, Travel: Plane, Storage: Database, Trading: ShoppingBag,
};

const CATEGORY_COLORS: Record<string, string> = {
  Search: "oklch(0.55 0.15 260 / 0.12)", Inference: "oklch(0.55 0.15 300 / 0.12)",
  Data: "oklch(0.55 0.18 150 / 0.12)", Media: "oklch(0.55 0.20 30 / 0.12)",
  Social: "oklch(0.55 0.15 260 / 0.12)", Infra: "oklch(0.45 0.01 260 / 0.12)",
  Travel: "oklch(0.60 0.16 80 / 0.12)", Storage: "oklch(0.55 0.15 260 / 0.12)",
  Trading: "oklch(0.55 0.18 150 / 0.12)",
};

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

export default function ToolsPage() {
  const [services, setServices] = useState<ToolService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    fetch("/api/tools")
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => toast.error("Failed to load tools"))
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setVisibleCount(24);
  }, [search, categoryFilter]);

  const categories = [...new Set(services.map(s => s.category))].sort();
  const filtered = services.filter(s => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Tools & APIs</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          800+ paid services your AI agents can call — pay per request in USDC
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
        <input
          placeholder="Search tools..."
          className="search-bar"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          className="category-pill"
          data-active={!categoryFilter}
          onClick={() => setCategoryFilter("")}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c}
            className="category-pill"
            data-active={categoryFilter === c}
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-fg-muted)" }}>
        <span>Showing {filtered.length} of {services.length} tools</span>
        <span>·</span>
        <span>Prices from $0.001/call</span>
        <span>·</span>
        <span>Powered by x402 via Agentic Market</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
            {displayed.map((svc) => {
              const Icon = CATEGORY_ICONS[svc.category] || Zap;
              const bgColor = CATEGORY_COLORS[svc.category] || "rgba(107,114,128,0.15)";
              const price = parseFloat(svc.price_amount);

              return (
                <Card key={svc.id} className="hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-1">
                      <Badge style={{ backgroundColor: bgColor, color: "var(--color-fg)", border: "none" }} className="text-[10px] gap-1">
                        <Icon className="h-3 w-3" />
                        {svc.category}
                      </Badge>
                      {svc.networks?.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">{svc.networks[0]}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{svc.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{svc.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>
                        ${price < 0.01 ? price.toFixed(4) : price.toFixed(2)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>per call</span>
                    </div>
                    <div className="text-xs space-y-0.5" style={{ color: "var(--color-fg-muted)" }}>
                      {svc.endpoints.slice(0, 2).map((ep, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-[10px] font-mono px-1 rounded" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                            {ep.method || "POST"}
                          </span>
                          <span className="truncate">{ep.description || ep.url}</span>
                        </div>
                      ))}
                      {svc.endpoints.length > 2 && (
                        <span>+{svc.endpoints.length - 2} more endpoints</span>
                      )}
                    </div>
                    <a
                      href={`https://agentic.market?service=${svc.name.toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Use via Agentic Wallet
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setVisibleCount(prev => prev + 24)}>
                Load More Tools
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
