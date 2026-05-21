/**
 * ClipArc - Product Catalog Browse
 * Lists all active products with search/filter and creator info
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, User, Tag, Loader2, AlertCircle, Plus } from "lucide-react";
import { VerifiedBadges } from "@/components/verified-badges";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PRODUCT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "clip_pack", label: "Clip Pack" },
  { value: "template", label: "Template" },
  { value: "membership", label: "Membership" },
  { value: "automation", label: "AI Automation" },
  { value: "service", label: "Service" },
  { value: "community", label: "Community" },
] as const;

const PRODUCT_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  clip_pack: {
    label: "Clip Pack",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  template: {
    label: "Template",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  membership: {
    label: "Membership",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  automation: {
    label: "AI Automation",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  service: {
    label: "Service",
    className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
  community: {
    label: "Community",
    className: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  product_type: string;
  delivery_type: string;
  tags: string[] | null;
  status: string;
  featured: boolean | null;
  media_urls: string[] | null;
  creator_profile: { id: string; display_name: string } | null;
};

export default function ProductsPage() {
  const supabase = createSupabaseBrowserClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          creator_profile:creator_profiles!products_creator_profile_id_fkey(id, display_name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (typeFilter) {
        query = query.eq("product_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      let results = (data || []) as Product[];

      // Client-side title search (case-insensitive)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
        );
      }

      setProducts(results);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setFetching(false);
    }
  }, [supabase, searchQuery, typeFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            Product Catalog
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Browse clip packs, templates, AI automations, and more from creators
          </p>
        </div>
      </div>

      {/* Search / Filter bar */}
      <div className="flex gap-3 animate-fade-in-up">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--color-fg-muted)" }}
          />
          <Input
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              borderColor: "var(--color-bd)",
              color: "var(--color-fg)",
            }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm border"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-bd)",
            color: "var(--color-fg)",
          }}
        >
          {PRODUCT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {fetching ? (
        <div className="flex justify-center py-16 animate-fade-in">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : error ? (
        /* Error state */
        <div className="text-center py-16 border-2 border-dashed rounded-lg" style={{ borderColor: "var(--color-bd)" }}>
          <AlertCircle className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-error)" }} />
          <p className="text-lg" style={{ color: "var(--color-fg)" }}>Something went wrong</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>{error}</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 border-2 border-dashed rounded-lg animate-fade-in" style={{ borderColor: "var(--color-bd)" }}>
          <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
          <p className="text-lg" style={{ color: "var(--color-fg-secondary)" }}>
            {searchQuery || typeFilter ? "No products match your filters" : "No products yet"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-muted)" }}>
            {searchQuery || typeFilter
              ? "Try adjusting your search or filter"
              : "Products will appear here once creators publish them"}
          </p>
        </div>
      ) : (
        /* Product grid — stagger-1 for card entrance animation */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
          {products.map((product) => {
            const typeBadge = PRODUCT_TYPE_BADGES[product.product_type] || {
              label: product.product_type,
              className: "",
            };

            return (
              <Link key={product.id} href={`/dashboard/products/${product.id}`} className="block">
              <Card
                className="hover-lift"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  borderColor: "var(--color-bd)",
                }}
              >
                <CardHeader>
                  {/* Product type badge + tags row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {product.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{product.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <CardTitle
                    className="text-lg leading-snug"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {product.title}
                  </CardTitle>

                  {/* Description (truncated) */}
                  {product.description && (
                    <p
                      className="text-sm line-clamp-2 mt-1"
                      style={{ color: "var(--color-fg-secondary)" }}
                    >
                      {product.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: "var(--color-fg)" }}
                    >
                      {product.price_amount}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-fg-muted)" }}
                    >
                      {product.price_currency}
                    </span>
                  </div>

                  {/* Creator name */}
                  <div
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    <User className="h-3.5 w-3.5" style={{ color: "var(--color-fg-muted)" }} />
                    <span>
                      {product.creator_profile?.display_name || "Unknown Creator"}
                    </span>
                  </div>

                  {/* Verified social badges */}
                  <VerifiedBadges creatorProfileId={product.creator_profile?.id} compact />

                  {/* Tags row (remaining tags beyond header) */}
                  {product.tags && product.tags.length > 2 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Delivery type */}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant="outline"
                      className="text-[11px]"
                      style={{ borderColor: "var(--color-bd)" }}
                    >
                      {product.delivery_type === "instant" ? "Instant Delivery" : "Escrow"}
                    </Badge>
                    {product.featured && (
                      <Badge
                        variant="secondary"
                        className="text-[11px]"
                        style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                      >
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!fetching && !error && products.length > 0 && (
        <p
          className="text-xs text-center animate-fade-in"
          style={{ color: "var(--color-fg-muted)" }}
        >
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
          {typeFilter ? ` — ${typeFilter.replace("_", " ")}s` : ""}
          {searchQuery ? ` matching &ldquo;${searchQuery}&rdquo;` : ""}
        </p>
      )}
    </div>
  );
}
