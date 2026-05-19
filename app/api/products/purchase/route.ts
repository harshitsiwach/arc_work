/**
 * Arc ClipArc - API: Purchase a product
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PurchaseSchema = z.object({
  product_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PurchaseSchema.safeParse(body);
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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price_amount, price_currency, status")
      .eq("id", parsed.data.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 400 });
    }

    const { data: purchase, error: insertError } = await supabase
      .from("product_purchases")
      .insert({
        product_id: product.id,
        buyer_profile_id: profile.id,
        amount: product.price_amount,
        currency: product.price_currency,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error: any) {
    console.error("Error recording purchase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
