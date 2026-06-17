import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/utils/openAIClient";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface ValidateRequest {
  proofUrl: string;
  bountyId: string;
  submissionId: string;
}

export async function POST(request: Request) {
  try {
    const body: ValidateRequest = await request.json();
    const { proofUrl, bountyId, submissionId } = body;

    if (!proofUrl || !bountyId || !submissionId) {
      return NextResponse.json(
        { error: "Missing required fields: proofUrl, bountyId, submissionId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Fetch bounty description
    const { data: bounty, error: bountyError } = await supabase
      .from("bounties")
      .select("description")
      .eq("id", bountyId)
      .single();

    if (bountyError || !bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      );
    }

    // Call OpenAI for validation
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `You are validating a bounty submission. Bounty description: ${bounty.description}.
The submitter provided this proof: ${proofUrl}.
Rate how well this proof satisfies the bounty requirements.
Return JSON only with no markdown: { "score": <number between 0 and 1>, "notes": "<1-2 sentences>" }`,
        },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let parsed: { score: number; notes: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { score: 0.5, notes: "AI could not provide a structured assessment." };
    }

    // Update submission in database
    const { error: updateError } = await supabase
      .from("bounty_submissions")
      .update({
        ai_validation_score: parsed.score,
        ai_validation_notes: parsed.notes,
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Failed to update submission with AI score:", updateError);
    }

    return NextResponse.json({ score: parsed.score, notes: parsed.notes });
  } catch (error: unknown) {
    console.error("Error validating bounty submission:", error);

    const isAuthError = error instanceof Error && (
      error.message.includes("API key") ||
      error.message.includes("authentication") ||
      error.message.includes("401")
    );

    return NextResponse.json(
      {
        error: isAuthError
          ? "AI service is not properly configured."
          : error instanceof Error ? error.message : "Validation failed",
      },
      { status: isAuthError ? 503 : 500 }
    );
  }
}
