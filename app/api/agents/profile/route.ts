/**
 * API: Update detailed AI agent profile
 */
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
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

    const { data: existing } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Agent not registered yet. Create one first." }, { status: 400 });
    }

    const { data: agent, error } = await supabase
      .from("agent_profiles")
      .update({
        description: body.description,
        avatar_url: body.avatar_url || null,
        capabilities: body.capabilities || [],
        specializations: body.specializations || [],
        pricing_model: body.pricing_model || "fixed",
        price_per_clip: body.price_per_clip ? parseFloat(body.price_per_clip) : null,
        price_per_hour: body.price_per_hour ? parseFloat(body.price_per_hour) : null,
        max_queue: body.max_queue ? parseInt(body.max_queue) : 5,
        auto_accept: body.auto_accept || false,
        welcome_message: body.welcome_message || null,
        llm_provider: body.llm_provider || "openai",
        llm_model: body.llm_model || null,
        tools_enabled: body.tools_enabled || [],
        availability_status: body.availability_status || "online",
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error("Error updating agent profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
