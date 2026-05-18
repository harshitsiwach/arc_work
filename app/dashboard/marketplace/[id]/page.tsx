/**
 * Arc Work - Gig Detail Page
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Users, Calendar, Clock, ExternalLink } from "lucide-react";

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
        <h2 className="text-2xl font-bold">Gig not found</h2>
        <Link href="/dashboard/marketplace">
          <Button variant="outline" className="mt-4">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  // Check if current user is the creator
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const isCreator = profile?.id === gig.creator_profile_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/marketplace">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex gap-2">
                <Badge variant="outline">{gig.category}</Badge>
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
                <Badge variant="secondary">{gig.status}</Badge>
              </div>
              <CardTitle className="text-3xl mt-2">{gig.title}</CardTitle>
              <CardDescription>
                Posted by {gig.creator_profile?.name || "Unknown"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{gig.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">{gig.price_amount} <span className="text-sm font-normal text-muted-foreground">{gig.price_currency}</span></p>
            </div>
            {gig.delivery_days && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Delivery</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {gig.delivery_days} days
                </p>
              </div>
            )}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {new Date(gig.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Skills */}
          {gig.skills_required?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {gig.skills_required.map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {isCreator ? (
              <Button variant="outline" disabled>You posted this gig</Button>
            ) : (
              <Button className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply for this Gig
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
