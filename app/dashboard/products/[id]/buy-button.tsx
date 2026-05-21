/**
 * ClipArc - Buy Product Button (Client Component)
 * Handles the purchase interaction and post-purchase success state
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ExternalLink, Download, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { arcTestnet } from "@/lib/web3/appkit-provider";

type BuyButtonProps = {
  productId: string;
  priceAmount: number;
  priceCurrency: string;
  accessUrl: string | null;
  fileUrl: string | null;
  productTitle: string;
  initialPurchased?: boolean;
  initialTxHash?: string | null;
  creatorWalletAddress: string | null;
};

export function BuyProductButton({
  productId,
  priceAmount,
  priceCurrency,
  accessUrl,
  fileUrl,
  productTitle,
  initialPurchased = false,
  initialTxHash = null,
  creatorWalletAddress,
}: BuyButtonProps) {
  const { isConnected, connect, activeWalletType, address, chainId } = useWallet();
  const { walletProvider } = useAppKitProvider("eip155");
  const { switchNetwork } = useAppKitNetwork();

  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(initialPurchased);
  const [purchaseResult, setPurchaseResult] = useState<{
    accessUrl: string | null;
    fileUrl: string | null;
    txHash: string | null;
  } | null>(initialPurchased ? { accessUrl, fileUrl, txHash: initialTxHash } : null);

  const encodeTransfer = (recipient: string, amount: string) => {
    const recipientHex = recipient.replace("0x", "").toLowerCase().padStart(64, "0");
    const amountHex = BigInt(amount).toString(16).padStart(64, "0");
    return `0xa9059cbb${recipientHex}${amountHex}`;
  };

  const handlePurchase = async () => {
    // 1. Ensure user has a connected wallet
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }

    setLoading(true);
    try {
      let txHashToSubmit: string | undefined = undefined;

      // 2. MetaMask EOA Flow
      if (activeWalletType === "metamask") {
        if (!creatorWalletAddress) {
          throw new Error("Creator's payment wallet address is not available.");
        }

        // Switch to Arc Testnet if needed
        if (chainId !== 5042002) {
          if (switchNetwork) {
            try {
              await switchNetwork(arcTestnet);
              // Wait a bit for the wallet to switch network contexts
              await new Promise(r => setTimeout(r, 1000));
            } catch {
              throw new Error("Please switch your wallet network to Arc Testnet to continue.");
            }
          } else {
            throw new Error("Please switch your wallet network to Arc Testnet.");
          }
        }

        if (!walletProvider) {
          throw new Error("Browser wallet provider not found. Please reload or reconnect your wallet.");
        }

        toast.info("Please approve the USDC transfer transaction in your wallet...");

        const usdcContractAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x3600000000000000000000000000000000000000";
        const usdcBaseUnits = BigInt(Math.round(priceAmount * 1_000_000)).toString();

        // Submit client-side transfer
        const txHash = await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to: usdcContractAddress,
            data: encodeTransfer(creatorWalletAddress, usdcBaseUnits),
          }],
        });

        if (!txHash) {
          throw new Error("Transaction rejected or failed to broadcast.");
        }

        txHashToSubmit = txHash;
        toast.info("Transaction submitted! Recording purchase...");
      }

      // 3. Submit purchase to API
      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          tx_hash: txHashToSubmit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Purchase verification failed");
      }

      toast.success(
        `Successfully purchased "${productTitle}" — access granted!`
      );

      const serverPurchase = data.purchase;
      setPurchased(true);
      setPurchaseResult({
        accessUrl: serverPurchase?.access_url ?? data.purchase?.access_url ?? null,
        fileUrl: serverPurchase?.file_url ?? data.purchase?.file_url ?? null,
        txHash: serverPurchase?.tx_hash ?? txHashToSubmit ?? null,
      });
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error(err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  // Resolve final URLs & TX tracking
  const finalAccessUrl = purchaseResult?.accessUrl || accessUrl;
  const finalFileUrl = purchaseResult?.fileUrl || fileUrl;
  const finalTxHash = purchaseResult?.txHash;

  // ── Success State ─────────────────────────────────────────
  if (purchased) {
    return (
      <div className="animate-scale-in space-y-5">
        {/* Success confirmation */}
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm"
          style={{
            backgroundColor: "var(--color-success-soft)",
            border: "1px solid color-mix(in srgb, var(--color-success) 20%, transparent)",
          }}
        >
          <CheckCircle
            className="h-6 w-6 shrink-0 animate-bounce"
            style={{ color: "var(--color-success)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              Purchase complete
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              You now own &ldquo;{productTitle}&rdquo;
            </p>
          </div>
        </div>

        {/* Access links */}
        <div className="space-y-2.5">
          {finalAccessUrl && (
            <a
              href={finalAccessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] border shadow-sm"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-fg)",
                borderColor: "var(--color-bd)",
              }}
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 shrink-0 text-blue-500" />
                <span>Open in browser</span>
              </span>
              <span className="text-xs font-normal" style={{ color: "var(--color-fg-muted)" }}>View site</span>
            </a>
          )}

          {finalFileUrl && (
            <a
              href={finalFileUrl}
              download
              className="flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] border shadow-sm"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-fg)",
                borderColor: "var(--color-bd)",
              }}
            >
              <span className="flex items-center gap-2.5">
                <Download className="h-4 w-4 shrink-0 text-purple-500" />
                <span>Download file</span>
              </span>
              <span className="text-xs font-normal" style={{ color: "var(--color-fg-muted)" }}>Instant download</span>
            </a>
          )}
        </div>

        {/* Transaction tracking */}
        {finalTxHash && (
          <div
            className="p-4 rounded-xl border text-xs space-y-2 shadow-inner"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              borderColor: "var(--color-bd)",
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: "var(--color-fg-secondary)" }}>
              <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
              <span>Verified Payment Transaction</span>
            </div>
            <p className="font-mono break-all select-all leading-relaxed p-2 rounded-lg text-[10px]" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", color: "var(--color-fg-muted)" }}>
              {finalTxHash}
            </p>
            <div className="flex justify-end pt-1">
              <a
                href={finalTxHash.startsWith("0x") ? `https://testnet.arcscan.app/tx/${finalTxHash}` : undefined}
                target={finalTxHash.startsWith("0x") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-all duration-150 text-[11px]"
                onClick={(e) => {
                  if (!finalTxHash.startsWith("0x")) {
                    e.preventDefault();
                    toast.info(`Transaction ${finalTxHash} is processed via Circle platform wallet set.`);
                  }
                }}
              >
                View on ArcScan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Fallback note if no links */}
        {!finalAccessUrl && !finalFileUrl && (
          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Your purchase has been recorded. The creator will provide access
            details shortly.
          </p>
        )}
      </div>
    );
  }

  // ── Buy Button ────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <Button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full h-12 text-base font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer shadow-md hover:shadow-lg rounded-xl flex items-center justify-center gap-2"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#fff",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5 shrink-0" />
            Buy for {priceAmount} {priceCurrency}
          </>
        )}
      </Button>
      
      {!isConnected && (
        <p className="text-[10px] text-center" style={{ color: "var(--color-fg-muted)" }}>
          Connect your wallet to purchase this product using USDC
        </p>
      )}
    </div>
  );
}

