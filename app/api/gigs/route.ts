/**
 * Arc Work - API: Create a gig
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GigSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string(),
  price_amount: z.number().positive(),
  delivery_days: z.number().int().positive().nullable(),
  agent_only: z.boolean().default(false),
  skills_required: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = GigSchema.safeParse(body);
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

    const { data: gig, error } = await supabase.from("gigs").insert({
      creator_profile_id: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      price_amount: parsed.data.price_amount,
      price_currency: "USDC",
      delivery_days: parsed.data.delivery_days,
      agent_only: parsed.data.agent_only,
      skills_required: parsed.data.skills_required,
      status: "open",
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ gig }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gig:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
