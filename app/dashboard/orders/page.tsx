/**
 * Arc Work — Orders
 * Order history and management
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Orders</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Track your purchases and sales
        </p>
      </div>

      {/* Empty State */}
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <ShoppingCart size={32} className="mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>No orders yet</p>
        <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-fg-muted)" }}>
          Your order history will appear here once you make a purchase
        </p>
        <Link href="/explore">
          <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
