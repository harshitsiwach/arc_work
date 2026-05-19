/**
 * Server-side swap execution using Circle App Kit.
 * This bypasses the browser CORS restriction on x-user-agent header.
 * The kit.swap() SDK call is made here on the server using a private-key adapter
 * for quote/routing only — actual signing still happens client-side via MetaMask.
 *
 * NOTE: This endpoint only fetches the swap quote/transaction data from Circle.
 * The client must still sign and send the transaction via their own wallet.
 */
import { NextRequest, NextResponse } from "next/server";

// Arc Testnet token contract addresses (from environment variables)
const ARC_TOKEN_ADDRESSES: Record<string, string> = {
  USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS ?? "0x3600000000000000000000000000000000000000",
  EURC: process.env.NEXT_PUBLIC_EURC_CONTRACT_ADDRESS ?? "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

export async function POST(req: NextRequest) {
  try {
    const { tokenIn, tokenOut, amountIn, fromAddress } = await req.json();

    if (!tokenIn || !tokenOut || !amountIn || !fromAddress) {
      return NextResponse.json(
        { message: "Missing required fields: tokenIn, tokenOut, amountIn, fromAddress" },
        { status: 400 }
      );
    }

    const kitKey = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY;
    if (!kitKey) {
      return NextResponse.json({ message: "Kit Key not configured" }, { status: 500 });
    }

    // Convert human-readable amount to base units (USDC/EURC both have 6 decimals)
    const amountInBaseUnits = BigInt(Math.round(parseFloat(amountIn) * 1_000_000)).toString();

    // Resolve token aliases to actual EVM contract addresses
    const tokenInAddress = ARC_TOKEN_ADDRESSES[tokenIn] ?? tokenIn;
    const tokenOutAddress = ARC_TOKEN_ADDRESSES[tokenOut] ?? tokenOut;

    // Proxy the swap quote request to Circle's API server-side (no CORS restrictions)
    const circleRes = await fetch("https://api.circle.com/v1/stablecoinKits/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${kitKey}`,
      },
      body: JSON.stringify({
        tokenInChain: "Arc_Testnet",
        tokenOutChain: "Arc_Testnet",
        tokenInAddress: tokenIn,   // USDC / EURC alias resolved by Circle
        tokenOutAddress: tokenOut, // USDC / EURC alias resolved by Circle
        amount: amountInBaseUnits,
        fromAddress,
        toAddress: fromAddress,    // swap to same address (self)
      }),
    });

    const data = await circleRes.json().catch(() => ({}));

    // Log full Circle response for debugging
    console.log("[/api/swap] Circle status:", circleRes.status);
    console.log("[/api/swap] Circle response:", JSON.stringify(data, null, 2));

    if (!circleRes.ok) {
      return NextResponse.json(data, { status: circleRes.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Internal error" }, { status: 500 });
  }
}
