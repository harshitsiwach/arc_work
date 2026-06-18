import { getPublicClient } from "@/lib/contracts/instance";
import { BOUNTY_ESCROW_ABI, BOUNTY_ESCROW_ADDRESS } from "@/constants/BountyEscrowABI";

export interface BountyContractData {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  reward: bigint;
  deadline: bigint;
  workerType: number;
  status: number;
  winner: `0x${string}`;
  submissionCount: bigint;
}

function parseBountyTuple(raw: Record<string, unknown>): BountyContractData {
  return {
    id: raw.id as bigint,
    creator: raw.creator as `0x${string}`,
    title: (raw.title as string) ?? "",
    description: (raw.description as string) ?? "",
    reward: raw.reward as bigint,
    deadline: raw.deadline as bigint,
    workerType: Number(raw.workerType),
    status: Number(raw.status),
    winner: raw.winner as `0x${string}`,
    submissionCount: raw.submissionCount as bigint,
  };
}

export const bountyReads = {
  async getBounty(bountyId: bigint): Promise<BountyContractData> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: BOUNTY_ESCROW_ADDRESS,
      abi: BOUNTY_ESCROW_ABI,
      functionName: "getBounty",
      args: [bountyId],
    });
    return parseBountyTuple(result as Record<string, unknown>);
  },

  async nextBountyId(): Promise<bigint> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: BOUNTY_ESCROW_ADDRESS,
      abi: BOUNTY_ESCROW_ABI,
      functionName: "nextBountyId",
    });
    return result as bigint;
  },

  /**
   * Fetch ALL bounties in a single RPC call via the on-chain getAllBounties() view.
   * This replaces the old N+1 sequential loop and is dramatically faster.
   */
  async getAllBounties(): Promise<BountyContractData[]> {
    const client = getPublicClient();
    const result = await client.readContract({
      address: BOUNTY_ESCROW_ADDRESS,
      abi: BOUNTY_ESCROW_ABI,
      functionName: "getAllBounties",
    });
    const rawList = result as readonly Record<string, unknown>[];
    return rawList.map(parseBountyTuple);
  },

  async getBountiesByCreator(creator: `0x${string}`): Promise<BountyContractData[]> {
    const all = await this.getAllBounties();
    return all.filter((b) => b.creator.toLowerCase() === creator.toLowerCase());
  },
};
