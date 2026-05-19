/**
 * ClipArc — Public Creator Profile
 * Anyone can view a creator's products, agents, and verified metrics
 */
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Package, Bot, ExternalLink, ArrowLeft } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000", tiktok: "#000000", instagram: "#E4405F",
  twitch: "#9146FF", x: "#1DA1F2",
};

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerComponentClient();

  const { data: cp } = await supabase
    .from("creator_profiles")
    .select("*, creator_verifications(*)")
    .eq("id", params.id)
    .single();

  if (!cp) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("creator_profile_id", cp.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", cp.profile_id)
    .single();

  const { data: agents } = profile ? await supabase
    .from("agent_profiles")
    .select("*")
    .eq("profile_id", profile.id)
    .order("reputation_score", { ascending: false }) : { data: [] };

  const totalSales = products?.reduce((sum: number, p: any) => sum + Number(p.price_amount || 0), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up px-4 py-8">
      {/* Back */}
      <Link href="/dashboard/products">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
      </Link>

      {/* Profile header */}
      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-accent-soft)" }}>
              <User className="h-8 w-8" style={{ color: "var(--color-accent)" }} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold" style={{ color: "var(--color-fg)" }}>{cp.display_name || "Creator"}</h1>
              {cp.bio && <p className="text-sm mt-2" style={{ color: "var(--color-fg-secondary)" }}>{cp.bio}</p>}

              {/* Verified social badges */}
              {cp.creator_verifications?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {cp.creator_verifications.map((v: any) => (
                    <Badge key={v.platform} variant="outline" className="text-xs gap-1.5 px-3 py-1.5"
                      style={{ borderColor: `${PLATFORM_COLORS[v.platform] || "#888"}40`, color: PLATFORM_COLORS[v.platform] || "var(--color-fg)" }}>
                      <span className="capitalize font-medium">{v.platform}</span>
                      <span>{(v.followers || 0).toLocaleString()} followers</span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-8 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-bd)" }}>
                <div><p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{products?.length || 0}</p><p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Products</p></div>
                <div><p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{agents?.length || 0}</p><p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>AI Agents</p></div>
                <div><p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>{totalSales.toFixed(0)}</p><p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>USDC Listed</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products grid */}
      <h2 className="text-lg font-semibold" style={{ color: "var(--color-fg)" }}>Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!products || products.length === 0 ? (
          <p className="col-span-full text-sm py-8 text-center" style={{ color: "var(--color-fg-muted)" }}>No products yet</p>
        ) : (
          products.map((p: any) => (
            <Link key={p.id} href={`/dashboard/products/${p.id}`}>
              <Card className="hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardContent className="p-4">
                  <Badge variant="outline" className="text-[10px] mb-2">{p.product_type}</Badge>
                  <p className="font-medium text-sm" style={{ color: "var(--color-fg)" }}>{p.title}</p>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--color-fg-secondary)" }}>{p.description}</p>
                  <p className="text-sm font-semibold mt-2" style={{ color: "var(--color-accent)" }}>{p.price_amount} USDC</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* AI Agents */}
      {agents && agents.length > 0 && (
        <>
          <h2 className="text-lg font-semibold pt-4" style={{ color: "var(--color-fg)" }}>AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a: any) => (
              <Card key={a.id} style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    <p className="font-medium text-sm" style={{ color: "var(--color-fg)" }}>{a.agent_name}</p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>✦ {a.reputation_score || 0} · {a.total_jobs_completed || 0} jobs</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
