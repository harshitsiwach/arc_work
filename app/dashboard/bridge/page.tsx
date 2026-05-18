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
import { Loader2, ArrowRightLeft, ExternalLink, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function BridgePage() {
  const { address, chainId, isConnected, connect, switchChain } = useWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_SOURCE_CHAINS[0]);
  const [txHash, setTxHash] = useState<string | null>(null);

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

    // Check chain matches
    if (chainId !== selectedChain.id) {
      await switchChain(selectedChain.id);
      // After switching, they'll need to click again
      toast.info(`Switch to ${selectedChain.name} and try again`);
      return;
    }

    setLoading(true);
    setTxHash(null);

    try {
      // Call our API which will orchestrate the bridge
      const res = await fetch("/api/bridge/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceChain: selectedChain.arcName,
          amount: numAmount.toString(),
          userAddress: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // If we get a tx request back, send it
      if (data.txRequest) {
        if (!(window as any).ethereum) throw new Error("No wallet found");
        const tx = await (window as any).ethereum.request({
          method: data.txRequest.method,
          params: data.txRequest.params,
        });
        setTxHash(tx);
        toast.success("Bridge transaction sent!");
      } else if (data.txHash) {
        setTxHash(data.txHash);
        toast.success("Bridge initiated!");
      }

      if (data.explorerUrl) {
        window.open(data.explorerUrl, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Bridge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bridge</h1>
        <p className="text-muted-foreground">
          Move USDC from other chains to Arc in under 1 second
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main bridge card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bridge USDC to Arc</CardTitle>
              <CardDescription>
                Powered by Circle CCTP — deposit from any supported chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet connection status */}
              {!isConnected ? (
                <div className="p-6 text-center border-2 border-dashed rounded-lg">
                  <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">Connect your wallet to bridge USDC</p>
                  <Button onClick={connect}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connected status */}
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    {chainId && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Chain: {SUPPORTED_SOURCE_CHAINS.find(c => c.id === chainId)?.name || chainId}
                      </span>
                    )}
                  </div>

                  {/* Source chain */}
                  <div>
                    <Label>Source Chain</Label>
                    <select
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
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
                    <Label>Amount (USDC)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="100"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>

                  {/* Bridge button */}
                  <Button
                    onClick={handleBridge}
                    disabled={loading || !amount}
                    className="w-full"
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
                    <div className="p-3 bg-green-500/10 rounded-lg text-sm">
                      <p className="text-green-600 font-medium">Bridge transaction sent!</p>
                      <p className="text-muted-foreground text-xs mt-1 font-mono break-all">
                        Tx: {txHash}
                      </p>
                      <a
                        href={`https://testnet.arcscan.app`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                      >
                        View on Arc Explorer →
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    USDC lands on Arc in under 1 second with deterministic finality
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Connect your wallet with USDC on Sepolia, Base, or Arbitrum</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Enter the amount and bridge via Circle CCTP</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>USDC arrives on Arc in &lt;1 second — instant finality</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Chains</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {SUPPORTED_SOURCE_CHAINS.map(chain => (
                  <li key={chain.id} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
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
