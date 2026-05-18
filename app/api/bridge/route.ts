/**
 * Arc Work - API: Bridge USDC via App Kit
 * Uses @circle-fin/app-kit for cross-chain bridging
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BridgeSchema = z.object({
  sourceChain: z.string(),
  amount: z.string(),
  targetAddress: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BridgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { sourceChain, amount, targetAddress } = parsed.data;

    // App Kit bridge requires:
    // 1. A Circle API key with developer-controlled wallets
    // 2. An adapter (viem, ethers, etc.)
    // 3. The App Kit instance
    //
    // For now, we return the bridge parameters so the frontend
    // can initiate the bridge via the user's wallet (browser-side).
    //
    // Full server-side App Kit bridge will be integrated after
    // wallet setup is complete.

    const bridgeParams = {
      from: {
        chain: sourceChain,
        // Adapter will be injected client-side
      },
      to: {
        chain: "ARC-TESTNET",
        address: targetAddress, // or current user's wallet
      },
      amount,
      // App Kit handles CCTP burn/attestation/mint automatically
    };

    return NextResponse.json({
      message: "Bridge params ready",
      params: bridgeParams,
      explorerUrl: `https://testnet.arcscan.app`,
      note: "Client-side bridge initiation coming after wallet connection setup",
    });

  } catch (error: any) {
    console.error("Bridge error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
