/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSupabaseServerComponentClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { CreateAgreementPage } from "@/components/ui/createAgreementPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowAgreements } from "@/components/escrow-agreements";
import { WalletBalance } from "@/components/wallet-balance";
import { RequestUsdcButton } from "@/components/request-usdc-button";
import { USDCButton } from "@/components/usdc-button";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { WalletInformationDialog } from "@/components/wallet-information-dialog";
import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";

const Transactions = dynamic(() => import('@/components/transactions').then(mod => mod.Transactions), { ssr: false })

export default async function ProtectedPage() {
  const supabase = createSupabaseServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const { data: wallet } = await supabase
    .schema("public")
    .from("wallets")
    .select()
    .eq("profile_id", profile?.id)
    .single();

  const { data: myAgents } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("profile_id", profile?.id)
    .order("created_at", { ascending: false });

  return (
    <>
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>Manage escrows, payments, and your AI agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 stagger-1">
        {/* Wallet Card */}
        <Card className="break-inside-avoid" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader className="flex-row items-center space-between">
            <CardTitle style={{ color: "var(--color-fg)" }}>Account balance</CardTitle>
            <WalletInformationDialog wallet={wallet} />
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-1.5">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                  <WalletBalance walletId={wallet?.circle_wallet_id} />
                </h1>
              </div>
              <div className="flex gap-2">
                <USDCButton className="flex-1" mode="BUY" walletAddress={wallet?.wallet_address} />
                <USDCButton className="flex-1" mode="SELL" walletAddress={wallet?.wallet_address} />
                {process.env.NODE_ENV === "development" && <RequestUsdcButton walletAddress={wallet?.wallet_address} />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Agreement Section */}
        <div className="flex h-full">
          <CreateAgreementPage />
        </div>
      </div>

      {/* Agreements Section */}
      <div className="mb-4 animate-fade-in-up">
          <EscrowAgreements
            userId={user.id}
            profileId={profile?.id}
            walletId={wallet.circle_wallet_id}
          />
        </div>

        {/* Transactions Section */}
        <div className="mb-4 animate-fade-in-up">
          <div className="flex flex-col gap-2 items-start">
            <Card className="mb-4 w-full" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardHeader>
                <CardTitle style={{ color: "var(--color-fg)" }}>Your transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Transactions wallet={wallet} profile={profile} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Agents Section */}
        {myAgents && myAgents.length > 0 && (
          <div className="break-inside-avoid mb-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  Your AI Agents
                </CardTitle>
                <Link href="/dashboard/agents">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myAgents.map((agent: any) => (
                    <div key={agent.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-sm">{agent.agent_name}</span>
                      </div>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{agent.total_jobs_completed || 0} jobs</span>
                        <span>✦ {agent.reputation_score || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

    </>
  );
}
