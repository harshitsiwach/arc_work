import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trimVideo } from "@/src/modules/video/ffmpeg/trim";
import { resizeVideo } from "@/src/modules/video/ffmpeg/resize";
import { generateThumbnail } from "@/src/modules/video/ffmpeg/thumbnail";
import { extractAudio } from "@/src/modules/video/ffmpeg/extractAudio";
import { mergeVideos } from "@/src/modules/video/ffmpeg/merge";

export const dynamic = "force-dynamic";

// ── Action Schemas ────────────────────────────────────────────────

const TrimAction = z.object({
  action: z.literal("trim"),
  inputPath: z.string().min(1, "inputPath is required"),
  options: z.object({
    start: z.number().min(0, "start must be >= 0"),
    end: z.number().min(0.01, "end must be > 0"),
  }),
});

const ResizeAction = z.object({
  action: z.literal("resize"),
  inputPath: z.string().min(1, "inputPath is required"),
  options: z.object({
    width: z.number().int().positive("width must be a positive integer"),
    height: z.number().int().positive("height must be a positive integer"),
  }),
});

const ThumbnailAction = z.object({
  action: z.literal("thumbnail"),
  inputPath: z.string().min(1, "inputPath is required"),
  options: z.object({
    timestamp: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/, "timestamp must be HH:MM:SS"),
  }),
});

const ExtractAudioAction = z.object({
  action: z.literal("extractAudio"),
  inputPath: z.string().min(1, "inputPath is required"),
  options: z.object({}).default({}),
});

const MergeAction = z.object({
  action: z.literal("merge"),
  options: z.object({
    inputPaths: z
      .array(z.string().min(1))
      .min(2, "merge requires at least two input paths"),
  }),
});

// ── Future Actions (stubs for type safety) ────────────────────────
// Add new action schemas here as they are implemented:
//
// const TranscribeAction = z.object({
//   action: z.literal("transcribe"),
//   inputPath: z.string().min(1),
//   options: z.object({ language: z.string().optional() }).default({}),
// });
//
// const CaptionAction = z.object({
//   action: z.literal("caption"),
//   inputPath: z.string().min(1),
//   options: z.object({ style: z.string().optional() }).default({}),
// });

// ── Discriminated Union ───────────────────────────────────────────

const ProcessRequestSchema = z.discriminatedUnion("action", [
  TrimAction,
  ResizeAction,
  ThumbnailAction,
  ExtractAudioAction,
  MergeAction,
  // TranscribeAction,
  // CaptionAction,
]);

type ProcessRequest = z.infer<typeof ProcessRequestSchema>;

// ── Action Dispatcher ─────────────────────────────────────────────

async function executeAction(
  req: ProcessRequest
): Promise<Record<string, unknown>> {
  switch (req.action) {
    case "trim": {
      const result = await trimVideo({
        inputPath: req.inputPath,
        start: req.options.start,
        end: req.options.end,
      });
      return {
        action: "trim",
        inputPath: req.inputPath,
        start: req.options.start,
        end: req.options.end,
        outputPath: result.outputPath,
      };
    }

    case "resize": {
      const result = await resizeVideo({
        inputPath: req.inputPath,
        width: req.options.width,
        height: req.options.height,
      });
      return {
        action: "resize",
        inputPath: req.inputPath,
        width: req.options.width,
        height: req.options.height,
        outputPath: result.outputPath,
      };
    }

    case "thumbnail": {
      const result = await generateThumbnail({
        inputPath: req.inputPath,
        timestamp: req.options.timestamp,
      });
      return {
        action: "thumbnail",
        inputPath: req.inputPath,
        timestamp: req.options.timestamp,
        outputPath: result.outputPath,
      };
    }

    case "extractAudio": {
      const result = await extractAudio({ inputPath: req.inputPath });
      return {
        action: "extractAudio",
        inputPath: req.inputPath,
        outputPath: result.outputPath,
      };
    }

    case "merge": {
      const result = await mergeVideos({
        inputPaths: req.options.inputPaths,
      });
      return {
        action: "merge",
        inputPaths: req.options.inputPaths,
        outputPath: result.outputPath,
      };
    }

    default: {
      const _exhaustive: never = req;
      throw new Error(`Unknown action: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

// ── Route Handlers ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const routeStart = Date.now();
  let action = "unknown";

  try {
    const body = await req.json();
    const parsed = ProcessRequestSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          action: body?.action ?? "unknown",
          error: "Validation failed",
          details: issues,
        },
        { status: 400 }
      );
    }

    action = parsed.data.action;
    console.log(`[Video Process] Starting action="${action}"`);

    const result = await executeAction(parsed.data);
    const totalDuration = (Date.now() - routeStart) / 1000;

    console.log(
      `[Video Process] Completed action="${action}" in ${totalDuration.toFixed(2)}s → ${result.outputPath}`
    );

    return NextResponse.json({
      success: true,
      ...result,
      duration: totalDuration,
    });
  } catch (error) {
    const totalDuration = (Date.now() - routeStart) / 1000;

    console.error(
      `[Video Process] Failed action="${action}" in ${totalDuration.toFixed(2)}s:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        action,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/video/process",
    method: "POST",
    description: "Unified video processing endpoint",
    supportedActions: [
      "trim",
      "resize",
      "thumbnail",
      "extractAudio",
      "merge",
    ],
    example: {
      action: "trim",
      inputPath: "videos/sample.mp4",
      start: 10,
      end: 30,
      outputPath: "/video-output/trim/trim_1717324800000_abc123.mp4",
      duration: 2.1,
    },
  });
}
