/**
 * Arc ClipArc - API: x402 Gated Courses
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyX402Payment } from "@/lib/x402";

// Static course database for MVP demonstration
const COURSES: Record<string, {
  title: string;
  creatorAddress: string;
  priceUSDC: number;
  modules: Array<{
    id: string;
    title: string;
    isFree: boolean;
    videoUrl?: string;
    description: string;
  }>;
}> = {
  "solidity-101": {
    title: "Solidity & Smart Contract Development 101",
    creatorAddress: "0x37fc98997055b4be246d698b131cabc2c4ab34a3", // Platform / Agent wallet address
    priceUSDC: 5.0, // 5 USDC
    modules: [
      {
        id: "intro",
        title: "1. Introduction to Smart Contracts",
        isFree: true,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        description: "Welcome to Solidity 101! In this session, we will cover the absolute basics of EVM architecture, compiler setups, and basic variables."
      },
      {
        id: "erc20-tokens",
        title: "2. Building & Customizing ERC20 Tokens",
        isFree: false,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        description: "Learn how to import OpenZeppelin standards, customize decimal logic, and manage total supply allocations."
      },
      {
        id: "advanced-escrows",
        title: "3. Implementing Escrow & Refund Protocols",
        isFree: false,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        description: "Deep dive into multi-sig, arbiter release structures, and handling USDC payments securely inside smart contracts."
      }
    ]
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const course = COURSES[courseId];

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("module");

    if (!moduleId) {
      // Return list of modules (stripping locked info)
      const publicModules = course.modules.map(mod => ({
        id: mod.id,
        title: mod.title,
        isFree: mod.isFree,
        description: mod.isFree ? mod.description : "Pay to unlock full content and resources."
      }));

      return NextResponse.json({
        title: course.title,
        priceUSDC: course.priceUSDC,
        creatorAddress: course.creatorAddress,
        modules: publicModules
      });
    }

    const moduleItem = course.modules.find(mod => mod.id === moduleId);
    if (!moduleItem) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // 1. If it's free, return it directly
    if (moduleItem.isFree) {
      return NextResponse.json({ module: moduleItem });
    }

    // 2. If it's locked, verify x402 authorization
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("x402 ")) {
      // Return HTTP 402 with billing metadata headers
      return new NextResponse(
        JSON.stringify({
          error: "Payment Required to unlock this module",
          amount: course.priceUSDC,
          recipient: course.creatorAddress,
          currency: "USDC",
          chainId: 5042002
        }),
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
            "x-payment-amount": course.priceUSDC.toString(),
            "x-payment-address": course.creatorAddress,
            "x-payment-currency": "USDC",
            "x-payment-chain-id": "5042002"
          }
        }
      );
    }

    const txHash = authHeader.split(" ")[1];
    
    // Verify transaction hash
    const verification = await verifyX402Payment(txHash, course.creatorAddress, course.priceUSDC);

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 402 }
      );
    }

    // Payment validated successfully! Return the full locked module details.
    return NextResponse.json({
      module: moduleItem,
      verifiedPayment: verification.details
    });

  } catch (error: any) {
    console.error("Error in course API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
