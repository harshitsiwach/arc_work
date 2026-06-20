"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Globe, Zap, CheckCircle, ChevronDown, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitNetwork } from "@reown/appkit/react";
import { getPublicClient, getWalletClient } from "@/lib/contracts/instance";
import { X402_VALIDATOR_ABI } from "@/lib/contracts/x402-validator-data";
import { usdc } from "@/lib/contracts/usdc";
import { arcTestnet, base } from "@/lib/web3/appkit-provider";
import { EndpointAccordion } from "@/components/marketplace/endpoint-accordion";

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

interface ServiceDetailViewProps {
  serviceId: string;
}

function ServiceLogo({ service }: { service: ToolService }) {
  const [failed, setFailed] = useState(false);
  const domain = service.domain || `${service.name.toLowerCase().replace(/\s+/g, "")}.com`;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  if (!failed) {
    return (
      <img
        src={faviconUrl}
        alt=""
        className="w-12 h-12 rounded-xl flex-shrink-0 object-contain"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white/50 flex-shrink-0">
      {service.name.charAt(0).toUpperCase()}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-medium text-white/60">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-white/20 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-xs text-white/40 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "How does payment work?", a: "Payments are processed via USDC on-chain. Select an endpoint, authorize the micropayment through your connected wallet, and the network processes the transaction in seconds." },
  { q: "What chains are supported?", a: "Services may be available on Arc Testnet or Base Mainnet. The required network is displayed per service and your wallet will be prompted to switch if needed." },
  { q: "Can I test before paying?", a: "Each endpoint shows its pricing upfront before any payment is required. Payment is only processed when you explicitly authorize it." },
  { q: "How are API responses delivered?", a: "After payment is confirmed, you can submit your prompt or parameters and receive the response directly in the interface." },
];

export function ServiceDetailView({ serviceId }: ServiceDetailViewProps) {
  const router = useRouter();
  const { isConnected, connect, address, chainId } = useWallet();
  const { switchNetwork } = useAppKitNetwork();

  const [service, setService] = useState<ToolService | null>(null);
  const [loading, setLoading] = useState(true);
  const [validatorAddress, setValidatorAddress] = useState<string>("0xb0c7709a4ccc69899d922048792fcba240a9afcb");

  const [payingEndpoint, setPayingEndpoint] = useState<string | null>(null);
  const [paymentTxHashes, setPaymentTxHashes] = useState<Record<string, string>>({});
  const [paymentVerifiedEndpoints, setPaymentVerifiedEndpoints] = useState<Set<string>>(new Set());
  const [playgroundInputs, setPlaygroundInputs] = useState<Record<string, string>>({});
  const [runningApis, setRunningApis] = useState<Record<string, boolean>>({});
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [sidebarEndpointUrl, setSidebarEndpointUrl] = useState("");

  useEffect(() => {
    const isBase = !!(
      service?.networks?.includes("Base") ||
      service?.endpoints?.some((ep: any) => 
        ep.network?.includes("Base") || 
        ep.network?.includes("8453") || 
        ep.url?.includes("paysponge.com")
      )
    );
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
  }, [service]);

  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.services || []).find(
          (s: ToolService) => s.id === serviceId || s.name.toLowerCase() === serviceId.toLowerCase()
        );
        if (found) setService(found);
        else toast.error("Service not found");
      })
      .catch(() => toast.error("Failed to load service"))
      .finally(() => setLoading(false));
  }, [serviceId]);

  useEffect(() => {
    if (service && !sidebarEndpointUrl && service.endpoints?.length > 0) {
      setSidebarEndpointUrl(service.endpoints[0].url);
    }
  }, [service, sidebarEndpointUrl]);

  const isBaseService = !!(
    service?.networks?.includes("Base") ||
    service?.endpoints?.some((ep: any) => 
      ep.network?.includes("Base") || 
      ep.network?.includes("8453") || 
      ep.url?.includes("paysponge.com")
    )
  );
  const targetChainId = isBaseService ? 8453 : 5042002;

  const handlePayForEndpoint = async (endpointUrl: string) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }
    if (!service) return;

    const endpoint = service.endpoints?.find((ep) => ep.url === endpointUrl);
    if (!endpoint) return;

    setPayingEndpoint(endpointUrl);
    try {
      const targetChain = isBaseService ? base : arcTestnet;
      const walletClient = getWalletClient(targetChain);
      if (!walletClient) throw new Error("Wallet provider not found.");

      const priceVal = parseFloat(endpoint.price || service.price_amount) || 0.001;
      const priceWithMarkup = isBaseService ? priceVal * 1.10 : priceVal;
      const usdcUnits = BigInt(Math.round(priceWithMarkup * 1_000_000));

      if (isBaseService) {
        const baseUsdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
        
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
          args: [service.name, usdcUnits],
          account: address as `0x${string}`,
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await getPublicClient(base).waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === "success") {
          toast.success("Payment confirmed on Base Mainnet!");
          setPaymentTxHashes((prev) => ({ ...prev, [endpointUrl]: txHash }));
          setPaymentVerifiedEndpoints((prev) => new Set(prev).add(endpointUrl));
        } else {
          throw new Error("Payment transaction failed on Base Mainnet.");
        }
      } else {
        toast.info("Checking USDC allowance...");
        const approveTx = await usdc.approveIfNeeded(validatorAddress as `0x${string}`, usdcUnits);
        if (approveTx) {
          toast.info("USDC approval requested...");
          const publicClient = getPublicClient(arcTestnet);
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
          toast.success("USDC approved successfully.");
        }

        toast.info("Signing payment transaction...");
        const { request } = await getPublicClient(arcTestnet).simulateContract({
          address: validatorAddress as `0x${string}`,
          abi: X402_VALIDATOR_ABI,
          functionName: "payForService",
          args: [service.name, usdcUnits],
          account: address as `0x${string}`,
        });

        const txHash = await walletClient.writeContract(request);
        const receipt = await getPublicClient(arcTestnet).waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === "success") {
          toast.success("Payment confirmed on-chain!");
          setPaymentTxHashes((prev) => ({ ...prev, [endpointUrl]: txHash }));
          setPaymentVerifiedEndpoints((prev) => new Set(prev).add(endpointUrl));
        } else {
          throw new Error("Payment transaction failed on-chain.");
        }
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Payment transaction failed");
    } finally {
      setPayingEndpoint(null);
    }
  };

  const handleRunApi = async (endpointUrl: string) => {
    const txHash = paymentTxHashes[endpointUrl];
    if (!txHash || !service) return;

    setRunningApis((prev) => ({ ...prev, [endpointUrl]: true }));
    try {
      const endpoint = service.endpoints?.find((ep) => ep.url === endpointUrl);
      const priceVal = parseFloat(endpoint?.price || service.price_amount) || 0.001;
      const res = await fetch("/api/tools/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          serviceId: service.name,
          amount: priceVal,
          validatorAddress,
          endpointUrl,
          endpointMethod: endpoint?.method || "GET",
          endpointParams: {},
          network: service?.networks?.[0] || "",
          inputPayload: playgroundInputs[endpointUrl] || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API call failed");

      setApiResponses((prev) => ({ ...prev, [endpointUrl]: data.apiResponse }));
      toast.success("API response received!");
    } catch (error: any) {
      console.error("API call failed:", error);
      toast.error(error.message || "API execution failed");
    } finally {
      setRunningApis((prev) => ({ ...prev, [endpointUrl]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-white/40 text-sm">Service not found</p>
        <Button onClick={() => router.push("/marketplace/agents")} variant="outline" className="border-white/10 text-white/60">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const price = parseFloat(service.price_amount) || 0.001;
  const network = service.networks?.[0] || "Arc Testnet";

  const sidebarEndpoint = service.endpoints?.find((ep) => ep.url === sidebarEndpointUrl);
  const sidebarIsPaid = sidebarEndpointUrl ? paymentVerifiedEndpoints.has(sidebarEndpointUrl) : false;
  const sidebarTxHash = sidebarEndpointUrl ? (paymentTxHashes[sidebarEndpointUrl] || "") : "";
  const isSidebarPaying = sidebarEndpointUrl === payingEndpoint;
  const isSidebarRunning = sidebarEndpointUrl ? !!runningApis[sidebarEndpointUrl] : false;
  const sidebarInput = sidebarEndpointUrl ? (playgroundInputs[sidebarEndpointUrl] || "") : "";
  const sidebarResponse = sidebarEndpointUrl ? apiResponses[sidebarEndpointUrl] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={() => router.push("/marketplace/agents")}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Marketplace
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Main Content (70%) */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-black to-[#0d1208] p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.04] to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-lime-400/[0.03] blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <ServiceLogo service={service} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-white/90">{service.name}</h1>
                {service.domain && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Globe className="h-3 w-3 text-white/30" />
                    <span className="text-xs text-white/40 font-mono">{service.domain}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 text-[10px] font-medium">{service.category}</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 text-[10px]">{network}</Badge>
                  <span className="text-xs text-lime-400/80 font-medium">
                    {price < 0.01 ? `$${price.toFixed(4)}` : `$${price.toFixed(2)}`} / request
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Overview */}
          <div>
            <h2 className="text-sm font-semibold text-white/70 mb-3">Service Overview</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Category", value: service.category },
              { label: "Network", value: network },
              { label: "Endpoints", value: String(service.endpoints?.length || 0) },
              { label: "Pricing", value: "Per Request" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl border border-white/5 bg-[#090909] space-y-2">
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-sm text-white/70 font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Endpoints */}
          <div>
            <h2 className="text-sm font-semibold text-white/70 mb-4">Endpoints</h2>
            <div className="space-y-2">
              {service.endpoints?.map((ep) => (
                <EndpointAccordion
                  key={ep.url}
                  endpoint={ep}
                  isPaid={paymentVerifiedEndpoints.has(ep.url)}
                  isPaying={payingEndpoint === ep.url}
                  paymentTxHash={paymentTxHashes[ep.url] || ""}
                  isConnected={isConnected}
                  chainId={chainId}
                  targetChainId={targetChainId}
                  validatorAddress={validatorAddress}
                  isBaseService={isBaseService}
                  onSelect={() => {}}
                  onPay={() => handlePayForEndpoint(ep.url)}
                  onConnect={connect}
                  onSwitchChain={() => switchNetwork && switchNetwork(isBaseService ? base : arcTestnet)}
                  playgroundInput={playgroundInputs[ep.url] || ""}
                  onPlaygroundInputChange={(val) => setPlaygroundInputs((prev) => ({ ...prev, [ep.url]: val }))}
                  runningApi={!!runningApis[ep.url]}
                  apiResponse={apiResponses[ep.url]}
                  onRunApi={() => handleRunApi(ep.url)}
                />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-sm font-semibold text-white/70 mb-4">FAQ</h2>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Sidebar (30%) */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
          <div className="lg:sticky lg:top-[72px] space-y-6">
            {/* Quick Access */}
            <div className="rounded-2xl border border-white/5 bg-[#090909] p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Service Quick Access</h3>
              <div className="space-y-3">
                {[
                  { label: "Provider", value: service.name },
                  { label: "Category", value: service.category },
                  { label: "Network", value: network },
                  { label: "Total Endpoints", value: String(service.endpoints?.length || 0) },
                  { label: "Pricing", value: price < 0.01 ? `$${price.toFixed(4)} USDC` : `$${price.toFixed(2)} USDC` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/30">{item.label}</span>
                    <span className="text-[11px] text-white/60 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Make A Call */}
            <div className="rounded-2xl border border-white/5 bg-[#090909] p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Make A Call</h3>

              {/* Endpoint Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/30 font-medium">Endpoint</label>
                <select
                  value={sidebarEndpointUrl}
                  onChange={(e) => {
                    setSidebarEndpointUrl(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-xs text-white/70 appearance-none cursor-pointer focus:outline-none focus:border-lime-400/30 transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  {service.endpoints?.map((ep) => (
                    <option key={ep.url} value={ep.url}>
                      {ep.description || ep.url.split("/").pop()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/30 font-medium">Prompt</label>
                <textarea
                  value={sidebarInput}
                  onChange={(e) => sidebarEndpointUrl && setPlaygroundInputs((prev) => ({ ...prev, [sidebarEndpointUrl!]: e.target.value }))}
                  placeholder="Describe what you want this endpoint to do..."
                  className="w-full h-24 p-3 rounded-xl border border-white/10 bg-black/30 text-xs text-white/60 placeholder:text-white/20 resize-none focus:outline-none focus:border-lime-400/30 transition-colors"
                />
              </div>

              {/* Payment / Auth Status */}
              {sidebarEndpoint && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-black/30">
                  {sidebarIsPaid ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-lime-400 flex-shrink-0" />
                      <span className="text-xs text-lime-400/70 font-medium">Authorized</span>
                      <code className="ml-auto text-[9px] font-mono text-lime-400/40 truncate max-w-[120px]">
                        Tx: {sidebarTxHash.slice(0, 8)}...
                      </code>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-amber-400/60 flex-shrink-0" />
                      <span className="text-xs text-amber-400/60 font-medium">Authorization Required</span>
                    </>
                  )}
                </div>
              )}

              {/* Action Button */}
              {sidebarEndpoint && (
                <>
                  {!sidebarIsPaid ? (
                    !isConnected ? (
                      <Button onClick={connect} className="w-full bg-lime-400 hover:bg-lime-400/90 text-black font-semibold text-xs h-10 rounded-xl">
                        Connect Wallet
                      </Button>
                    ) : chainId !== targetChainId ? (
                      <Button onClick={() => switchNetwork && switchNetwork(isBaseService ? base : arcTestnet)} className="w-full bg-lime-400 hover:bg-lime-400/90 text-black font-semibold text-xs h-10 rounded-xl">
                        Switch to {isBaseService ? "Base" : "Arc Testnet"}
                      </Button>
                    ) : (
                      <Button
                        disabled={isSidebarPaying || (!isBaseService && !validatorAddress)}
                        onClick={() => sidebarEndpointUrl && handlePayForEndpoint(sidebarEndpointUrl)}
                        className="w-full bg-lime-400 hover:bg-lime-400/90 text-black font-semibold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                      >
                        {isSidebarPaying ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Authorizing...</>
                        ) : (
                          <><Zap className="h-3.5 w-3.5" /> Authorize Payment</>
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      disabled={isSidebarRunning}
                      onClick={() => sidebarEndpointUrl && handleRunApi(sidebarEndpointUrl)}
                      className="w-full bg-lime-400 hover:bg-lime-400/90 text-black font-semibold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isSidebarRunning ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing...</>
                      ) : (
                        <><Code className="h-3.5 w-3.5" /> Execute Request</>
                      )}
                    </Button>
                  )}
                </>
              )}

              {/* Response */}
              <AnimatePresence>
                {sidebarResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-2"
                  >
                    <p className="text-[11px] font-medium text-white/40">Response</p>
                    <pre className="p-3 rounded-2xl bg-black/60 border border-white/5 text-[11px] font-mono text-white/50 overflow-auto max-h-48">
                      {JSON.stringify(sidebarResponse, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
