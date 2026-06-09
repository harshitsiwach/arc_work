/**
 * Arc ClipArc - x402 Payment Protocol Verifier
 */

import { decodeFunctionData } from "viem";

const ARC_RPC_URL = "https://rpc.quicknode.testnet.arc.network";
const USDC_CONTRACT_ADDRESS = "0x3600000000000000000000000000000000000000";

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T | null;
  error?: {
    code: number;
    message: string;
  };
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  input: string;
  value: string;
}

interface TransactionReceipt {
  transactionHash: string;
  status: string; // "0x1" for success, "0x0" for failure
  blockNumber: string;
}

/**
 * Decodes ERC20 transfer(address,uint256) input data.
 * ERC20 transfer selector: 0xa9059cbb
 */
function decodeTransferInput(input: string) {
  if (!input || !input.startsWith("0xa9059cbb")) {
    return null;
  }

  // Address is 32 bytes (64 hex characters) starting after method selector (10 characters: 0x + 8 chars)
  const toPart = input.slice(10, 74);
  const amountPart = input.slice(74, 138);

  // Pad left with 0s, so address is last 40 hex characters (20 bytes)
  const recipientAddress = "0x" + toPart.slice(24).toLowerCase();
  
  // Parse amount hex to BigInt/number
  const amountHex = "0x" + amountPart.replace(/^0+/, "");
  const amountRaw = amountHex === "0x" ? BigInt(0) : BigInt(amountHex);
  
  // USDC has 6 decimal places
  const amountUSDC = Number(amountRaw) / 1_000_000;

  return {
    recipientAddress,
    amountUSDC,
  };
}

/**
 * Queries the Arc Testnet JSON-RPC endpoint.
 */
async function callRpc<T>(method: string, params: any[]): Promise<T | null> {
  try {
    const res = await fetch(ARC_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      }),
    });

    if (!res.ok) {
      throw new Error(`RPC request failed: HTTP ${res.status}`);
    }

    const payload: RpcResponse<T> = await res.json();
    if (payload.error) {
      throw new Error(`RPC Error: ${payload.error.message}`);
    }

    return payload.result;
  } catch (error) {
    console.error(`[RPC Error] method ${method}:`, error);
    return null;
  }
}

export interface VerificationResult {
  success: boolean;
  error?: string;
  details?: {
    from: string;
    to: string;
    amountUSDC: number;
    blockNumber: number;
  };
}

/**
 * Verifies a transaction hash on-chain for a specific USDC payment.
 * @param txHash The transaction hash to verify.
 * @param expectedRecipient The creator wallet address expecting the funds.
 * @param expectedAmount The required USDC price.
 */
export async function verifyX402Payment(
  txHash: string,
  expectedRecipient: string,
  expectedAmount: number
): Promise<VerificationResult> {
  if (!txHash || !txHash.startsWith("0x")) {
    return { success: false, error: "Invalid transaction hash format" };
  }

  // 1. Get transaction details
  const tx = await callRpc<TransactionData>("eth_getTransactionByHash", [txHash]);
  if (!tx) {
    return { success: false, error: "Transaction not found on Arc Testnet" };
  }

  // 2. Validate token destination contract address
  const usdcTokenAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || USDC_CONTRACT_ADDRESS;
  if (tx.to.toLowerCase() !== usdcTokenAddress.toLowerCase()) {
    return { success: false, error: "Transaction destination is not the USDC token contract" };
  }

  // 3. Decode input data
  const decoded = decodeTransferInput(tx.input);
  if (!decoded) {
    return { success: false, error: "Transaction is not a standard ERC20 transfer" };
  }

  const { recipientAddress, amountUSDC } = decoded;

  // 4. Verify recipient and amount
  if (recipientAddress.toLowerCase() !== expectedRecipient.toLowerCase()) {
    return {
      success: false,
      error: `Recipient mismatch. Expected: ${expectedRecipient}, Transferred to: ${recipientAddress}`,
    };
  }

  // Allow minor floating point variance (e.g. 0.001)
  if (amountUSDC < expectedAmount - 0.001) {
    return {
      success: false,
      error: `Amount mismatch. Expected: ${expectedAmount} USDC, Transferred: ${amountUSDC} USDC`,
    };
  }

  // 5. Get transaction receipt to verify status is 0x1 (success)
  const receipt = await callRpc<TransactionReceipt>("eth_getTransactionReceipt", [txHash]);
  if (!receipt) {
    return { success: false, error: "Transaction receipt not available yet" };
  }

  if (receipt.status !== "0x1") {
    return { success: false, error: "Transaction failed on-chain" };
  }

  const blockNumber = parseInt(receipt.blockNumber, 16);

  return {
    success: true,
    details: {
      from: tx.from,
      to: recipientAddress,
      amountUSDC,
      blockNumber,
    },
  };
}

const X402_VALIDATOR_DECODE_ABI = [
  {
    name: "payForService",
    type: "function",
    inputs: [
      { name: "serviceId", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * Verifies a transaction hash on-chain for a payment processed through our custom X402Validator contract.
 */
export async function verifyX402ValidatorPayment(
  txHash: string,
  expectedServiceId: string,
  expectedAmountUSDC: number,
  validatorAddress: string
): Promise<VerificationResult> {
  if (!txHash || !txHash.startsWith("0x")) {
    return { success: false, error: "Invalid transaction hash format" };
  }

  // 1. Get transaction details
  const tx = await callRpc<TransactionData>("eth_getTransactionByHash", [txHash]);
  if (!tx) {
    return { success: false, error: "Transaction not found on Arc Testnet" };
  }

  // 2. Validate token destination contract address is our validator
  if (!tx.to || tx.to.toLowerCase() !== validatorAddress.toLowerCase()) {
    return { success: false, error: `Transaction destination is not the X402Validator contract. Expected: ${validatorAddress}, Got: ${tx.to}` };
  }

  // 3. Decode input data using viem
  try {
    const { args, functionName } = decodeFunctionData({
      abi: X402_VALIDATOR_DECODE_ABI,
      data: tx.input as `0x${string}`,
    });

    if (functionName !== "payForService") {
      return { success: false, error: "Invalid function called, expected payForService" };
    }

    const [serviceId, amount] = args;

    // 4. Verify service ID
    if (serviceId.toLowerCase() !== expectedServiceId.toLowerCase()) {
      return {
        success: false,
        error: `Service ID mismatch. Expected: ${expectedServiceId}, Got: ${serviceId}`,
      };
    }

    // USDC has 6 decimals, convert expected USDC (float) to units
    const expectedAmountUnits = BigInt(Math.round(expectedAmountUSDC * 1_000_000));
    if (amount < expectedAmountUnits) {
      return {
        success: false,
        error: `Amount mismatch. Expected at least: ${expectedAmountUSDC} USDC (${expectedAmountUnits} units), Paid: ${Number(amount) / 1_000_000} USDC (${amount} units)`,
      };
    }

    // 5. Get transaction receipt to verify status is 0x1 (success)
    const receipt = await callRpc<TransactionReceipt>("eth_getTransactionReceipt", [txHash]);
    if (!receipt) {
      return { success: false, error: "Transaction receipt not available yet" };
    }

    if (receipt.status !== "0x1") {
      return { success: false, error: "Transaction failed on-chain" };
    }

    const blockNumber = parseInt(receipt.blockNumber, 16);

    return {
      success: true,
      details: {
        from: tx.from,
        to: validatorAddress,
        amountUSDC: Number(amount) / 1_000_000,
        blockNumber,
      },
    };
  } catch (error: any) {
    return { success: false, error: `Failed to decode transaction: ${error.message}` };
  }
}

