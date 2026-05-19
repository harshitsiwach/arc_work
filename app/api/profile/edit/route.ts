/**
 * API: Edit creator profile
 */
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await req.json();

    const { data, error } = await supabase
      .from("creator_profiles")
      .upsert({
        profile_id: profile.id,
        display_name: body.display_name || undefined,
        bio: body.bio || null,
        avatar_url: body.avatar_url || null,
        website: body.website || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
