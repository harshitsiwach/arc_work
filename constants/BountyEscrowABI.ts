/**
 * BountyEscrow contract ABI and address constants.
 * ABI generated from contracts/BountyEscrow.sol
 */

export const BOUNTY_ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS ?? "") as `0x${string}`;

export const BOUNTY_ESCROW_ABI = [
  {
    inputs: [{ internalType: "address", name: "_usdc", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // Errors
  { inputs: [], name: "BountyNotFound", type: "error" },
  { inputs: [], name: "InvalidStatus", type: "error" },
  { inputs: [], name: "DeadlineNotPassed", type: "error" },
  { inputs: [], name: "DeadlinePassed", type: "error" },
  { inputs: [], name: "AlreadyCompleted", type: "error" },
  { inputs: [], name: "NotCreatorOrSubmitter", type: "error" },
  { inputs: [], name: "InvalidReward", type: "error" },
  { inputs: [], name: "InvalidDeadline", type: "error" },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "workerType", type: "uint8" },
    ],
    name: "BountyCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "submitter", type: "address" },
      { indexed: false, internalType: "bytes32", name: "proofHash", type: "bytes32" },
    ],
    name: "WorkSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "winner", type: "address" },
    ],
    name: "SubmissionApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
    ],
    name: "SubmissionRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "BountyCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "BountyRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "raiser", type: "address" },
    ],
    name: "DisputeRaised",
    type: "event",
  },
  // Read functions
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "getBounty",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "reward", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "workerType", type: "uint8" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint256", name: "submissionCount", type: "uint256" },
        ],
        internalType: "struct BountyEscrow.Bounty",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "getSubmissions",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "bountyId", type: "uint256" },
          { internalType: "address", name: "submitter", type: "address" },
          { internalType: "bytes32", name: "proofHash", type: "bytes32" },
          { internalType: "uint256", name: "submittedAt", type: "uint256" },
          { internalType: "bool", name: "isApproved", type: "bool" },
        ],
        internalType: "struct BountyEscrow.Submission[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextBountyId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "reward", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "workerType", type: "uint8" },
    ],
    name: "createBounty",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "bountyId", type: "uint256" },
      { internalType: "bytes32", name: "proofHash", type: "bytes32" },
    ],
    name: "submitWork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "bountyId", type: "uint256" },
      { internalType: "uint256", name: "submissionId", type: "uint256" },
    ],
    name: "approveSubmission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "bountyId", type: "uint256" },
      { internalType: "uint256", name: "submissionId", type: "uint256" },
    ],
    name: "rejectSubmission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "refundCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "raiseDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdc",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
