/**
 * AgenticCommerce — Error decoder
 * Maps contract custom errors to user-friendly messages
 */

const ERROR_MAP: Record<string, string> = {
  InvalidJob: "This job does not exist or has been deleted.",
  ProviderNotSet: "No provider has been assigned to this job yet.",
  WrongStatus: "This action cannot be performed in the current job state.",
  FeesTooHigh: "Platform or evaluator fees exceed the maximum allowed.",
  ExpiryTooShort: "The job expiry time is too soon. Please set a later deadline.",
  HookNotWhitelisted: "The selected hook contract is not authorized.",
  ZeroAddress: "A required address is missing. Please check all fields.",
  ZeroBudget: "The budget amount must be greater than zero.",
  Unauthorized: "You are not authorized to perform this action.",
  SafeERC20FailedOperation: "USDC transfer failed. Check your balance.",
  AccessControlUnauthorizedAccount: "You don't have the required role for this action.",
  ReentrancyGuardReentrantCall: "Transaction failed due to reentrancy protection.",
  UserRejectedRequest: "Transaction was rejected in your wallet.",
  ContractFunctionExecutionError: "Contract execution failed. Check the transaction parameters and try again.",
  UnknownError: "An unexpected error occurred. Please try again.",
};

const FUNCTION_ERROR_MAP: Record<string, Record<string, string>> = {
  createJob: {
    ExpiryTooShort: "The expiry date must be in the future.",
    HookNotWhitelisted: "This hook contract is not whitelisted on the platform.",
    ZeroAddress: "Please provide a valid evaluator address.",
  },
  fund: {
    WrongStatus: "This job is not ready for funding. Ensure a provider and budget are set.",
    InvalidJob: "Job not found. It may have been deleted.",
    SafeERC20FailedOperation: "Insufficient USDC balance or approval. Please check your wallet.",
  },
  submitBid: {
    WrongStatus: "This job is no longer accepting bids.",
    ZeroBudget: "Bid amount must be greater than zero.",
  },
  acceptBid: {
    WrongStatus: "This job is no longer in the bidding phase.",
    InvalidJob: "Job not found.",
    Unauthorized: "Only the job creator can accept bids.",
  },
  setBudget: {
    ZeroBudget: "Budget must be greater than zero.",
    WrongStatus: "Cannot set budget in the current job state.",
  },
  submit: {
    ProviderNotSet: "No provider assigned. Cannot submit work.",
    WrongStatus: "This job is not ready for work submission.",
  },
  complete: {
    WrongStatus: "No work has been submitted for review yet.",
    Unauthorized: "Only the designated evaluator can approve work.",
  },
  reject: {
    WrongStatus: "No work has been submitted for review yet.",
    Unauthorized: "Only the designated evaluator can reject work.",
  },
  claimRefund: {
    WrongStatus: "This job has not expired yet or is not in a refundable state.",
    Unauthorized: "Only the job creator can claim a refund.",
  },
};

export function decodeContractError(
  error: unknown,
  functionName?: string
): string {
  const raw = extractErrorName(error);

  if (!raw) {
    return ERROR_MAP.UnknownError;
  }

  if (functionName && FUNCTION_ERROR_MAP[functionName]?.[raw]) {
    return FUNCTION_ERROR_MAP[functionName][raw];
  }

  if (ERROR_MAP[raw]) {
    return ERROR_MAP[raw];
  }

  return `Transaction failed: ${raw}`;
}

function extractErrorName(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const err = error as Record<string, unknown>;
  if (typeof err.errorName === "string") return err.errorName;
  if (typeof err.name === "string") return err.name;

  // viem wraps contract errors — dig into cause chain
  if (err.cause && typeof err.cause === "object") {
    const cause = err.cause as Record<string, unknown>;
    if (typeof cause.errorName === "string") return cause.errorName;
    if (typeof cause.name === "string") return cause.name;
    // Some viem versions nest deeper (cause.cause or cause.data.errorName)
    if (cause.data && typeof cause.data === "object") {
      const data = cause.data as Record<string, unknown>;
      if (typeof data.errorName === "string") return data.errorName;
    }
    if (cause.cause && typeof cause.cause === "object") {
      const deep = cause.cause as Record<string, unknown>;
      if (typeof deep.errorName === "string") return deep.errorName;
      if (typeof deep.name === "string") return deep.name;
    }
  }

  if (typeof err.message === "string") {
    // Match "Error: ZeroAddress()" format from viem ContractFunctionRevertedError
    const matchNamed = err.message.match(/Error:\s*(\w+)\(\)/);
    if (matchNamed) return matchNamed[1];

    // Match "Error(ZeroAddress)" format (alternative encoding)
    const match = err.message.match(/Error\((\w+)\)/);
    if (match) return match[1];

    const match2 = err.message.match(/Error\((\w+)\(/);
    if (match2) return match2[1];

    // Specific known error patterns
    if (err.message.includes("User rejected") || err.message.includes("user rejected")) return "UserRejectedRequest";
  }

  return null;
}
