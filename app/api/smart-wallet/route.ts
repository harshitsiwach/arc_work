/**
 * API: Create/Manage smart (modular) wallets
 * All Circle API calls happen server-side — API key stays secure
 */
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, userToken, challengeId } = body || {};

    // Setup: Create Circle user + token
    if (action === "setup") {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const circleUserId = user.id;
      try { await circleClient.createUser({ userId: circleUserId }); } catch {}
      const tokenResp = await circleClient.createUserToken({ userId: circleUserId });

      return NextResponse.json({
        userId: circleUserId,
        userToken: tokenResp.data?.userToken,
      });
    }

    // Create wallet challenge
    if (action === "create-wallet") {
      if (!userId || !userToken) {
        return NextResponse.json({ error: "Missing userId or userToken" }, { status: 400 });
      }
      const challengeResp = await (circleClient as any).createWallet({
        userToken, userId, accountType: "SCA", blockchains: ["ARC-TESTNET"],
      });
      return NextResponse.json({ challengeId: challengeResp.data?.challengeId });
    }

    // Check challenge status
    if (action === "check-challenge") {
      if (!userId || !userToken || !challengeId) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
      }
      const statusResp = await circleClient.getUserChallenge({ userToken, challengeId });
      return NextResponse.json(statusResp.data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Smart wallet error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
