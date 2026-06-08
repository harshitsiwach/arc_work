/**
 * Arc Work — My Products (Seller Management)
 * Manage your own product listings: view, track, and create new products
 */
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  ExternalLink,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default async function MyProductsPage() {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return redirect("/sign-in");

  const { data: products } = await supabase
    .from("products")
    .select("id, title, description, price_amount, status, product_type, created_at, media_urls, tags")
    .eq("creator_profile_id", profile.id)
    .order("created_at", { ascending: false });

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.status === "active")?.length || 0;
  const totalValue = products?.reduce((s: number, p: any) => s + Number(p.price_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            My Products
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Manage your product listings
          </p>
        </div>
        <Link href="/dashboard/products/create">
          <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: "Total Products", value: totalProducts.toString() },
          { icon: TrendingUp, label: "Active", value: activeProducts.toString() },
          { icon: DollarSign, label: "Total Listed Value", value: `${totalValue.toFixed(0)} USDC` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
              <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Products list */}
      {!products || products.length === 0 ? (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-fg-muted)" }} />
            <p className="text-base font-medium mb-1" style={{ color: "var(--color-fg)" }}>
              No products yet
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--color-fg-muted)" }}>
              Create your first product to start earning USDC
            </p>
            <Link href="/dashboard/products/create">
              <Button style={{ backgroundColor: "var(--color-accent)" }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>
              All Products ({totalProducts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg transition-colors"
                  style={{ backgroundColor: "var(--color-bg-inset)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "var(--color-accent-soft)" }}
                    >
                      <Package className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-fg)" }}>
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                          {product.product_type?.replace("_", " ")}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>·</span>
                        <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                      style={{
                        backgroundColor: product.status === "active" ? "oklch(0.75 0.18 125 / 0.12)" : "var(--color-bg-hover)",
                        color: product.status === "active" ? "var(--color-accent)" : "var(--color-fg-muted)",
                      }}
                    >
                      {product.status}
                    </Badge>
                    <span className="text-sm font-mono font-medium" style={{ color: "var(--color-fg)" }}>
                      {product.price_amount} USDC
                    </span>
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
