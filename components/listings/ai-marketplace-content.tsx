"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Search, ExternalLink, Zap, Globe, Cpu, Database,
  Image, Music, Plane, Bot, ShoppingBag, TrendingUp,
  ArrowRight, Star, Users, Clock, ChevronRight, Filter,
  Mic, BarChart3, MessageSquare, Code, Layers, Shield,
  Sparkles,
} from "lucide-react";
import { OpenAI, Anthropic, Exa } from "@lobehub/icons";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, any> = {
  Search: Search, Inference: Cpu, Data: Database, Media: Image,
  Social: Globe, Infra: Cpu, Travel: Plane, Storage: Database,
  Trading: ShoppingBag, Voice: Mic, Automation: Zap,
  Productivity: Layers, Blockchain: Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  Search: "oklch(0.75 0.18 125)", Inference: "oklch(0.75 0.18 125)",
  Data: "oklch(0.75 0.18 125)", Media: "oklch(0.55 0.20 30)",
  Social: "oklch(0.75 0.18 125)", Infra: "oklch(0.55 0 0)",
  Travel: "oklch(0.60 0.16 80)", Storage: "oklch(0.75 0.18 125)",
  Trading: "oklch(0.75 0.18 125)", Voice: "oklch(0.75 0.18 125)",
  Automation: "oklch(0.75 0.18 125)", Productivity: "oklch(0.75 0.18 125)",
  Blockchain: "oklch(0.55 0.15 120)",
};

const ECOSYSTEM_SIGNALS: Record<string, string> = {
  Search: "Used by 3.2k agents", Inference: "Trending in research",
  Data: "Popular in analytics", Media: "Fast growing",
  Social: "Trending", Automation: "Most deployed",
  Trading: "High demand", Voice: "New integration",
};

const FEATURED_PROVIDERS: { name: string; desc: string; category: string; users: string; icon?: React.ElementType; iconSrc?: string; brand: boolean }[] = [
  { name: "OpenAI", desc: "GPT-4o, o1, DALL-E — leading AI models", category: "Inference", users: "12.4k", icon: OpenAI, brand: true },
  { name: "Anthropic", desc: "Claude — advanced reasoning & analysis", category: "Inference", users: "8.9k", icon: Anthropic, brand: true },
  { name: "Deepgram", desc: "Real-time speech-to-text & transcription", category: "Voice", users: "4.2k", iconSrc: "/icons/ai/deepgram.svg", brand: false },
  { name: "ElevenLabs", desc: "Premium AI voice generation & cloning", category: "Voice", users: "6.1k", iconSrc: "/icons/ai/elevenlabs.svg", brand: false },
  { name: "Tavily", desc: "AI-optimized search & research API", category: "Search", users: "5.7k", iconSrc: "/icons/ai/tavily.svg", brand: false },
  { name: "Exa", desc: "Neural search for AI applications", category: "Search", users: "3.4k", icon: Exa, brand: true },
  { name: "The Graph", desc: "Decentralized indexing for blockchain data", category: "Blockchain", users: "7.8k", iconSrc: "/icons/ai/thegraph.svg", brand: false },
];

const DISCOVERY_CHIPS = [
  "Research", "Automation", "Inference", "Voice",
  "Trading", "Social", "Content", "Data",
];

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

export function AIMarketplaceContent() {
  const [services, setServices] = useState<ToolService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tools")
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => toast.error("Failed to load marketplace"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, oklch(0.75 0.18 125 / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, oklch(0.75 0.18 125 / 0.06) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              AI Marketplace
            </p>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            Discover AI Capabilities
          </h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--color-fg-secondary)" }}>
            Deploy AI tools, APIs, automation services, and capabilities for autonomous agents. Pay per request in USDC.
          </p>

          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
            <input
              placeholder="Search tools, models, services..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-bd)",
                color: "var(--color-fg)",
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {DISCOVERY_CHIPS.map((chip) => (
              <button
                key={chip}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-bd)",
                  color: "var(--color-fg-secondary)",
                }}
                onClick={() => setSearch(chip.toLowerCase())}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Featured Providers</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>Trusted AI ecosystem partners</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => featuredRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button
              onClick={() => featuredRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={featuredRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {FEATURED_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const color = CATEGORY_COLORS[provider.category] || "var(--color-accent)";
            const isBrand = provider.brand;
            return (
              <div
                key={provider.name}
                className="flex-shrink-0 w-64 p-4 rounded-xl hover-lift cursor-pointer group"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-bd)",
                  scrollSnapAlign: "start",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={isBrand
                      ? { backgroundColor: "var(--color-bg-inset)" }
                      : { backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                  >
                    {provider.iconSrc ? (
                      <img
                        src={provider.iconSrc}
                        alt={`${provider.name} icon`}
                        width={20}
                        height={20}
                        style={{ color }}
                        className="w-5 h-5"
                      />
                    ) : Icon ? (
                      <Icon size={20} style={isBrand ? undefined : { color }} />
                    ) : null}
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--color-fg-muted)" }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-fg)" }}>{provider.name}</p>
                <p className="text-[11px] mb-3 line-clamp-2" style={{ color: "var(--color-fg-muted)" }}>{provider.desc}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">{provider.category}</Badge>
                  <p className="text-[10px] font-medium" style={{ color: "var(--color-accent)" }}>{provider.users} users</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} style={{ color: "var(--color-fg-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Categories</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
            style={{
              backgroundColor: !categoryFilter ? "var(--color-accent)" : "var(--color-bg-elevated)",
              color: !categoryFilter ? "white" : "var(--color-fg-secondary)",
              border: `1px solid ${!categoryFilter ? "var(--color-accent)" : "var(--color-bd)"}`,
            }}
            onClick={() => setCategoryFilter("")}
          >
            All
          </button>
          {categories.map(c => {
            const Icon = CATEGORY_ICONS[c] || Zap;
            const color = CATEGORY_COLORS[c] || "var(--color-fg-muted)";
            return (
              <button
                key={c}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: categoryFilter === c ? `color-mix(in oklch, ${color} 15%, transparent)` : "var(--color-bg-elevated)",
                  color: categoryFilter === c ? color : "var(--color-fg-secondary)",
                  border: `1px solid ${categoryFilter === c ? color : "var(--color-bd)"}`,
                }}
                onClick={() => setCategoryFilter(c)}
              >
                <Icon size={14} />
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-fg-muted)" }}>
        <span className="flex items-center gap-1">
          <TrendingUp size={12} />
          Showing {filtered.length} of {services.length} capabilities
        </span>
        <span>·</span>
        <span>From $0.001/call</span>
        <span>·</span>
        <span>Powered by x42 via Agentic Market</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
            {displayed.map((svc) => {
              const Icon = CATEGORY_ICONS[svc.category] || Zap;
              const color = CATEGORY_COLORS[svc.category] || "var(--color-fg-muted)";
              const price = parseFloat(svc.price_amount);
              const signal = ECOSYSTEM_SIGNALS[svc.category];

              return (
                <Card key={svc.id} className="hover-lift group" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--color-fg-muted)" }}>{svc.source || "Agentic Market"}</span>
                      </div>
                      {signal && (
                        <span className="text-[10px] font-medium" style={{ color: "var(--color-accent)" }}>{signal}</span>
                      )}
                    </div>

                    <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{svc.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{svc.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>
                          ${price < 0.01 ? price.toFixed(4) : price.toFixed(2)}
                        </span>
                        <span className="text-xs ml-1" style={{ color: "var(--color-fg-muted)" }}>per call</span>
                      </div>
                      {svc.networks?.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">{svc.networks[0]}</Badge>
                      )}
                    </div>

                    <div className="text-xs space-y-1" style={{ color: "var(--color-fg-muted)" }}>
                      {svc.endpoints.slice(0, 2).map((ep, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                            {ep.method || "POST"}
                          </span>
                          <span className="truncate">{ep.description || ep.url}</span>
                        </div>
                      ))}
                      {svc.endpoints.length > 2 && (
                        <span className="text-[11px]">+{svc.endpoints.length - 2} more endpoints</span>
                      )}
                    </div>

                    <a
                      href={`https://agentic.market?service=${svc.name.toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full transition-all duration-200 group-hover:border-[var(--color-accent)]"
                      >
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
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={() => setVisibleCount(prev => prev + 24)}>
                Load More Capabilities
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
