"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reads } from "@/lib/contracts/reads";
import { useWallet } from "@/lib/web3/wallet-provider";
import type { Bid } from "@/lib/contracts/types";

export default function ProviderDashboardPage() {
  const { activeAddress, isConnected } = useWallet();
  const [acceptedBids, setAcceptedBids] = useState<{ jobId: bigint; amount: bigint; status: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!activeAddress) { setLoading(false); return; }
      setLoading(false);
    })();
  }, [activeAddress]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>Provider Dashboard</h1>
        <Link href="/jobs" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "white" }}>Browse Jobs</Link>
      </div>

      {!isConnected ? (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Connect your wallet to see your dashboard.</p>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border" style={{ borderColor: "var(--color-bd)" }}>
          <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>Your accepted jobs and bids will appear here.</p>
          <Link href="/jobs" className="text-sm mt-2 inline-block hover:underline" style={{ color: "var(--color-accent)" }}>Browse available jobs &rarr;</Link>
        </div>
      )}
    </div>
  );
}
