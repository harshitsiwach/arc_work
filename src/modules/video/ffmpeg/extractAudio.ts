import { ffmpeg } from "@/src/modules/video/services/ffmpeg.service";
import {
  resolveInputPath,
  generateOutputPath,
  ensureDirectory,
  fileExists,
} from "@/src/modules/video/utils/paths";
import type { ExtractAudioRequest, FFmpegOperationResult } from "@/src/modules/video/types/video.types";

export async function extractAudio(params: ExtractAudioRequest): Promise<FFmpegOperationResult> {
  const input = resolveInputPath(params.inputPath);

  if (!(await fileExists(input))) {
    throw new Error(`Input file not found: ${input}`);
  }

  const outputPath = generateOutputPath("extract-audio", "aac");
  await ensureDirectory(outputPath);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    ffmpeg(input)
      .noVideo()
      .outputOptions(["-c:a", "copy"])
      .output(outputPath)
      .on("end", () => {
        resolve({
          success: true,
          outputPath,
          duration: (Date.now() - startTime) / 1000,
        });
      })
      .on("error", (err: Error) => {
        reject(new Error(`FFmpeg audio extraction failed: ${err.message}`));
      })
      .run();
  });
}
