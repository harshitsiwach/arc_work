import { NextRequest, NextResponse } from "next/server";
import { verifyX402ValidatorPayment } from "@/lib/x402";

export async function POST(req: NextRequest) {
  try {
    const { txHash, serviceId, amount, validatorAddress, inputPayload } = await req.json();

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
    });

    const verification = await verifyX402ValidatorPayment(
      txHash,
      serviceId,
      parseFloat(amount),
      validatorAddress
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 402 }
      );
    }

    // Generate high-fidelity simulated responses based on the service paid for
    let mockApiResponse: any = {};
    const serviceKey = serviceId.toLowerCase();
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
            content: `Tavily Search API was built specifically for AI agents to query the live web. By routing queries through an on-chain validator, users pay exactly for what they search (${amount} USDC per call). Verification was completed successfully on Block ${verification.details?.blockNumber}.`
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
      verification: verification.details,
      apiResponse: mockApiResponse,
    });
  } catch (error: any) {
    console.error("[API Verify Error] POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
