import { z } from "zod";

export const TrimRequestSchema = z.object({
  inputPath: z.string().min(1, "inputPath is required"),
  start: z.number().min(0, "start must be >= 0"),
  end: z.number().min(0, "end must be > 0"),
});

export const ResizeRequestSchema = z.object({
  inputPath: z.string().min(1, "inputPath is required"),
  width: z.number().int().positive("width must be a positive integer"),
  height: z.number().int().positive("height must be a positive integer"),
});

export const ThumbnailRequestSchema = z.object({
  inputPath: z.string().min(1, "inputPath is required"),
  timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/, "timestamp must be in HH:MM:SS format"),
});

export const ExtractAudioRequestSchema = z.object({
  inputPath: z.string().min(1, "inputPath is required"),
});

export const MergeRequestSchema = z.object({
  inputPaths: z.array(z.string().min(1)).min(2, "At least two input paths required"),
});

export type TrimRequest = z.infer<typeof TrimRequestSchema>;
export type ResizeRequest = z.infer<typeof ResizeRequestSchema>;
export type ThumbnailRequest = z.infer<typeof ThumbnailRequestSchema>;
export type ExtractAudioRequest = z.infer<typeof ExtractAudioRequestSchema>;
export type MergeRequest = z.infer<typeof MergeRequestSchema>;

export interface VideoProcessingResponse {
  success: boolean;
  outputPath?: string;
  error?: string;
  details?: string;
}

export interface FFmpegOperationResult {
  success: boolean;
  outputPath: string;
  duration?: number;
}
