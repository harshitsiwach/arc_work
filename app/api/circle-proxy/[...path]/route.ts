/**
 * Proxy for Circle API calls — strips x-user-agent header to avoid CORS rejection.
 * The @circle-fin/app-kit SDK sends x-user-agent which Circle's CORS policy blocks
 * from browsers, so we proxy all calls server-side.
 */
import { NextRequest, NextResponse } from "next/server";

async function proxyToCircle(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/");
  const url = new URL(`https://api.circle.com/${path}`);

  // Forward query params
  req.nextUrl.searchParams.forEach((val, key) => url.searchParams.set(key, val));

  const forwardHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward Authorization but NOT x-user-agent (blocked by Circle CORS)
  const auth = req.headers.get("authorization");
  if (auth) forwardHeaders["Authorization"] = auth;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = JSON.stringify(await req.json());
    } catch {
      body = undefined;
    }
  }

  const response = await fetch(url.toString(), {
    method: req.method,
    headers: forwardHeaders,
    body,
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToCircle(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToCircle(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToCircle(req, params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
