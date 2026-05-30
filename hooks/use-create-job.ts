"use client";

/**
 * Re-export useCreateJob from features layer
 * This file exists for backwards compatibility
 */
export { useCreateJob } from "@/features/jobs/hooks/use-create-job";
export type { CreateJobInput, JobRecord } from "@/features/jobs/types/job";
