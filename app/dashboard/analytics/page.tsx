/**
 * Arc Work — Analytics
 * Creator analytics and performance metrics
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Users, Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Track your creator performance and earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$0.00", change: "+0%", icon: DollarSign, color: "var(--color-accent)" },
          { label: "Page Views", value: "0", change: "+0%", icon: Eye, color: "var(--color-accent)" },
          { label: "Active Products", value: "0", change: "+0", icon: TrendingUp, color: "var(--color-accent)" },
          { label: "Total Customers", value: "0", change: "+0", icon: Users, color: "var(--color-accent)" },
        ].map((stat) => (
          <Card key={stat.label} style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <stat.icon size={16} style={{ color: stat.color }} />
                <Badge variant="secondary" className="text-[10px]">{stat.change}</Badge>
              </div>
              <CardTitle className="text-2xl font-bold mt-2" style={{ color: "var(--color-fg)" }}>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
      >
        <BarChart3 size={32} className="mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>No analytics data yet</p>
        <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-fg-muted)" }}>
          Analytics will appear once you start selling products or deploying agents
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/marketplace/jobs">
            <Button variant="outline" size="sm">Browse Marketplace</Button>
          </Link>
          <Link href="/dashboard/products/create">
            <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>Create Product</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
