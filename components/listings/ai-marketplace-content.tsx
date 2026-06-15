"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Search, ExternalLink, Zap, Globe, Cpu, Database,
  Image, Music, Plane, Bot, ShoppingBag, TrendingUp,
  ArrowRight, Star, Users, Clock, ChevronRight, Filter,
  Mic, BarChart3, MessageSquare, Code, Layers, Shield,
  Sparkles, Unlock,
} from "lucide-react";
import { OpenAI, Anthropic, Exa } from "@lobehub/icons";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { getPublicClient, getWalletClient } from "@/lib/contracts/instance";
import { X402_VALIDATOR_ABI } from "@/lib/contracts/x402-validator-data";
import { usdc } from "@/lib/contracts/usdc";
import { arcTestnet, base } from "@/lib/web3/appkit-provider";

const CATEGORY_ICONS: Record<string, any> = {
  Search: Search, Inference: Cpu, Data: Database, Media: Image,
  Social: Globe, Infra: Cpu, Travel: Plane, Storage: Database,
  Trading: ShoppingBag, Voice: Mic, Automation: Zap,
  Productivity: Layers, Blockchain: Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  Search: "oklch(0.75 0.18 125)", Inference: "oklch(0.75 0.18 125)",
  Data: "oklch(0.75 0.18 125)", Media: "oklch(0.55 0.20 30)",
  Social: "oklch(0.75 0.18 125)", Infra: "oklch(0.55 0 0)",
  Travel: "oklch(0.60 0.16 80)", Storage: "oklch(0.75 0.18 125)",
  Trading: "oklch(0.75 0.18 125)", Voice: "oklch(0.75 0.18 125)",
  Automation: "oklch(0.75 0.18 125)", Productivity: "oklch(0.75 0.18 125)",
  Blockchain: "oklch(0.55 0.15 120)",
};

const ECOSYSTEM_SIGNALS: Record<string, string> = {
  Search: "Used by 3.2k agents", Inference: "Trending in research",
  Data: "Popular in analytics", Media: "Fast growing",
  Social: "Trending", Automation: "Most deployed",
  Trading: "High demand", Voice: "New integration",
};

const FEATURED_PROVIDERS: { name: string; desc: string; category: string; users: string; icon?: React.ElementType; iconSrc?: string; brand: boolean }[] = [
  { name: "OpenAI", desc: "GPT-4o, o1, DALL-E — leading AI models", category: "Inference", users: "12.4k", icon: OpenAI, brand: true },
  { name: "Anthropic", desc: "Claude — advanced reasoning & analysis", category: "Inference", users: "8.9k", icon: Anthropic, brand: true },
  { name: "Deepgram", desc: "Real-time speech-to-text & transcription", category: "Voice", users: "4.2k", iconSrc: "/icons/ai/deepgram.svg", brand: false },
  { name: "ElevenLabs", desc: "Premium AI voice generation & cloning", category: "Voice", users: "6.1k", iconSrc: "/icons/ai/elevenlabs.svg", brand: false },
  { name: "Tavily", desc: "AI-optimized search & research API", category: "Search", users: "5.7k", iconSrc: "/icons/ai/tavily.svg", brand: false },
  { name: "Exa", desc: "Neural search for AI applications", category: "Search", users: "3.4k", icon: Exa, brand: true },
  { name: "The Graph", desc: "Decentralized indexing for blockchain data", category: "Blockchain", users: "7.8k", iconSrc: "/icons/ai/thegraph.svg", brand: false },
];

const DISCOVERY_CHIPS = [
  "Research", "Automation", "Inference", "Voice",
  "Trading", "Social", "Content", "Data",
];

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

function getEndpointParamsList(url: string) {
  const params: { name: string; type: "path" | "query"; placeholder: string }[] = [];
  if (!url) return params;
  
  // Extract path parameters starting with :
  const pathMatches = url.match(/:[a-zA-Z0-9]+/g);
  if (pathMatches) {
    pathMatches.forEach(m => {
      const name = m.substring(1);
      params.push({
        name,
        type: "path",
        placeholder: `Enter ${name} (e.g. 1500543)`
      });
    });
  }
  
  // Add query parameters based on endpoint type
  if (url.includes("/search") && !url.includes("/nearby_search")) {
    params.push({
      name: "query",
      type: "query",
      placeholder: "Search query (e.g. Paris, London, Tokyo)"
    });
  } else if (url.includes("/nearby_search")) {
    params.push({
      name: "latLong",
      type: "query",
      placeholder: "Latitude & Longitude (e.g. 48.8566,2.3522)"
    });
  }
  
  return params;
}

export function AIMarketplaceContent() {
  const [services, setServices] = useState<ToolService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const featuredRef = useRef<HTMLDivElement>(null);

  // Wallet & web3 hooks
  const { isConnected, connect, address, activeWalletType, chainId } = useWallet();
  const { switchNetwork } = useAppKitNetwork();

  // Validator Address
  const [validatorAddress, setValidatorAddress] = useState<string>("0xb0c7709a4ccc69899d922048792fcba240a9afcb");
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
    const envAddress = process.env.NEXT_PUBLIC_X402_VALIDATOR_ADDRESS;
    const localAddress = localStorage.getItem("arc_x402_validator_address");
    if (envAddress) {
      setValidatorAddress(envAddress);
    } else if (localAddress) {
      setValidatorAddress(localAddress);
    }
  }, []);

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
      const usdcUnits = BigInt(Math.round(priceVal * 1_000_000));
      
      if (isBaseService) {
        // Direct Base Mainnet USDC transfer (no approval needed)
        const baseUsdcAddress = (selectedEndpoint?.asset || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`;
        const payToAddress = (selectedEndpoint?.payTo || "0x6302D9e6DBB22fEC3c350551568Bb39B4b35Ad57") as `0x${string}`;
        
        toast.info(`Paying ${priceVal} USDC directly on Base Mainnet...`);
        
        const ERC20_TRANSFER_ABI = [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ name: "", type: "bool" }]
          }
        ] as const;
        
        const { request } = await getPublicClient(base).simulateContract({
          address: baseUsdcAddress,
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [payToAddress, usdcUnits],
          account: address as `0x${string}`,
        });
        
        const txHash = await walletClient.writeContract(request);
        toast.info("USDC transfer submitted on Base Mainnet. Waiting for confirmation...");
        
        const receipt = await getPublicClient(base).waitForTransactionReceipt({ hash: txHash });
        
        if (receipt.status === "success") {
          toast.success("USDC transfer confirmed on Base Mainnet!");
          setPaymentTxHash(txHash);
          setPaymentVerified(true);
        } else {
          throw new Error("USDC transfer failed on Base Mainnet.");
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

  const categories = [...new Set(services.map(s => s.category))].sort();
  const filtered = services.filter(s => {
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, oklch(0.75 0.18 125 / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, oklch(0.75 0.18 125 / 0.06) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              AI Marketplace
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
              Discover AI Capabilities
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[var(--color-bd)] text-[12px] font-medium"
              style={{ backgroundColor: "var(--color-bg)", color: "var(--color-fg-secondary)" }}
              onClick={() => setShowAdminPanel(!showAdminPanel)}
            >
              <Shield className="h-3.5 w-3.5" />
              {showAdminPanel ? "Hide X402 Settings" : "X402 Validator Settings"}
            </Button>
          </div>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--color-fg-secondary)" }}>
            Deploy AI tools, APIs, automation services, and capabilities for autonomous agents. Pay per request in USDC.
          </p>

          {showAdminPanel && (
            <div
              className="mt-6 p-4 rounded-xl border space-y-4 text-xs transition-all duration-200"
              style={{
                backgroundColor: "var(--color-bg-inset)",
                borderColor: "var(--color-bd)",
              }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--color-bd)" }}>
                <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--color-fg)" }}>
                  <Shield size={14} className="text-[var(--color-accent)]" /> X402 Validator & Facilitator Setup
                </h3>
                <Badge variant="outline" className="bg-[#CBF825]/5 text-[#CBF825] border-[#CBF825]/20">
                  Arc Testnet
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="font-medium text-[var(--color-fg-secondary)]">X402 Validator Contract Address</div>
                  <div className="flex">
                    <input
                      value={validatorAddress}
                      readOnly
                      placeholder="Not Deployed / Paste address..."
                      className="w-full px-3 py-1.5 rounded-lg border font-mono text-[11px]"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        borderColor: "var(--color-bd)",
                        color: "var(--color-fg)",
                      }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                    The official contract address deployed on Arc Testnet.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-medium text-[var(--color-fg-secondary)]">Fee Destination (Agent Wallet)</div>
                  <div className="p-2.5 rounded-lg border font-mono text-[11px] truncate" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}>
                    {process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || "0x5352c3c9C4c3746a59600eEcd461332f1CFCaA9a (Fallback)"}
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                    USDC paid through the validator contract will be sent directly to this address.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
            <input
              placeholder="Search tools, models, services..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-bd)",
                color: "var(--color-fg)",
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {DISCOVERY_CHIPS.map((chip) => (
              <button
                key={chip}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-bd)",
                  color: "var(--color-fg-secondary)",
                }}
                onClick={() => setSearch(chip.toLowerCase())}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Featured Providers</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>Trusted AI ecosystem partners</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => featuredRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button
              onClick={() => featuredRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={featuredRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {FEATURED_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const color = CATEGORY_COLORS[provider.category] || "var(--color-accent)";
            const isBrand = provider.brand;
            return (
              <div
                key={provider.name}
                className="flex-shrink-0 w-64 p-4 rounded-xl hover-lift cursor-pointer group"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-bd)",
                  scrollSnapAlign: "start",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={isBrand
                      ? { backgroundColor: "var(--color-bg-inset)" }
                      : { backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                  >
                    {provider.iconSrc ? (
                      <img
                        src={provider.iconSrc}
                        alt={`${provider.name} icon`}
                        width={20}
                        height={20}
                        style={{ color }}
                        className="w-5 h-5"
                      />
                    ) : Icon ? (
                      <Icon size={20} style={isBrand ? undefined : { color }} />
                    ) : null}
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--color-fg-muted)" }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-fg)" }}>{provider.name}</p>
                <p className="text-[11px] mb-3 line-clamp-2" style={{ color: "var(--color-fg-muted)" }}>{provider.desc}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">{provider.category}</Badge>
                  <p className="text-[10px] font-medium" style={{ color: "var(--color-accent)" }}>{provider.users} users</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} style={{ color: "var(--color-fg-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Categories</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
            style={{
              backgroundColor: !categoryFilter ? "var(--color-accent)" : "var(--color-bg-elevated)",
              color: !categoryFilter ? "white" : "var(--color-fg-secondary)",
              border: `1px solid ${!categoryFilter ? "var(--color-accent)" : "var(--color-bd)"}`,
            }}
            onClick={() => setCategoryFilter("")}
          >
            All
          </button>
          {categories.map(c => {
            const Icon = CATEGORY_ICONS[c] || Zap;
            const color = CATEGORY_COLORS[c] || "var(--color-fg-muted)";
            return (
              <button
                key={c}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: categoryFilter === c ? `color-mix(in oklch, ${color} 15%, transparent)` : "var(--color-bg-elevated)",
                  color: categoryFilter === c ? color : "var(--color-fg-secondary)",
                  border: `1px solid ${categoryFilter === c ? color : "var(--color-bd)"}`,
                }}
                onClick={() => setCategoryFilter(c)}
              >
                <Icon size={14} />
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-fg-muted)" }}>
        <span className="flex items-center gap-1">
          <TrendingUp size={12} />
          Showing {filtered.length} of {services.length} capabilities
        </span>
        <span>·</span>
        <span>From $0.001/call</span>
        <span>·</span>
        <span>Powered by x42 via Agentic Market</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-1">
            {displayed.map((svc) => {
              const Icon = CATEGORY_ICONS[svc.category] || Zap;
              const color = CATEGORY_COLORS[svc.category] || "var(--color-fg-muted)";
              const price = parseFloat(svc.price_amount);
              const signal = ECOSYSTEM_SIGNALS[svc.category];

              return (
                <Card key={svc.id} className="hover-lift group" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--color-fg-muted)" }}>{svc.source || "Agentic Market"}</span>
                      </div>
                      {signal && (
                        <span className="text-[10px] font-medium" style={{ color: "var(--color-accent)" }}>{signal}</span>
                      )}
                    </div>

                    <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{svc.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{svc.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>
                          ${price < 0.01 ? price.toFixed(4) : price.toFixed(2)}
                        </span>
                        <span className="text-xs ml-1" style={{ color: "var(--color-fg-muted)" }}>per call</span>
                      </div>
                      {svc.networks?.length > 0 && (
                        <Badge variant="outline" className="text-[10px]">{svc.networks[0]}</Badge>
                      )}
                    </div>

                    <div className="text-xs space-y-1" style={{ color: "var(--color-fg-muted)" }}>
                      {svc.endpoints.slice(0, 2).map((ep, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                            {ep.method || "POST"}
                          </span>
                          <span className="truncate">{ep.description || ep.url}</span>
                        </div>
                      ))}
                      {svc.endpoints.length > 2 && (
                        <span className="text-[11px]">+{svc.endpoints.length - 2} more endpoints</span>
                      )}
                    </div>

                     <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 transition-all duration-200 group-hover:border-[var(--color-accent)]"
                        onClick={() => handleOpenPaymentDialog(svc)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Use via Connected Wallet
                      </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={() => setVisibleCount(prev => prev + 24)}>
                Load More Capabilities
              </Button>
            </div>
          )}
        </>
      )}

      {/* X402 Payment & Playground Modal */}
      <Dialog open={selectedService !== null} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-2xl border-[var(--color-bd)] overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)", color: "var(--color-fg)" }}>
          {selectedService && (
            <>
              <DialogHeader className="border-b pb-4" style={{ borderColor: "var(--color-bd)" }}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" style={{ color: "var(--color-accent)", borderColor: "color-mix(in oklch, var(--color-accent) 30%, transparent)" }}>
                    X402 Standard
                  </Badge>
                  <span className="text-xs font-mono" style={{ color: "var(--color-fg-muted)" }}>
                    API Endpoint: {selectedService.name}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-2" style={{ color: "var(--color-fg)" }}>
                  Pay & Call {selectedService.name}
                </DialogTitle>
                <DialogDescription style={{ color: "var(--color-fg-secondary)" }}>
                  {selectedService.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Endpoint Selector */}
                {selectedService.endpoints && selectedService.endpoints.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>
                      Select Endpoint / API
                    </label>
                    <select
                      disabled={paymentVerified}
                      value={selectedEndpoint?.url || ""}
                      onChange={(e) => {
                        const ep = selectedService.endpoints.find(x => x.url === e.target.value);
                        setSelectedEndpoint(ep || null);
                        setEndpointParams({});
                        setPlaygroundInput("");
                        setApiResponse(null);
                      }}
                      className="w-full p-2.5 rounded-lg border text-xs"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        borderColor: "var(--color-bd)",
                        color: "var(--color-fg)",
                      }}
                    >
                      {selectedService.endpoints.map((ep, i) => (
                        <option key={i} value={ep.url}>
                          [{ep.method || "GET"}] {ep.description || ep.url} (${ep.price} USDC)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contract & Price Details */}
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl border text-xs" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
                  <div>
                    <span className="block font-medium" style={{ color: "var(--color-fg-muted)" }}>Validator Contract</span>
                    <code className="text-[11px] font-mono block mt-0.5 truncate" style={{ color: "var(--color-fg)" }}>
                      {validatorAddress || "Not Configured (Please deploy first)"}
                    </code>
                  </div>
                  <div>
                    <span className="block font-medium" style={{ color: "var(--color-fg-muted)" }}>Service Cost</span>
                    <span className="text-sm font-bold block mt-0.5" style={{ color: "var(--color-accent)" }}>
                      {selectedEndpoint ? parseFloat(selectedEndpoint.price) : (parseFloat(selectedService.price_amount) || 0.001)} USDC
                    </span>
                  </div>
                </div>

                {!paymentVerified ? (
                  /* Payment Execution Screen */
                  <div className="space-y-4 text-center py-6">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/10 border border-violet-500/20 text-violet-500 mb-2">
                      <Zap size={24} />
                    </div>
                    <h4 className="font-semibold text-sm" style={{ color: "var(--color-fg)" }}>
                      Authorize Micropayment
                    </h4>
                    <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--color-fg-secondary)" }}>
                      This service requires a USDC payment to be routed through our X402 validator contract. Click below to sign the payment.
                    </p>

                    <div className="pt-2 flex justify-center gap-3">
                      {!isConnected ? (
                        <Button onClick={connect} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-medium">
                          Connect Wallet
                        </Button>
                      ) : chainId !== targetChainId ? (
                        <Button
                          onClick={() => switchNetwork && switchNetwork(isBaseService ? base : arcTestnet)}
                          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-medium"
                        >
                          Switch to {isBaseService ? "Base Mainnet" : "Arc Testnet"}
                        </Button>
                      ) : (
                        <Button
                          disabled={paying || (!isBaseService && !validatorAddress)}
                          onClick={handlePayForService}
                          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white font-semibold flex items-center gap-2 shadow-lg"
                        >
                          {paying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <Unlock size={14} /> Pay {selectedEndpoint ? parseFloat(selectedEndpoint.price) : (parseFloat(selectedService.price_amount) || 0.001)} USDC
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {!validatorAddress && (
                      <p className="text-[10px] text-red-500 font-medium mt-2">
                        * Please deploy the X402 Validator contract first from the settings panel.
                      </p>
                    )}
                  </div>
                ) : (
                  /* API Playground & Execution Screen */
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-[#CBF825]/20 text-xs space-y-1.5" style={{ backgroundColor: "rgba(203, 248, 37, 0.03)" }}>
                      <div className="font-semibold text-[#CBF825] flex items-center gap-1.5">
                        <Badge className="bg-[#CBF825]/20 text-[#CBF825] border border-[#CBF825]/30">On-Chain Payment Verified</Badge>
                      </div>
                      <div className="truncate">Tx Hash: <code className="text-[11px] font-mono text-[var(--color-fg-muted)]">{paymentTxHash}</code></div>
                      <div>Validator: <code className="text-[11px] font-mono text-[var(--color-fg-muted)]">{validatorAddress}</code></div>
                    </div>

                    {selectedEndpoint ? (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg border text-xs space-y-1" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-bd)" }}>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-bg-inset)] mr-1.5">
                            {selectedEndpoint.method || "GET"}
                          </span>
                          <span className="font-mono text-[11px]" style={{ color: "var(--color-fg)" }}>
                            {selectedEndpoint.url}
                          </span>
                          <p className="text-[11px] mt-1 text-[var(--color-fg-muted)]">
                            {selectedEndpoint.description}
                          </p>
                        </div>

                        {getEndpointParamsList(selectedEndpoint.url).map((p) => (
                          <div key={p.name} className="space-y-1">
                            <label className="block text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>
                              {p.name} <span className="text-red-500">*</span> ({p.type} parameter)
                            </label>
                            <input
                              type="text"
                              placeholder={p.placeholder}
                              value={endpointParams[p.name] || ""}
                              onChange={(e) => setEndpointParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                              className="w-full p-2.5 rounded-lg border text-xs"
                              style={{
                                backgroundColor: "var(--color-bg)",
                                borderColor: "var(--color-bd)",
                                color: "var(--color-fg)",
                              }}
                            />
                          </div>
                        ))}

                        {getEndpointParamsList(selectedEndpoint.url).length === 0 && (
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>
                              Playground Input Payload (e.g. prompt, query, audio transcript)
                            </label>
                            <textarea
                              value={playgroundInput}
                              onChange={(e) => setPlaygroundInput(e.target.value)}
                              placeholder="Enter input payload here..."
                              className="w-full h-20 p-2.5 rounded-lg border text-xs resize-none"
                              style={{
                                backgroundColor: "var(--color-bg)",
                                borderColor: "var(--color-bd)",
                                color: "var(--color-fg)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>
                          Playground Input Payload (e.g. prompt, query, audio transcript)
                        </label>
                        <textarea
                          value={playgroundInput}
                          onChange={(e) => setPlaygroundInput(e.target.value)}
                          placeholder={
                            selectedService.name.toLowerCase().includes("search") || selectedService.name.toLowerCase().includes("exa")
                              ? "Enter a web search query (e.g., 'USDC micropayments on Arc blockchain')...."
                              : "Enter prompt input here..."
                          }
                          className="w-full h-20 p-2.5 rounded-lg border text-xs resize-none"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            borderColor: "var(--color-bd)",
                            color: "var(--color-fg)",
                          }}
                        />
                      </div>
                    )}

                    <Button
                      disabled={runningApi}
                      onClick={handleRunPlaygroundApi}
                      className="w-full bg-[#CBF825] hover:bg-[#CBF825]/90 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      {runningApi ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Executing Call (X402 Paid)...
                        </>
                      ) : (
                        <>
                          <Code size={14} /> Run API Request
                        </>
                      )}
                    </Button>

                    {apiResponse && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold" style={{ color: "var(--color-fg-secondary)" }}>API Response Payload</span>
                          {verificationDetails && (
                            <span className="font-mono text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                              Block Height: {verificationDetails.blockNumber}
                            </span>
                          )}
                        </div>
                        <pre
                          className="p-3 rounded-lg border text-[11px] font-mono overflow-auto max-h-48 scrollbar-thin"
                          style={{
                            backgroundColor: "var(--color-bg-inset)",
                            borderColor: "var(--color-bd)",
                            color: "var(--color-fg)",
                          }}
                        >
                          {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

