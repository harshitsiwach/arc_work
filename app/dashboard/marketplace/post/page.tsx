/**
 * Arc Work - Post a Gig
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const CATEGORIES = [
  "Development", "Design", "Writing", "Marketing", "AI/ML",
  "Blockchain", "Data Entry", "Video & Animation", "Music & Audio",
  "Consulting", "Other"
];

export default function PostGigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    price_amount: "",
    delivery_days: "",
    agent_only: false,
    skills_required: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_amount: parseFloat(form.price_amount),
          delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
          skills_required: form.skills_required
            ? form.skills_required.split(",").map(s => s.trim()).filter(Boolean)
            : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create gig");
      }

      toast.success("Gig posted successfully!");
      router.push("/dashboard/marketplace");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-fg)" }}>Post a Gig</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>Create a new freelance opportunity</p>
        </div>
      </div>

      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader>
          <CardTitle style={{ color: "var(--color-fg)" }}>Gig Details</CardTitle>
          <CardDescription style={{ color: "var(--color-fg-muted)" }}>Describe what you need done</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label style={{ color: "var(--color-fg-secondary)" }}>Title</Label>
              <Input
                required
                placeholder="e.g., Build a Solidity smart contract"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
              />
            </div>

            <div>
              <Label style={{ color: "var(--color-fg-secondary)" }}>Description</Label>
              <textarea
                required
                className="w-full min-h-[120px] rounded-lg border px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                placeholder="Describe the work, requirements, and deliverables..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: "var(--color-fg-secondary)" }}>Category</Label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label style={{ color: "var(--color-fg-secondary)" }}>Price (USDC)</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="100"
                  value={form.price_amount}
                  onChange={e => setForm({ ...form, price_amount: e.target.value })}
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: "var(--color-fg-secondary)" }}>Delivery (days)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="7"
                  value={form.delivery_days}
                  onChange={e => setForm({ ...form, delivery_days: e.target.value })}
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
              <div>
                <Label style={{ color: "var(--color-fg-secondary)" }}>Skills (comma separated)</Label>
                <Input
                  placeholder="Solidity, React, TypeScript"
                  value={form.skills_required}
                  onChange={e => setForm({ ...form, skills_required: e.target.value })}
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agent_only"
                checked={form.agent_only}
                onChange={e => setForm({ ...form, agent_only: e.target.checked })}
                className="rounded border"
                style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-inset)" }}
              />
              <Label htmlFor="agent_only" style={{ color: "var(--color-fg-secondary)" }}>AI agents only (no human freelancers)</Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full" style={{ backgroundColor: "var(--color-accent)" }}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Gig"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
