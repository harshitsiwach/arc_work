/**
 * ClipArc — Create a product listing
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PRODUCT_TYPES = [
  { value: "clip_pack", label: "Clip Pack", desc: "Batch of edited clips for short-form content" },
  { value: "template", label: "Template", desc: "Editable template, preset, or asset pack" },
  { value: "membership", label: "Membership", desc: "Recurring access to content or tools" },
];

const DELIVERY_TYPES = [
  { value: "instant", label: "Instant Delivery", desc: "Buyer gets access immediately after payment" },
  { value: "escrow", label: "Escrow", desc: "Deliverable reviewed before release" },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_amount: "",
    product_type: "clip_pack",
    delivery_type: "instant",
    tags: "",
    access_url: "",
    file_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price_amount: parseFloat(form.price_amount),
          product_type: form.product_type,
          delivery_type: form.delivery_type,
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
          access_url: form.access_url || undefined,
          file_url: form.file_url || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Product listed!");
      router.push(`/dashboard/products/${data.product?.id || data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Create Product</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>List a clipping pack, template, or membership</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <CardTitle style={{ color: "var(--color-fg)" }}>Product Details</CardTitle>
            <CardDescription>What are you selling?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                required
                placeholder="e.g., 50 AI-Powered Clips for TikTok"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                required
                className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}
                placeholder="Describe what buyers get — deliverable format, quantity, turnaround time..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Price + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (USDC)</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="50"
                  value={form.price_amount}
                  onChange={e => setForm({ ...form, price_amount: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Product Type</Label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                  value={form.product_type}
                  onChange={e => setForm({ ...form, product_type: e.target.value })}
                >
                  {PRODUCT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
                  {PRODUCT_TYPES.find(t => t.value === form.product_type)?.desc}
                </p>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <Label>Delivery Method</Label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                value={form.delivery_type}
                onChange={e => setForm({ ...form, delivery_type: e.target.value })}
              >
                {DELIVERY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="tiktok, gaming, vertical, viral"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Delivery URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Access URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={form.access_url}
                  onChange={e => setForm({ ...form, access_url: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>File URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={form.file_url}
                  onChange={e => setForm({ ...form, file_url: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full" style={{ backgroundColor: "var(--color-accent)" }}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...</>
              ) : (
                <><Package className="mr-2 h-4 w-4" /> List Product</>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
