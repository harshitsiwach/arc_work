import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: [".env.local"] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const agentAddress = process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking for agent wallet in database...");
  console.log("Agent Address:", agentAddress);

  // Check wallets
  const { data: wallets, error: walletsError } = await supabase
    .from("wallets")
    .select("*")
    .eq("wallet_address", agentAddress);

  if (walletsError) {
    console.error("Error querying wallets:", walletsError);
  } else {
    console.log("Matching wallets:", wallets);
  }

  // Check all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .limit(10);

  if (profilesError) {
    console.error("Error querying profiles:", profilesError);
  } else {
    console.log("First 10 profiles in DB:", profiles);
  }
}

run();
