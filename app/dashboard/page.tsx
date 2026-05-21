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
  Wallet, AlertCircle,
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
    <div className="space-y-6">
      {/* Page header */}
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
          <Link href="/dashboard/products">
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Package}
          label="Active Products"
          value={activeProducts.toString()}
        />
        <StatCard
          icon={Bot}
          label="AI Agents"
          value={agentCount.toString()}
        />
        <StatCard
          icon={DollarSign}
          label="Total Listed"
          value={`${totalListed.toFixed(0)} USDC`}
        />
        <StatCard
          icon={Coins}
          label="Wallet Balance"
          value={wallet?.circle_wallet_id ? <WalletBalance walletId={wallet.circle_wallet_id} /> : "—"}
          isBalance
        />
      </div>

      {/* Wallet + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Card */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
              <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>Account balance</CardTitle>
            </div>
            {wallet && <WalletInformationDialog wallet={wallet} />}
          </CardHeader>
          <CardContent>
            {wallet ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
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
          </CardContent>
        </Card>

        {/* Buyer Quick Start */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>Browse & Buy</CardTitle>
            <CardDescription>Discover what creators have built</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard/products", label: "Product Catalog", icon: TrendingUp },
                { href: "/dashboard/marketplace", label: "Freelance Gigs", icon: ExternalLink },
                { href: "/dashboard/courses", label: "Courses", icon: Shield },
                { href: "/dashboard/tools", label: "Tools & APIs", icon: Zap },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg border transition-all duration-150 hover-lift cursor-pointer"
                    style={{ borderColor: "var(--color-bd)" }}
                  >
                    <action.icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      {myProducts && myProducts.length > 0 && (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>Recent Products</CardTitle>
              <CardDescription>Your latest listings</CardDescription>
            </div>
            <Link href="/dashboard/my-products">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-inset)" }}
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
          </CardContent>
        </Card>
      )}

      {/* Empty state for products */}
      {(!myProducts || myProducts.length === 0) && (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardContent className="py-8 text-center">
            <Package className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
              Start selling on Arc Work
            </p>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-fg-muted)" }}>
              Create your first product to earn USDC from buyers worldwide
            </p>
            <Link href="/dashboard/products/create">
              <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Your First Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* AI Agents */}
      {myAgents && myAgents.length > 0 && (
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                <Bot className="h-4 w-4" style={{ color: "oklch(0.55 0.15 200)" }} />
                Your AI Agents
              </CardTitle>
              <CardDescription>Autonomous workers earning for you</CardDescription>
            </div>
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {myAgents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "var(--color-bd)" }}
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
          </CardContent>
        </Card>
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
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
              <Clock className="h-4 w-4" />
              Recent transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Transactions wallet={wallet} profile={profile} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, isBalance }: { icon: any; label: string; value: string | React.ReactNode; isBalance?: boolean }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
        <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
        {value}
      </p>
    </div>
  );
}
