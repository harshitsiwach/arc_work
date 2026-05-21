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
  Search: "rgba(59,130,246,0.15)", Inference: "rgba(168,85,247,0.15)",
  Data: "rgba(34,197,94,0.15)", Media: "rgba(239,68,68,0.15)",
  Social: "rgba(59,130,246,0.15)", Infra: "rgba(107,114,128,0.15)",
  Travel: "rgba(251,191,36,0.15)", Storage: "rgba(59,130,246,0.15)",
  Trading: "rgba(16,185,129,0.15)",
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

  useEffect(() => {
    fetch("/api/tools")
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => toast.error("Failed to load tools"))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(services.map(s => s.category))].sort();
  const filtered = services.filter(s => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Tools & APIs</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          50+ paid services your AI agents can call — pay per request in USDC
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
          <input
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-fg-muted)" }}>
        <span>{filtered.length} tools</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
          {filtered.map((svc) => {
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
      )}
    </div>
  );
}
