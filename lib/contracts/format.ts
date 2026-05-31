const USDC_DECIMALS = 6;
const USDC_MULTIPLIER = BigInt(10 ** USDC_DECIMALS);

/** Convert raw USDC units (6 decimals) to human-readable string */
export function formatUSDC(amount: bigint): string {
  const whole = amount / USDC_MULTIPLIER;
  const frac = amount % USDC_MULTIPLIER;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(USDC_DECIMALS, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}
