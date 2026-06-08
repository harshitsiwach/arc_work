/**
 * Arc Work — Product Live Preview
 * Sticky marketplace card preview + metadata panel
 */
"use client";

import { CheckCircle2, Zap, Shield, Bot, Coins, TrendingUp, Eye, Star } from "lucide-react";

type ProductType = { label: string; icon: string; desc: string } | undefined;
type DeliveryType = { label: string; icon: any; desc: string } | undefined;

interface ProductPreviewProps {
  title: string;
  description: string;
  price: string;
  productType: ProductType;
  deliveryType: DeliveryType;
  tags: string[];
  coverImage: string | null;
}

export function ProductPreview({
  title,
  description,
  price,
  productType,
  deliveryType,
  tags,
  coverImage,
}: ProductPreviewProps) {
  const priceNum = parseFloat(price);
  const platformFee = priceNum ? (priceNum * 0.05).toFixed(2) : "0.00";
  const youEarn = priceNum ? (priceNum * 0.95).toFixed(2) : "0.00";

  return (
    <div className="space-y-3">
      {/* ── Marketplace card preview ──────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-bd)" }}>
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" style={{ color: "var(--color-fg-muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>
              Marketplace preview
            </span>
          </div>
          <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
            How buyers see it
          </span>
        </div>

        {/* Cover */}
        <div
          className="w-full h-32 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-inset)" }}
        >
          {coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{productType?.icon || "📦"}</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold line-clamp-2" style={{ color: "var(--color-fg)" }}>
              {title || "Your product name"}
            </h3>
            {description && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-fg-secondary)" }}>
                {description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>
              {priceNum ? priceNum.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>USDC</span>
          </div>

          {/* Type + delivery badges */}
          <div className="flex flex-wrap gap-1.5">
            {productType && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
              >
                {productType.icon} {productType.label}
              </span>
            )}
            {deliveryType && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "oklch(0.75 0.18 125 / 0.1)", color: "var(--color-accent)" }}
              >
                {deliveryType.label}
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg-muted)" }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                  +{tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Earnings breakdown ────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <div className="flex items-center gap-2">
          <Coins className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
            Earnings preview
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--color-fg-secondary)" }}>Sale price</span>
            <span className="font-mono" style={{ color: "var(--color-fg)" }}>
              {priceNum ? `${priceNum.toFixed(2)} USDC` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--color-fg-secondary)" }}>Platform fee (5%)</span>
            <span className="font-mono" style={{ color: "var(--color-fg-secondary)" }}>
              -{platformFee} USDC
            </span>
          </div>
          <div className="flex justify-between text-xs font-medium pt-1.5" style={{ borderTop: "1px solid var(--color-bd)" }}>
            <span style={{ color: "var(--color-fg)" }}>You earn</span>
            <span className="font-mono" style={{ color: "var(--color-accent)" }}>
              {youEarn} USDC
            </span>
          </div>
        </div>
      </div>

      {/* ── AI compatibility ──────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
            AI compatibility
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-fg-secondary)" }}>AI agents can discover & recommend</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-fg-secondary)" }}>Auto-validation on delivery</span>
          </div>
          {tags.some(t => ["AI Tools", "Automation", "Templates", "Workflows"].includes(t)) && (
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
              <span style={{ color: "var(--color-accent)" }}>AI-optimized category</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust indicators ──────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>
          When published
        </span>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-fg-secondary)" }}>Listed on marketplace</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3 w-3" style={{ color: "oklch(0.65 0.14 80)" }} />
            <span style={{ color: "var(--color-fg-secondary)" }}>Instant USDC payout</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-fg-secondary)" }}>Escrow-protected sales</span>
          </div>
        </div>
      </div>
    </div>
  );
}
