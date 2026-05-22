/**
 * API: Update Clipper Transcript in Escrow Terms
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agreementId, transcript } = await req.json();

    if (!agreementId || transcript === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the agreement
    const { data: agreement, error: agreementError } = await supabase
      .from("escrow_agreements")
      .select("*")
      .eq("id", agreementId)
      .single();

    if (agreementError || !agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    // Update transcript in terms
    const updatedTerms = {
      ...agreement.terms,
      clipDetails: {
        ...agreement.terms.clipDetails,
        transcript,
      },
    };

    const { error: updateError } = await supabase
      .from("escrow_agreements")
      .update({ terms: updatedTerms })
      .eq("id", agreement.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: "Transcript updated successfully" });

  } catch (error: any) {
    console.error("[Update Transcript] Error:", error);
    return NextResponse.json({ error: "Failed to update transcript", details: error.message }, { status: 500 });
  }
}
