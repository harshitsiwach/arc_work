import { createWalletClient, createPublicClient, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { X402_VALIDATOR_ABI, X402_VALIDATOR_BYTECODE } from "../lib/contracts/x402-validator-data";
import * as dotenv from "dotenv";

dotenv.config();

const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
let PRIVATE_KEY = process.env.BASE_DEPLOYER_PRIVATE_KEY;
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = `0x${PRIVATE_KEY}`;
}
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base native USDC
const FEE_COLLECTOR = process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || "0x37fc98997055b4be246d698b131cabc2c4ab34a3";

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Error: BASE_DEPLOYER_PRIVATE_KEY not set in environment.");
    process.exit(1);
  }

  const account = privateKeyToAccount(PRIVATE_KEY as Hex);
  
  console.log("Deploying X402Validator on Base Mainnet...");
  console.log(`Deployer Address: ${account.address}`);
  console.log(`Fee Collector Address: ${FEE_COLLECTOR}`);
  console.log(`USDC Contract Address: ${USDC_ADDRESS}`);
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC_URL)
  });
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL)
  });
  
  try {
    const hash = await walletClient.deployContract({
      abi: X402_VALIDATOR_ABI,
      bytecode: X402_VALIDATOR_BYTECODE,
      args: [USDC_ADDRESS as `0x${string}`, FEE_COLLECTOR as `0x${string}`]
    });
    
    console.log(`Deployment transaction submitted. Hash: ${hash}`);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log("Deployment Successful!");
    console.log(`Contract Address: ${receipt.contractAddress}`);
    console.log(`Block Number: ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main();
