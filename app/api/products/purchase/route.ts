/**
 * Arc ClipArc - API: Purchase a product
 */

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { circleDeveloperSdk } from "@/lib/utils/developer-controlled-wallets-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PurchaseSchema = z.object({
  product_id: z.string().uuid(),
  tx_hash: z.string().optional(),
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

    const { product_id, tx_hash } = parsed.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch product with access_url and file_url (securely stored in DB)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price_amount, price_currency, status, creator_profile_id, access_url, file_url")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 400 });
    }

    // Prevent creator from buying their own product
    if (product.creator_profile_id === profile.id) {
      return NextResponse.json({ error: "You cannot purchase your own product." }, { status: 400 });
    }

    // Check if user has already purchased the product
    const { data: existingPurchase } = await supabase
      .from("product_purchases")
      .select("id")
      .eq("product_id", product.id)
      .eq("buyer_profile_id", profile.id)
      .eq("status", "completed")
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({
        message: "You already own this product",
        purchase: {
          id: existingPurchase.id,
          access_url: product.access_url,
          file_url: product.file_url,
        }
      }, { status: 200 });
    }

    let finalTxHash = tx_hash;

    // If tx_hash is not provided by the client (e.g. platform wallet/Circle DCW flow)
    if (!finalTxHash) {
      // 1. Fetch the buyer's developer-controlled wallet
      const { data: buyerWallet, error: buyerWalletError } = await supabase
        .from("wallets")
        .select("circle_wallet_id, wallet_address")
        .eq("profile_id", profile.id)
        .single();

      if (buyerWalletError || !buyerWallet) {
        return NextResponse.json({ error: "Buyer's wallet not found. Please set up a wallet or request funds first." }, { status: 404 });
      }

      // 2. Fetch the creator's developer-controlled wallet
      const { data: creatorWallet, error: creatorWalletError } = await supabase
        .from("wallets")
        .select("wallet_address")
        .eq("profile_id", product.creator_profile_id)
        .single();

      if (creatorWalletError || !creatorWallet) {
        return NextResponse.json({ error: "Creator's wallet not found. Payments cannot be routed." }, { status: 404 });
      }

      // 3. Fetch buyer's USDC balance using Circle DCW client
      const balanceResponse = await circleDeveloperSdk.getWalletTokenBalance({
        id: buyerWallet.circle_wallet_id,
        includeAll: true,
      });

      const usdcBalance = balanceResponse.data?.tokenBalances?.find(
        ({ token }) => token.symbol === "USDC",
      )?.amount;

      if (!usdcBalance || parseFloat(usdcBalance) < product.price_amount) {
        return NextResponse.json({
          error: `Insufficient USDC balance. You have ${usdcBalance || "0"} USDC, but this product costs ${product.price_amount} USDC. Please request USDC via faucet.`
        }, { status: 400 });
      }

      // 4. Execute the on-chain USDC transfer from buyer to creator
      const transferResponse = await circleDeveloperSdk.createTransaction({
        walletId: buyerWallet.circle_wallet_id,
        destinationAddress: creatorWallet.wallet_address,
        amount: [product.price_amount.toString()],
        fee: {
          type: "level",
          config: {
            feeLevel: "MEDIUM",
          },
        },
        tokenAddress: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x3600000000000000000000000000000000000000",
        blockchain: (process.env.CIRCLE_BLOCKCHAIN || "ARC-TESTNET") as any
      });

      if (!transferResponse.data?.id) {
        return NextResponse.json({ error: "Failed to initiate Circle USDC transfer transaction" }, { status: 500 });
      }

      finalTxHash = transferResponse.data.id;
    }

    // 5. Record the completed purchase in the database
    const { data: purchase, error: insertError } = await supabase
      .from("product_purchases")
      .insert({
        product_id: product.id,
        buyer_profile_id: profile.id,
        amount: product.price_amount,
        currency: product.price_currency,
        status: "completed",
        tx_hash: finalTxHash,
        delivered: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Return purchase with secure access URLs
    return NextResponse.json({
      purchase: {
        ...purchase,
        access_url: product.access_url,
        file_url: product.file_url,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error recording purchase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

