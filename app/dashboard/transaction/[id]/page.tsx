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

import Link from "next/link";
import { ArrowLeft, Clock, CreditCard, Calendar, Activity, Database, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? (process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
  : "http://localhost:3000";

export default async function Transaction({
  params,
}: {
  params: { id: string };
}) {
  const response = await fetch(
    `${baseUrl}/api/wallet/transactions/${params.id}`,
  );
  const parsedResponse = await response.json();

  if (parsedResponse.error) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "oklch(0.55 0.20 30)" }} />
            <h2 className="text-xl font-semibold tracking-tight mb-2" style={{ color: "var(--color-fg)" }}>
              Invalid Transaction
            </h2>
            <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
              {parsedResponse.error || "The transaction you are looking for does not exist or cannot be fetched."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transaction = parsedResponse.transaction;
  const transactionCreationTimestamp = new Date(transaction.createDate);
  const creationDate = transactionCreationTimestamp.toLocaleDateString();
  const creationTime = transactionCreationTimestamp.toLocaleTimeString();

  const transactionLastUpdateTimestamp = new Date(transaction.updateDate);
  const lastUpdateDate = transactionLastUpdateTimestamp.toLocaleDateString();
  const lastUpdateTime = transactionLastUpdateTimestamp.toLocaleTimeString();

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case "complete":
      case "completed":
      case "success":
        return {
          bg: "oklch(0.60 0.15 150 / 0.12)",
          fg: "oklch(0.60 0.15 150)"
        };
      case "pending":
      case "processing":
        return {
          bg: "oklch(0.65 0.14 80 / 0.12)",
          fg: "oklch(0.65 0.14 80)"
        };
      case "failed":
      case "error":
        return {
          bg: "oklch(0.55 0.20 30 / 0.12)",
          fg: "oklch(0.55 0.20 30)"
        };
      default:
        return {
          bg: "var(--color-bg-hover)",
          fg: "var(--color-fg-muted)"
        };
    }
  };

  const stateColors = getStateColor(transaction.state);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4" style={{ borderColor: "var(--color-bd)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <CreditCard className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold" style={{ color: "var(--color-fg)" }}>
                Transaction Detail
              </CardTitle>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                {transaction.id}
              </p>
            </div>
          </div>
          <Badge
            className="text-xs px-2.5 py-0.5"
            style={{
              backgroundColor: stateColors.bg,
              color: stateColors.fg,
              border: "none"
            }}
          >
            {transaction.state}
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Amount Display */}
          <div className="text-center py-6 border-b mb-6" style={{ borderColor: "var(--color-bd)" }}>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--color-fg-muted)" }}>
              Amount
            </span>
            <p className="text-3xl font-bold tracking-tight mt-1 font-mono" style={{ color: "var(--color-fg)" }}>
              {transaction.amounts?.[0] || "0.00 USDC"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Database className="h-4 w-4 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>
                  Blockchain Network
                </p>
                <p className="text-sm font-semibold mt-1 capitalize" style={{ color: "var(--color-fg)" }}>
                  {transaction.blockchain}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-4 w-4 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>
                  Transaction Type
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-fg)" }}>
                  {transaction.transactionType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>
                  Created At
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-fg)" }}>
                  {creationDate} <span className="text-xs font-normal" style={{ color: "var(--color-fg-secondary)" }}>{creationTime}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>
                  Last Updated
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-fg)" }}>
                  {lastUpdateDate} <span className="text-xs font-normal" style={{ color: "var(--color-fg-secondary)" }}>{lastUpdateTime}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
