import { NextRequest, NextResponse } from "next/server";
import { verifyBaseValidatorPayment } from "@/lib/x402";
import { circleDeveloperSdk } from "@/lib/utils/developer-controlled-wallets-client";
import { getOpenAI } from "@/lib/utils/openAIClient";
import { VeniceClient } from "venice-x402-client";

// In-memory cache for Agentic Market services
let cachedServices: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

async function fetchAgenticServices() {
  const now = Date.now();
  if (cachedServices && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedServices;
  }

  try {
    let allServicesRaw: any[] = [];
    let offset = 0;
    let total = 200;
    const limit = 200;

    while (offset < total) {
      const res = await fetch(`https://api.agentic.market/v1/services?limit=${limit}&offset=${offset}`, {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch agentic services at offset ${offset}`);
      }

      const data = await res.json();
      const services = data.services || [];
      allServicesRaw.push(...services);
      total = data.total || total;

      if (services.length === 0 || services.length < limit) {
        break;
      }
      offset += limit;
    }

    cachedServices = allServicesRaw;
    cacheTimestamp = now;
    return allServicesRaw;
  } catch (error) {
    console.error("Error fetching Agentic Market services:", error);
    return cachedServices || [];
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { service: string } }
) {
  try {
    const serviceName = params.service;
    if (!serviceName) {
      return NextResponse.json({ error: "Service name parameter is required" }, { status: 400 });
    }

    const serviceKey = serviceName.toLowerCase();
    const body = await req.json().catch(() => ({}));
    
    const {
      endpointUrl,
      endpointMethod = "GET",
      endpointParams = {},
      inputPayload = ""
    } = body;

    // 1. Fetch and find the service matching serviceKey from Agentic Market
    const allServices = await fetchAgenticServices();
    const matchedService = allServices.find(
      (s: any) => s.name.toLowerCase() === serviceKey || s.id.toLowerCase() === serviceKey
    );

    // Find specific endpoint price if endpointUrl is provided
    let actualPrice = 0.001; // Default fallback price
    let payToAddress = "";
    let assetAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Default Base USDC

    if (matchedService) {
      const endpoints = matchedService.endpoints || [];
      const matchedEndpoint = endpoints.find(
        (e: any) => e.url && e.url.toLowerCase() === (endpointUrl || "").toLowerCase()
      );

      if (matchedEndpoint && matchedEndpoint.pricing) {
        actualPrice = parseFloat(matchedEndpoint.pricing.amount) || actualPrice;
        payToAddress = matchedEndpoint.pricing.payTo || "";
        assetAddress = matchedEndpoint.pricing.asset || assetAddress;
      } else {
        // Fallback to cheapest endpoint pricing
        const pricedEndpoints = endpoints.filter((e: any) => e.pricing?.amount);
        if (pricedEndpoints.length > 0) {
          actualPrice = Math.min(...pricedEndpoints.map((e: any) => parseFloat(e.pricing.amount)));
          const cheapestEp = pricedEndpoints.find((e: any) => parseFloat(e.pricing.amount) === actualPrice);
          payToAddress = cheapestEp?.pricing?.payTo || "";
          assetAddress = cheapestEp?.pricing?.asset || assetAddress;
        }
      }
    }

    // Apply the 10% markup
    const expectedPriceUSDC = actualPrice * 1.10;

    const validatorAddress = process.env.NEXT_PUBLIC_X402_VALIDATOR_ADDRESS_BASE || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Fallback address
    const txHash = req.headers.get("X-PAYMENT");

    // 2. Enforce x402 payment
    if (!txHash) {
      return NextResponse.json(
        {
          error: "Payment Required",
          validatorAddress,
          serviceId: matchedService?.name || serviceName,
          amountUSDC: expectedPriceUSDC,
          message: `Please execute payForService('${matchedService?.name || serviceName}', ${Math.round(expectedPriceUSDC * 1_000_000)} units) on the Base Mainnet X402Validator contract at ${validatorAddress}, then retry with the transaction hash in X-PAYMENT header.`
        },
        { status: 402 }
      );
    }

    // 3. Verify user's transaction on-chain (Base Mainnet)
    const verification = await verifyBaseValidatorPayment(
      txHash,
      matchedService?.name || serviceName,
      expectedPriceUSDC,
      validatorAddress
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: `Payment verification failed: ${verification.error || "Transaction not found on Base Mainnet"}` },
        { status: 402 }
      );
    }

    // 4. Brokering / Routing Logic
    let apiResponse: any = null;

    // CASE A: Standard AI capabilities we can fulfill using server API keys (e.g. OpenAI/GPT)
    if (serviceKey.includes("openai") || serviceKey.includes("gpt")) {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OpenAI API key not configured on proxy server" }, { status: 500 });
      }

      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: inputPayload || "Hello",
          },
        ],
      });
      apiResponse = completion;
    }
    // CASE B: General Agentic Market services requiring payment relay
    else {
      if (!endpointUrl) {
        return NextResponse.json({ error: "endpointUrl parameter is required to call third-party services" }, { status: 400 });
      }

      const isX402Service = (endpointUrl && (
        endpointUrl.includes("venice.ai") || 
        endpointUrl.includes("paysponge.com") || 
        endpointUrl.includes("coingecko.com")
      )) || serviceKey.includes("tripadvisor") || serviceKey.includes("coingecko");

      // Construct the target URL by replacing path parameters and appending query parameters
      let targetUrl = endpointUrl;
      const pathKeysUsed = new Set<string>();

      for (const [key, val] of Object.entries(endpointParams)) {
        const placeholder = `:${key}`;
        if (targetUrl.includes(placeholder)) {
          targetUrl = targetUrl.replace(placeholder, encodeURIComponent(val as string));
          pathKeysUsed.add(key);
        }
      }

      const urlObj = new URL(targetUrl);
      for (const [key, val] of Object.entries(endpointParams)) {
        if (!pathKeysUsed.has(key) && val !== undefined && val !== null && val !== "") {
          urlObj.searchParams.set(key, val as string);
        }
      }

      const finalUrl = urlObj.toString();

      if (isX402Service) {
        const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY;
        if (!privateKey) {
          console.warn("[Proxy Relay Exec] BASE_DEPLOYER_PRIVATE_KEY not set. Falling back to mock response.");
          if (serviceName.toLowerCase().includes("coinmarketcap")) {
            apiResponse = {
              status: "success",
              data: {
                bitcoin: { price: 95420.50, change_24h: 1.85, market_cap: 1870000000000 },
                ethereum: { price: 3450.20, change_24h: -0.42, market_cap: 415000000000 },
                usdc: { price: 1.00, change_24h: 0.00, market_cap: 35000000000 }
              },
              message: "BASE_DEPLOYER_PRIVATE_KEY is not configured. This is a mock response."
            };
          } else {
            apiResponse = {
              status: "success",
              message: `BASE_DEPLOYER_PRIVATE_KEY is not configured. This is a mock response for service: ${serviceName}`
            };
          }
        } else {
          const originUrl = urlObj.origin;
          const pathAndSearch = urlObj.pathname + urlObj.search;

          console.log(`[Proxy Relay Exec] Calling X402 service ${finalUrl} via VeniceClient SDK`);

          try {
            const veniceClient = new VeniceClient(privateKey, {
              apiUrl: originUrl,
              autoTopUp: {
                enabled: true,
                amount: 5 // Top up $5 when balance is insufficient
              }
            });

            const requestBody = endpointMethod !== "GET" && endpointMethod !== "HEAD"
              ? (typeof body.inputPayload === 'object' ? JSON.stringify(body.inputPayload) : body.inputPayload)
              : undefined;

            const apiRes = await veniceClient.requestRaw(pathAndSearch, {
              method: endpointMethod,
              body: requestBody
            });

            const resStatus = apiRes.status;
            const resText = await apiRes.text();

            try {
              apiResponse = JSON.parse(resText);
            } catch {
              apiResponse = resText;
            }

            if (!apiRes.ok) {
              return NextResponse.json(
                { error: `X402 service returned error status ${resStatus}`, details: apiResponse },
                { status: resStatus }
              );
            }
          } catch (e: any) {
            console.error("[Proxy Relay Exec X402 Error]:", e);
            return NextResponse.json(
              { error: `Failed to connect or authenticate with X402 service: ${e.message}` },
              { status: 502 }
            );
          }
        }
      } else {
        // Standard Circle DCW payout relay routing
        let relayTxHash = "";

        // If the third-party API requires a fee payout to a specific address, we fund it
        if (payToAddress && actualPrice > 0) {
          console.log(`[Proxy Relay] Refunding provider's fee of ${actualPrice} USDC to: ${payToAddress}`);
          
          const transferResponse = await circleDeveloperSdk.createTransaction({
            walletId: process.env.NEXT_PUBLIC_AGENT_WALLET_ID || "",
            destinationAddress: payToAddress,
            amount: [actualPrice.toString()],
            fee: {
              type: "level",
              config: {
                feeLevel: "HIGH",
              },
            },
            tokenAddress: assetAddress as `0x${string}`,
            blockchain: "BASE" as any
          });

          if (!transferResponse.data?.id) {
            return NextResponse.json({ error: "Failed to initiate payment relay to service provider wallet" }, { status: 502 });
          }

          // Poll Circle for transaction completion and txHash
          const transactionId = transferResponse.data.id;
          const startTime = Date.now();
          let complete = false;

          while (Date.now() - startTime < 35_000) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const txStatus = await circleDeveloperSdk.getTransaction({ id: transactionId });
            const txDetails = txStatus.data?.transaction;
            
            if (txDetails && txDetails.txHash) {
              relayTxHash = txDetails.txHash;
              if (txDetails.state === "CONFIRMED" || txDetails.state === "COMPLETE") {
                complete = true;
                break;
              }
            }
          }

          if (!complete || !relayTxHash) {
            return NextResponse.json({ error: "Timeout waiting for relay transaction block confirmation on Base Mainnet" }, { status: 504 });
          }
        }

        console.log(`[Proxy Relay Exec] Forwarding to: ${finalUrl} with raw payment headers if available`);

        const relayHeaders: Record<string, string> = {
          "Accept": "application/json",
        };

        if (relayTxHash) {
          // Format the X-PAYMENT header as a Base64-encoded JSON string as required by the x402 protocol
          const paymentPayload = {
            x402Version: 1,
            scheme: "exact",
            network: "base",
            payload: {
              txHash: relayTxHash
            }
          };
          const xPaymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
          relayHeaders["X-PAYMENT"] = xPaymentHeader;
        }

        const apiRes = await fetch(finalUrl, {
          method: endpointMethod,
          headers: relayHeaders,
          body: endpointMethod !== "GET" && endpointMethod !== "HEAD" ? JSON.stringify(body.inputPayload || {}) : undefined
        });

        const resStatus = apiRes.status;
        const resText = await apiRes.text();

        try {
          apiResponse = JSON.parse(resText);
        } catch {
          apiResponse = resText;
        }

        if (!apiRes.ok) {
          return NextResponse.json(
            { error: `Third-party service returned error status ${resStatus}`, details: apiResponse },
            { status: resStatus }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      serviceName,
      pricePaidUSDC: expectedPriceUSDC,
      markupRetainedUSDC: expectedPriceUSDC - actualPrice,
      apiResponse
    });

  } catch (error: any) {
    console.error("[Proxy Gateway Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
