import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: [".env.local"] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const agentWalletId = process.env.NEXT_PUBLIC_AGENT_WALLET_ID;
const agentAddress = process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS;

if (!supabaseUrl || !supabaseKey || !agentWalletId || !agentAddress) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking profiles...");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .limit(5);

  if (!profiles || profiles.length === 0) {
    console.error("No profiles found!");
    process.exit(1);
  }

  const userProfileId = profiles[0].id;
  console.log(`Using profile ID ${userProfileId} (${profiles[0].name}) to attach agent wallet...`);

  const walletPayload = {
    profile_id: userProfileId,
    circle_wallet_id: agentWalletId,
    wallet_type: "SCA",
    wallet_address: agentAddress,
    currency: "USDC",
    blockchain: "ARC-TESTNET"
  };

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .insert(walletPayload)
    .select()
    .single();

  if (walletError) {
    console.error("Error creating agent wallet:", walletError);
    process.exit(1);
  }

  console.log("Agent wallet registered successfully in DB:", wallet);
}

run();
