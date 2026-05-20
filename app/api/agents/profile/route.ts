/**
 * API: Update AI Agent Profile
 * PATCH — update fields on an existing agent
 */
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { agentId, ...updates } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("id", agentId)
      .eq("profile_id", profile.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Agent not found or access denied" }, { status: 404 });
    }

    const { data: agent, error } = await supabase
      .from("agent_profiles")
      .update(updates)
      .eq("id", agentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error("Error updating agent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
