/**
 * ClipArc — Profile Edit Form (inline)
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export function ProfileEditForm({ profile }: { profile: any }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    avatar_url: profile?.avatar_url || "",
    website: profile?.website || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setEditing(true)}>
        <Settings className="h-3 w-3 mr-1" />
        Edit Profile
      </Button>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-lg space-y-3" style={{ backgroundColor: "var(--color-bg-inset)" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>Edit Profile</p>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Display Name</Label>
          <Input size={1} value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Website</Label>
          <Input size={1} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" className="mt-1 text-sm" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Bio</Label>
        <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1" rows={2}
          style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }}
          value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Avatar URL</Label>
        <Input size={1} value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://" className="mt-1 text-sm" />
      </div>
      <Button onClick={handleSave} disabled={loading} size="sm">
        {loading ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving...</> : <><CheckCircle2 className="mr-1 h-3 w-3" /> Save</>}
      </Button>
    </div>
  );
}
