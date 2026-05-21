/**
 * Arc Work — Dashboard
 * Creator-focused overview with wallet, products, agents, and activity
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletBalance } from "@/components/wallet-balance";
import { RequestUsdcButton } from "@/components/request-usdc-button";
import { USDCButton } from "@/components/usdc-button";
import { WalletInformationDialog } from "@/components/wallet-information-dialog";
import { EscrowAgreements } from "@/components/escrow-agreements";
import { CreateAgreementPage } from "@/components/ui/createAgreementPage";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Bot, Package, Coins, DollarSign, ExternalLink, Plus,
  ArrowUpRight, TrendingUp, Shield, Zap, Clock,
  Wallet, AlertCircle, Briefcase, GraduationCap, Wrench,
  Scissors, PlusCircle,
} from "lucide-react";

const Transactions = dynamic(() => import('@/components/transactions').then(mod => mod.Transactions), { ssr: false });

export default async function DashboardPage() {
  const supabase = createSupabaseServerComponentClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("auth_user_id", user.id)
    .single();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("profile_id", profile?.id)
    .single();

  const { data: myAgents } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("profile_id", profile?.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: myProducts } = await supabase
    .from("products")
    .select("id, title, price_amount, status, product_type, created_at")
    .eq("creator_profile_id", profile?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentAgreements } = await supabase
    .from("escrow_agreements")
    .select("*, beneficiary_wallet:wallets!beneficiary_wallet_id_fkey(*), depositor_wallet:wallets!depositor_wallet_id_fkey(*)")
    .or(`beneficiary_wallet_id.eq.${wallet?.id},depositor_wallet_id.eq.${wallet?.id}`)
    .order("created_at", { ascending: false })
    .limit(5);

  const activeProducts = myProducts?.filter(p => p.status === "active")?.length || 0;
  const totalListed = myProducts?.reduce((s: number, p: any) => s + Number(p.price_amount || 0), 0) || 0;
  const agentCount = myAgents?.length || 0;

  return (
    <div className="space-y-8">
      {/* Page header + inline stats */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
              Welcome back, {profile?.name || user.email?.split("@")[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/explore">
              <Button size="sm" variant="outline">
                Browse Products
              </Button>
            </Link>
            <Link href="/dashboard/products/create">
              <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Sell Something
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact inline summary strip */}
        <div
          className="mt-4 flex items-center gap-4 px-4 py-2.5 rounded-lg"
          style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
        >
          <div className="stat-inline">
            <Package size={13} style={{ color: "var(--color-accent)" }} />
            <span className="stat-value">{activeProducts}</span> products
          </div>
          <span style={{ color: "var(--color-bd)" }}>·</span>
          <div className="stat-inline">
            <Bot size={13} style={{ color: "var(--color-accent)" }} />
            <span className="stat-value">{agentCount}</span> agents
          </div>
          <span style={{ color: "var(--color-bd)" }}>·</span>
          <div className="stat-inline">
            <DollarSign size={13} style={{ color: "var(--color-accent)" }} />
            <span className="stat-value">{totalListed.toFixed(0)} USDC</span> listed
          </div>
          <span style={{ color: "var(--color-bd)" }}>·</span>
          <div className="stat-inline">
            <Coins size={13} style={{ color: "var(--color-accent)" }} />
            {wallet?.circle_wallet_id ? (
              <span className="stat-value"><WalletBalance walletId={wallet.circle_wallet_id} /></span>
            ) : (
              <span className="stat-value">—</span>
            )}
            {" "}balance
          </div>
        </div>
      </div>

      {/* Wallet + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet section */}
        <div
          className="p-5 rounded-xl"
          style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Account balance</h2>
            </div>
            {wallet && <WalletInformationDialog wallet={wallet} />}
          </div>
          {wallet ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
                  <WalletBalance walletId={wallet.circle_wallet_id} />
                </h2>
                <p className="text-xs mt-1 font-mono" style={{ color: "var(--color-fg-muted)" }}>
                  {wallet.wallet_address?.slice(0, 10)}...{wallet.wallet_address?.slice(-6)}
                </p>
              </div>
              <div className="flex gap-2">
                <USDCButton className="flex-1" mode="BUY" walletAddress={wallet.wallet_address} />
                <USDCButton className="flex-1" mode="SELL" walletAddress={wallet.wallet_address} />
                {process.env.NODE_ENV === "development" && (
                  <RequestUsdcButton walletAddress={wallet.wallet_address} />
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-warning)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>No wallet found</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
                Sign up to automatically get a Circle wallet
              </p>
            </div>
          )}
        </div>

        {/* Browse & Buy quick links */}
        <div
          className="p-5 rounded-xl"
          style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-fg)" }}>Browse & Buy</h2>
          <p className="text-xs mb-4" style={{ color: "var(--color-fg-muted)" }}>Discover what creators have built</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/explore", label: "Product Catalog", icon: TrendingUp, accent: "oklch(0.55 0.15 260)" },
              { href: "/dashboard/marketplace", label: "Freelance Gigs", icon: Briefcase, accent: "oklch(0.55 0.15 200)" },
              { href: "/dashboard/courses", label: "Courses", icon: GraduationCap, accent: "oklch(0.55 0.18 150)" },
              { href: "/agents/marketplace", label: "AI Marketplace", icon: Zap, accent: "oklch(0.60 0.16 80)" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div
                  className="flex items-center gap-2.5 p-3 rounded-lg border hover-bg cursor-pointer"
                  style={{ borderColor: "var(--color-bd)" }}
                >
                  <action.icon className="h-4 w-4 shrink-0" style={{ color: action.accent }} />
                  <span className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      {myProducts && myProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Recent Products</h2>
            <Link href="/dashboard/my-products">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-1.5">
            {myProducts.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg hover-bg"
                style={{ backgroundColor: "var(--color-bg-elevated)" }}
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{product.title}</p>
                    <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                      {product.product_type?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                    style={{
                      backgroundColor: product.status === "active" ? "oklch(0.60 0.15 150 / 0.12)" : "var(--color-bg-hover)",
                      color: product.status === "active" ? "oklch(0.60 0.15 150)" : "var(--color-fg-muted)",
                    }}
                  >
                    {product.status}
                  </Badge>
                  <span className="text-sm font-mono font-medium" style={{ color: "var(--color-fg)" }}>
                    {product.price_amount} USDC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state for products — onboarding prompt */}
      {(!myProducts || myProducts.length === 0) && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-fg)" }}>Get started selling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Scissors,
                title: "Create a Clip Pack",
                desc: "Bundle your best clips and sell them instantly",
                href: "/dashboard/products/create",
              },
              {
                icon: Package,
                title: "Launch a Template",
                desc: "Sell editable presets and workflows to creators",
                href: "/dashboard/products/create",
              },
              {
                icon: PlusCircle,
                title: "Post a Gig",
                desc: "Offer your skills as a freelance service",
                href: "/dashboard/marketplace/post",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href}>
                <div
                  className="p-4 rounded-xl hover-lift cursor-pointer"
                  style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: "var(--color-accent-soft)" }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: "var(--color-fg)" }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-fg-muted)" }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Agents */}
      {myAgents && myAgents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" style={{ color: "oklch(0.55 0.15 200)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Your AI Agents</h2>
            </div>
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {myAgents.map((agent: any) => (
              <div
                key={agent.id}
                className="p-4 rounded-xl hover-bg"
                style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "oklch(0.55 0.15 200 / 0.12)" }}
                    >
                      <Bot className="h-4 w-4" style={{ color: "oklch(0.55 0.15 200)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{agent.agent_name}</p>
                      <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{agent.agent_type}</p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: agent.availability_status === "online" ? "oklch(0.60 0.15 150 / 0.12)" : "var(--color-bg-hover)",
                      color: agent.availability_status === "online" ? "oklch(0.60 0.15 150)" : "var(--color-fg-muted)",
                    }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.availability_status === "online" ? "bg-green-500 animate-pulse-soft" : "bg-muted-foreground"}`} />
                    {agent.availability_status || "offline"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                  <span>{agent.total_jobs_completed || 0} jobs</span>
                  <span>✦ {agent.reputation_score || 0}</span>
                  {agent.total_earnings > 0 && <span>{agent.total_earnings} USDC</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Escrow Agreements */}
      {wallet && (
        <EscrowAgreements
          userId={user.id}
          profileId={profile?.id}
          walletId={wallet.circle_wallet_id}
        />
      )}

      {/* Transactions */}
      {wallet && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Recent transactions</h2>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <Transactions wallet={wallet} profile={profile} />
          </div>
        </section>
      )}
    </div>
  );
}
