"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { MarketplaceSearch } from "@/components/marketplace/marketplace-search";
import { MarketplaceTable, type SortKey } from "@/components/marketplace/marketplace-table";
import { MarketplaceTabs, type TabKey } from "@/components/marketplace/marketplace-tabs";
import { MarketplaceFilterBar } from "@/components/marketplace/marketplace-filter-bar";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitNetwork } from "@reown/appkit/react";
import { getPublicClient, getWalletClient } from "@/lib/contracts/instance";
import { X402_VALIDATOR_ABI } from "@/lib/contracts/x402-validator-data";
import { usdc } from "@/lib/contracts/usdc";
import { arcTestnet, base } from "@/lib/web3/appkit-provider";

interface ToolService {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  price_amount: string;
  price_currency: string;
  endpoints: { url: string; method: string; description: string; price: string }[];
  source: string;
  networks: string[];
}



export function AIMarketplaceContent() {
  const router = useRouter();
  const [services, setServices] = useState<ToolService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeTab, setActiveTab] = useState<TabKey>("services");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [networkFilter, setNetworkFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");

  // Wallet & web3 hooks
  const { isConnected, connect, address, chainId } = useWallet();
  const { switchNetwork } = useAppKitNetwork();

  // Validator Address
  const [validatorAddress, setValidatorAddress] = useState<string>("0xb0c7709a4ccc69899d922048792fcba240a9afcb");

  // Active payment service modal
  const [selectedService, setSelectedService] = useState<ToolService | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string>("");
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Active endpoint selection state
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [endpointParams, setEndpointParams] = useState<Record<string, string>>({});

  // Playground state
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [runningApi, setRunningApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);

  const isBaseService = !!(selectedService?.networks?.includes("Base") || selectedEndpoint?.network?.includes("Base") || selectedEndpoint?.network?.includes("8453") || selectedEndpoint?.url?.includes("paysponge.com"));
  const targetChainId = isBaseService ? 8453 : 5042002;

  // Load validator address on mount
  useEffect(() => {
    if (selectedService) {
      const isBase = !!(selectedService.networks?.includes("Base") || selectedEndpoint?.network?.includes("Base") || selectedEndpoint?.network?.includes("8453") || selectedEndpoint?.url?.includes("paysponge.com"));
      const envAddress = isBase 
        ? process.env.NEXT_PUBLIC_X402_VALIDATOR_ADDRESS_BASE 
        : process.env.NEXT_PUBLIC_X402_VALIDATOR_ADDRESS;
      const localAddress = localStorage.getItem("arc_x402_validator_address");
      
      const defaultAddr = isBase 
        ? "0x03a42354bfb02458ce371cb1ba07fe25d604306f" 
        : "0xb0c7709a4ccc69899d922048792fcba240a9afcb";

      if (envAddress) setValidatorAddress(envAddress);
      else if (localAddress) setValidatorAddress(localAddress);
      else setValidatorAddress(defaultAddr);
    }
  }, [selectedService, selectedEndpoint]);

  const handlePayForService = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }
    
    if (!selectedService) return;

    if (!isBaseService && !validatorAddress) {
      toast.error("No validator contract address configured. Deploy or configure one first.");
      return;
    }
    
    setPaying(true);
    try {
      const targetChain = isBaseService ? base : arcTestnet;
      const walletClient = getWalletClient(targetChain);
      if (!walletClient) throw new Error("Wallet provider not found.");
      
      const priceVal = parseFloat(selectedEndpoint?.price || selectedService.price_amount) || 0.001; // default to 0.001 if free/not specified
      const priceWithMarkup = isBaseService ? priceVal * 1.10 : priceVal;
      const usdcUnits = BigInt(Math.round(priceWithMarkup * 1_000_000));
      
      if (isBaseService) {
        // Validator-based payment on Base Mainnet
        const baseUsdcAddress = (selectedEndpoint?.asset || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`;
        
        toast.info("Checking USDC allowance on Base Mainnet...");
        const ERC20_ABI = [
          { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
          { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }
        ] as const;

        const currentAllowance = await getPublicClient(base).readContract({
          address: baseUsdcAddress,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, validatorAddress],
        });

        if (currentAllowance < usdcUnits) {
          // Approve a larger amount (1,000 USDC) to prevent recurring approval popups and bypass RPC sync lag on future calls
          const approveAmount = 1000n * 1_000_000n;
          toast.info("Approving USDC on Base Mainnet...");
          const { request: approveReq } = await getPublicClient(base).simulateContract({
            address: baseUsdcAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [validatorAddress, approveAmount],
            account: address as `0x${string}`,
          });
          const approveTx = await walletClient.writeContract(approveReq);
          toast.info("USDC approval requested on Base. Waiting for confirmation...");
          await getPublicClient(base).waitForTransactionReceipt({ hash: approveTx });
          toast.success("USDC approved successfully on Base!");
          
          // Poll the allowance until the RPC node reflects the update to bypass RPC load balancer sync lag
          toast.info("Syncing blockchain state...");
          let retries = 15;
          while (retries > 0) {
            const allowanceAfter = await getPublicClient(base).readContract({
              address: baseUsdcAddress,
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [address, validatorAddress],
            });
            if (allowanceAfter >= usdcUnits) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries--;
          }
        }

        toast.info("Signing payment transaction via Base X402Validator...");
        const { request } = await getPublicClient(base).simulateContract({
          address: validatorAddress as `0x${string}`,
          abi: X402_VALIDATOR_ABI,
          functionName: "payForService",
          args: [selectedService.name, usdcUnits],
          account: address as `0x${string}`,
        });

        const txHash = await walletClient.writeContract(request);
        toast.info("Payment submitted to Base. Waiting for confirmation...");
        const receipt = await getPublicClient(base).waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === "success") {
          toast.success("Payment confirmed on Base Mainnet!");
          setPaymentTxHash(txHash);
          setPaymentVerified(true);
        } else {
          throw new Error("Payment transaction failed on Base Mainnet.");
        }
      } else {
        // Standard validator-based payment on Arc Testnet
        // 1. Approve USDC if needed
        toast.info("Checking USDC allowance...");
        const approveTx = await usdc.approveIfNeeded(validatorAddress as `0x${string}`, usdcUnits);
        if (approveTx) {
          toast.info("USDC approval requested. Please sign in your wallet...");
          const publicClient = getPublicClient(arcTestnet);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
          toast.success("USDC approved successfully.");
        }
        
        // 2. Pay for service
        toast.info("Signing payment transaction via X402Validator...");
        const { request } = await getPublicClient(arcTestnet).simulateContract({
          address: validatorAddress as `0x${string}`,
          abi: X402_VALIDATOR_ABI,
          functionName: "payForService",
          args: [selectedService.name, usdcUnits],
          account: address as `0x${string}`,
        });
        
        const txHash = await walletClient.writeContract(request);
        toast.info("Payment submitted to Arc blockchain. Waiting for block confirmation...");
        
        const receipt = await getPublicClient(arcTestnet).waitForTransactionReceipt({ hash: txHash });
        
        if (receipt.status === "success") {
          toast.success("Payment confirmed on-chain!");
          setPaymentTxHash(txHash);
          setPaymentVerified(true);
        } else {
          throw new Error("Payment transaction failed on-chain.");
        }
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Payment transaction failed");
    } finally {
      setPaying(false);
    }
  };

  const handleRunPlaygroundApi = async () => {
    if (!paymentTxHash || !selectedService) return;
    
    setRunningApi(true);
    setApiResponse(null);
    try {
      const priceVal = parseFloat(selectedEndpoint?.price || selectedService.price_amount) || 0.001;
      const res = await fetch("/api/tools/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: paymentTxHash,
          serviceId: selectedService.name,
          amount: priceVal,
          validatorAddress,
          endpointUrl: selectedEndpoint?.url || "",
          endpointMethod: selectedEndpoint?.method || "GET",
          endpointParams,
          network: selectedEndpoint?.network || selectedService?.networks?.[0] || "",
          inputPayload: playgroundInput
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify payment or call API");
      }

      setApiResponse(data.apiResponse);
      setVerificationDetails(data.verification);
      toast.success("API response received!");
    } catch (error: any) {
      console.error("API call failed:", error);
      toast.error(error.message || "API execution failed");
    } finally {
      setRunningApi(false);
    }
  };

  const handleOpenPaymentDialog = (svc: ToolService) => {
    setSelectedService(svc);
    setPaymentTxHash("");
    setPaymentVerified(false);
    setPlaygroundInput("");
    setApiResponse(null);
    setVerificationDetails(null);
    setSelectedEndpoint(svc.endpoints?.[0] || null);
    setEndpointParams({});
  };

  useEffect(() => {
    fetch("/api/tools")
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => toast.error("Failed to load marketplace"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(24);
  }, [search, categoryFilter]);

  const categories = useMemo(() => [...new Set(services.map(s => s.category))].sort(), [services]);
  const networks = useMemo(() => [...new Set(services.flatMap(s => s.networks || []))].sort(), [services]);
  const filtered = services.filter(s => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (networkFilter && !(s.networks || []).includes(networkFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesDomain = s.domain?.toLowerCase().includes(q);
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || matchesDomain;
    }
    return true;
  });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">
          Marketplace
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Discover AI services, APIs, research tools, analytics services and automation endpoints.
        </p>
      </div>

      {/* Tabs */}
      <MarketplaceTabs active={activeTab} onChange={setActiveTab} />

      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <MarketplaceSearch value={search} onChange={setSearch} />
        </div>
        <MarketplaceFilterBar
          categories={categories}
          networks={networks}
          categoryActive={categoryFilter}
          networkActive={networkFilter}
          verificationActive={verificationFilter}
          onCategoryChange={setCategoryFilter}
          onNetworkChange={setNetworkFilter}
          onVerificationChange={setVerificationFilter}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-6 w-6 text-white/30" />
          </motion.div>
        </div>
      ) : activeTab !== "services" ? (
        <div className="text-center py-16">
          <p className="text-sm text-white/30">Coming soon</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-[#050505] overflow-hidden">
          <MarketplaceTable
            services={displayed}
            sort={sort}
            onSortChange={setSort}
            onRowClick={(id) => router.push(`/marketplace/agents/${id}`)}
          />

          {visibleCount < filtered.length && (
            <div className="flex justify-center py-4 border-t border-white/[0.03]">
              <Button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/50 hover:text-white/70 text-xs h-9 px-5 rounded-xl transition-all duration-200"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

