/**
 * API: Connect social accounts for verification
 * YouTube — live OAuth
 * TikTok, IG, Twitch, X — mock data for now (OAuth setup guide)
 */
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

// Mock data for platforms without live OAuth yet
const MOCK_METRICS: Record<string, { followers: number; views: number; username: string }> = {
  youtube: { followers: 45200, views: 3200000, username: "creatorschannel" },
  tiktok: { followers: 128000, views: 8900000, username: "cliptok" },
  instagram: { followers: 38000, views: 2100000, username: "clip_creator" },
  twitch: { followers: 15200, views: 980000, username: "streamer_clips" },
  x: { followers: 8900, views: 450000, username: "clip_artist" },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { platform } = await req.json();
    if (!platform || !MOCK_METRICS[platform]) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Get or create creator profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    let { data: cp } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!cp) {
      const { data: newCp } = await supabase
        .from("creator_profiles")
        .insert({ profile_id: profile.id, display_name: user.email?.split("@")[0] || "Creator" })
        .select()
        .single();
      cp = newCp;
    }

    if (!cp) return NextResponse.json({ error: "Failed to create creator profile" }, { status: 500 });

    // Store/update verification with mock data
    const metrics = MOCK_METRICS[platform];
    const { error } = await supabase.from("creator_verifications").upsert({
      creator_profile_id: cp.id,
      platform,
      platform_username: metrics.username,
      platform_user_id: `${platform}_${user.id}`,
      followers: metrics.followers,
      total_views: metrics.views,
      verified_at: new Date().toISOString(),
      raw_response: { mock: true, note: "Replace with OAuth real data" },
    }, { onConflict: "creator_profile_id, platform" });

    if (error) throw error;

    return NextResponse.json({ mock: true, platform, metrics });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
