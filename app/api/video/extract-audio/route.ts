import { NextRequest, NextResponse } from "next/server";
import { extractAudio } from "@/src/modules/video/ffmpeg/extractAudio";
import { ExtractAudioRequestSchema } from "@/src/modules/video/types/video.types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExtractAudioRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
        },
        { status: 400 }
      );
    }

    const result = await extractAudio(parsed.data);

    return NextResponse.json({
      success: true,
      outputPath: result.outputPath,
      duration: result.duration,
    });
  } catch (error) {
    console.error("[Video Extract Audio]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST with { inputPath } to extract audio from a video",
  });
}
