/**
 * Arc Work — Bridge & Swap
 * Premium creator-focused crypto UX
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, SUPPORTED_SOURCE_CHAINS } from "@/lib/web3/wallet-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2, ArrowRightLeft, ArrowDown, ArrowUpRight, Shield,
  Zap, Clock, CheckCircle2, Wallet, RefreshCcw, ChevronDown,
  Search, Star, TrendingUp, Bot, DollarSign, Info,
  AlertCircle, ExternalLink, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { arcTestnet } from "@/lib/web3/appkit-provider";
import { sepolia, baseSepolia, arbitrumSepolia } from "@reown/appkit/networks";
import { TokenSelector } from "./token-selector";
import { BridgeFlow } from "./bridge-flow";
import { TransactionStatus } from "./transaction-status";

/* ── Token definitions ─────────────────────────────────────── */

const BRIDGE_TOKENS = [
  { symbol: "USDC", name: "USD Coin", icon: "", color: "oklch(0.55 0.15 260)", decimals: 6 },
];

const SWAP_TOKENS = [
  { symbol: "USDC", name: "USD Coin", icon: "", color: "oklch(0.55 0.15 260)", decimals: 6, contract: "0x3600000000000000000000000000000000000000" as const },
  { symbol: "EURC", name: "Euro Coin", icon: "", color: "oklch(0.50 0.18 260)", decimals: 6, contract: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const },
];

const CREATOR_ACTIONS = [
  { label: "Top up creator wallet", icon: Wallet, desc: "Fund your account" },
  { label: "Pay a freelancer", icon: TrendingUp, desc: "Send USDC directly" },
  { label: "Fund AI agent", icon: Bot, desc: "Deposit for agent work" },
  { label: "Convert earnings", icon: DollarSign, desc: "Swap to your preferred token" },
];

const BRIDGE_ESTIMATES: Record<string, { time: string; fee: string }> = {
  "11155111": { time: "< 1 sec", fee: "~0.00 USDC" },
  "84532": { time: "< 1 sec", fee: "~0.00 USDC" },
  "421614": { time: "< 1 sec", fee: "~0.00 USDC" },
};

/* ── Component ─────────────────────────────────────────────── */

export default function BridgePage() {
  const { address, chainId, isConnected, connect } = useWallet();
  const { walletProvider } = useAppKitProvider("eip155");
  const { switchNetwork } = useAppKitNetwork();

  /* Bridge state */
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_SOURCE_CHAINS[0]);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [bridgeTxHash, setBridgeTxHash] = useState<string | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<"idle" | "pending" | "confirming" | "completed" | "failed">("idle");

  /* Swap state */
  const [swapAmount, setSwapAmount] = useState("");
  const [swapTokenIn, setSwapTokenIn] = useState(SWAP_TOKENS[0]);
  const [swapTokenOut, setSwapTokenOut] = useState(SWAP_TOKENS[1]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [swapStatus, setSwapStatus] = useState<"idle" | "pending" | "confirming" | "completed" | "failed">("idle");
  const [swapQuote, setSwapQuote] = useState<number | null>(null);

  /* Ramp state */
  const [rampMode, setRampMode] = useState<"buy" | "sell">("buy");
  const [rampAmount, setRampAmount] = useState("");
  const [rampLoading, setRampLoading] = useState(false);
  const [rampTxHash, setRampTxHash] = useState<string | null>(null);
  const [rampStatus, setRampStatus] = useState<"idle" | "pending" | "completed" | "failed">("idle");
  const [rampCardInfo, setRampCardInfo] = useState({ number: "", expiry: "", cvc: "" });
  const [rampBankInfo, setRampBankInfo] = useState({ account: "", routing: "" });

  /* Fetch swap quote */
  useEffect(() => {
    const numAmount = parseFloat(swapAmount);
    if (!numAmount || numAmount <= 0 || swapTokenIn.symbol === swapTokenOut.symbol) {
      setSwapQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenIn: swapTokenIn.symbol,
            tokenOut: swapTokenOut.symbol,
            amountIn: numAmount.toString(),
            fromAddress: address || "0x0000000000000000000000000000000000000000",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.quote?.estimatedAmount) {
          setSwapQuote(parseFloat(data.quote.estimatedAmount));
        }
      } catch {
        setSwapQuote(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [swapAmount, swapTokenIn, swapTokenOut, address]);

  /* Bridge handler */
  const handleBridge = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    const numAmount = parseFloat(bridgeAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (chainId !== selectedChain.id) {
      try {
        const targetNet = [sepolia, baseSepolia, arbitrumSepolia].find(n => n.id === selectedChain.id);
        if (targetNet && switchNetwork) {
          await switchNetwork(targetNet);
          return;
        }
      } catch {
        toast.error(`Switch your wallet to ${selectedChain.name}`);
        return;
      }
      toast.error(`Switch your wallet to ${selectedChain.name}`);
      return;
    }

    setBridgeLoading(true);
    setBridgeTxHash(null);
    setBridgeStatus("pending");

    try {
      if (!walletProvider) throw new Error("Wallet provider not found");

      const adapter = await createViemAdapterFromProvider({ provider: walletProvider as any });
      const kit = new AppKit();

      const result = await kit.bridge({
        from: { adapter, chain: selectedChain.arcName as any },
        to: { adapter, chain: "Arc_Testnet" },
        amount: numAmount.toString(),
      });

      const burnStep = result.steps?.find((s: any) => s.name === "burn" || s.txHash);
      if (burnStep?.txHash) {
        setBridgeTxHash(burnStep.txHash);
        setBridgeStatus("confirming");
      }

      setBridgeStatus("completed");
      toast.success(`${numAmount} USDC bridged to Arc!`);
    } catch (err: any) {
      setBridgeStatus("failed");
      toast.error(err.message || "Bridge failed");
    } finally {
      setBridgeLoading(false);
    }
  };

  /* Swap handler */
  const handleSwap = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    const numAmount = parseFloat(swapAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (chainId !== 5042002) {
      try {
        if (switchNetwork) await switchNetwork(arcTestnet);
        return;
      } catch {
        toast.error("Switch your wallet to Arc Testnet");
        return;
      }
    }

    setSwapLoading(true);
    setSwapTxHash(null);
    setSwapStatus("pending");

    try {
      if (!walletProvider) throw new Error("Wallet provider not found");

      const swapRes = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenIn: swapTokenIn.symbol,
          tokenOut: swapTokenOut.symbol,
          amountIn: numAmount.toString(),
          fromAddress: address,
        }),
      });

      const swapData = await swapRes.json().catch(() => ({}));
      if (!swapRes.ok) throw new Error(swapData?.message || `Swap API error: ${swapRes.status}`);
      if (!swapData?.transaction?.executionParams?.instructions) {
        throw new Error(swapData?.message || "No transaction data returned");
      }

      const { instructions, gasLimit } = swapData.transaction.executionParams;
      const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

      const encodeApprove = (spender: string, amount: string) => {
        const spenderHex = spender.replace("0x", "").padStart(64, "0");
        const amountHex = BigInt(amount).toString(16).padStart(64, "0");
        return `0x095ea7b3${spenderHex}${amountHex}`;
      };

      let lastTxHash: string | null = null;
      setSwapStatus("confirming");

      for (const instruction of instructions) {
        const { target, data, value, tokenIn, amountToApprove } = instruction;
        if (amountToApprove && BigInt(amountToApprove) > 0n && tokenIn && tokenIn !== ZERO_ADDR) {
          await (walletProvider as any).request({
            method: "eth_sendTransaction",
            params: [{ from: address, to: tokenIn, data: encodeApprove(target, amountToApprove) }],
          });
        }
        lastTxHash = await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{ from: address, to: target, data, value: value || "0x0", gas: gasLimit }],
        });
      }

      if (lastTxHash) {
        setSwapTxHash(lastTxHash);
        setSwapStatus("completed");
        toast.success(`Swapped ${numAmount} ${swapTokenIn.symbol} to ${swapTokenOut.symbol}`);
        window.open(`https://testnet.arcscan.app/tx/${lastTxHash}`, "_blank");
      }
    } catch (err: any) {
      setSwapStatus("failed");
      toast.error(err.message || "Swap failed");
    } finally {
      setSwapLoading(false);
    }
  };

  /* Ramp handler */
  const handleRamp = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    const numAmount = parseFloat(rampAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setRampLoading(true);
    setRampStatus("pending");
    setRampTxHash(null);

    try {
      if (rampMode === "buy") {
        // Mock Buy: Simulate credit card processing
        if (!rampCardInfo.number || !rampCardInfo.expiry || !rampCardInfo.cvc) {
          throw new Error("Please fill out all card details");
        }
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        setRampStatus("completed");
        toast.success(`Successfully bought ${numAmount} USDC. Testnet tokens will arrive shortly.`);
      } else {
        // Mock Sell: Send USDC to dummy platform address via MetaMask
        if (!rampBankInfo.account || !rampBankInfo.routing) {
          throw new Error("Please fill out bank account details");
        }
        if (chainId !== 5042002) {
          throw new Error("Switch to Arc Testnet to sell");
        }

        const USDC_CONTRACT = "0x3600000000000000000000000000000000000000";
        const MOCK_PLATFORM_ADDRESS = "0x000000000000000000000000000000000000dEaD";

        // encode transfer(address, uint256)
        const methodId = "0xa9059cbb";
        const targetHex = MOCK_PLATFORM_ADDRESS.replace("0x", "").padStart(64, "0");
        const amountHex = BigInt(Math.floor(numAmount * 1_000_000)).toString(16).padStart(64, "0");
        const data = `${methodId}${targetHex}${amountHex}`;

        const txHash = await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{ from: address, to: USDC_CONTRACT, data }],
        });

        setRampTxHash(txHash);
        setRampStatus("completed");
        toast.success(`USDC sent! Fiat withdrawal to bank initiated.`);
      }
    } catch (err: any) {
      setRampStatus("failed");
      toast.error(err.message || "Ramp transaction failed");
    } finally {
      setRampLoading(false);
    }
  };

  const isOnArc = chainId === 5042002;
  const isOnSourceChain = SUPPORTED_SOURCE_CHAINS.some(c => c.id === chainId);
  const estimate = BRIDGE_ESTIMATES[String(selectedChain.id)] || { time: "< 1 sec", fee: "~0.00 USDC" };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
          Bridge & Swap
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Move funds between chains or swap tokens on Arc
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ── LEFT: Main module ─────────────────────────── */}
        <Tabs defaultValue="bridge" className="space-y-0">
          <TabsList
            className="w-full mb-4 p-1"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <TabsTrigger value="ramp" className="flex-1 data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <DollarSign className="mr-2 h-4 w-4" />
              Buy Crypto
            </TabsTrigger>
            <TabsTrigger value="bridge" className="flex-1 data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <ArrowDown className="mr-2 h-4 w-4" />
              Bridge
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex-1 data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Swap
            </TabsTrigger>
          </TabsList>

          {/* ── Bridge Tab ──────────────────────────────── */}
          <TabsContent value="bridge" className="mt-0">
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              {/* Wallet connection */}
              {!isConnected ? (
                <div className="p-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-soft)" }}
                  >
                    <Wallet className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-fg)" }}>
                    Connect your wallet
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-fg-secondary)" }}>
                    Link your wallet to bridge USDC to Arc
                  </p>
                  <Button onClick={connect} style={{ backgroundColor: "var(--color-accent)" }}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connected header */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ borderBottom: "1px solid var(--color-bd)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                      style={{
                        backgroundColor: isOnSourceChain ? "oklch(0.60 0.15 150 / 0.12)" : "oklch(0.65 0.14 80 / 0.12)",
                        color: isOnSourceChain ? "oklch(0.60 0.15 150)" : "oklch(0.65 0.14 80)",
                      }}
                    >
                      {SUPPORTED_SOURCE_CHAINS.find(c => c.id === chainId)?.name || `Chain ${chainId}`}
                    </Badge>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* From: Source chain */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: "var(--color-fg-secondary)" }}>
                        From
                      </label>
                      <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg"></span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>USDC</p>
                              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>USD Coin</p>
                            </div>
                          </div>
                          <select
                            className="text-xs rounded-md px-2 py-1 border"
                            style={{
                              backgroundColor: "var(--color-bg-elevated)",
                              borderColor: "var(--color-bd)",
                              color: "var(--color-fg)",
                            }}
                            value={selectedChain.id}
                            onChange={e => {
                              const chain = SUPPORTED_SOURCE_CHAINS.find(c => c.id === parseInt(e.target.value));
                              if (chain) setSelectedChain(chain);
                            }}
                          >
                            {SUPPORTED_SOURCE_CHAINS.map(chain => (
                              <option key={chain.id} value={chain.id}>{chain.name}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={bridgeAmount}
                          onChange={e => setBridgeAmount(e.target.value)}
                          className="text-2xl font-semibold bg-transparent border-0 px-0 h-auto pt-1"
                          style={{ color: "var(--color-fg)" }}
                        />
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
                      >
                        <ArrowDown className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                      </div>
                    </div>

                    {/* To: Arc */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: "var(--color-fg-secondary)" }}>
                        To
                      </label>
                      <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg"></span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>USDC</p>
                              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Arc Testnet</p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                            style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                          >
                            Arc
                          </Badge>
                        </div>
                        <p className="text-2xl font-semibold" style={{ color: bridgeAmount ? "var(--color-fg)" : "var(--color-fg-muted)" }}>
                          {bridgeAmount || "0.00"}
                        </p>
                      </div>
                    </div>

                    {/* Bridge button */}
                    <Button
                      onClick={handleBridge}
                      disabled={bridgeLoading || !bridgeAmount}
                      className="w-full"
                      style={{ backgroundColor: "var(--color-accent)", minHeight: "44px" }}
                    >
                      {bridgeLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bridging...</>
                      ) : chainId !== selectedChain.id ? (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Switch to {selectedChain.name}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Bridge to Arc
                        </>
                      )}
                    </Button>

                    {/* Transaction status */}
                    <TransactionStatus
                      status={bridgeStatus}
                      txHash={bridgeTxHash}
                      explorerUrl={bridgeTxHash ? `https://testnet.arcscan.app/tx/${bridgeTxHash}` : undefined}
                    />

                    <p className="text-xs text-center" style={{ color: "var(--color-fg-muted)" }}>
                      Powered by Circle CCTP — USDC arrives in under 1 second
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ── Swap Tab ────────────────────────────────── */}
          <TabsContent value="swap" className="mt-0">
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              {!isConnected ? (
                <div className="p-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-soft)" }}
                  >
                    <RefreshCcw className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-fg)" }}>
                    Connect your wallet
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-fg-secondary)" }}>
                    Link your wallet to swap tokens on Arc
                  </p>
                  <Button onClick={connect} style={{ backgroundColor: "var(--color-accent)" }}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ borderBottom: "1px solid var(--color-bd)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                      style={{
                        backgroundColor: isOnArc ? "oklch(0.60 0.15 150 / 0.12)" : "oklch(0.65 0.14 80 / 0.12)",
                        color: isOnArc ? "oklch(0.60 0.15 150)" : "oklch(0.65 0.14 80)",
                      }}
                    >
                      {isOnArc ? "Arc Testnet" : `Chain ${chainId}`}
                    </Badge>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* From token */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: "var(--color-fg-secondary)" }}>
                        You pay
                      </label>
                      <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <TokenSelector
                            tokens={SWAP_TOKENS}
                            selected={swapTokenIn}
                            onSelect={setSwapTokenIn}
                            label="From"
                          />
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={swapAmount}
                          onChange={e => setSwapAmount(e.target.value)}
                          className="text-2xl font-semibold bg-transparent border-0 px-0 h-auto pt-1"
                          style={{ color: "var(--color-fg)" }}
                        />
                      </div>
                    </div>

                    {/* Swap arrow */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setSwapTokenIn(swapTokenOut);
                          setSwapTokenOut(swapTokenIn);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                        style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
                      >
                        <ArrowDown className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                      </button>
                    </div>

                    {/* To token */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: "var(--color-fg-secondary)" }}>
                        You receive
                      </label>
                      <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <TokenSelector
                            tokens={SWAP_TOKENS}
                            selected={swapTokenOut}
                            onSelect={setSwapTokenOut}
                            label="To"
                          />
                        </div>
                        <p className="text-2xl font-semibold" style={{ color: swapQuote ? "var(--color-fg)" : "var(--color-fg-muted)" }}>
                          {swapQuote ? swapQuote.toFixed(2) : "0.00"}
                        </p>
                      </div>
                    </div>

                    {/* Rate display */}
                    {swapQuote && parseFloat(swapAmount) > 0 && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span style={{ color: "var(--color-fg-muted)" }}>Rate</span>
                        <span className="font-mono" style={{ color: "var(--color-fg-secondary)" }}>
                          1 {swapTokenIn.symbol} ≈ {(swapQuote / parseFloat(swapAmount)).toFixed(4)} {swapTokenOut.symbol}
                        </span>
                      </div>
                    )}

                    {/* Swap button */}
                    <Button
                      onClick={handleSwap}
                      disabled={swapLoading || !swapAmount || swapTokenIn.symbol === swapTokenOut.symbol}
                      className="w-full"
                      style={{ backgroundColor: "var(--color-accent)", minHeight: "44px" }}
                    >
                      {swapLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Swapping...</>
                      ) : !isOnArc ? (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Switch to Arc Testnet
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Swap
                        </>
                      )}
                    </Button>

                    {/* Transaction status */}
                    <TransactionStatus
                      status={swapStatus}
                      txHash={swapTxHash}
                      explorerUrl={swapTxHash ? `https://testnet.arcscan.app/tx/${swapTxHash}` : undefined}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ── Ramp Tab ────────────────────────────────── */}
          <TabsContent value="ramp" className="mt-0">
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
            >
              {!isConnected ? (
                <div className="p-12 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-soft)" }}
                  >
                    <Wallet className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-fg)" }}>
                    Connect Wallet
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--color-fg-secondary)" }}>
                    Connect your wallet to buy crypto directly.
                  </p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/10 w-full mb-6">
                    <button
                      onClick={() => setRampMode("buy")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${rampMode === "buy" ? "bg-[var(--color-accent)] text-white shadow-sm" : "text-white/60 hover:text-white"
                        }`}
                    >
                      Buy USDC
                    </button>
                    <button
                      onClick={() => setRampMode("sell")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${rampMode === "sell" ? "bg-[var(--color-accent)] text-white shadow-sm" : "text-white/60 hover:text-white"
                        }`}
                    >
                      Sell USDC
                    </button>
                  </div>

                  {rampMode === "buy" ? (
                    <>
                      {/* BUY UI */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-white/60">Amount to Buy (USD)</label>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                          <Input
                            type="number"
                            placeholder="100.00"
                            value={rampAmount}
                            onChange={(e) => setRampAmount(e.target.value)}
                            className="text-2xl font-semibold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 text-white w-full"
                          />
                          <Badge variant="outline" className="bg-zinc-800 border-white/10 text-white ml-2 shrink-0 h-8">
                            🇺🇸 USD
                          </Badge>
                        </div>
                        {rampAmount && parseFloat(rampAmount) > 0 && (
                          <p className="text-xs text-white/60 mt-2 text-right">
                            ≈ {parseFloat(rampAmount).toFixed(2)} USDC
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-medium block text-white/60">Simulated Payment Details</label>
                        <Input
                          placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                          value={rampCardInfo.number}
                          onChange={(e) => setRampCardInfo({ ...rampCardInfo, number: e.target.value })}
                          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/30"
                        />
                        <div className="flex gap-3">
                          <Input
                            placeholder="MM/YY"
                            value={rampCardInfo.expiry}
                            onChange={(e) => setRampCardInfo({ ...rampCardInfo, expiry: e.target.value })}
                            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/30"
                          />
                          <Input
                            placeholder="CVC"
                            value={rampCardInfo.cvc}
                            onChange={(e) => setRampCardInfo({ ...rampCardInfo, cvc: e.target.value })}
                            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/30"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* SELL UI */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-white/60">Amount to Sell (USDC)</label>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                          <Input
                            type="number"
                            placeholder="100.00"
                            value={rampAmount}
                            onChange={(e) => setRampAmount(e.target.value)}
                            className="text-2xl font-semibold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 text-white w-full"
                          />
                          <Badge variant="outline" className="bg-zinc-800 border-white/10 text-white ml-2 shrink-0 h-8 flex items-center">
                            <span className="mr-1"></span> USDC
                          </Badge>
                        </div>
                        {rampAmount && parseFloat(rampAmount) > 0 && (
                          <p className="text-xs text-white/60 mt-2 text-right">
                            ≈ ${parseFloat(rampAmount).toFixed(2)} USD to Bank
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-medium block text-white/60">Destination Bank Account</label>
                        <Input
                          placeholder="Account Number"
                          value={rampBankInfo.account}
                          onChange={(e) => setRampBankInfo({ ...rampBankInfo, account: e.target.value })}
                          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/30"
                        />
                        <Input
                          placeholder="Routing Number / Sort Code"
                          value={rampBankInfo.routing}
                          onChange={(e) => setRampBankInfo({ ...rampBankInfo, routing: e.target.value })}
                          className="bg-zinc-900/50 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleRamp}
                    disabled={rampLoading || !rampAmount}
                    className="w-full mt-4"
                    style={{ backgroundColor: "var(--color-accent)", minHeight: "44px" }}
                  >
                    {rampLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : rampMode === "buy" ? (
                      <><Shield className="mr-2 h-4 w-4" /> Pay Securely</>
                    ) : (
                      <><ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw to Bank</>
                    )}
                  </Button>

                  <TransactionStatus
                    status={rampStatus}
                    txHash={rampTxHash}
                    explorerUrl={rampTxHash ? `https://testnet.arcscan.app/tx/${rampTxHash}` : undefined}
                  />

                  <p className="text-xs text-center mt-2 text-white/40">
                    {rampMode === "buy"
                      ? "This is a Testnet integration. Dummy card details will simulate a fiat purchase."
                      : "Selling USDC requires a real MetaMask transaction. Tokens will be sent to a mock address."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── RIGHT: Contextual panel ───────────────────── */}
        <div className="space-y-3">
          {/* Bridge info (shown on bridge tab) */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
              Transfer details
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--color-fg-secondary)" }}>Source</span>
                <span className="font-medium" style={{ color: "var(--color-fg)" }}>{selectedChain.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--color-fg-secondary)" }}>Destination</span>
                <span className="font-medium" style={{ color: "var(--color-fg)" }}>Arc Testnet</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--color-fg-secondary)" }}>Est. arrival</span>
                <span className="font-medium flex items-center gap-1" style={{ color: "oklch(0.60 0.15 150)" }}>
                  <Zap className="h-3 w-3" />
                  {estimate.time}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--color-fg-secondary)" }}>Network fee</span>
                <span className="font-medium" style={{ color: "var(--color-fg)" }}>{estimate.fee}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--color-fg-secondary)" }}>Protocol</span>
                <span className="font-medium" style={{ color: "var(--color-fg)" }}>Circle CCTP</span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" style={{ color: "oklch(0.60 0.15 150)" }} />
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
                Security
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3" style={{ color: "oklch(0.60 0.15 150)" }} />
                <span style={{ color: "var(--color-fg-secondary)" }}>Deterministic finality</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3" style={{ color: "oklch(0.60 0.15 150)" }} />
                <span style={{ color: "var(--color-fg-secondary)" }}>No re-org risk</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3" style={{ color: "oklch(0.60 0.15 150)" }} />
                <span style={{ color: "var(--color-fg-secondary)" }}>Circle-verified bridges</span>
              </div>
            </div>
          </div>

          {/* Creator quick actions */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
              Creator actions
            </h4>
            <div className="space-y-1.5">
              {CREATOR_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-150"
                    style={{ color: "var(--color-fg-secondary)" }}
                    onClick={() => toast.info(`${action.label} — coming soon`)}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "var(--color-accent-soft)" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>{action.label}</p>
                      <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{action.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
