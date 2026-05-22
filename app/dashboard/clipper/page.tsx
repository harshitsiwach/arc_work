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
import {
  Loader2,
  Youtube,
  Twitch as TwitchIcon,
  Scissors,
  Clock,
  ExternalLink,
  Bot,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

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
  const supabase = createSupabaseBrowserClient();

  // Basic video state
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<VideoSource>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [twitchInfo, setTwitchInfo] = useState<{ type: "video" | "channel"; id: string } | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipping, setClipping] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // User Profile and Connected Socials
  const [profile, setProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loadingSocials, setLoadingSocials] = useState(true);

  // Billing / Free Clipper state
  const [isFree, setIsFree] = useState(false);

  // Commissioning Form States
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [instructions, setInstructions] = useState("");
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [showCommissionForm, setShowCommissionForm] = useState(false);

  // Escrow & Agent execution states
  const [executingState, setExecutingState] = useState<
    "idle" | "deploying" | "depositing" | "processing" | "completed" | "failed"
  >("idle");
  const [currentStepMessage, setCurrentStepMessage] = useState("");
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [processResult, setProcessResult] = useState<{
    videoUrl: string;
    transcript: string;
    socialPosts: { platform: string; url: string; postedAt: string }[];
  } | null>(null);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isUpdatingTranscript, setIsUpdatingTranscript] = useState(false);
  const [postingToPlatform, setPostingToPlatform] = useState<string | null>(null);

  // Load User details and connected social channels
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .single();
        if (!prof) return;
        setProfile(prof);

        const { data: cp } = await supabase
          .from("creator_profiles")
          .select("id")
          .eq("profile_id", prof.id)
          .single();
        if (!cp) return;
        setCreatorProfile(cp);

        const { data: verifs } = await supabase
          .from("creator_verifications")
          .select("*")
          .eq("creator_profile_id", cp.id);
        
        if (verifs) {
          setVerifications(verifs);
        }
      } catch (err) {
        console.error("Error loading socials/verifications:", err);
      } finally {
        setLoadingSocials(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  // Handle standard browser clip and open
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

  // Commission Agent Flow
  const handleCommissionAgent = async () => {
    setExecutingState("deploying");
    setProcessResult(null);
    const toastId = toast.loading("Initiating agent commission...");
    
    try {
      // 1. Commission Agent (Deploys Escrow Contract)
      setCurrentStepMessage(
        isFree
          ? "1/3: Initializing Free Clipper..."
          : "1/3: Deploying new Refund Protocol Escrow contract on Base..."
      );
      const commissionRes = await fetch("/api/clipper/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          startTime,
          endTime,
          targetLanguage,
          instructions,
          socials: selectedSocials,
          isFree,
        }),
      });
      
      const commissionData = await commissionRes.json();
      if (!commissionRes.ok || commissionData.error) {
        throw new Error(commissionData.error || "Failed to commission agent");
      }

      const { agreementId: newAgreementId, circleContractId, circleTransactionId } = commissionData;
      setAgreementId(newAgreementId);
      setContractId(circleContractId);

      if (isFree) {
        // If it's free, skip deployment confirmation and skip deposit step!
        setExecutingState("processing");
        setCurrentStepMessage("3/3: Free AI Agent clipping video, transcribing with Whisper, and posting clips...");
        toast.loading("Free AI Agent processing clip, transcribing & sharing...", { id: toastId });

        const processRes = await fetch("/api/clipper/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agreementId: newAgreementId }),
        });
        const processData = await processRes.json();
        if (!processRes.ok || processData.error) {
          throw new Error(processData.error || "AI processing failed");
        }

        // Done!
        setProcessResult({
          videoUrl: processData.videoUrl,
          transcript: processData.transcript,
          socialPosts: processData.socialPosts || [],
        });
        setEditedTranscript(processData.transcript);
        setExecutingState("completed");
        toast.success("AI Agent successfully clipped, transcribed, and posted your video!", { id: toastId });
        return;
      }

      // Poll transaction status for deployment
      let deployed = false;
      let checkAttempts = 0;
      while (!deployed && checkAttempts < 30) {
        setCurrentStepMessage(`1/3: Deploying escrow contract (waiting for chain confirmation, attempt ${checkAttempts + 1}/30)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const statusRes = await fetch(`/api/contracts/escrow?id=${circleTransactionId}`);
        const statusData = await statusRes.json();
        if (statusData.status === "COMPLETE") {
          deployed = true;
        } else if (statusData.status === "FAILED") {
          throw new Error("Escrow contract deployment failed on-chain");
        }
        checkAttempts++;
      }
      if (!deployed) {
        throw new Error("Timeout waiting for escrow contract deployment");
      }

      // 2. Deposit Escrow Funds
      setExecutingState("depositing");
      setCurrentStepMessage("2/3: Depositing 5.00 USDC into the escrow contract...");
      toast.loading("Depositing 5.00 USDC to escrow contract...", { id: toastId });

      const depositRes = await fetch("/api/contracts/escrow/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleContractId }),
      });
      const depositData = await depositRes.json();
      if (!depositRes.ok || depositData.error) {
        throw new Error(depositData.error || "Failed to deposit funds to escrow");
      }

      const depositTxId = depositData.transactionId;

      // Poll transaction status for deposit
      let deposited = false;
      checkAttempts = 0;
      while (!deposited && checkAttempts < 30) {
        setCurrentStepMessage(`2/3: Confirming USDC deposit (waiting for chain confirmation, attempt ${checkAttempts + 1}/30)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const statusRes = await fetch(`/api/contracts/escrow?id=${depositTxId}`);
        const statusData = await statusRes.json();
        if (statusData.status === "COMPLETE") {
          deposited = true;
        } else if (statusData.status === "FAILED") {
          throw new Error("USDC deposit transaction failed on-chain");
        }
        checkAttempts++;
      }
      if (!deposited) {
        throw new Error("Timeout waiting for USDC deposit transaction");
      }

      // 3. Process video segment and release funds
      setExecutingState("processing");
      setCurrentStepMessage("3/3: AI Agent clipping video, transcribing with Whisper, posting clips, and releasing escrow...");
      toast.loading("AI Agent processing clip, transcribing & sharing...", { id: toastId });

      const processRes = await fetch("/api/clipper/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleContractId }),
      });
      const processData = await processRes.json();
      if (!processRes.ok || processData.error) {
        throw new Error(processData.error || "AI processing failed");
      }

      // Done!
      setProcessResult({
        videoUrl: processData.videoUrl,
        transcript: processData.transcript,
        socialPosts: processData.socialPosts || [],
      });
      setEditedTranscript(processData.transcript);
      setExecutingState("completed");
      toast.success("AI Agent successfully clipped, transcribed, and posted your video!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      setExecutingState("failed");
      setCurrentStepMessage(`Error: ${err.message || "Execution failed"}`);
      toast.error(err.message || "AI commissioning failed", { id: toastId });
    }
  };

  // Update Transcript Captions in Database
  const handleUpdateTranscript = async () => {
    if (!agreementId) return;
    setIsUpdatingTranscript(true);
    const toastId = toast.loading("Saving transcript updates...");
    try {
      const res = await fetch("/api/clipper/update-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId,
          transcript: editedTranscript,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update transcript");
      }
      toast.success("Transcript updated successfully", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to update transcript", { id: toastId });
    } finally {
      setIsUpdatingTranscript(false);
    }
  };

  // Trigger post-facto social shares
  const handlePostSocial = async (platform: string) => {
    if (!agreementId) return;
    setPostingToPlatform(platform);
    const toastId = toast.loading(`Posting clip to ${platform}...`);
    try {
      const res = await fetch("/api/clipper/post-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId,
          platform,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to post to ${platform}`);
      }
      
      // Update processResult socials locally
      if (processResult) {
        setProcessResult({
          ...processResult,
          socialPosts: [...processResult.socialPosts, data.post],
        });
      }
      
      toast.success(`Successfully shared to ${platform}!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || `Failed to share to ${platform}`, { id: toastId });
    } finally {
      setPostingToPlatform(null);
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
      return;
    }
    toast.error("Could not parse URL. Use a YouTube or Twitch link.");
  };

  // YouTube player ready
  useEffect(() => {
    if (source !== "youtube" || !videoId) return;
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

          {/* Sidebar — Commission Form & Progress */}
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
                    className="w-full text-xs" 
                    size="sm" 
                    style={{ backgroundColor: "var(--color-accent)", color: "white" }}
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
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-xs" 
                    size="sm"
                    onClick={() => setShowCommissionForm(true)}
                    disabled={showCommissionForm || executingState !== "idle"}
                  >
                    <Bot className="mr-2 h-4 w-4 text-[var(--color-accent)]" />
                    Commission AI Clipper
                  </Button>

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

            {/* Settings Form */}
            {showCommissionForm && executingState === "idle" && (
              <Card className="animate-fade-in-up" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                    <Bot className="h-4 w-4 text-[var(--color-accent)]" />
                    Commission Settings
                  </CardTitle>
                  <CardDescription className="text-xs">Configure the AI Agent's tasks & escrow parameters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Language */}
                  <div className="space-y-1.5">
                    <Label htmlFor="lang" className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Target Language</Label>
                    <select
                      id="lang"
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full text-sm bg-transparent rounded-md border p-2 focus:outline-none focus:ring-1"
                      style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)", backgroundColor: "var(--color-bg-inset)" }}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <Label htmlFor="instructions" className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Agent Instructions</Label>
                    <textarea
                      id="instructions"
                      placeholder="e.g. Focus on coding demo, crop vertical, highlight the best quote..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      className="w-full text-sm bg-transparent rounded-md border p-2 focus:outline-none focus:ring-1"
                      style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)", backgroundColor: "var(--color-bg-inset)" }}
                    />
                  </div>

                  {/* Social sharing */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Post to Socials</Label>
                    {loadingSocials ? (
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading connected socials...
                      </div>
                    ) : verifications.length === 0 ? (
                      <div className="p-2.5 rounded text-[11px] border leading-normal" style={{ backgroundColor: "var(--color-warning-soft)", borderColor: "var(--color-warning)", color: "var(--color-warning)" }}>
                        No social accounts verified. Visit <Link href="/dashboard/verify" className="underline font-semibold">Verify</Link> to connect your socials and enable auto-posting.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {verifications.map((v) => (
                          <label key={v.platform} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--color-fg)" }}>
                            <input
                              type="checkbox"
                              checked={selectedSocials.includes(v.platform)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSocials([...selectedSocials, v.platform]);
                                } else {
                                  setSelectedSocials(selectedSocials.filter((s) => s !== v.platform));
                                }
                              }}
                              className="rounded border"
                              style={{ borderColor: "var(--color-bd)", accentColor: "var(--color-accent)" }}
                            />
                            <span className="capitalize">{v.platform} (@{v.platform_username || "connected"})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Clipper Billing Mode Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Agent Billing Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFree(false)}
                        className="p-2 text-left rounded-md border transition-all"
                        style={{
                          borderColor: !isFree ? "var(--color-accent)" : "var(--color-bd)",
                          backgroundColor: !isFree ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                        }}
                      >
                        <p className="text-xs font-bold" style={{ color: !isFree ? "var(--color-accent)" : "var(--color-fg)" }}>Smart Escrow</p>
                        <p className="text-[10px]" style={{ color: "var(--color-fg-secondary)" }}>5.00 USDC Budget</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFree(true)}
                        className="p-2 text-left rounded-md border transition-all"
                        style={{
                          borderColor: isFree ? "var(--color-accent)" : "var(--color-bd)",
                          backgroundColor: isFree ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
                        }}
                      >
                        <p className="text-xs font-bold" style={{ color: isFree ? "var(--color-accent)" : "var(--color-fg)" }}>Free Clipper</p>
                        <p className="text-[10px]" style={{ color: "var(--color-fg-secondary)" }}>0.00 USDC Budget</p>
                      </button>
                    </div>
                  </div>

                  {/* Budget details */}
                  <div className="p-3 rounded border space-y-1" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-fg-secondary)" }}>Commission Budget</span>
                      <span className="font-semibold" style={{ color: "var(--color-accent)" }}>{isFree ? "0.00 USDC" : "5.00 USDC"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-fg-secondary)" }}>Protocol Fee</span>
                      <span className="font-semibold" style={{ color: "var(--color-success)" }}>0.00 USDC</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => setShowCommissionForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                      onClick={handleCommissionAgent}
                    >
                      {isFree ? "Hire Clipper" : "Deploy & Hire"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stepper progress */}
            {executingState !== "idle" && (
              <Card className="animate-fade-in-up" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: "var(--color-fg)" }}>
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
                    Agent Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Steps */}
                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="flex items-start gap-2.5 text-xs">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shrink-0 animate-fade-in"
                        style={{
                          backgroundColor:
                            isFree
                              ? "var(--color-success)"
                              : (executingState === "deploying"
                                  ? "var(--color-accent)"
                                  : executingState !== "failed"
                                  ? "var(--color-success)"
                                  : "var(--color-bg-inset)"),
                          color:
                            isFree || executingState === "deploying" || executingState !== "failed"
                              ? "white"
                              : "var(--color-fg-muted)",
                          border: isFree || executingState === "deploying" ? "none" : "1px solid var(--color-bd)",
                        }}
                      >
                        1
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold" style={{ color: "var(--color-fg)" }}>Deploy Escrow Contract</p>
                        <p style={{ color: "var(--color-fg-muted)", fontSize: "10px" }}>
                          {isFree ? "Skipped (Free Clipper)" : (
                            executingState === "deploying"
                              ? "Deploying RefundProtocol.sol smart contract on Base..."
                              : executingState === "failed"
                              ? "Deployment failed"
                              : "Escrow deployed"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-2.5 text-xs">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shrink-0"
                        style={{
                          backgroundColor:
                            isFree
                              ? "var(--color-success)"
                              : (executingState === "depositing"
                                  ? "var(--color-accent)"
                                  : executingState === "processing" || executingState === "completed"
                                  ? "var(--color-success)"
                                  : "var(--color-bg-inset)"),
                          color:
                            isFree || executingState === "depositing" || executingState === "processing" || executingState === "completed"
                              ? "white"
                              : "var(--color-fg-muted)",
                          border: isFree || executingState === "depositing" ? "none" : "1px solid var(--color-bd)",
                        }}
                      >
                        2
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold" style={{ color: "var(--color-fg)" }}>Deposit 5.00 USDC</p>
                        <p style={{ color: "var(--color-fg-muted)", fontSize: "10px" }}>
                          {isFree ? "Skipped (Free Clipper)" : (
                            executingState === "depositing"
                              ? "Depositing 5 USDC from user smart wallet..."
                              : executingState === "processing" || executingState === "completed"
                              ? "Deposited successfully"
                              : "Waiting"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-2.5 text-xs">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] mt-0.5 shrink-0"
                        style={{
                          backgroundColor:
                            executingState === "processing"
                              ? "var(--color-accent)"
                              : executingState === "completed"
                              ? "var(--color-success)"
                              : "var(--color-bg-inset)",
                          color:
                            executingState === "processing" || executingState === "completed"
                              ? "white"
                              : "var(--color-fg-muted)",
                          border: executingState === "processing" ? "none" : "1px solid var(--color-bd)",
                        }}
                      >
                        3
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold" style={{ color: "var(--color-fg)" }}>
                          {isFree ? "Process Clip" : "Process & Release Escrow"}
                        </p>
                        <p style={{ color: "var(--color-fg-muted)", fontSize: "10px" }}>
                          {executingState === "processing"
                            ? (isFree
                                ? "Agent running yt-dlp, Whisper transcription, and simulated posting..."
                                : "Agent running yt-dlp, Whisper transcription, simulated posting & auto-withdrawing...")
                            : executingState === "completed"
                            ? (isFree
                                ? "Done! Clip successfully processed"
                                : "Done! Escrow released to agent")
                            : "Waiting"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="p-2.5 rounded text-[11px] font-mono whitespace-pre-wrap break-all leading-relaxed" style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-fg-secondary)", border: "1px solid var(--color-bd)" }}>
                    {currentStepMessage || "Initializing..."}
                  </div>

                  {/* Retry or Reset */}
                  {(executingState === "failed" || executingState === "completed") && (
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        setExecutingState("idle");
                        setShowCommissionForm(false);
                      }}
                    >
                      {executingState === "failed" ? "Retry Commission" : "Commission New Clip"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* How it works */}
            {!showCommissionForm && executingState === "idle" && (
              <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                <CardContent className="p-4 text-xs space-y-2.5" style={{ color: "var(--color-fg-secondary)" }}>
                  <p className="flex items-center gap-2 font-medium" style={{ color: "var(--color-fg)" }}>How Agent Commissioning Works:</p>
                  <p className="flex items-start gap-2 leading-relaxed">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>1</span>
                    Specify parameters like target language and instructions.
                  </p>
                  <p className="flex items-start gap-2 leading-relaxed">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>2</span>
                    A dedicated USDC escrow contract is deployed to secure the agent's work.
                  </p>
                  <p className="flex items-start gap-2 leading-relaxed">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>3</span>
                    The AI agent completes video clipping, transcription, and social shares.
                  </p>
                  <p className="flex items-start gap-2 leading-relaxed">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>4</span>
                    Upon successful processing, the escrowed funds are automatically released to the agent.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Commission Results Section */}
      {processResult && (
        <Card className="animate-fade-in-up" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[var(--color-accent)] animate-bounce" />
              <div>
                <CardTitle className="text-base" style={{ color: "var(--color-fg)" }}>
                  AI Agent Deliverables
                </CardTitle>
                <CardDescription className="text-xs">
                  {contractId === "free-clipper" ? (
                    <>Free Clipper Agent • Agreement ID: <span className="font-mono text-xs" style={{ color: "var(--color-fg)" }}>{agreementId}</span></>
                  ) : (
                    <>Escrow Contract: <span className="font-mono text-xs" style={{ color: "var(--color-fg)" }}>{contractId}</span> • 
                    Agreement ID: <span className="font-mono text-xs" style={{ color: "var(--color-fg)" }}>{agreementId}</span></>
                  )}
                </CardDescription>
              </div>
              <Badge className="ml-auto" style={{ backgroundColor: "var(--color-success-soft)", color: "var(--color-success)", border: "none" }}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {contractId === "free-clipper" ? "Agreement Closed (Free Clipper Done)" : "Agreement Closed (Escrow Released)"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Processed Clip */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Processed Clip Player</Label>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-bd)" }}>
                <video src={processResult.videoUrl} controls className="w-full h-full" />
              </div>
              <div>
                <a href={processResult.videoUrl} download className="block">
                  <Button variant="outline" className="w-full text-xs">
                    Download Completed Clip (MP4)
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Col: Caption Editor & Posting Center */}
            <div className="space-y-4">
              {/* Editable Transcript */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Editable Captions / Transcription</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={handleUpdateTranscript}
                    disabled={isUpdatingTranscript}
                  >
                    {isUpdatingTranscript ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Save Transcript Changes
                  </Button>
                </div>
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  rows={5}
                  className="w-full text-sm bg-transparent rounded-md border p-2 focus:outline-none focus:ring-1 font-mono leading-relaxed"
                  style={{ borderColor: "var(--color-bd)", color: "var(--color-fg)", backgroundColor: "var(--color-bg-inset)" }}
                />
              </div>

              {/* Social Posting Hub */}
              <div className="space-y-2.5 border-t pt-3" style={{ borderColor: "var(--color-bd)" }}>
                <Label className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Social Auto-Posting Status</Label>
                <div className="space-y-2">
                  {["X", "YouTube", "Instagram"].map((plat) => {
                    const post = processResult.socialPosts.find(p => p.platform.toLowerCase() === plat.toLowerCase());
                    const isPosting = postingToPlatform?.toLowerCase() === plat.toLowerCase();
                    
                    return (
                      <div key={plat} className="flex items-center justify-between p-2.5 rounded text-xs" style={{ backgroundColor: "var(--color-bg-inset)", border: "1px solid var(--color-bd)" }}>
                        <span className="font-semibold" style={{ color: "var(--color-fg)" }}>{plat}</span>
                        {post ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>
                              Posted {new Date(post.postedAt).toLocaleTimeString()}
                            </span>
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[var(--color-accent)] hover:underline font-medium">
                              View Post <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px]"
                            disabled={!!postingToPlatform}
                            onClick={() => handlePostSocial(plat)}
                          >
                            {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                            Share to {plat}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
