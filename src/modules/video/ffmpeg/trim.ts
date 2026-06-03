import { ffmpeg } from "@/src/modules/video/services/ffmpeg.service";
import {
  resolveInputPath,
  generateOutputPath,
  ensureDirectory,
  fileExists,
} from "@/src/modules/video/utils/paths";
import type { TrimRequest, FFmpegOperationResult } from "@/src/modules/video/types/video.types";

export async function trimVideo(params: TrimRequest): Promise<FFmpegOperationResult> {
  const input = resolveInputPath(params.inputPath);

  if (!(await fileExists(input))) {
    throw new Error(`Input file not found: ${input}`);
  }

  if (params.start >= params.end) {
    throw new Error("start must be less than end");
  }

  const outputPath = generateOutputPath("trim", "mp4");
  await ensureDirectory(outputPath);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    ffmpeg(input)
      .setStartTime(params.start)
      .setDuration(params.end - params.start)
      .outputOptions(["-c:v", "libx264", "-c:a", "aac", "-avoid_negative_ts", "make_zero"])
      .output(outputPath)
      .on("end", () => {
        resolve({
          success: true,
          outputPath,
          duration: (Date.now() - startTime) / 1000,
        });
      })
      .on("error", (err: Error) => {
        reject(new Error(`FFmpeg trim failed: ${err.message}`));
      })
      .run();
  });
}
