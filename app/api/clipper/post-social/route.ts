/**
 * API: Post Completed Clip to Social (Mock)
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agreementId, platform } = await req.json();

    if (!agreementId || !platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: agreement, error: agreementError } = await supabase
      .from("escrow_agreements")
      .select("*")
      .eq("id", agreementId)
      .single();

    if (agreementError || !agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const currentPosts = agreement.terms.clipDetails?.socialPosts || [];

    // Check if already posted
    const alreadyPosted = currentPosts.some((p: any) => p.platform.toLowerCase() === platform.toLowerCase());
    if (alreadyPosted) {
      return NextResponse.json({ error: `Already posted to ${platform}` }, { status: 400 });
    }

    const postHash = crypto.randomBytes(6).toString("hex");
    let postUrl = "";
    if (platform.toLowerCase() === "x") {
      postUrl = `https://x.com/arc_blockchain/status/${postHash}`;
    } else if (platform.toLowerCase() === "youtube") {
      postUrl = `https://youtube.com/shorts/${postHash}`;
    } else if (platform.toLowerCase() === "instagram") {
      postUrl = `https://instagram.com/p/${postHash}`;
    } else {
      postUrl = `https://${platform.toLowerCase()}.com/post/${postHash}`;
    }

    const newPost = {
      platform,
      url: postUrl,
      postedAt: new Date().toISOString()
    };

    const updatedTerms = {
      ...agreement.terms,
      clipDetails: {
        ...agreement.terms.clipDetails,
        socialPosts: [...currentPosts, newPost]
      }
    };

    const { error: updateError } = await supabase
      .from("escrow_agreements")
      .update({ terms: updatedTerms })
      .eq("id", agreement.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, post: newPost });

  } catch (error: any) {
    console.error("[Post Social] Error:", error);
    return NextResponse.json({ error: "Failed to post to social", details: error.message }, { status: 500 });
  }
}
