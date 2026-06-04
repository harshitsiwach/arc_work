/**
 * ClipArc - Subscriptions & Memberships (ERC-8191)
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWallet } from "@/lib/web3/wallet-provider";
import { useAppKitProvider } from "@reown/appkit/react";
import { Loader2, ShieldCheck, CreditCard, Users, DollarSign, Calendar, Ban, Send, ArrowUpRight } from "lucide-react";

interface OnChainSubscription {
  id: number;
  creator: string;
  subscriber: string;
  amount: number;
  intervalDays: number;
  nextBilling: Date;
  status: "Active" | "PastDue" | "Cancelled";
  tierName: string;
}

export default function SubscriptionsPage() {
  const { isConnected, connect, address, activeWalletType } = useWallet();
  const { walletProvider } = useAppKitProvider("eip155");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New subscription form
  const [creatorAddress, setCreatorAddress] = useState("");
  const [tierName, setTierName] = useState("Premium Member");
  const [amount, setAmount] = useState("10");
  const [intervalDays, setIntervalDays] = useState("30");

  // Sample data for active memberships
  const [subscriptions, setSubscriptions] = useState<OnChainSubscription[]>([
    {
      id: 1,
      creator: "0x37fc98997055b4be246d698b131cabc2c4ab34a3",
      subscriber: "0xAddress...",
      amount: 15.0,
      intervalDays: 30,
      nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: "Active",
      tierName: "Alpha Video Editor VIP"
    },
    {
      id: 2,
      creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      subscriber: "0xAddress...",
      amount: 5.0,
      intervalDays: 7,
      nextBilling: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue by 1 day
      status: "PastDue",
      tierName: "Weekly Creator Assets Feed"
    }
  ]);

  // Creator's billing list (members they can charge)
  const [membersToBill, setMembersToBill] = useState([
    {
      id: 3,
      subscriber: "0x98144be246d698b131cabc2c4ab34a322c56a88b2",
      amount: 12.0,
      tierName: "Pro Editor Preset Subscription",
      nextBilling: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      due: true
    }
  ]);

  const totalMonthlySpend = subscriptions
    .filter(s => s.status !== "Cancelled")
    .reduce((acc, curr) => acc + (curr.amount * (30 / curr.intervalDays)), 0);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }

    if (!creatorAddress.startsWith("0x") || creatorAddress.length !== 42) {
      toast.error("Please enter a valid creator wallet address");
      return;
    }

    const price = parseFloat(amount);
    if (isNaN(price) || price <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    setSubmitting(true);
    try {
      // 1. ERC-20 approval transaction request (approving USDC transfer to the Subscription Controller)
      if (activeWalletType === "metamask" && walletProvider) {
        toast.info("Approving USDC allowances for ERC-8191 recurring payments...");
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || "0x3600000000000000000000000000000000000000";
        // Approve a high allowance for recurring monthly charges
        const maxAllowance = BigInt(Math.round(price * 12 * 1_000_000)).toString(); // 1 year of allowance
        
        // Encode ERC20 approve(address,uint256)
        const recipientHex = creatorAddress.replace("0x", "").toLowerCase().padStart(64, "0");
        const allowanceHex = (maxAllowance as any).toString(16).padStart(64, "0");
        const approveData = `0x095ea7b3${recipientHex}${allowanceHex}`;

        await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to: usdcAddress,
            data: approveData
          }]
        });
        
        toast.success("USDC allowance approved! Broadcasted subscription terms to ERC-8191.");
      }

      // Add to local state list
      const newSub: OnChainSubscription = {
        id: subscriptions.length + 1,
        creator: creatorAddress,
        subscriber: address || "0xSelf",
        amount: price,
        intervalDays: parseInt(intervalDays),
        nextBilling: new Date(Date.now() + parseInt(intervalDays) * 24 * 60 * 60 * 1000),
        status: "Active",
        tierName
      };

      setSubscriptions([newSub, ...subscriptions]);
      setCreatorAddress("");
      toast.success(`Successfully subscribed to ${tierName}!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create subscription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    setSubscriptions(prev =>
      prev.map(sub => sub.id === id ? { ...sub, status: "Cancelled" } : sub)
    );
    toast.success("Subscription cancelled successfully");
  };

  const handleExecuteBilling = async (subId: number, memberName: string, amountDue: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    toast.info(`Triggering ERC-8191 billing execution for ${memberName}...`);
    try {
      // Prompt wallet execution
      if (activeWalletType === "metamask" && walletProvider) {
        // Mock calling SubscriptionController.executeBilling(subId)
        await (walletProvider as any).request({
          method: "eth_sendTransaction",
          params: [{
            from: address,
            to: address, // Self-call for mock trigger
            value: "0"
          }]
        });
      }

      // Clear from due list
      setMembersToBill(prev => prev.filter(m => m.id !== subId));
      toast.success(`Successfully billed ${amountDue} USDC from ${memberName.slice(0, 8)}...`);
    } catch (err: any) {
      toast.error(err.message || "Billing execution failed");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Subscriptions & Memberships</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Manage your active recurring payments and bill members using ERC-8191 recurring standards.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[var(--color-bd)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--color-fg-secondary)" }}>Monthly Outflow</CardTitle>
            <CreditCard className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>
              {totalMonthlySpend.toFixed(2)} USDC
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Across active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-bd)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--color-fg-secondary)" }}>Active Memberships</CardTitle>
            <Users className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>
              {subscriptions.filter(s => s.status === "Active").length}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>1 requiring renewal payment</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-bd)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--color-fg-secondary)" }}>Standard Protocol</CardTitle>
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>ERC-8191</div>
            <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>On-chain subscription standard</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Subscriptions */}
          <Card className="border-[var(--color-bd)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>My Subscriptions</CardTitle>
              <CardDescription style={{ color: "var(--color-fg-secondary)" }}>Tiers and services you pay for recurringly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border-[var(--color-bd)] border transition-all duration-150"
                  style={{ backgroundColor: "var(--color-bg-inset)" }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--color-fg)" }}>{sub.tierName}</span>
                      <Badge
                        variant="secondary"
                        className={
                          sub.status === "Active"
                            ? "bg-[#CBF825]/10 text-[#CBF825] border border-[#CBF825]/20"
                            : sub.status === "PastDue"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                      Creator: <code className="text-[var(--color-fg-muted)]">{sub.creator.slice(0, 6)}...{sub.creator.slice(-4)}</code>
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
                      <span className="flex items-center gap-1"><Calendar size={12} /> Next billing: {sub.nextBilling.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Cycle: Every {sub.intervalDays} days</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm" style={{ color: "var(--color-fg)" }}>{sub.amount} USDC</span>
                    {sub.status !== "Cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-red-500/10 hover:text-red-500 text-xs gap-1 border border-transparent hover:border-red-500/20"
                        onClick={() => handleCancel(sub.id)}
                      >
                        <Ban size={12} /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing queue (Creator Mode) */}
          <Card className="border-[var(--color-bd)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>Execute Member Charges</CardTitle>
              <CardDescription style={{ color: "var(--color-fg-secondary)" }}>
                Subscriptions due for billing. Trigger execution to pull USDC from member allowances.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {membersToBill.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--color-fg-muted)" }}>No member payments due at the moment.</p>
              ) : (
                membersToBill.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-amber-500/20"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.04)" }}
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-sm" style={{ color: "var(--color-fg)" }}>{member.tierName}</span>
                      <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                        Subscriber: <code className="text-[var(--color-fg-muted)]">{member.subscriber.slice(0, 8)}...{member.subscriber.slice(-6)}</code>
                      </p>
                      <span className="text-xs block text-amber-500">Payment Overdue</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm" style={{ color: "var(--color-fg)" }}>{member.amount} USDC</span>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1"
                        onClick={() => handleExecuteBilling(member.id, member.subscriber, member.amount)}
                      >
                        Bill Member <ArrowUpRight size={12} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Creation Form */}
        <div>
          <Card className="border-[var(--color-bd)] h-fit" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--color-fg)" }}>Subscribe to Tier</CardTitle>
              <CardDescription style={{ color: "var(--color-fg-secondary)" }}>Create a new ERC-8191 subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>Creator Wallet Address</label>
                  <Input
                    placeholder="0x..."
                    value={creatorAddress}
                    onChange={e => setCreatorAddress(e.target.value)}
                    style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg)", borderColor: "var(--color-bd)" }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>Tier Name</label>
                  <Input
                    placeholder="Premium Tier"
                    value={tierName}
                    onChange={e => setTierName(e.target.value)}
                    style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg)", borderColor: "var(--color-bd)" }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg)", borderColor: "var(--color-bd)" }}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--color-fg-secondary)" }}>Billing Cycle (Days)</label>
                    <select
                      className="w-full rounded-md px-3 py-2 text-sm border focus:outline-none"
                      style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg)", borderColor: "var(--color-bd)" }}
                      value={intervalDays}
                      onChange={e => setIntervalDays(e.target.value)}
                    >
                      <option value="7">Every 7 Days</option>
                      <option value="30">Every 30 Days</option>
                      <option value="90">Every 90 Days</option>
                      <option value="365">Every 365 Days</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-[oklch(0.150_0_0)] gap-2 font-medium"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Initialize Subscription
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
