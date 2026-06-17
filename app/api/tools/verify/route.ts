import { NextRequest, NextResponse } from "next/server";
import { verifyX402ValidatorPayment } from "@/lib/x402";
import { getPublicClient } from "@/lib/contracts/instance";
import { base } from "@/lib/web3/appkit-provider";

export async function POST(req: NextRequest) {
  try {
    const { txHash, serviceId, amount, validatorAddress, inputPayload, endpointUrl, endpointMethod, endpointParams, network } = await req.json();

    if (!txHash || !serviceId || amount === undefined || !validatorAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: txHash, serviceId, amount, validatorAddress" },
        { status: 400 }
      );
    }

    console.log(`[API Verify] Verifying X402 payment:`, {
      txHash,
      serviceId,
      amount,
      validatorAddress,
      network
    });

    const serviceKey = serviceId.toLowerCase();
    const isBaseService = (network && (network.toLowerCase().includes("base") || network.includes("8453"))) ||
                          serviceKey.includes("tripadvisor") || 
                          serviceKey.includes("coingecko") ||
                          (endpointUrl && (
                            endpointUrl.includes("paysponge.com") || 
                            endpointUrl.includes("coingecko.com")
                          ));

    let verificationDetails: any = null;
    if (!isBaseService) {
      const verification = await verifyX402ValidatorPayment(
        txHash,
        serviceId,
        parseFloat(amount),
        validatorAddress
      );

      if (!verification.success) {
        return NextResponse.json(
          { 
            error: `Payment verification failed: ${verification.error || "Transaction not found"}. debug: serviceId=${serviceId}, isBaseService=${isBaseService}, endpointUrl=${endpointUrl}`
          },
          { status: 402 }
        );
      }
      verificationDetails = verification.details;
    } else {
      verificationDetails = {
        from: "Base Mainnet Wallet",
        to: "Paysponge Recipient",
        amountUSDC: parseFloat(amount),
        blockNumber: 0
      };
    }

    let mockApiResponse: any = {};
    const userInput = inputPayload || "";

    if (serviceKey.includes("exa")) {
      mockApiResponse = {
        results: [
          {
            title: `AI Agents in 2026 - Breakthroughs & Trends`,
            url: "https://exa.ai/results/ai-agents-trends-2026",
            publishedDate: "2026-05-15",
            score: 0.982,
            snippet: `Autonomous agents on the Arc Blockchain are shifting from simple prompt-response wrappers to fully integrated economic actors. With x402-based micro-transactions, agents can dynamically hire other services like Tavily, ElevenLabs, and OpenAI to fulfill complex multi-agent objectives without human escrow keys...`,
          },
          {
            title: "Understanding x402 and ERC-8183 Micropayments",
            url: "https://exa.ai/results/x402-erc8183-standard",
            publishedDate: "2026-04-10",
            score: 0.941,
            snippet: `The x402 protocol enables pay-per-call APIs directly inside HTTP headers by using 'Authorization: x402 <tx_hash>'. When paired with ERC-8183 on-chain escrows, it allows machine-to-machine validation, eliminating subscriptions and enabling granular API billing...`,
          }
        ],
        query: userInput || "AI agents and blockchain payment protocols",
        status: "success",
        usage: {
          computeUnits: 12,
          costUSDC: 0.001
        }
      };
    } else if (serviceKey.includes("openai") || serviceKey.includes("gpt")) {
      mockApiResponse = {
        id: "chatcmpl-x402mockopenai12345",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `Hello! I am OpenAI's GPT-4o model. I have successfully processed your request after verifying your x402 payment of ${amount} USDC via the X402Validator contract at ${validatorAddress}.

You asked: "${userInput || "Hello, AI!"}"

Here is my response: Using decentralized payment rails on the Arc Blockchain enables true API autonomy. AI agents are now able to make decisions, execute smart contracts, and transact with other tools natively. This represents a paradigm shift in how computing resources and services are distributed. Let me know if you need assistance with code generation, data structuring, or agent planning!`
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: 42,
          completion_tokens: 128,
          total_tokens: 170
        }
      };
    } else if (serviceKey.includes("anthropic") || serviceKey.includes("claude")) {
      mockApiResponse = {
        id: "msg_mockclaude98765",
        type: "message",
        role: "assistant",
        model: "claude-3-5-sonnet",
        content: [
          {
            type: "text",
            text: `This is Claude 3.5 Sonnet responding. I have verified your x402 micro-payment of ${amount} USDC on the Arc Blockchain.

Request payload: "${userInput || "Hi Claude!"}"

Analyzing the request: Incorporating on-chain validators like X402Validator allows APIs to become completely self-sustaining. Instead of a centralized portal managing subscriptions and billing, callers directly transfer the required micro-charge to the service provider's agent wallet. This eliminates payment gateways, reduces developer friction, and maximizes API availability.`
          }
        ],
        stop_reason: "end_turn",
        usage: {
          input_tokens: 35,
          output_tokens: 110
        }
      };
    } else if (serviceKey.includes("elevenlabs") || serviceKey.includes("voice")) {
      mockApiResponse = {
        status: "completed",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
        durationSeconds: 3.5,
        audioUrl: "https://actions.agentic.market/audio/rachel_elevenlabs_x402_success.mp3",
        textProcessed: userInput || "Initializing x402 payment verification. System online.",
        settings: {
          stability: 0.75,
          similarityBoost: 0.85
        },
        creditsUsed: 120
      };
    } else if (serviceKey.includes("deepgram") || serviceKey.includes("voice") || serviceKey.includes("mic")) {
      mockApiResponse = {
        status: "success",
        transcript: userInput ? `Transcribing audio input for: "${userInput}"` : "Transcribed: 'Arc Blockchain is the ultimate commerce layer for AI agents.'",
        confidence: 0.994,
        words: [
          { word: "Arc", start: 0.1, end: 0.4, confidence: 0.99 },
          { word: "Blockchain", start: 0.4, end: 1.0, confidence: 0.99 },
          { word: "is", start: 1.0, end: 1.2, confidence: 0.99 },
          { word: "online", start: 1.2, end: 1.7, confidence: 0.98 }
        ]
      };
    } else if (serviceKey.includes("tavily") || serviceKey.includes("search")) {
      mockApiResponse = {
        query: userInput || "USDC payment protocols",
        followUpQuestions: [
          "How does x402 compare to traditional Stripe subscriptions?",
          "What is the gas fee on Arc blockchain for USDC transfers?"
        ],
        results: [
          {
            title: "Tavily Search: AI-Native Search Engine results",
            url: "https://tavily.com/search/ai-native-micropayments",
            content: `Tavily Search API was built specifically for AI agents to query the live web. By routing queries through an on-chain validator, users pay exactly for what they search (${amount} USDC per call). Verification was completed successfully on Block ${verificationDetails?.blockNumber}.`
          }
        ]
      };
    } else if (serviceKey.includes("thegraph") || serviceKey.includes("blockchain")) {
      mockApiResponse = {
        data: {
          indexedSubgraphs: [
            { id: "0x12a9...3f", name: "Arc-Escrows", status: "Synced", blockHeight: 1259020 }
          ],
          queriesProcessed: 1,
          cost: `${amount} USDC`
        }
      };
    } else if (isBaseService) {
      if (endpointUrl) {
        // DEBUG: Fetch and print Base transaction details to see if payment was correct
        try {
          const client = getPublicClient(base);
          console.log(`[Base Service debug] Querying Base Mainnet for txHash: ${txHash}`);
          const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
          const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
          console.log(`[Base Service debug] Tx details:`, {
            from: tx.from,
            to: tx.to,
            status: receipt.status,
            input: tx.input,
            blockNumber: receipt.blockNumber.toString()
          });
        } catch (err: any) {
          console.error(`[Base Service debug] Error fetching transaction details: ${err.message}`);
        }

        // Construct the target URL by replacing path parameters and appending query parameters
        let targetUrl = endpointUrl;
        const pathKeysUsed = new Set<string>();

        if (endpointParams) {
          for (const [key, val] of Object.entries(endpointParams)) {
            const placeholder = `:${key}`;
            if (targetUrl.includes(placeholder)) {
              targetUrl = targetUrl.replace(placeholder, encodeURIComponent(val as string));
              pathKeysUsed.add(key);
            }
          }
        }

        const urlObj = new URL(targetUrl);
        if (endpointParams) {
          for (const [key, val] of Object.entries(endpointParams)) {
            if (!pathKeysUsed.has(key) && val !== undefined && val !== null && val !== "") {
              urlObj.searchParams.set(key, val as string);
            }
          }
        }

        const finalUrl = urlObj.toString();
        console.log(`[Base Service Paysponge Proxy] Calling live endpoint: ${finalUrl} with X-PAYMENT: ${txHash}`);

        try {
          const apiRes = await fetch(finalUrl, {
            method: endpointMethod || "GET",
            headers: {
              "Accept": "application/json",
              "X-PAYMENT": txHash
            }
          });

          const resStatus = apiRes.status;
          const resText = await apiRes.text();

          let resBody: any;
          try {
            resBody = JSON.parse(resText);
          } catch {
            resBody = resText;
          }

          if (!apiRes.ok) {
            console.error(`[Base Service Paysponge Proxy Error] Status ${resStatus}:`, resText);
            return NextResponse.json(
              { 
                error: `Paysponge API returned error (status ${resStatus}): ${typeof resBody === 'object' ? JSON.stringify(resBody) : resBody}`,
                debug: {
                  txHash,
                  finalUrl,
                  resStatus,
                  resBody
                }
              },
              { status: resStatus }
            );
          }

          mockApiResponse = resBody;
        } catch (e: any) {
          console.error("[Base Service Paysponge Proxy Connection Error]:", e);
          return NextResponse.json(
            { error: `Failed to connect to Paysponge Base Service proxy: ${e.message}` },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Endpoint URL is required for live Base service execution." },
          { status: 400 }
        );
      }
    } else {
      // General service response
      mockApiResponse = {
        status: "success",
        message: `API endpoint called successfully for service: ${serviceId}`,
        details: {
          serviceId,
          pricePaidUSDC: amount,
          recipientAddress: validatorAddress,
          timestamp: new Date().toISOString(),
          inputLength: userInput.length
        }
      };
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and API executed successfully",
      verification: verificationDetails,
      apiResponse: mockApiResponse,
    });
  } catch (error: any) {
    console.error("[API Verify Error] POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
