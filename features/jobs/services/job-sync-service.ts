/**
 * Job sync service
 * Synchronizes onchain state to Supabase
 */

import { reads } from "@/lib/contracts/reads";
import { jobService } from "./job-service";

const STATUS_MAP: Record<number, string> = {
  0: "open",
  1: "funded",
  2: "submitted",
  3: "completed",
  4: "rejected",
  5: "expired",
};

export const jobSyncService = {
  async syncJobStatus(gigId: string, onchainJobId: number): Promise<boolean> {
    try {
      const job = await reads.getJob(BigInt(onchainJobId));
      const newStatus = STATUS_MAP[job.status] ?? "open";

      await jobService.updateStatus(gigId, newStatus);
      return true;
    } catch (err) {
      console.error(`Failed to sync job ${gigId}:`, err);
      return false;
    }
  },

  async syncAllActiveJobs(): Promise<{ synced: number; failed: number }> {
    const activeJobs = await jobService.getJobsByStatus("open");
    const fundedJobs = await jobService.getJobsByStatus("funded");
    const allActive = [...activeJobs, ...fundedJobs];

    let synced = 0;
    let failed = 0;

    for (const gig of allActive) {
      if (!gig.onchain_job_id) continue;

      const success = await this.syncJobStatus(gig.id, gig.onchain_job_id);
      if (success) synced++;
      else failed++;
    }

    return { synced, failed };
  },
} as const;
