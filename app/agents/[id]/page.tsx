"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Clock, DollarSign, Star, Users, AlertCircle,
  ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { getAgentById } from "@/lib/mock/agents";
import { AgentWorkflowVisualization } from "@/components/agent-workflow-visualization";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Web3: "oklch(0.55 0.15 120)",
  Development: "oklch(0.75 0.18 125)",
  Research: "oklch(0.60 0.16 240)",
  Marketing: "oklch(0.65 0.18 30)",
  Content: "oklch(0.60 0.12 280)",
  Automation: "oklch(0.65 0.16 80)",
};

export default function AgentDetailPage() {
  const params = useParams();
  const agent = getAgentById(params.id as string);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={48} style={{ color: "var(--color-fg-muted)" }} />
        <h2 className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>Agent not found</h2>
        <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>The agent you are looking for does not exist.</p>
        <Link href="/agents/marketplace">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = agent.icon;
  const categoryColor = CATEGORY_COLORS[agent.category] || "var(--color-accent)";
  const avgRating = agent.rating;

  return (
    <div className="space-y-8">
      <Link
        href="/agents/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 hover:opacity-70"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        <ArrowLeft size={14} />
        Back to Marketplace
      </Link>

      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in oklch, ${categoryColor} 12%, transparent)` }}
                >
                  <Icon size={28} style={{ color: categoryColor }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
                      {agent.name}
                    </h1>
                    <Badge
                      className="text-[11px]"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${categoryColor} 15%, transparent)`,
                        color: categoryColor,
                        border: `1px solid ${categoryColor}`,
                      }}
                    >
                      {agent.category}
                    </Badge>
                  </div>

                  <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
                    {agent.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 flex-wrap text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                    <span className="flex items-center gap-1">
                      <Star size={13} style={{ color: "var(--color-warning)" }} />
                      <span className="font-medium">{avgRating.toFixed(1)}</span>
                      <span>({agent.reviewCount} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {agent.users} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {agent.executionTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full md:w-56">
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-fg-muted)" }}>
                  Price per run
                </p>
                <div className="flex items-center gap-1">
                  <DollarSign size={18} style={{ color: "var(--color-accent)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                    ${agent.pricePerRun.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full transition-all duration-200"
                style={{ backgroundColor: "var(--color-accent)" }}
                onClick={() => toast.success(`${agent.name} execution started! (Mock)`)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Run Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                {agent.longDescription}
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentWorkflowVisualization steps={agent.workflow} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {agent.inputs.map((input, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                    <ArrowRight size={12} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Outputs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {agent.outputs.map((output, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: "oklch(0.75 0.18 125)" }} />
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
            Reviews ({agent.reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  style={{
                    color: star <= Math.round(avgRating) ? "var(--color-warning)" : "var(--color-bd)",
                    fill: star <= Math.round(avgRating) ? "var(--color-warning)" : "transparent",
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
              ({agent.reviewCount} reviews)
            </span>
          </div>

          <div className="space-y-3">
            {agent.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: `color-mix(in oklch, ${categoryColor} 12%, transparent)`, color: categoryColor }}
                    >
                      {review.author[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>{review.author}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={10}
                      style={{
                        color: star <= review.rating ? "var(--color-warning)" : "var(--color-bd)",
                        fill: star <= review.rating ? "var(--color-warning)" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-bd)" }}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => toast.success("Review submitted! (Mock)")}
            >
              Write a Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
