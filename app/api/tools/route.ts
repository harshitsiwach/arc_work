/**
 * API: Fetch Agentic Market services and combine with our products
 */
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.agentic.market/v1/services", {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch agentic services" }, { status: 502 });
    }

    const data = await res.json();
    const services = (data.services || []).map((s: any) => ({
      id: `agentic_${s.id}`,
      name: s.name,
      description: s.description,
      category: s.category || "API",
      domain: s.domain,
      tags: [s.category, s.integrationType].filter(Boolean),
      // Use the cheapest endpoint as the "price"
      price_amount: Math.min(
        ...s.endpoints
          .filter((e: any) => e.pricing?.amount)
          .map((e: any) => parseFloat(e.pricing.amount))
      ).toString(),
      price_currency: "USDC",
      endpoints: s.endpoints.map((e: any) => ({
        url: e.url,
        method: e.method,
        description: e.description,
        price: e.pricing?.amount || "0",
      })),
      source: "agentic_market",
      networks: s.networks || [],
    }));

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
