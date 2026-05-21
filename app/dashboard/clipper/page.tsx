/**
 * ClipArc — In-App Video Clipper
 * Paste any YouTube/Twitch URL → watch → pick timestamps → commission an AI agent
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Youtube, Twitch as TwitchIcon, Scissors, Clock, ExternalLink, Bot, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type VideoSource = "youtube" | "twitch" | null;

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseTwitchId(url: string): { type: "video" | "channel"; id: string } | null {
  const videoMatch = url.match(/(?:twitch\.tv\/videos\/)(\d+)/);
  if (videoMatch) return { type: "video", id: videoMatch[1] };
  const channelMatch = url.match(/(?:twitch\.tv\/)(\w+)/);
  if (channelMatch) return { type: "channel", id: channelMatch[1] };
  return null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ClipperPage() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<VideoSource>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [twitchInfo, setTwitchInfo] = useState<{ type: "video" | "channel"; id: string } | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipping, setClipping] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const handleClipAndOpen = async () => {
    setClipping(true);
    const toastId = toast.loading("Downloading and clipping video segment...");
    try {
      const res = await fetch("/api/clipper/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to clip video");
      }

      toast.success("Video segment clipped successfully!", { id: toastId });
      
      const fileUrl = `${window.location.origin}${data.fileUrl}`;
      const editorBase = process.env.NEXT_PUBLIC_EDITOR_URL || 'http://localhost:5174';
      const editorUrl = `${editorBase}/#/editor?importUrl=${encodeURIComponent(fileUrl)}&importName=${encodeURIComponent(data.filename)}`;
      window.open(editorUrl, "_blank");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download and clip video", { id: toastId });
    } finally {
      setClipping(false);
    }
  };

  // Parse URL
  const handleParse = () => {
    const ytId = parseYouTubeId(url);
    if (ytId) {
      setSource("youtube");
      setVideoId(ytId);
      setTwitchInfo(null);
      setStartTime(0);
      setEndTime(30);
      setDuration(0);
      setPlaying(false);
      return;
    }
    const twInfo = parseTwitchId(url);
    if (twInfo) {
      setSource("twitch");
      setTwitchInfo(twInfo);
      setVideoId(null);
      setStartTime(0);
      setEndTime(30);
      setDuration(0);
      setPlaying(false);
      return;
    }
    toast.error("Could not parse URL. Use a YouTube or Twitch link.");
  };

  // YouTube player ready
  useEffect(() => {
    if (source !== "youtube" || !videoId) return;
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
    }
    const onReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        height: "100%",
        width: "100%",
        playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
          },
        },
      });
      if (onReady) onReady();
    };
    // If API already loaded
    if ((window as any).YT?.Player) {
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        height: "100%",
        width: "100%",
        playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
        events: {
          onReady: (e: any) => setDuration(e.target.getDuration()),
        },
      });
    }
    return () => { playerRef.current = null; };
  }, [source, videoId]);

  // Track current time for YouTube
  useEffect(() => {
    if (source !== "youtube" || !playerRef.current) return;
    intervalRef.current = setInterval(() => {
      try {
        const t = playerRef.current?.getCurrentTime?.();
        if (t !== undefined) setCurrentTime(t);
      } catch {}
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [source]);

  const seekTo = (seconds: number) => {
    if (source === "youtube" && playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  };

  const markStart = () => {
    setStartTime(Math.floor(currentTime));
    toast.success(`Start set at ${formatTime(currentTime)}`);
  };

  const markEnd = () => {
    setEndTime(Math.floor(currentTime));
    toast.success(`End set at ${formatTime(currentTime)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Clipper</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Paste any YouTube or Twitch link, set timestamps, and commission an AI agent to clip it
        </p>
      </div>

      {/* URL input */}
      <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Paste YouTube or Twitch URL..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleParse()}
              />
            </div>
            <Button onClick={handleParse} disabled={!url.trim()}>
              Load Video
            </Button>
          </div>
          <div className="flex gap-3 mt-2 text-xs" style={{ color: "var(--color-fg-muted)" }}>
            <span className="flex items-center gap-1"><Youtube className="h-3 w-3" /> youtube.com/watch?v=...</span>
            <span className="flex items-center gap-1"><TwitchIcon className="h-3 w-3" /> twitch.tv/videos/... or twitch.tv/channel</span>
          </div>
        </CardContent>
      </Card>

      {/* Video Player + Clipper */}
      {source && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video embed */}
          <div className="lg:col-span-2 space-y-4">
            <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardContent className="p-0 overflow-hidden rounded-xl">
                {source === "youtube" && videoId && (
                  <div className="aspect-video bg-black" id="yt-player" />
                )}
                {source === "twitch" && twitchInfo && (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`https://player.twitch.tv/?${twitchInfo.type === "video" ? `video=${twitchInfo.id}` : `channel=${twitchInfo.id}`}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}&autoplay=false`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback controls */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-2 rounded-full relative cursor-pointer" style={{ backgroundColor: "var(--color-bg-inset)" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  const t = pct * (duration || 60);
                  seekTo(t);
                }}>
                {/* Start marker */}
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 cursor-pointer"
                  style={{ left: `${(startTime / (duration || 60)) * 100}%`, backgroundColor: "var(--color-accent)" }} />
                {/* End marker */}
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 cursor-pointer"
                  style={{ left: `${(endTime / (duration || 60)) * 100}%`, backgroundColor: "var(--color-error)" }} />
                {/* Progress fill */}
                <div className="h-full rounded-full transition-all" style={{ width: `${(currentTime / (duration || 60)) * 100}%`, backgroundColor: "var(--color-accent)", opacity: 0.5 }} />
              </div>
              <span className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--color-fg-muted)" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Timestamp markers */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markStart}>
                <Clock className="h-3 w-3 mr-1" />
                Mark Start
              </Button>
              <Button variant="outline" size="sm" onClick={markEnd}>
                <Clock className="h-3 w-3 mr-1" />
                Mark End
              </Button>
              <div className="ml-auto text-xs font-mono" style={{ color: "var(--color-fg-secondary)" }}>
                {formatTime(startTime)} — {formatTime(endTime)} 
                <span className="ml-1" style={{ color: "var(--color-accent)" }}>({formatTime(endTime - startTime)})</span>
              </div>
            </div>
          </div>

          {/* Sidebar — Commission */}
          <div className="space-y-4">
            {/* Clip summary */}
            <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                  <Scissors className="h-4 w-4" />
                  Clip Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-fg-muted)" }}>Source</span>
                    <span className="flex items-center gap-1 font-medium" style={{ color: "var(--color-fg)" }}>
                      {source === "youtube" ? <Youtube className="h-3 w-3" /> : <TwitchIcon className="h-3 w-3" />}
                      {source === "youtube" ? "YouTube" : "Twitch"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-fg-muted)" }}>Length</span>
                    <span className="font-medium" style={{ color: "var(--color-fg)" }}>{formatTime(endTime - startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-fg-muted)" }}>Start</span>
                    <span className="font-medium" style={{ color: "var(--color-fg)" }}>{formatTime(startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-fg-muted)" }}>End</span>
                    <span className="font-medium" style={{ color: "var(--color-fg)" }}>{formatTime(endTime)}</span>
                  </div>
                </div>

                  <div className="border-t pt-3 space-y-2" style={{ borderColor: "var(--color-bd)" }}>
                    <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Automated Editing Options</p>
                    
                    <Button 
                      className="w-full" 
                      size="sm" 
                      style={{ backgroundColor: "var(--color-accent)" }}
                      onClick={handleClipAndOpen}
                      disabled={clipping}
                    >
                      {clipping ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Scissors className="mr-2 h-4 w-4" />
                      )}
                      Clip & Open in Editor
                    </Button>
                    
                    <Link href="/dashboard/agents">
                      <Button variant="outline" className="w-full" size="sm">
                        <Bot className="mr-2 h-4 w-4" />
                        Commission AI Clipper
                      </Button>
                    </Link>

                    <a
                      href={`${process.env.NEXT_PUBLIC_EDITOR_URL || 'http://localhost:5174'}/#/editor`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="ghost" className="w-full text-xs" size="sm">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Open Editor (Empty)
                      </Button>
                    </a>
                  </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
              <CardContent className="p-4 text-xs space-y-2" style={{ color: "var(--color-fg-secondary)" }}>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>1</span>
                  Paste a YouTube/Twitch URL
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>2</span>
                  Watch the video and mark start/end timestamps
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>3</span>
                  Commission an AI agent to cut your clip
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>4</span>
                  Agent delivers your MP4 in minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
