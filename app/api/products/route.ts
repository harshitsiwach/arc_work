/**
 * Arc ClipArc - API: Create a product
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(""),
  price_amount: z.number().positive(),
  price_currency: z.string().optional().default("USDC"),
  product_type: z.enum(["clip_pack", "template", "membership"]),
  delivery_type: z.string().optional().default("instant"),
  media_urls: z.array(z.string()).optional().default([]),
  file_url: z.string().optional().nullable().default(null),
  access_url: z.string().optional().nullable().default(null),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);
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

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        creator_profile_id: profile.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        price_amount: parsed.data.price_amount,
        price_currency: parsed.data.price_currency,
        product_type: parsed.data.product_type,
        delivery_type: parsed.data.delivery_type,
        media_urls: parsed.data.media_urls,
        file_url: parsed.data.file_url,
        access_url: parsed.data.access_url,
        tags: parsed.data.tags,
        featured: parsed.data.featured,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
