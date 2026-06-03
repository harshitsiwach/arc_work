import { ffmpeg } from "@/src/modules/video/services/ffmpeg.service";
import {
  resolveInputPath,
  generateOutputPath,
  ensureDirectory,
  fileExists,
} from "@/src/modules/video/utils/paths";
import type { ThumbnailRequest, FFmpegOperationResult } from "@/src/modules/video/types/video.types";

export async function generateThumbnail(params: ThumbnailRequest): Promise<FFmpegOperationResult> {
  const input = resolveInputPath(params.inputPath);

  if (!(await fileExists(input))) {
    throw new Error(`Input file not found: ${input}`);
  }

  const outputPath = generateOutputPath("thumbnail", "jpg");
  await ensureDirectory(outputPath);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    ffmpeg(input)
      .setStartTime(params.timestamp)
      .outputOptions(["-vframes", "1", "-q:v", "2"])
      .output(outputPath)
      .on("end", () => {
        resolve({
          success: true,
          outputPath,
          duration: (Date.now() - startTime) / 1000,
        });
      })
      .on("error", (err: Error) => {
        reject(new Error(`FFmpeg thumbnail failed: ${err.message}`));
      })
      .run();
  });
}
