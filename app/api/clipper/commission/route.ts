/**
 * API: Commission AI Clipper Escrow Contract
 */
import type { Blockchain } from "@circle-fin/smart-contract-platform";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { circleContractSdk } from "@/lib/utils/smart-contract-platform-client";
import { createAgreementService } from "@/app/services/agreement.service";
import { REFUND_PROTOCOL_BYTECODE, REFUND_PROTOCOL_ABI_JSON } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const agreementService = createAgreementService(supabase);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, startTime, endTime, targetLanguage, instructions, socials, isFree } = await req.json();

    if (!url || startTime === undefined || endTime === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      return NextResponse.json({ error: "Invalid start or end times" }, { status: 400 });
    }

    // 1. Fetch depositor profile & primary wallet
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch user's primary wallet (exclude agent address if they share profile)
    const { data: depositorWallet, error: depositorWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("profile_id", profile.id)
      .neq("wallet_address", process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS)
      .limit(1)
      .single();

    if (depositorWalletError || !depositorWallet) {
      return NextResponse.json({ error: "Depositor wallet not found" }, { status: 404 });
    }

    // 2. Fetch agent wallet
    const { data: agentWallet, error: agentWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("wallet_address", process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS)
      .single();

    if (agentWalletError || !agentWallet) {
      return NextResponse.json({ error: "Agent wallet not registered in database" }, { status: 500 });
    }

    const amountUSDC = isFree ? 0.0 : 5.0; // Fixed budget

    // 3. Create the initial transaction and agreement records in Supabase
    const transaction = await agreementService.createTransaction({
      walletId: depositorWallet.id,
      profileId: profile.id,
      amount: amountUSDC,
      description: isFree ? "Free AI Clipper agent execution" : "AI Clipper Agent commission deposit",
    });

    const agreementTerms = {
      amounts: [
        {
          amount: `${amountUSDC.toFixed(2)} USDC`,
          for: "AI Video clipping & posting",
        },
      ],
      tasks: [
        {
          description: `Download video segment from ${start} to ${end} seconds`,
        },
        {
          description: `Transcribe to ${targetLanguage || "English"} and post to ${socials && socials.length > 0 ? socials.join(", ") : "no socials"}`,
        },
      ],
      clipDetails: {
        url,
        startTime: start,
        endTime: end,
        targetLanguage: targetLanguage || "English",
        instructions: instructions || "",
        socials: socials || [],
        videoUrl: null,
        transcript: null,
        socialPosts: [],
      },
    };

    const agreement = await agreementService.createAgreement({
      beneficiaryWalletId: agentWallet.id,
      depositorWalletId: depositorWallet.id,
      transactionId: transaction.id,
      terms: agreementTerms,
    });

    if (isFree) {
      // For free clipper, we skip contract deployment entirely
      await supabase
        .from("escrow_agreements")
        .update({
          circle_contract_id: "free-clipper",
          status: "ACTIVE",
        })
        .eq("id", agreement.id);

      await supabase
        .from("transactions")
        .update({ circle_transaction_id: "free-clipper" })
        .eq("id", transaction.id);

      return NextResponse.json({
        success: true,
        agreementId: agreement.id,
        circleContractId: "free-clipper",
        circleTransactionId: "free-clipper",
        isFree: true,
        status: "ACTIVE",
        message: "Free AI Clipper execution initialized",
      });
    }

    // 4. Deploy the escrow contract
    if (!process.env.CIRCLE_BLOCKCHAIN) {
      throw new Error("CIRCLE_BLOCKCHAIN environment variable is not set");
    }

    if (!process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS) {
      throw new Error("NEXT_PUBLIC_USDC_CONTRACT_ADDRESS environment variable is not set");
    }

    const deployResponse = await circleContractSdk.deployContract({
      name: `Refund Protocol Clipper Escrow ${agentWallet.wallet_address}`,
      description: `Clipper Agent Escrow ${agentWallet.wallet_address}`,
      walletId: process.env.NEXT_PUBLIC_AGENT_WALLET_ID,
      blockchain: process.env.CIRCLE_BLOCKCHAIN as Blockchain,
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
      constructorParameters: [
        process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS,
        process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
        "EscrowProtocol",
        "1.0",
      ],
      abiJson: REFUND_PROTOCOL_ABI_JSON,
      bytecode: REFUND_PROTOCOL_BYTECODE,
    });

    if (!deployResponse.data) {
      throw new Error("No data returned from Circle contract deployment");
    }

    // 5. Update the contract IDs in the database
    await supabase
      .from("escrow_agreements")
      .update({
        circle_contract_id: deployResponse.data.contractId,
        status: "PENDING",
      })
      .eq("id", agreement.id);

    await supabase
      .from("transactions")
      .update({ circle_transaction_id: deployResponse.data.transactionId })
      .eq("id", transaction.id);

    return NextResponse.json({
      success: true,
      agreementId: agreement.id,
      circleContractId: deployResponse.data.contractId,
      circleTransactionId: deployResponse.data.transactionId,
      status: "PENDING",
      message: "AI Clipper escrow contract deployment initiated",
    });

  } catch (error: any) {
    console.error("[Clipper Commission] Error:", error);
    return NextResponse.json(
      { error: "Failed to commission clipper agent", details: error.message },
      { status: 500 }
    );
  }
}
