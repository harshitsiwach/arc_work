import { getPublicClient } from "@/lib/contracts/instance";
import { BOUNTY_ESCROW_ABI, BOUNTY_ESCROW_ADDRESS } from "@/constants/BountyEscrowABI";

export interface BountyContractData {
  id: bigint;
  creator: `0x${string}`;
  reward: bigint;
  deadline: bigint;
  workerType: number;
  status: number;
  winner: `0x${string}`;
  submissionCount: bigint;
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
    const raw = result as readonly unknown[];
    return {
      id: raw[0] as bigint,
      creator: raw[1] as `0x${string}`,
      reward: raw[2] as bigint,
      deadline: raw[3] as bigint,
      workerType: Number(raw[4]),
      status: Number(raw[5]),
      winner: raw[6] as `0x${string}`,
      submissionCount: raw[7] as bigint,
    };
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

  async getAllBounties(): Promise<BountyContractData[]> {
    const total = await this.nextBountyId();
    if (total === 0n || total > 200n) return [];

    const bounties: BountyContractData[] = [];
    for (let i = 0n; i < total; i++) {
      try {
        const bounty = await this.getBounty(i);
        bounties.push(bounty);
      } catch {
        // skip — bounty may not exist if gaps in IDs
      }
    }
    return bounties;
  },

  async getBountiesByCreator(creator: `0x${string}`): Promise<BountyContractData[]> {
    const all = await this.getAllBounties();
    return all.filter((b) => b.creator.toLowerCase() === creator.toLowerCase());
  },
};
