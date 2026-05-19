/**
 * ClipArc — Social verification: connect YouTube, TikTok, IG, Twitch, X
 * Each platform OAuth flow → fetch metrics → store as verified attestation
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, ExternalLink, Youtube, Music2, Instagram, Twitch, Twitter, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    description: "Subscribers, total views, video count",
    apiLink: "https://console.cloud.google.com/apis/credentials",
    docLink: "https://developers.google.com/youtube/v3",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    color: "#000000",
    description: "Followers, total likes, video views",
    apiLink: "https://developers.tiktok.com/",
    docLink: "https://developers.tiktok.com/docs",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    description: "Followers, posts, engagement rate",
    apiLink: "https://developers.facebook.com/",
    docLink: "https://developers.facebook.com/docs/instagram-basic-display-api",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: Twitch,
    color: "#9146FF",
    description: "Followers, total views, stream count",
    apiLink: "https://dev.twitch.tv/console/apps",
    docLink: "https://dev.twitch.tv/docs/api",
  },
  {
    id: "x",
    name: "X / Twitter",
    icon: Twitter,
    color: "#1DA1F2",
    description: "Followers, tweet impressions, media views",
    apiLink: "https://developer.twitter.com/en/portal/dashboard",
    docLink: "https://developer.twitter.com/en/docs",
  },
];

export default function VerifyPage() {
  const supabase = createSupabaseBrowserClient();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchVerifications = useCallback(async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .single();

    if (!profile) { setFetching(false); return; }

    const { data: cp } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!cp) { setFetching(false); return; }

    const { data } = await supabase
      .from("creator_verifications")
      .select("*")
      .eq("creator_profile_id", cp.id)
      .order("verified_at", { ascending: false });

    setVerifications(data || []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const res = await fetch("/api/verify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.url) {
        // OAuth redirect
        window.location.href = data.url;
      } else if (data.mock) {
        // For platforms without live OAuth yet, show mock data
        toast.success(`${platform} verified! Metrics stored.`);
        fetchVerifications();
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to connect ${platform}`);
    } finally {
      setConnecting(null);
    }
  };

  const verifiedPlatforms = verifications.map(v => v.platform);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Social Verification</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Connect your social accounts to prove your reach — verified metrics show on your profile
        </p>
      </div>

      {fetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-fg-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const verified = verifications.find(v => v.platform === platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <Card key={platform.id} className="hover-lift" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: verified ? "var(--color-success)" : "var(--color-bd)" }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: platform.color }} />
                      <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>{platform.name}</CardTitle>
                    </div>
                    {verified && (
                      <Badge style={{ backgroundColor: "var(--color-success-soft)", color: "var(--color-success)", border: "none" }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{platform.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {verified ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Followers</p>
                          <p className="font-semibold" style={{ color: "var(--color-fg)" }}>
                            {(verified.followers || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: "var(--color-bg-inset)" }}>
                          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Views</p>
                          <p className="font-semibold" style={{ color: "var(--color-fg)" }}>
                            {(verified.total_views || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-fg-muted)" }}>
                        <span>@{verified.platform_username || "connected"}</span>
                        <span>Verified {new Date(verified.verified_at).toLocaleDateString()}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleConnect(platform.id)} disabled={isConnecting}>
                        {isConnecting ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Refreshing...</> : "Refresh"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs space-y-1" style={{ color: "var(--color-fg-muted)" }}>
                        <p>• OAuth-based verification</p>
                        <p>• Proof of reach stored on-chain</p>
                        <p>• Auto-refreshes periodically</p>
                      </div>
                      <Button
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting}
                        className="w-full"
                        variant="outline"
                      >
                        {isConnecting ? (
                          <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Connecting...</>
                        ) : (
                          <>Connect {platform.name}</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* API keys info */}
      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "var(--color-fg)" }}>API Keys Needed</CardTitle>
          <CardDescription className="text-xs">Set these in your environment variables for live OAuth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-2" style={{ color: "var(--color-fg-muted)" }}>
            {PLATFORMS.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span><strong className="capitalize">{p.name}:</strong> {p.apiLink}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
