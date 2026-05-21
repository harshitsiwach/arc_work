/**
 * ClipArc - x402 Gated Course Player
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { arcTestnet } from "@/lib/web3/appkit-provider";
import { Loader2, PlayCircle, Lock, Unlock, ShieldAlert, Award, FileText, ChevronRight } from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  isFree: boolean;
  videoUrl?: string;
  description: string;
}

interface CourseData {
  title: string;
  priceUSDC: number;
  creatorAddress: string;
  modules: CourseModule[];
}

export default function CoursePlayerPage({ params }: { params: { id: string } }) {
  const { isConnected, connect, address, activeWalletType, chainId } = useWallet();
  const { walletProvider } = useAppKitProvider("eip155");
  const { switchNetwork } = useAppKitNetwork();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  
  // Payment states
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({}); // module_id -> tx_hash mapping
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null);

  useEffect(() => {
    fetchCourseInfo();
  }, [params.id]);

  const fetchCourseInfo = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`);
      if (!res.ok) throw new Error("Failed to load course details");
      const data: CourseData = await res.json();
      setCourse(data);
      if (data.modules.length > 0) {
        setSelectedModuleId(data.modules[0].id);
        fetchModule(data.modules[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const fetchModule = async (moduleId: string, txHashOverride?: string) => {
    setLoading(true);
    setVerifiedPayment(null);
    try {
      const txHash = txHashOverride || txHashes[moduleId];
      const headers: Record<string, string> = {};
      if (txHash) {
        headers["Authorization"] = `x402 ${txHash}`;
      }

      const res = await fetch(`/api/courses/${params.id}?module=${moduleId}`, { headers });
      const data = await res.json();

      if (res.status === 402) {
        // Module is locked, return locked state
        setActiveModule({
          id: moduleId,
          title: course?.modules.find(m => m.id === moduleId)?.title || "Locked Module",
          isFree: false,
          description: "Pay to unlock full content, resources, and downloadable files."
        });
      } else if (!res.ok) {
        throw new Error(data.error || "Failed to load lecture module");
      } else {
        // Module unlocked successfully!
        setActiveModule(data.module);
        if (data.verifiedPayment) {
          setVerifiedPayment(data.verifiedPayment);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load module content");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    fetchModule(moduleId);
  };

  const encodeTransfer = (recipient: string, amount: string) => {
    const recipientHex = recipient.replace("0x", "").toLowerCase().padStart(64, "0");
    const amountHex = BigInt(amount).toString(16).padStart(64, "0");
    return `0xa9059cbb${recipientHex}${amountHex}`;
  };

  const handleUnlock = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }

    if (!course || !activeModule) return;

    setUnlocking(true);
    try {
      // 1. Ensure we are on Arc Testnet for MetaMask EOA
      if (activeWalletType === "metamask") {
        if (chainId !== 5042002) {
          if (switchNetwork) {
            try {
              await switchNetwork(arcTestnet);
              await new Promise(r => setTimeout(r, 1000));
            } catch {
              throw new Error("Please switch your wallet network to Arc Testnet to complete the payment.");
            }
          } else {
            throw new Error("Please switch your wallet network to Arc Testnet.");
          }
        }

        if (!walletProvider) {
          throw new Error("Wallet provider not found. Reconnect wallet.");
        }

        toast.info("Please sign the one-time x402 USDC payment in your wallet...");

        const usdcAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x3600000000000000000000000000000000000000";
        const usdcBaseUnits = BigInt(Math.round(course.priceUSDC * 1_000_000)).toString();

        const txHash = await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to: usdcAddress,
            data: encodeTransfer(course.creatorAddress, usdcBaseUnits),
          }],
        });

        if (!txHash) {
          throw new Error("Transaction rejected or failed to broadcast.");
        }

        toast.success("Transaction submitted to Arc scan! Verification in progress...");
        
        // Save tx_hash
        setTxHashes(prev => ({ ...prev, [activeModule.id]: txHash }));
        
        // Load the module with the new token
        await fetchModule(activeModule.id, txHash);
      } else {
        // Smart wallets (non-EIP-1193 MetaMask)
        toast.error("One-time x402 EOA payments require MetaMask. Circle smart wallets can purchase products via product details catalog pages.");
      }
    } catch (err: any) {
      console.error("x402 payment error:", err);
      toast.error(err.message || "Unlock payment failed");
    } finally {
      setUnlocking(false);
    }
  };

  if (!course) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
        <p className="text-sm text-text-secondary">Loading course content player...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
          {course.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Course Creator: <code className="text-[var(--color-fg-muted)]">{course.creatorAddress}</code>
        </p>
      </div>

      {/* Main player layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar course index (1/4 width) */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-[var(--color-bd)] h-full" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            <CardHeader className="py-4">
              <CardTitle className="text-[15px]" style={{ color: "var(--color-fg)" }}>Lectures Index</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4 space-y-1">
              {course.modules.map(mod => {
                const isActiveModule = mod.id === selectedModuleId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors duration-150"
                    style={{
                      backgroundColor: isActiveModule ? "var(--color-bg-hover)" : "transparent",
                      color: isActiveModule ? "var(--color-fg)" : "var(--color-fg-secondary)"
                    }}
                  >
                    <span className="truncate pr-2 font-medium">{mod.title}</span>
                    <span className="flex-shrink-0">
                      {mod.isFree ? (
                        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px]">Free</Badge>
                      ) : txHashes[mod.id] || verifiedPayment ? (
                        <Unlock size={11} className="text-green-500" />
                      ) : (
                        <Lock size={11} className="text-[var(--color-fg-muted)]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Video Player & content (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-[var(--color-bd)] overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            {activeModule?.videoUrl ? (
              // Video Player
              <div className="aspect-video w-full bg-black relative">
                <video
                  src={activeModule.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  autoPlay
                />
              </div>
            ) : (
              // Locked Lock Screen
              <div className="aspect-video w-full flex flex-col items-center justify-center px-4 relative" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 mb-3 text-red-500 animate-pulse">
                  <Lock size={28} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "var(--color-fg)" }}>Locked Lecture</h3>
                <p className="text-xs text-center max-w-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
                  This module requires a one-time x402 payment of **{course.priceUSDC} USDC** directly to the creator.
                </p>

                <div className="mt-5 flex gap-3">
                  <Button
                    disabled={unlocking}
                    onClick={handleUnlock}
                    className="text-white bg-red-500 hover:bg-red-600 font-semibold gap-2 shadow-lg hover:shadow-red-500/10"
                  >
                    {unlocking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Unlock size={14} /> Pay {course.priceUSDC} USDC
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--color-fg)" }}>
                  {activeModule?.title}
                </h2>
                {verifiedPayment && (
                  <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                    <Award size={12} /> x402 Verified
                  </Badge>
                )}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                {activeModule?.description}
              </p>

              {verifiedPayment && (
                <div className="p-4 rounded-lg border border-green-500/20 text-xs space-y-1.5" style={{ backgroundColor: "rgba(34, 197, 94, 0.03)" }}>
                  <div className="font-semibold text-green-500 flex items-center gap-1.5">
                    <Award size={13} /> On-chain Payment Proof (Arc Testnet)
                  </div>
                  <div>Sender: <code className="text-[var(--color-fg-muted)]">{verifiedPayment.from}</code></div>
                  <div>Transferred: <span className="font-bold text-green-500">{verifiedPayment.amountUSDC} USDC</span></div>
                  <div>Block Confirmed: <span className="font-bold">{verifiedPayment.blockNumber}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
