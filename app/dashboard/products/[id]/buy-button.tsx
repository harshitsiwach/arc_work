/**
 * ClipArc - Buy Product Button (Client Component)
 * Handles the purchase interaction and post-purchase success state
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

type BuyButtonProps = {
  productId: string;
  priceAmount: number;
  priceCurrency: string;
  accessUrl: string | null;
  fileUrl: string | null;
  productTitle: string;
};

export function BuyProductButton({
  productId,
  priceAmount,
  priceCurrency,
  accessUrl,
  fileUrl,
  productTitle,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    accessUrl: string | null;
    fileUrl: string | null;
  } | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      toast.success(
        `Successfully purchased "${productTitle}" — you now have access!`
      );

      setPurchased(true);
      setPurchaseResult({
        accessUrl: accessUrl ?? data.purchase?.access_url ?? null,
        fileUrl: fileUrl ?? data.purchase?.file_url ?? null,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────
  if (purchased) {
    return (
      <div className="animate-scale-in space-y-5">
        {/* Success confirmation */}
        <div
          className="flex items-center gap-3 rounded-lg px-5 py-4"
          style={{
            backgroundColor: "var(--color-success-soft)",
            border: "1px solid color-mix(in srgb, var(--color-success) 25%, transparent)",
          }}
        >
          <CheckCircle
            className="h-6 w-6 shrink-0"
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
          {accessUrl && (
            <a
              href={accessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 w-full rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 hover:opacity-80"
              style={{
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--color-fg)",
                border: "1px solid var(--color-bd)",
              }}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Open in browser</span>
            </a>
          )}

          {fileUrl && (
            <a
              href={fileUrl}
              download
              className="flex items-center gap-2.5 w-full rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 hover:opacity-80"
              style={{
                backgroundColor: "var(--color-bg-hover)",
                color: "var(--color-fg)",
                border: "1px solid var(--color-bd)",
              }}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Download file</span>
            </a>
          )}
        </div>

        {/* Fallback note if no links */}
        {!accessUrl && !fileUrl && (
          <p
            className="text-xs text-center"
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
    <Button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full h-12 text-base font-semibold"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "#fff",
      }}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Buy for {priceAmount} {priceCurrency}
        </>
      )}
    </Button>
  );
}
