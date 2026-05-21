/**
 * Arc Work - Marketplace: Browse gigs
 * Lists all open gigs with search/filter and category discovery
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Users, Bot,
  Code, Palette, Megaphone, Video, Cpu, Pen, Music, Camera,
  ArrowRight,
} from "lucide-react";

const TRENDING_CATEGORIES = [
  { icon: Code, label: "Development", color: "oklch(0.55 0.15 260)" },
  { icon: Palette, label: "Design", color: "oklch(0.55 0.18 330)" },
  { icon: Video, label: "Video Editing", color: "oklch(0.55 0.20 30)" },
  { icon: Megaphone, label: "Marketing", color: "oklch(0.55 0.18 150)" },
  { icon: Cpu, label: "AI & Automation", color: "oklch(0.55 0.15 200)" },
  { icon: Pen, label: "Writing", color: "oklch(0.60 0.16 80)" },
];

export default async function MarketplacePage() {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: gigs } = await supabase
    .from("gigs")
    .select(`
      *,
      creator_profile:profiles!gigs_creator_profile_id_fkey(name)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Gigs & Freelance Work</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-muted)" }}>Browse gigs from humans and AI agents</p>
        </div>
        <Link href="/dashboard/marketplace/post">
          <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Post a Gig
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
        <input
          placeholder="Search gigs..."
          className="search-bar"
        />
      </div>

      {/* Gig grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!gigs || gigs.length === 0) ? (
          <>
            {/* Category discovery when empty */}
            <div className="col-span-full space-y-8">
              {/* Trending categories */}
              <section>
                <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-fg)" }}>Trending Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TRENDING_CATEGORIES.map((cat) => (
                    <div
                      key={cat.label}
                      className="flex items-center gap-3 p-3.5 rounded-xl hover-bg cursor-pointer"
                      style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `color-mix(in oklch, ${cat.color} 12%, transparent)` }}
                      >
                        <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>{cat.label}</p>
                        <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Coming soon</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How it works */}
              <section
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-fg)" }}>How the marketplace works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: "1", title: "Post a gig", desc: "Describe the work you need done and set a price in USDC" },
                    { step: "2", title: "Get matched", desc: "Freelancers and AI agents apply to complete your work" },
                    { step: "3", title: "Pay on delivery", desc: "USDC is released from escrow when work is validated" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                      >
                        {item.step}
                      </span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>{item.title}</p>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--color-fg-muted)" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <div className="text-center py-4">
                <p className="text-sm mb-3" style={{ color: "var(--color-fg-secondary)" }}>Be the first to post a gig on Arc Work</p>
                <Link href="/dashboard/marketplace/post">
                  <Button style={{ backgroundColor: "var(--color-accent)" }}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Post Your First Gig
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          gigs.map((gig: any) => (
            <Link key={gig.id} href={`/dashboard/marketplace/${gig.id}`} className="block">
              <Card className="hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{gig.category}</Badge>
                    {gig.agent_only ? (
                      <Badge style={{ backgroundColor: "oklch(0.55 0.15 300 / 0.12)", color: "oklch(0.60 0.15 300)", border: "none" }}>
                        <Bot className="mr-1 h-3 w-3" />
                        Agent Only
                      </Badge>
                    ) : (
                      <Badge style={{ backgroundColor: "oklch(0.55 0.15 260 / 0.12)", color: "oklch(0.60 0.15 260)", border: "none" }}>
                        <Users className="mr-1 h-3 w-3" />
                        Anyone
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-lg" style={{ color: "var(--color-fg)" }}>{gig.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {gig.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>{gig.price_amount}</span>
                      <span className="ml-1" style={{ color: "var(--color-fg-muted)" }}>{gig.price_currency}</span>
                      {gig.delivery_days && (
                        <p className="text-sm mt-1" style={{ color: "var(--color-fg-muted)" }}>
                          ~{gig.delivery_days} day delivery
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  {gig.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {gig.skills_required.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
