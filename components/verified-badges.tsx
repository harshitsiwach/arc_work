/**
 * ClipArc — Verified Badge Display
 * Shows social verification badges for creators
 */
"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Badge } from "@/components/ui/badge";
import { Youtube, Music2, Instagram, Twitch, Twitter, Loader2 } from "lucide-react";

const PLATFORM_ICONS: Record<string, any> = {
  youtube: Youtube,
  tiktok: Music2,
  instagram: Instagram,
  twitch: Twitch,
  x: Twitter,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  tiktok: "#000000",
  instagram: "#E4405F",
  twitch: "#9146FF",
  x: "#1DA1F2",
};

interface VerifiedBadgesProps {
  creatorProfileId?: string;
  compact?: boolean;
  size?: "sm" | "md";
}

export function VerifiedBadges({ creatorProfileId, compact = false, size = "sm" }: VerifiedBadgesProps) {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorProfileId) { setLoading(false); return; }
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("creator_verifications")
      .select("*")
      .eq("creator_profile_id", creatorProfileId)
      .then(({ data }: { data: unknown[] | null }) => {
        setVerifications(data || []);
        setLoading(false);
      });
  }, [creatorProfileId]);

  if (loading) return null;
  if (verifications.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {verifications.slice(0, 3).map(v => {
          const Icon = PLATFORM_ICONS[v.platform];
          return (
            <span key={v.platform} className="inline-flex items-center gap-1 text-xs" style={{ color: PLATFORM_COLORS[v.platform] }}>
              {Icon && <Icon className="h-3 w-3" />}
              {(v.followers || 0) >= 1000
                ? `${(v.followers / 1000).toFixed(1)}K`
                : v.followers || 0}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {verifications.map(v => {
        const Icon = PLATFORM_ICONS[v.platform];
        return (
          <Badge
            key={v.platform}
            variant="outline"
            className="text-xs gap-1 px-2 py-0.5"
            style={{
              borderColor: `${PLATFORM_COLORS[v.platform]}40`,
              color: PLATFORM_COLORS[v.platform],
            }}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {(v.followers || 0).toLocaleString()} followers
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Fetches creator_profile_id from a creator's auth_user_id
 * Use when you only have the auth user ID and need badges
 */
export function useCreatorProfileId(authUserId?: string) {
  const [cpId, setCpId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUserId) { setLoading(false); return; }
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single()
      .then(({ data: profile }: { data: { id: string } | null }) => {
        if (!profile) { setLoading(false); return; }
        supabase
          .from("creator_profiles")
          .select("id")
          .eq("profile_id", profile.id)
          .single()
          .then(({ data: cp }: { data: { id: string } | null }) => {
            setCpId(cp?.id || null);
            setLoading(false);
          });
      });
  }, [authUserId]);

  return { creatorProfileId: cpId, loading };
}
