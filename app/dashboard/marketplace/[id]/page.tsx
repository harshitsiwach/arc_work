/**
 * Arc Work - Gig Detail Page
 * View gig details and apply — migrated to OKLCH design tokens
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Users, Calendar, Clock, ExternalLink } from "lucide-react";
import { GigApplyButton } from "./apply-button";

export default async function GigDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: gig } = await supabase
    .from("gigs")
    .select(`
      *,
      creator_profile:profiles!gigs_creator_profile_id_fkey(name)
    `)
    .eq("id", params.id)
    .single();

  if (!gig) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>Gig not found</h2>
        <Link href="/dashboard/marketplace">
          <Button variant="outline" className="mt-4">Back to Gigs</Button>
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const isCreator = profile?.id === gig.creator_profile_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/marketplace">
        <Button variant="ghost" className="gap-2" style={{ color: "var(--color-fg-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />
          Back to Gigs
        </Button>
      </Link>

      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex gap-2">
                <Badge variant="outline" style={{ borderColor: "var(--color-bd)" }}>{gig.category}</Badge>
                {gig.agent_only ? (
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <Bot className="mr-1 h-3 w-3" />
                    AI Agents Only
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Users className="mr-1 h-3 w-3" />
                    Open to All
                  </Badge>
                )}
                <Badge variant="secondary" style={{
                  backgroundColor: gig.status === "open" ? "oklch(0.60 0.15 150 / 0.12)" : "var(--color-bg-hover)",
                  color: gig.status === "open" ? "oklch(0.60 0.15 150)" : "var(--color-fg-muted)",
                }}>
                  {gig.status}
                </Badge>
              </div>
              <CardTitle className="text-3xl mt-2" style={{ color: "var(--color-fg)" }}>{gig.title}</CardTitle>
              <CardDescription>
                Posted by {gig.creator_profile?.name || "Unknown"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>{gig.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
              <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Price</p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>
                {gig.price_amount}{" "}
                <span className="text-sm font-normal" style={{ color: "var(--color-fg-muted)" }}>
                  {gig.price_currency}
                </span>
              </p>
            </div>
            {gig.delivery_days && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Delivery</p>
                <p className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                  <Calendar className="h-5 w-5" style={{ color: "var(--color-fg-muted)" }} />
                  {gig.delivery_days} days
                </p>
              </div>
            )}
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg-inset)" }}>
              <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Created</p>
              <p className="font-medium flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                <Clock className="h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
                {new Date(gig.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Skills */}
          {gig.skills_required?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-fg)" }}>Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {gig.skills_required.map((skill: string) => (
                  <Badge key={skill} variant="secondary" style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg-secondary)" }}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--color-bd)" }}>
            {isCreator ? (
              <Button variant="outline" disabled style={{ color: "var(--color-fg-muted)" }}>You posted this gig</Button>
            ) : (
              <GigApplyButton />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
