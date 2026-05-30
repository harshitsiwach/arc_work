-- Add onchain_job_id to gigs table for AgenticCommerce integration
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS onchain_job_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gigs_onchain_job_id ON gigs(onchain_job_id) WHERE onchain_job_id IS NOT NULL;
