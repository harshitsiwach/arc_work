import { ffmpeg } from "@/src/modules/video/services/ffmpeg.service";
import {
  resolveInputPath,
  generateOutputPath,
  ensureDirectory,
  fileExists,
} from "@/src/modules/video/utils/paths";
import type { MergeRequest, FFmpegOperationResult } from "@/src/modules/video/types/video.types";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function mergeVideos(params: MergeRequest): Promise<FFmpegOperationResult> {
  const resolvedPaths = params.inputPaths.map((p) => resolveInputPath(p));

  for (const p of resolvedPaths) {
    if (!(await fileExists(p))) {
      throw new Error(`Input file not found: ${p}`);
    }
  }

  const outputPath = generateOutputPath("merge", "mp4");
  await ensureDirectory(outputPath);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ffmpeg-merge-"));
  const concatFile = path.join(tmpDir, "concat.txt");

  const fileContent = resolvedPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  await fs.writeFile(concatFile, fileContent, "utf-8");

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    ffmpeg()
      .input(concatFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c:v", "libx264", "-c:a", "aac"])
      .output(outputPath)
      .on("end", async () => {
        try {
          await fs.rm(tmpDir, { recursive: true, force: true });
        } catch {}
        resolve({
          success: true,
          outputPath,
          duration: (Date.now() - startTime) / 1000,
        });
      })
      .on("error", async (err: Error) => {
        try {
          await fs.rm(tmpDir, { recursive: true, force: true });
        } catch {}
        reject(new Error(`FFmpeg merge failed: ${err.message}`));
      })
      .run();
  });
}
