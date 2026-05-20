/**
 * Arc Work — Create Product
 * Premium creator publishing experience
 */
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ArrowLeft, Package, Upload, Image as ImageIcon,
  Sparkles, Eye, Coins, Zap, Shield, Bot, Tag, X,
  CheckCircle2, Globe, Clock, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProductPreview } from "./product-preview";

/* ── Constants ─────────────────────────────────────────────── */

const PRODUCT_TYPES = [
  { value: "clip_pack", label: "Clip Pack", icon: "🎬", desc: "Batch of edited short-form clips" },
  { value: "template", label: "Template", icon: "📐", desc: "Editable presets, assets, or workflows" },
  { value: "membership", label: "Membership", icon: "👑", desc: "Recurring access to content or tools" },
  { value: "automation", label: "AI Automation", icon: "🤖", desc: "Automated workflow or agent service" },
  { value: "service", label: "Service", icon: "💼", desc: "Done-for-you creative service" },
  { value: "community", label: "Community", icon: "🌐", desc: "Access to a private group or channel" },
];

const DELIVERY_TYPES = [
  { value: "instant", label: "Instant", icon: Zap, desc: "Buyer gets access immediately" },
  { value: "escrow", label: "Escrow", icon: Shield, desc: "Reviewed before release" },
];

const SUGGESTED_TAGS = [
  "TikTok", "YouTube Shorts", "IG Reels", "Gaming", "Podcast",
  "Music", "Design", "AI Tools", "Automation", "Editing",
  "Thumbnails", "Captions", "Voiceover", "Branding", "Social Media",
  "Templates", "Presets", "Workflows", "Notion", "Figma",
];

/* ── Component ─────────────────────────────────────────────── */

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_amount: "",
    product_type: "clip_pack",
    delivery_type: "instant",
    tags: [] as string[],
    tagInput: "",
    access_url: "",
    file_url: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback((tag: string) => {
    setForm(prev => {
      if (prev.tags.includes(tag) || prev.tags.length >= 8) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  }, []);

  const handleTagInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = form.tagInput.trim();
      if (val) {
        addTag(val);
        setForm(prev => ({ ...prev, tagInput: "" }));
      }
    }
  }, [form.tagInput, addTag]);

  const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price_amount) {
      toast.error("Title and price are required");
      return;
    }

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
          tags: form.tags,
          media_urls: coverImage ? [coverImage] : [],
          access_url: form.access_url || null,
          file_url: form.file_url || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Product published!");
      router.push(`/dashboard/products/${data.product?.id || data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = PRODUCT_TYPES.find(t => t.value === form.product_type);
  const selectedDelivery = DELIVERY_TYPES.find(d => d.value === form.delivery_type);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
            Publish a product
          </h1>
          <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
            List it on the marketplace and start earning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── LEFT: Form ────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover image */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div className="p-5">
              <Label className="mb-3 block">Cover image</Label>
              <div
                className="relative rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150 hover:border-[var(--color-accent)]"
                style={{
                  borderColor: coverImage ? "transparent" : "var(--color-bd)",
                  backgroundColor: coverImage ? "transparent" : "var(--color-bg-inset)",
                  minHeight: coverImage ? "auto" : "160px",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {coverImage ? (
                  <div className="relative">
                    <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCoverImage(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "oklch(0 0 0 / 0.6)", color: "white" }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <ImageIcon className="h-8 w-8" style={{ color: "var(--color-fg-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--color-fg-secondary)" }}>
                      Click to upload cover image
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div>
              <Label className="mb-1.5 block">Product name</Label>
              <Input
                required
                placeholder="e.g., 50 AI-Powered Clips for TikTok"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="mt-1"
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-fg-muted)" }}>
                Make it specific. Buyers search by what they need.
              </p>
            </div>

            <div>
              <Label className="mb-1.5 block">Description</Label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                placeholder="What does the buyer get? Include deliverable format, quantity, and any requirements..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-fg-muted)" }}>
                Clear descriptions convert 3x better.
              </p>
            </div>
          </div>

          {/* Product type */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div>
              <Label className="mb-1.5 block">What are you selling?</Label>
              <p className="text-xs mb-3" style={{ color: "var(--color-fg-muted)" }}>
                Pick the category that best fits your product
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRODUCT_TYPES.map(pt => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setForm({ ...form, product_type: pt.value })}
                  className="p-3 rounded-lg text-left border transition-all duration-150"
                  style={{
                    backgroundColor: form.product_type === pt.value ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                    borderColor: form.product_type === pt.value ? "var(--color-accent)" : "var(--color-bd)",
                  }}
                >
                  <span className="text-lg block mb-1">{pt.icon}</span>
                  <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>{pt.label}</p>
                  <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--color-fg-muted)" }}>{pt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & delivery */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Price</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-fg-muted)" }}>
                    USDC
                  </span>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="49"
                    value={form.price_amount}
                    onChange={e => setForm({ ...form, price_amount: e.target.value })}
                    className="pl-12"
                    style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--color-fg-muted)" }}>
                  Payouts settle instantly on Arc
                </p>
              </div>

              <div>
                <Label className="mb-1.5 block">Delivery</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {DELIVERY_TYPES.map(dt => {
                    const Icon = dt.icon;
                    return (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => setForm({ ...form, delivery_type: dt.value })}
                        className="p-2.5 rounded-lg text-left border transition-all duration-150"
                        style={{
                          backgroundColor: form.delivery_type === dt.value ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                          borderColor: form.delivery_type === dt.value ? "var(--color-accent)" : "var(--color-bd)",
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 mb-1" style={{ color: form.delivery_type === dt.value ? "var(--color-accent)" : "var(--color-fg-muted)" }} />
                        <p className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>{dt.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <div>
              <Label className="mb-1.5 block">Tags</Label>
              <p className="text-xs mb-3" style={{ color: "var(--color-fg-muted)" }}>
                Help buyers discover your product. Press Enter to add.
              </p>
            </div>

            {/* Tag pills */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.tags.map(tag => (
                  <Badge
                    key={tag}
                    className="gap-1 px-2.5 py-1 text-xs cursor-default"
                    style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag input */}
            <Input
              placeholder={form.tags.length >= 8 ? "Max 8 tags" : "Type a tag and press Enter..."}
              value={form.tagInput}
              onChange={e => setForm({ ...form, tagInput: e.target.value })}
              onKeyDown={handleTagInput}
              disabled={form.tags.length >= 8}
              className="mt-1"
              style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
            />

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_TAGS
                .filter(t => !form.tags.includes(t))
                .slice(0, 10)
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-2.5 py-1 rounded-full text-[11px] border transition-colors duration-150"
                    style={{
                      borderColor: "var(--color-bd)",
                      color: "var(--color-fg-muted)",
                    }}
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Delivery URLs */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}
          >
            <Label className="mb-1.5 block">Delivery details</Label>
            <p className="text-xs mb-3" style={{ color: "var(--color-fg-muted)" }}>
              Where buyers get access after purchase
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>Access URL</Label>
                <Input
                  placeholder="https://notion.so/..."
                  value={form.access_url}
                  onChange={e => setForm({ ...form, access_url: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>File URL</Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={form.file_url}
                  onChange={e => setForm({ ...form, file_url: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              style={{ backgroundColor: "var(--color-accent)", minHeight: "44px" }}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Publish Product</>
              )}
            </Button>
            <Link href="/dashboard/products">
              <Button variant="outline" type="button" style={{ minHeight: "44px" }}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        {/* ── RIGHT: Sticky Preview ─────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-[72px] space-y-4">
            <ProductPreview
              title={form.title}
              description={form.description}
              price={form.price_amount}
              productType={selectedType}
              deliveryType={selectedDelivery}
              tags={form.tags}
              coverImage={coverImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
