/**
 * Smart Wallet (Modular Wallet) integration
 * All Circle SDK calls go through our API — no client-side SDK needed
 */
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Fingerprint, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/lib/web3/wallet-provider";

// Inline wallet creation button (for dropdown)
export function SmartWalletButton() {
  const { setSmartWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const createSmartWallet = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Setup user + get token
      const setupRes = await fetch("/api/smart-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const setupData = await setupRes.json();
      if (!setupRes.ok) throw new Error(setupData.error);

      const { userId, userToken } = setupData;

      // Step 2: Create wallet challenge
      const createRes = await fetch("/api/smart-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-wallet",
          userId,
          userToken,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      const challengeId = createData.challengeId;

      // Step 3: Poll for completion
      let walletData: any = null;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch("/api/smart-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "check-challenge",
            userId,
            userToken,
            challengeId,
          }),
        });
        const statusData = await statusRes.json();
        if (statusData?.challenge?.status === "COMPLETE") {
          walletData = statusData.challenge;
          break;
        }
      }

      if (!walletData) throw new Error("Wallet creation timed out");

      // Step 4: Extract ARC wallet address
      const wallets = walletData.wallets || [];
      // Filter for ARC wallets
      const arcWallet = wallets.find((w: any) =>
        w.blockchain?.toLowerCase?.()?.includes?.("arc") ||
        w.blockchain === "ARC-TESTNET"
      );
      const address = arcWallet?.address || wallets[0]?.address || "Created";

      setSmartWallet({
        address,
        userId,
        walletId: arcWallet?.id || null,
      });

      toast.success("Smart wallet created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create smart wallet");
    } finally {
      setLoading(false);
    }
  }, [setSmartWallet]);

  return (
    <Button
      variant="default"
      size="sm"
      onClick={createSmartWallet}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Creating...</>
      ) : (
        <><Fingerprint className="mr-1 h-3 w-3" /> Create with Passkey</>
      )}
    </Button>
  );
}

// Full setup card (for dedicated page)
export function SmartWalletSetup() {
  const { smartWallet, setSmartWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const setupRes = await fetch("/api/smart-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const setupData = await setupRes.json();
      if (!setupRes.ok) throw new Error(setupData.error);

      const { userId, userToken } = setupData;

      const createRes = await fetch("/api/smart-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-wallet", userId, userToken }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      let walletData: any = null;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch("/api/smart-wallet", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check-challenge", userId, userToken, challengeId: createData.challengeId }),
        });
        const statusData = await statusRes.json();
        if (statusData?.challenge?.status === "COMPLETE") {
          walletData = statusData.challenge;
          break;
        }
      }

      if (!walletData) throw new Error("Timed out");
      const wallets = walletData.wallets || [];
      const arcWallet = wallets.find((w: any) =>
        w.blockchain?.toLowerCase?.()?.includes?.("arc") ||
        w.blockchain === "ARC-TESTNET"
      );
      const address = arcWallet?.address || wallets[0]?.address || "Created";

      setSmartWallet({ address, userId, walletId: arcWallet?.id || null });
      toast.success("Smart wallet created!");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (smartWallet?.address) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#CBF825] shrink-0" />
          <div>
            <p className="text-sm font-medium">Smart Wallet Active</p>
            <p className="text-xs text-muted-foreground font-mono">{smartWallet.address}</p>
          </div>
          <Badge className="ml-auto">ARC-TESTNET</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Smart Wallet
        </CardTitle>
        <CardDescription>
          Create a wallet with Face ID / fingerprint — no browser extension needed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">✅ No MetaMask/Rabby required</p>
          <p className="flex items-center gap-2">✅ Secured by your device biometrics</p>
          <p className="flex items-center gap-2">✅ Works on mobile & desktop</p>
          <p className="flex items-center gap-2">✅ Use Deposit to buy USDC with credit card</p>
        </div>
        <Button onClick={handleSetup} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
          ) : (
            <><Fingerprint className="mr-2 h-4 w-4" /> Create with Passkey</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
