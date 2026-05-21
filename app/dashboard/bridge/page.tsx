/**
 * Arc Work - Bridge USDC to Arc
 * Real wallet connection + App Kit bridge via CCTP
 */
"use client";

import { useState } from "react";
import { useWallet, SUPPORTED_SOURCE_CHAINS } from "@/lib/web3/wallet-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRightLeft, ExternalLink, Wallet, CheckCircle2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { arcTestnet } from "@/lib/web3/appkit-provider";
import { sepolia, baseSepolia, arbitrumSepolia } from "@reown/appkit/networks";

export default function BridgePage() {
  const { address, chainId, isConnected, connect } = useWallet();
  const { walletProvider } = useAppKitProvider("eip155");
  const { switchNetwork } = useAppKitNetwork();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_SOURCE_CHAINS[0]);
  const [txHash, setTxHash] = useState<string | null>(null);

  const rawKitKey = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY || "";
  const formattedKitKey = rawKitKey.startsWith("KIT_KEY:") || !rawKitKey ? rawKitKey : `KIT_KEY:${rawKitKey}`;

  // Swap State
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapTokenIn, setSwapTokenIn] = useState("USDC");
  const [swapTokenOut, setSwapTokenOut] = useState("EURC");
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  const handleBridge = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    // If on wrong chain, try to switch automatically
    if (chainId !== selectedChain.id) {
      if (switchNetwork) {
        try {
          const targetNet = [sepolia, baseSepolia, arbitrumSepolia].find(n => n.id === selectedChain.id);
          if (targetNet) {
            await switchNetwork(targetNet);
            return; // Exit after triggering switch, user needs to click bridge again or we could proceed. Better to let them click again.
          }
        } catch (e) {
          toast.error(`Switch your wallet to ${selectedChain.name} and try again`);
          return;
        }
      }
      toast.error(`Switch your wallet to ${selectedChain.name} and try again`);
      return;
    }

    setLoading(true);
    setTxHash(null);

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
      if (burnStep && burnStep.txHash) {
        setTxHash(burnStep.txHash);
        toast.success("Bridge transaction sent!");
      } else {
        toast.success("Bridge initiated!");
      }

      const explorerUrl = (burnStep?.data as any)?.explorerUrl || (result.steps?.[0]?.data as any)?.explorerUrl;
      if (explorerUrl) {
        window.open(explorerUrl, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Bridge failed");
    } finally {
      setLoading(false);
    }
  };

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
        await switchNetwork(arcTestnet);
        return;
      } catch {
        toast.error("Switch your wallet to Arc Testnet to swap");
        return;
      }
    }

    setSwapLoading(true);
    setSwapTxHash(null);

    try {
      if (!walletProvider) throw new Error("Wallet provider not found");

      // Call Circle swap API server-side to avoid CORS restrictions.
      // The /api/swap route uses the Circle SDK internally with correct body formatting.
      const swapRes = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenIn: swapTokenIn,
          tokenOut: swapTokenOut,
          amountIn: numAmount.toString(),
          fromAddress: address,
        }),
      });

      const swapData: any = await swapRes.json().catch(() => ({}));

      if (!swapRes.ok) {
        throw new Error(swapData?.message || `Swap API error: ${swapRes.status}`);
      }

      // Circle returns a quote with transaction instructions to execute on-chain
      if (!swapData?.transaction?.executionParams?.instructions) {
        throw new Error(swapData?.message || "No transaction data returned from swap quote");
      }

      const { instructions, gasLimit } = swapData.transaction.executionParams;
      const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

      // Helper: encode ERC-20 approve(spender, amount) calldata
      const encodeApprove = (spender: string, amount: string) => {
        const spenderHex = spender.replace("0x", "").padStart(64, "0");
        const amountHex = BigInt(amount).toString(16).padStart(64, "0");
        return `0x095ea7b3${spenderHex}${amountHex}`;
      };

      let lastTxHash: string | null = null;

      // Execute each instruction via MetaMask directly — no SDK, no CORS
      for (const instruction of instructions) {
        const { target, data, value, tokenIn, amountToApprove } = instruction;

        // Step 1: Approve token spending if required
        if (amountToApprove && BigInt(amountToApprove) > 0n && tokenIn && tokenIn !== ZERO_ADDR) {
          await (walletProvider as any).request({
            method: "eth_sendTransaction",
            params: [{ from: address, to: tokenIn, data: encodeApprove(target, amountToApprove) }],
          });
        }

        // Step 2: Execute the instruction
        lastTxHash = await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{ from: address, to: target, data, value: value || "0x0", gas: gasLimit }],
        });
      }

      if (lastTxHash) {
        setSwapTxHash(lastTxHash);
        toast.success("Swap submitted!");
        window.open(`https://testnet.arcscan.app/tx/${lastTxHash}`, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Swap failed");
    } finally {
      setSwapLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-fg)" }}>Bridge</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Move USDC from other chains to Arc in under 1 second
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main bridge & swap cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Bridge card */}
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>Bridge USDC to Arc</CardTitle>
              <CardDescription style={{ color: "var(--color-fg-muted)" }}>
                Powered by Circle CCTP — deposit from any supported chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet connection status */}
              {!isConnected ? (
                <div className="p-6 text-center border border-dashed rounded-lg" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-inset)" }}>
                  <Wallet className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
                  <p className="text-sm mb-3" style={{ color: "var(--color-fg-secondary)" }}>Connect your wallet to bridge USDC</p>
                  <Button onClick={connect} style={{ backgroundColor: "var(--color-accent)" }}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connected status */}
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-success-soft)", color: "var(--color-success)" }}>
                    <CheckCircle2 className="h-4 w-4" />
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    {chainId && (
                      <span className="ml-auto text-xs" style={{ color: "var(--color-fg-muted)" }}>
                        Chain: {SUPPORTED_SOURCE_CHAINS.find(c => c.id === chainId)?.name || chainId}
                      </span>
                    )}
                  </div>

                  {/* Source chain */}
                  <div>
                    <Label style={{ color: "var(--color-fg)" }}>Source Chain</Label>
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm mt-1 focus:outline-none"
                      style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                      value={selectedChain.id}
                      onChange={e => {
                        const chain = SUPPORTED_SOURCE_CHAINS.find(c => c.id === parseInt(e.target.value));
                        if (chain) setSelectedChain(chain);
                      }}
                    >
                      {SUPPORTED_SOURCE_CHAINS.map(chain => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <Label style={{ color: "var(--color-fg)" }}>Amount (USDC)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="100"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                    />
                  </div>

                  {/* Bridge button */}
                  <Button
                    onClick={handleBridge}
                    disabled={loading || !amount}
                    className="w-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bridging...
                      </>
                    ) : chainId !== selectedChain.id ? (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Switch to {selectedChain.name}
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Bridge to Arc
                      </>
                    )}
                  </Button>

                  {/* Success */}
                  {txHash && (
                    <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-success-soft)" }}>
                      <p className="font-medium" style={{ color: "var(--color-success)" }}>Bridge transaction sent!</p>
                      <p className="text-xs mt-1 font-mono break-all" style={{ color: "var(--color-fg-muted)" }}>
                        Tx: {txHash}
                      </p>
                      <a
                        href={`https://testnet.arcscan.app`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-1 inline-block hover:underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        View on Arc Explorer →
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-center" style={{ color: "var(--color-fg-muted)" }}>
                    USDC lands on Arc in under 1 second with deterministic finality
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Swap card */}
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>Swap on Arc</CardTitle>
              <CardDescription style={{ color: "var(--color-fg-muted)" }}>
                Swap tokens natively on Arc Testnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="p-6 text-center border border-dashed rounded-lg" style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-inset)" }}>
                  <Wallet className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
                  <p className="text-sm mb-3" style={{ color: "var(--color-fg-secondary)" }}>Connect your wallet to swap</p>
                  <Button onClick={connect} style={{ backgroundColor: "var(--color-accent)" }}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label style={{ color: "var(--color-fg)" }}>From Token</Label>
                      <select
                        className="w-full rounded-lg border px-3 py-2 text-sm mt-1 focus:outline-none"
                        style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                        value={swapTokenIn}
                        onChange={e => setSwapTokenIn(e.target.value)}
                      >
                        <option value="USDC">USDC</option>
                        <option value="EURC">EURC</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const temp = swapTokenIn;
                          setSwapTokenIn(swapTokenOut);
                          setSwapTokenOut(temp);
                        }}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Label style={{ color: "var(--color-fg)" }}>To Token</Label>
                      <select
                        className="w-full rounded-lg border px-3 py-2 text-sm mt-1 focus:outline-none"
                        style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                        value={swapTokenOut}
                        onChange={e => setSwapTokenOut(e.target.value)}
                      >
                        <option value="USDC">USDC</option>
                        <option value="EURC">EURC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label style={{ color: "var(--color-fg)" }}>Amount ({swapTokenIn})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="100"
                      value={swapAmount}
                      onChange={e => setSwapAmount(e.target.value)}
                      style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                    />
                  </div>

                  <Button
                    onClick={handleSwap}
                    disabled={swapLoading || !swapAmount || swapTokenIn === swapTokenOut}
                    className="w-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {swapLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Swapping...
                      </>
                    ) : chainId !== 5042002 ? (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Switch to Arc Testnet
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Swap Tokens
                      </>
                    )}
                  </Button>

                  {swapTxHash && (
                    <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-success-soft)" }}>
                      <p className="font-medium" style={{ color: "var(--color-success)" }}>Swap successful!</p>
                      <p className="text-xs mt-1 font-mono break-all" style={{ color: "var(--color-fg-muted)" }}>
                        Tx: {swapTxHash}
                      </p>
                      <a
                        href={`https://testnet.arcscan.app/tx/${swapTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-1 inline-block hover:underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        View on Arc Explorer →
                      </a>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>1</span>
                <span style={{ color: "var(--color-fg-secondary)" }}>Connect your wallet with USDC on Sepolia, Base, or Arbitrum</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>2</span>
                <span style={{ color: "var(--color-fg-secondary)" }}>Enter the amount and bridge via Circle CCTP</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>3</span>
                <span style={{ color: "var(--color-fg-secondary)" }}>USDC arrives on Arc in &lt;1 second — instant finality</span>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>Supported Chains</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {SUPPORTED_SOURCE_CHAINS.map(chain => (
                  <li key={chain.id} className="flex items-center gap-2" style={{ color: "var(--color-fg-secondary)" }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
                    {chain.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
