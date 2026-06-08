"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Zap, Globe, Bot, ArrowRight, Star, Users, Clock,
  ChevronRight, Filter, Sparkles, DollarSign, Layout,
} from "lucide-react";
import Link from "next/link";
import { AGENTS, FEATURED_AGENT_IDS, CATEGORIES } from "@/lib/mock/agents";

const CATEGORY_COLORS: Record<string, string> = {
  Web3: "oklch(0.55 0.15 120)",
  Development: "oklch(0.75 0.18 125)",
  Research: "oklch(0.60 0.16 240)",
  Marketing: "oklch(0.65 0.18 30)",
  Content: "oklch(0.60 0.12 280)",
  Automation: "oklch(0.65 0.16 80)",
};

const CATEGORY_ICONS: Record<string, any> = {
  Web3: Globe, Development: Bot, Research: Search,
  Marketing: Sparkles, Content: Layout, Automation: Zap,
};

export function AIMarketplaceContent() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const featuredRef = useRef<HTMLDivElement>(null);

  const featuredAgents = AGENTS.filter((a) => FEATURED_AGENT_IDS.includes(a.id));
  const categories = CATEGORIES;

  const filtered = AGENTS.filter((a) => {
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

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
            background: "radial-gradient(ellipse at 20% 50%, oklch(0.75 0.18 125 / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, oklch(0.55 0.15 120 / 0.06) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              Arcwork Agents
            </p>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            AI Agent Marketplace
          </h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--color-fg-secondary)" }}>
            Deploy AI-powered agents for Web3, development, research, marketing, content, and automation.
          </p>

          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
            <input
              placeholder="Search agents..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-bd)",
                color: "var(--color-fg)",
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((chip) => (
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
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Featured Agents</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>Curated AI agents for every task</p>
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
          {featuredAgents.map((agent) => {
            const Icon = agent.icon;
            const color = CATEGORY_COLORS[agent.category] || "var(--color-accent)";
            return (
              <Link key={agent.id} href={`/agents/${agent.id}`} className="block flex-shrink-0">
                <div
                  className="w-72 p-4 rounded-xl hover-lift cursor-pointer group"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-bd)",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--color-fg-muted)" }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-fg)" }}>{agent.name}</p>
                  <p className="text-[11px] mb-3 line-clamp-2" style={{ color: "var(--color-fg-muted)" }}>{agent.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{agent.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Clock size={10} style={{ color: "var(--color-fg-muted)" }} />
                      <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{agent.executionTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
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
          {categories.map((c) => {
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
          <Bot size={12} />
          Showing {filtered.length} of {AGENTS.length} agents
        </span>
        <span>·</span>
        <span>From ${Math.min(...AGENTS.map((a) => a.pricePerRun)).toFixed(2)}/run</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
        {filtered.map((agent) => {
          const Icon = agent.icon;
          const color = CATEGORY_COLORS[agent.category] || "var(--color-fg-muted)";
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card className="hover-lift group h-full" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{agent.category}</Badge>
                  </div>

                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-fg)" }}>{agent.name}</p>
                  <p className="text-[12px] mb-3 line-clamp-2 flex-1" style={{ color: "var(--color-fg-muted)" }}>{agent.description}</p>

                  <div className="flex items-center gap-3 mb-3 text-[11px]" style={{ color: "var(--color-fg-secondary)" }}>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {agent.executionTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} style={{ color: "var(--color-warning)" }} />
                      {agent.rating} ({agent.reviewCount})
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {agent.users}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--color-bd)" }}>
                    <div className="flex items-center gap-1">
                      <DollarSign size={13} style={{ color: "var(--color-accent)" }} />
                      <span className="text-base font-bold" style={{ color: "var(--color-accent)" }}>
                        ${agent.pricePerRun.toFixed(2)}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>per run</span>
                    </div>
                    <Button
                      size="sm"
                      className="transition-all duration-200"
                      style={{ backgroundColor: "var(--color-accent)" }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/agents/${agent.id}`;
                      }}
                    >
                      Run Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No agents found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
