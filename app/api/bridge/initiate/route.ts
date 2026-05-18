/**
 * Arc Work - API: Initiate USDC Bridge via CCTP
 * Generates the transaction the user signs with their wallet
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BridgeSchema = z.object({
  sourceChain: z.string(),
  amount: z.string(),
  userAddress: z.string(),
});

// Arc Testnet USDC ERC-20 address
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ARC_CHAIN_ID = 5042002;

// CCTP TokenMessenger address on each testnet chain
const CCTP_CONTRACTS: Record<string, { tokenMessenger: string; usdc: string; domain: number }> = {
  "ETH-SEPOLIA": {
    tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156b6Ae5e3",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    domain: 0,
  },
  "BASE-SEPOLIA": {
    tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156b6Ae5e3",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    domain: 6,
  },
  "ARBITRUM-SEPOLIA": {
    tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156b6Ae5e3",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    domain: 7,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BridgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { sourceChain, amount, userAddress } = parsed.data;
    const cctp = CCTP_CONTRACTS[sourceChain];

    if (!cctp) {
      return NextResponse.json({ error: `Unsupported chain: ${sourceChain}` }, { status: 400 });
    }

    // Convert amount to 6 decimal USDC
    const amountWei = BigInt(Math.round(parseFloat(amount) * 1_000_000)).toString();

    // Build the approve transaction (approve USDC spending for TokenMessenger)
    const approveTx = {
      to: cctp.usdc,
      data: `0x095ea7b3000000000000000000000000${cctp.tokenMessenger.slice(2)}${amountWei.padStart(64, '0')}`,
    };

    // Build the depositForBurn transaction
    // depositForBurn(address burnToken, uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)
    const burnTx = {
      to: cctp.tokenMessenger,
      value: "0x0",
      data: `0x6fd3504e000000000000000000000000${cctp.usdc.slice(2)}${amountWei.padStart(64, '0')}0000001a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000${userAddress.slice(2).padStart(64, '0')}`,
    };

    return NextResponse.json({
      txRequest: {
        method: "eth_sendTransaction",
        params: [burnTx],
      },
      approveTx: {
        method: "eth_sendTransaction",
        params: [approveTx],
      },
      note: "First approve USDC spending, then call depositForBurn",
    });

  } catch (error: any) {
    console.error("Bridge error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
