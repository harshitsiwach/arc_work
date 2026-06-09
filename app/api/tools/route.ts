/**
 * API: Fetch Agentic Market services and combine with our products
 */
import { NextResponse } from "next/server";

// Simple in-memory cache to bypass Next.js 2MB fetch cache limit warnings
let cachedServices: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

export async function GET() {
  try {
    const now = Date.now();
    if (cachedServices && (now - cacheTimestamp < CACHE_TTL)) {
      return NextResponse.json({ services: cachedServices });
    }
    let allServicesRaw: any[] = [];
    let offset = 0;
    let total = 200; // Will be updated on first response
    const limit = 200;

    while (offset < total) {
      const res = await fetch(`https://api.agentic.market/v1/services?limit=${limit}&offset=${offset}`, {
        headers: { "Accept": "application/json" },
        cache: "no-store" // Disable Next.js fetch cache to prevent warnings about items over 2MB
      });

      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch agentic services at offset ${offset}` }, { status: 502 });
      }

      const data = await res.json();
      const services = data.services || [];
      allServicesRaw.push(...services);
      total = data.total || total;
      
      // If we got fewer than limit, or no services, we reached the end
      if (services.length === 0 || services.length < limit) {
        break;
      }
      
      offset += limit;
    }

    const services = allServicesRaw.map((s: any) => {
      // Use the cheapest endpoint as the "price"
      const endpointsWithPricing = (s.endpoints || []).filter((e: any) => e.pricing?.amount);
      const minPrice = endpointsWithPricing.length > 0 
        ? Math.min(...endpointsWithPricing.map((e: any) => parseFloat(e.pricing.amount))) 
        : 0;

      return {
        id: `agentic_${s.id}`,
        name: s.name,
        description: s.description,
        category: s.category || "API",
        domain: s.domain,
        tags: [s.category, s.integrationType].filter(Boolean),
        price_amount: minPrice.toString(),
        price_currency: "USDC",
        endpoints: (s.endpoints || []).map((e: any) => ({
          url: e.url,
          method: e.method,
          description: e.description,
          price: e.pricing?.amount || "0",
        })),
        source: "agentic_market",
        networks: s.networks || [],
      };
    });

    cachedServices = services;
    cacheTimestamp = now;

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
