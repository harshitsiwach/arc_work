import { ffmpeg } from "@/src/modules/video/services/ffmpeg.service";
import {
  resolveInputPath,
  generateOutputPath,
  ensureDirectory,
  fileExists,
} from "@/src/modules/video/utils/paths";
import type { ResizeRequest, FFmpegOperationResult } from "@/src/modules/video/types/video.types";

export async function resizeVideo(params: ResizeRequest): Promise<FFmpegOperationResult> {
  const input = resolveInputPath(params.inputPath);

  if (!(await fileExists(input))) {
    throw new Error(`Input file not found: ${input}`);
  }

  const outputPath = generateOutputPath("resize", "mp4");
  await ensureDirectory(outputPath);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    ffmpeg(input)
      .videoFilters(
        `scale=${params.width}:${params.height}:force_original_aspect_ratio=decrease,pad=${params.width}:${params.height}:(ow-iw)/2:(oh-ih)/2`
      )
      .outputOptions(["-c:v", "libx264", "-c:a", "copy"])
      .output(outputPath)
      .on("end", () => {
        resolve({
          success: true,
          outputPath,
          duration: (Date.now() - startTime) / 1000,
        });
      })
      .on("error", (err: Error) => {
        reject(new Error(`FFmpeg resize failed: ${err.message}`));
      })
      .run();
  });
}
