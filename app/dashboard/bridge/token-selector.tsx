/**
 * Arc Work — Token Selector
 * Premium token picker with search and chain badges
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Star } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  icon: string;
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
        className="flex items-center gap-2 transition-colors duration-150"
      >
        <span className="text-lg">{selected.icon}</span>
        <div className="text-left">
          <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{selected.symbol}</p>
          {label && <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{label}</p>}
        </div>
        <ChevronDown className="h-3 w-3 ml-1" style={{ color: "var(--color-fg-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 w-64 rounded-xl overflow-hidden shadow-lg"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-bd)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
          }}
        >
          {/* Search */}
          <div className="p-2" style={{ borderBottom: "1px solid var(--color-bd)" }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: "var(--color-bg-inset)" }}>
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-fg-muted)" }} />
              <input
                type="text"
                placeholder="Search tokens..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--color-fg)" }}
                autoFocus
              />
            </div>
          </div>

          {/* Token list */}
          <div className="p-1 max-h-48 overflow-y-auto">
            {filtered.map(token => (
              <button
                key={token.symbol}
                type="button"
                onClick={() => { onSelect(token); setOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors duration-150"
                style={{
                  backgroundColor: token.symbol === selected.symbol ? "var(--color-accent-soft)" : "transparent",
                }}
              >
                <span className="text-lg">{token.icon}</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{token.symbol}</p>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{token.name}</p>
                </div>
                {token.symbol === selected.symbol && (
                  <Star className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "var(--color-fg-muted)" }}>
                No tokens found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
