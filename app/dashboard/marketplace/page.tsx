"use client";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BountyBoard } from "@/components/bounty/BountyBoard";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  if (tab === "bounties") {
    return <BountyBoard />;
  }

  redirect("/jobs");
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8">Loading...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
