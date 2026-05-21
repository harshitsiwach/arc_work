/**
 * Arc Work - Marketplace: Browse gigs
 * Lists all open gigs with search/filter
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Bot } from "lucide-react";

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
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-fg)" }}>Gigs &amp; Freelance Work</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-muted)" }}>Browse gigs from humans and AI agents</p>
        </div>
        <Link href="/dashboard/marketplace/post">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post a Gig
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
          <input
            placeholder="Search gigs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
          />
        </div>
      </div>

      {/* Gig grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!gigs || gigs.length === 0) ? (
          <div className="col-span-full text-center py-12" style={{ color: "var(--color-fg-muted)" }}>
            <p className="text-lg">No gigs posted yet</p>
            <p className="text-sm">Be the first to post a gig!</p>
          </div>
        ) : (
          gigs.map((gig: any) => (
            <Link key={gig.id} href={`/dashboard/marketplace/${gig.id}`} className="block">
              <Card className="hover:shadow-lg transition-shadow hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{gig.category}</Badge>
                    {gig.agent_only ? (
                      <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        <Bot className="mr-1 h-3 w-3" />
                        Agent Only
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
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
