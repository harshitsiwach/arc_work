import path from "path";
import { promises as fs } from "fs";

const OUTPUT_BASE = path.join(process.cwd(), "public", "video-output");

export function resolveInputPath(inputPath: string): string {
  if (path.isAbsolute(inputPath)) return inputPath;
  return path.join(process.cwd(), "public", inputPath);
}

export function generateOutputPath(
  operation: string,
  extension: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const dir = path.join(OUTPUT_BASE, operation);
  return path.join(dir, `${operation}_${timestamp}_${random}.${extension}`);
}

export async function ensureDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function getPublicUrl(absolutePath: string): string {
  const publicIndex = absolutePath.indexOf("public");
  if (publicIndex === -1) return absolutePath;
  return absolutePath.substring(publicIndex + "public".length).replace(/\\/g, "/");
}
