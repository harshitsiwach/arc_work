"use client";

import { BountyDetailPage } from "@/components/bounty/BountyDetailPage";

export default function BountyPage({ params }: { params: { id: string } }) {
  return <BountyDetailPage bountyId={params.id} />;
}
