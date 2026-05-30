/**
 * AgenticCommerce — Transaction wait service
 * Waits for transaction confirmation and returns full receipt
 */

import { getPublicClient } from "./instance";

const DEFAULT_POLL_INTERVAL = 2_000;
const DEFAULT_TIMEOUT = 60_000;

export interface WaitForTxOptions {
  pollInterval?: number;
  timeout?: number;
}

export interface WaitForTxResult {
  status: "success" | "reverted";
  blockNumber: bigint;
  logs: Array<{
    address: string;
    topics: readonly `0x${string}`[];
    data: `0x${string}`;
  }>;
}

export async function waitForTransaction(
  txHash: `0x${string}`,
  options?: WaitForTxOptions
): Promise<WaitForTxResult> {
  const client = getPublicClient();
  const pollInterval = options?.pollInterval ?? DEFAULT_POLL_INTERVAL;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await client.getTransactionReceipt({ hash: txHash });
      if (receipt) {
        return {
          status: receipt.status === "success" ? "success" : "reverted",
          blockNumber: receipt.blockNumber,
          logs: receipt.logs.map((log) => ({
            address: log.address,
            topics: log.topics as readonly `0x${string}`[],
            data: log.data,
          })),
        };
      }
    } catch {
      // Transaction not yet mined — continue polling
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Transaction ${txHash} timed out after ${timeout}ms`);
}

export async function waitForMultipleTransactions(
  txHashes: (`0x${string}` | null)[],
  options?: WaitForTxOptions
): Promise<void> {
  const validHashes = txHashes.filter((h): h is `0x${string}` => h !== null);
  await Promise.all(validHashes.map((hash) => waitForTransaction(hash, options)));
}
