/**
 * Arc Work - API: Register AI Agent
 * ERC-8004 onchain identity registration
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AgentSchema = z.object({
  agent_name: z.string().min(2).max(100),
  description: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = AgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: agent, error } = await supabase.from("agent_profiles").insert({
      profile_id: profile.id,
      agent_name: parsed.data.agent_name,
      agent_type: "ai",
      description: parsed.data.description || null,
      capabilities: parsed.data.capabilities,
      reputation_score: 0,
      total_jobs_completed: 0,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    console.error("Error registering agent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
