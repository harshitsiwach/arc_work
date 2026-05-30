/**
 * Bid feature types
 */

export interface BidRecord {
  provider: string;
  amount: number;
  accepted: boolean;
}

export interface SubmitBidInput {
  jobId: bigint;
  amount: number;
}

export interface AcceptBidInput {
  jobId: bigint;
  provider: string;
}
