/**
 * ClipArc — Creator Profile Page
 * Shows products, agents, verified metrics, and stats
 * Public-facing: anyone can view a creator's profile
 */
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Package, Bot, Star, Briefcase, Coins, ExternalLink, ArrowLeft } from "lucide-react";

export default async function CreatorProfilePage() {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return redirect("/sign-in");

  // Get or create creator profile
  let { data: cp } = await supabase
    .from("creator_profiles")
    .select("*, creator_verifications(*)")
    .eq("profile_id", profile.id)
    .single();

  if (!cp) {
    const { data: newCp } = await supabase
      .from("creator_profiles")
      .insert({
        profile_id: profile.id,
        display_name: user.email?.split("@")[0] || "Creator",
      })
      .select("*, creator_verifications(*)")
      .single();
    cp = newCp;
  }

  // Get products
  const { data: myProducts } = await supabase
    .from("products")
    .select("*")
    .eq("creator_profile_id", cp?.id)
    .order("created_at", { ascending: false });

  // Get agents
  const { data: myAgents } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  // Get purchases
  const { data: purchases } = await supabase
    .from("product_purchases")
    .select("*, products(title)")
    .eq("buyer_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const totalSales = myProducts?.reduce((sum: number, p: any) => sum + Number(p.price_amount || 0), 0) || 0;
  const totalProducts = myProducts?.length || 0;
  const totalAgents = myAgents?.length || 0;

  const PLATFORM_COLORS: Record<string, string> = {
    youtube: "#FF0000",
    tiktok: "#000000",
    instagram: "#E4405F",
    twitch: "#9146FF",
    x: "#1DA1F2",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back + header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Creator Profile</h1>
          <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>Your public profile — buyers see this</p>
        </div>
      </div>

      {/* Profile header */}
      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-accent-soft)" }}>
              <User className="h-7 w-7" style={{ color: "var(--color-accent)" }} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>{cp?.display_name || "Creator"}</h2>
              {cp?.bio && <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>{cp.bio}</p>}
              
              {/* Verified social badges */}
              {cp?.creator_verifications?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {cp.creator_verifications.map((v: any) => (
                    <Badge
                      key={v.platform}
                      variant="outline"
                      className="text-xs gap-1.5 px-3 py-1"
                      style={{
                        borderColor: `${PLATFORM_COLORS[v.platform] || "#888"}40`,
                        color: PLATFORM_COLORS[v.platform] || "var(--color-fg)",
                      }}
                    >
                      <span className="capitalize">{v.platform}</span>
                      <span className="font-semibold">{(v.followers || 0).toLocaleString()} followers</span>
                      <span className="opacity-60">{(v.total_views || 0).toLocaleString()} views</span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{totalProducts}</p>
                  <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{totalAgents}</p>
                  <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>AI Agents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{totalSales.toFixed(0)}</p>
                  <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>USDC Earned</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
              <Package className="h-4 w-4" />
              Your Products
            </CardTitle>
            <Link href="/dashboard/products/create">
              <Button size="sm" variant="outline">+ New</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {!myProducts || myProducts.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--color-fg-muted)" }}>No products yet</p>
            ) : (
              myProducts.map((p: any) => (
                <Link key={p.id} href={`/dashboard/products/${p.id}`}>
                  <div className="p-3 rounded-lg flex items-center justify-between transition-colors hover-lift" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{p.title}</p>
                      <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{p.product_type} · {p.status}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>{p.price_amount} USDC</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Agents */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
              <Bot className="h-4 w-4" />
              Your AI Agents
            </CardTitle>
            <Link href="/dashboard/agents/create">
              <Button size="sm" variant="outline">+ New</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {!myAgents || myAgents.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--color-fg-muted)" }}>No agents deployed</p>
            ) : (
              myAgents.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{a.agent_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                      <span>✦ {a.reputation_score || 0}</span>
                      <span>{a.total_jobs_completed || 0} jobs</span>
                    </div>
                  </div>
                  {a.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.specializations.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent purchases */}
      {purchases && purchases.length > 0 && (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {purchases.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg text-sm" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <span style={{ color: "var(--color-fg)" }}>{p.products?.title || "Product"}</span>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--color-accent)" }}>{p.amount} USDC</span>
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
