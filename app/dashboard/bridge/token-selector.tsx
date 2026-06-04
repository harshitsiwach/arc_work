/**
 * Arc Work — Token Selector
 * Premium token picker with search and chain badges
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  decimals: number;
  contract?: string;
}

interface TokenSelectorProps<T extends Token> {
  tokens: T[];
  selected: T;
  onSelect: (token: T) => void;
  label?: string;
}

export function TokenSelector<T extends Token>({ tokens, selected, onSelect, label }: TokenSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = tokens.filter(
    t =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/5 active:scale-95"
        style={{ border: "1px solid var(--color-bd)" }}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">{selected.icon}</div>
        <span className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>{selected.symbol}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: "var(--color-fg-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 w-72 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-bd)",
            boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: "var(--color-bd)" }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: "var(--color-bg-inset)",
                borderColor: "var(--color-bd)",
              }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: "var(--color-fg-muted)" }} />
              <input
                type="text"
                placeholder="Search name or paste address"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
                style={{ color: "var(--color-fg)" }}
                autoFocus
              />
            </div>
          </div>

          {/* Token list */}
          <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
            {filtered.map(token => {
              const isSelected = token.symbol === selected.symbol;
              return (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => { onSelect(token); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isSelected ? "bg-[var(--color-bg-hover)]" : "hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                    {token.icon}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>{token.symbol}</p>
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--color-fg-muted)" }}>{token.name}</p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[var(--color-accent)]" />
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No tokens found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
