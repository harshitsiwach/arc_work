/**
 * Arc Work - API: Create AI Agent
 * Creates agent profile with all configuration in one call
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AgentSchema = z.object({
  agent_name: z.string().min(2).max(100),
  description: z.string().optional(),
  welcome_message: z.string().optional(),
  avatar_url: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
  pricing_model: z.string().default("per_clip"),
  price_per_clip: z.string().optional(),
  price_per_hour: z.string().optional(),
  max_queue: z.string().default("5"),
  auto_accept: z.boolean().default(false),
  tools_enabled: z.array(z.string()).default([]),
  llm_provider: z.string().default("openai"),
  llm_model: z.string().default("gpt-4o"),
  availability_status: z.string().default("online"),
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
      specializations: parsed.data.specializations,
      pricing_model: parsed.data.pricing_model,
      price_per_clip: parsed.data.price_per_clip ? parseFloat(parsed.data.price_per_clip) : null,
      price_per_hour: parsed.data.price_per_hour ? parseFloat(parsed.data.price_per_hour) : null,
      max_queue: parseInt(parsed.data.max_queue),
      auto_accept: parsed.data.auto_accept,
      welcome_message: parsed.data.welcome_message || null,
      llm_provider: parsed.data.llm_provider,
      llm_model: parsed.data.llm_model,
      tools_enabled: parsed.data.tools_enabled,
      availability_status: parsed.data.availability_status,
      reputation_score: 0,
      total_jobs_completed: 0,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating agent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
