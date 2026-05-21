/**
 * API: Download and clip a specific segment of YouTube/Twitch videos
 */
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

// Helper to format seconds to HH:MM:SS
function formatToHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export async function POST(req: Request) {
  try {
    const { url, startTime, endTime } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid or missing video URL" }, { status: 400 });
    }

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      return NextResponse.json({ error: "Invalid start or end time values" }, { status: 400 });
    }

    // Limit clip duration to 10 minutes to prevent resource abuse
    const duration = end - start;
    if (duration > 600) {
      return NextResponse.json({ error: "Clip duration cannot exceed 10 minutes" }, { status: 400 });
    }

    // Ensure target directory exists
    const clipsDir = path.join(process.cwd(), "public", "clips");
    await fs.mkdir(clipsDir, { recursive: true });

    // Generate unique ID
    const clipId = crypto.randomBytes(8).toString("hex");
    const filename = `clip_${clipId}.mp4`;
    const outputPath = path.join(clipsDir, filename);

    // Absolute binary paths to guarantee execution under Node.js process environment on macOS
    const ytDlpPath = "/opt/homebrew/bin/yt-dlp";
    const ffmpegPath = "/opt/homebrew/bin/ffmpeg";

    const startStr = formatToHHMMSS(start);
    const endStr = formatToHHMMSS(end);

    const args = [
      "--download-sections", `*${startStr}-${endStr}`,
      "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
      "--merge-output-format", "mp4",
      "--ffmpeg-location", ffmpegPath,
      "-o", outputPath,
      url
    ];

    console.log(`[Clipper] Running: ${ytDlpPath} ${args.join(" ")}`);

    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      const proc = spawn(ytDlpPath, args);
      let stderrData = "";

      proc.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: stderrData || `yt-dlp exited with code ${code}` });
        }
      });

      proc.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });

    if (!result.success) {
      console.error(`[Clipper] yt-dlp error:`, result.error);
      return NextResponse.json({ error: "Failed to download and clip video: " + (result.error || "Unknown error") }, { status: 500 });
    }

    // Return the relative URL to the static file
    const fileUrl = `/clips/${filename}`;
    return NextResponse.json({ success: true, fileUrl, filename });

  } catch (error: any) {
    console.error(`[Clipper] Endpoint exception:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
