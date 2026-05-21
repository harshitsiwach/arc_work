/**
 * ClipArc - Product Detail + Purchase Page
 * Server component: fetches product by id with creator_profile joined.
 * Buy interaction delegated to a separate client component.
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, User, Tag, Clock, ShieldCheck } from "lucide-react";
import { BuyProductButton } from "./buy-button";

// ── Product-Type Badge Config ───────────────────────────────
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
};

// ── Server Component ────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  // Fetch product with creator_profile join
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      creator_profile:creator_profiles!products_creator_profile_id_fkey(display_name)
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !product) {
    return (
      <div className="text-center py-20 animate-fade-in space-y-4">
        <Package
          className="h-12 w-12 mx-auto"
          style={{ color: "var(--color-fg-muted)" }}
        />
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--color-fg)" }}
        >
          Product not found
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          This product doesn&apos;t exist or has been removed.
        </p>
        <Link href="/dashboard/products">
          <Button variant="outline" className="mt-4">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  // Determine if the current user is the creator
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const isCreator = profile?.id === product.creator_profile_id;

  // Check if current user has already purchased the product
  const { data: purchase } = await supabase
    .from("product_purchases")
    .select("id")
    .eq("product_id", params.id)
    .eq("buyer_profile_id", profile?.id)
    .eq("status", "completed")
    .maybeSingle();

  const hasPurchased = !!purchase;

  // Fetch the creator's wallet address
  const { data: creatorWallet } = await supabase
    .from("wallets")
    .select("wallet_address")
    .eq("profile_id", product.creator_profile_id)
    .single();

  const typeBadge =
    PRODUCT_TYPE_BADGES[product.product_type] ?? {
      label: product.product_type,
      className: "",
    };

  const formattedPrice = Number(product.price_amount).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
      {/* Back navigation */}
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 text-sm transition-all duration-150 hover:opacity-70"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Main Content ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              borderColor: "var(--color-bd)",
            }}
          >
            <CardHeader>
              {/* Type badge + featured */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <Badge className={typeBadge.className}>
                  {typeBadge.label}
                </Badge>
                {product.featured && (
                  <Badge
                    variant="secondary"
                    className="text-[11px]"
                    style={{
                      backgroundColor: "var(--color-accent-soft)",
                      color: "var(--color-accent)",
                    }}
                  >
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <CardTitle
                className="text-3xl leading-tight"
                style={{ color: "var(--color-fg)" }}
              >
                {product.title}
              </CardTitle>

              {/* Creator + timestamp */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  <User className="h-3.5 w-3.5" style={{ color: "var(--color-fg-muted)" }} />
                  <span>
                    {product.creator_profile?.display_name || "Creator"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                     })}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              {product.description && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2 tracking-wide uppercase"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    Description
                  </h3>
                  <p
                    className="text-base leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2 tracking-wide uppercase"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery & meta */}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.delivery_type === "instant" ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-[11px]"
                    style={{ borderColor: "var(--color-bd)" }}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Instant delivery
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[11px]"
                    style={{ borderColor: "var(--color-bd)" }}
                  >
                    Escrow delivery
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-[11px]"
                  style={{ borderColor: "var(--color-bd)" }}
                >
                  {product.status === "active" ? "Available" : product.status}
                </Badge>
                {product.product_type === "membership" && (
                  <Badge
                    variant="outline"
                    className="text-[11px]"
                    style={{ borderColor: "var(--color-bd)" }}
                  >
                    Recurring
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar (Price + Purchase) ──────────────────── */}
        <div className="space-y-6">
          <div
            className="sticky top-24 space-y-5"
          >
            <Card
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-bd)",
              }}
            >
              <CardContent className="p-6 space-y-5">
                {/* Price */}
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--color-fg-muted)" }}
                  >
                    Price
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: "var(--color-fg)" }}
                    >
                      {formattedPrice}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-fg-muted)" }}
                    >
                      {product.price_currency}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <hr style={{ borderColor: "var(--color-bd)" }} />

                {/* Action */}
                {isCreator ? (
                  <div className="space-y-3">
                    <div
                      className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
                      style={{
                        backgroundColor: "var(--color-accent-soft)",
                        border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
                      }}
                    >
                      <ShieldCheck
                        className="h-5 w-5 shrink-0"
                        style={{ color: "var(--color-accent)" }}
                      />
                      <span
                        className="font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        You created this
                      </span>
                    </div>
                    <p
                      className="text-xs text-center"
                      style={{ color: "var(--color-fg-muted)" }}
                    >
                      As the creator, you can manage this product from the catalog.
                    </p>
                  </div>
                ) : (
                  <BuyProductButton
                    productId={product.id}
                    priceAmount={product.price_amount}
                    priceCurrency={product.price_currency}
                    accessUrl={hasPurchased ? product.access_url : null}
                    fileUrl={hasPurchased ? product.file_url : null}
                    productTitle={product.title}
                    initialPurchased={hasPurchased}
                    creatorWalletAddress={creatorWallet?.wallet_address || null}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

