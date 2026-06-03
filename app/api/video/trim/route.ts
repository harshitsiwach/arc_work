import { NextRequest, NextResponse } from "next/server";
import { trimVideo } from "@/src/modules/video/ffmpeg/trim";
import { TrimRequestSchema } from "@/src/modules/video/types/video.types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrimRequestSchema.safeParse(body);

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

    const result = await trimVideo(parsed.data);

    return NextResponse.json({
      success: true,
      outputPath: result.outputPath,
      duration: result.duration,
    });
  } catch (error) {
    console.error("[Video Trim]", error);
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
    message: "POST with { inputPath, start, end } to trim a video",
  });
}
