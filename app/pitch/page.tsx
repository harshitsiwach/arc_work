/**
 * Arc Work — Interactive Pitch Presentation
 * Widescreen investor-ready slides with interactive calculators, charts, and architectural walkthroughs.
 */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Shield,
  Bot,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Users,
  Coins,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
  Globe2,
  Building,
  Key,
  Compass,
  Briefcase,
  GraduationCap,
  Wrench,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Slide Data Structure
const SLIDES_COUNT = 8;

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, SLIDES_COUNT - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, SLIDES_COUNT - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Render different slides based on index
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return <SlideExecutiveSummary />;
      case 1:
        return <SlideTheProblem />;
      case 2:
        return <SlideTheSolution />;
      case 3:
        return <SlideProductVerticals />;
      case 4:
        return <SlideArchitecture />;
      case 5:
        return <SlideMarketOpportunity />;
      case 6:
        return <SlideBusinessModel />;
      case 7:
        return <SlideRoadmap />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-4">
      {/* Deck Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Arc Work Investor Pitch
          </span>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
            The On-chain Operating System for Creators & AI Workers
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Slide {currentSlide + 1} of {SLIDES_COUNT}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[var(--color-bd)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--color-accent)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentSlide + 1) / SLIDES_COUNT) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Slide Container (16:9 ratio wrapper) */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 min-h-[560px] flex flex-col justify-between transition-colors duration-300"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-bd)",
        }}
      >
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            opacity: 0.015,
          }}
        />

        {/* Slide contents wrapper */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col"
            >
              {renderSlideContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Controls Footer */}
        <div className="relative z-10 flex items-center justify-between border-t pt-4 mt-6" style={{ borderColor: "var(--color-bd)" }}>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === i ? "bg-[var(--color-accent)] w-6" : "bg-[var(--color-fg-muted)] hover:bg-[var(--color-fg-secondary)]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="gap-1"
            >
              <ChevronLeft size={16} />
              Back
            </Button>
            <Button
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === SLIDES_COUNT - 1}
              className="gap-1"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Helpful tips */}
      <p className="text-center text-xs" style={{ color: "var(--color-fg-muted)" }}>
        Tip: You can use the left and right arrow keys or spacebar to navigate the presentation slides.
      </p>
    </div>
  );
}

/* ── SLIDE 1: Cover / Executive Summary ────────────────────────────────── */
function SlideExecutiveSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
      <div className="space-y-6">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
        >
          <Sparkles size={12} className="animate-pulse" />
          The Future of Remote Work
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none" style={{ color: "var(--color-fg)" }}>
          Arc Work
        </h2>
        <p className="text-lg leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
          A high-performance consumer on-chain network powering next-generation creative careers, automated freelancing escrows, and leaseable autonomous AI agents.
        </p>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Platform Fee</p>
            <p className="text-2xl font-bold tracking-tight mt-1" style={{ color: "var(--color-success)" }}>2.5%</p>
            <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>On payouts</span>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Settlements</p>
            <p className="text-2xl font-bold tracking-tight mt-1" style={{ color: "var(--color-fg)" }}>&lt; 1s</p>
            <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Deterministic finality</span>
          </div>
          <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Users Onboarded</p>
            <p className="text-2xl font-bold tracking-tight mt-1" style={{ color: "var(--color-accent)" }}>2.8K+</p>
            <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Creators & agents</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center">
        <div
          className="relative w-64 h-64 rounded-full flex items-center justify-center border"
          style={{
            borderColor: "var(--color-bd)",
            background: "radial-gradient(circle, var(--color-accent-soft) 0%, transparent 70%)",
          }}
        >
          <div className="absolute inset-4 rounded-full border border-dashed animate-[spin_60s_linear_infinite]" style={{ borderColor: "var(--color-bd)" }} />
          <div className="absolute inset-10 rounded-full border border-dashed animate-[spin_40s_linear_infinite_reverse]" style={{ borderColor: "var(--color-bd)" }} />
          
          <div className="relative z-10 text-center">
            <Coins size={44} className="mx-auto mb-2 text-[var(--color-accent)] animate-bounce-slow" />
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-fg)" }}>Arc L2 Core</p>
            <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>Circle USDC Rails</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SLIDE 2: The Problem ──────────────────────────────────────────────── */
function SlideTheProblem() {
  const problems = [
    {
      title: "Exorbitant Platform Margins",
      desc: "Legacy networks like Upwork, Fiverr, and Whop extract 10% to 30% of creator earnings, plus add hefty FX conversion surcharges.",
      icon: DollarSign,
      color: "oklch(0.55 0.20 30)",
    },
    {
      title: "Arbitrary Payout Holds",
      desc: "Earnings are frozen in central corporate bank accounts for 7 to 14 business days, creating cash flow friction for global contractors.",
      icon: Shield,
      color: "oklch(0.60 0.16 80)",
    },
    {
      title: "Locked-In Reputation Silos",
      desc: "A creator's client feedback, metrics, and transaction history are owned by individual platforms, trapping them due to high switching costs.",
      icon: Users,
      color: "oklch(0.50 0.18 260)",
    },
    {
      title: "AI Agents Excluded from Rails",
      desc: "Autonomous software workers cannot register bank accounts, hold digital dollars, negotiate contracts, or verify deliveries programmatically.",
      icon: Bot,
      color: "oklch(0.55 0.18 150)",
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55 0.20 30)]">The Bottleneck</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          Centralized Bottlenecks Limiting Creator & Gig Growth
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {problems.map((p, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border flex gap-4 transition-all duration-200 hover:scale-[1.01]"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              borderColor: "var(--color-bd)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${p.color} / 0.1` }}
            >
              <p.icon size={20} style={{ color: p.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--color-fg)" }}>
                {p.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SLIDE 3: The Solution ─────────────────────────────────────────────── */
function SlideTheSolution() {
  const solutions = [
    {
      title: "Instant 2.5% USDC Settlement",
      desc: "Gas-less transfers routed via Circle developer-controlled wallets settle in <1 second directly to independent freelancers.",
      icon: Coins,
      color: "oklch(0.55 0.18 150)",
    },
    {
      title: "Smart Escrows (EIP-712)",
      desc: "Safe, programmatic trust agreements holding milestone deposits that payout automatically when terms are satisfied.",
      icon: Shield,
      color: "oklch(0.55 0.18 150)",
    },
    {
      title: "AI-Powered Deliverable Audit",
      desc: "Integrates OpenAI Vision APIs to inspect code, visual assets, or transcripts automatically before releasing funds.",
      icon: Cpu,
      color: "oklch(0.55 0.18 150)",
    },
    {
      title: "Open, Portable Identity Registry",
      desc: "Reputation, reviews, and transaction volumes are stored as standard smart contract metadata, portable anywhere on-chain.",
      icon: Layers,
      color: "oklch(0.55 0.18 150)",
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-success)]">The Breakthrough</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          Frictionless Payments, Trustless Audits, Open Autonomy
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {solutions.map((s, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border flex gap-4 transition-all duration-200 hover:scale-[1.01]"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              borderColor: "oklch(0.55 0.18 150 / 0.3)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${s.color} / 0.1` }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--color-fg)" }}>
                {s.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SLIDE 4: Key Product Verticals ────────────────────────────────────── */
function SlideProductVerticals() {
  const [activeTab, setActiveTab] = useState(0);

  const verticals = [
    {
      id: "explore",
      title: "Digital Products",
      route: "/explore",
      icon: Compass,
      sub: "Asset Marketplace",
      desc: "Browse and instantly unlock code templates, design assets, presets, and automation plugins. Delivery is immediate upon purchase transaction approval.",
      details: [
        "Pay via USDC or EURC on-chain",
        "Direct creator-to-buyer transactions",
        "Immutable product validation logs",
      ],
    },
    {
      id: "gigs",
      title: "Freelance Gigs",
      route: "/dashboard/marketplace",
      icon: Briefcase,
      sub: "Escrow-Backed Jobs",
      desc: "Post specialized creative requirements or apply to gigs. Contracts utilize EIP-712 cryptographic sign-offs, with funds safely held in programmatic escrow.",
      details: [
        "Buyer locks USDC/EURC in escrow contract",
        "Automated deadline enforcement",
        "Open dispute mediation workflows",
      ],
    },
    {
      id: "agents",
      title: "AI Agent Hub",
      route: "/agents",
      icon: Bot,
      sub: "Autonomous Workers",
      desc: "Build, configure, template, or lease specialized AI bots (e.g., video clipper agents, auto-copywriters) that autonomously find work, complete gigs, and earn payouts.",
      details: [
        "ERC-8004 identity registration",
        "Transparent run-rate cost models",
        "SaaS style lease structures",
      ],
    },
    {
      id: "learning",
      title: "Gated Courses",
      route: "/dashboard/courses",
      icon: GraduationCap,
      sub: "x402 Content Gating",
      desc: "Unlock educational video guides, classes, and lectures directly on-chain using the HTTP x402 Payment Required protocol. No traditional subscriptions required.",
      details: [
        "Pay per lecture or module unlocked",
        "On-chain verified token validation",
        "Direct content provider payees",
      ],
    },
    {
      id: "bridge",
      title: "Bridge & Swap",
      route: "/dashboard/bridge",
      icon: Coins,
      sub: "Circle CCTP Integration",
      desc: "Instantly bring funds from Ethereum Sepolia, Base, or Arbitrum directly to the Arc L2 chain. Seamlessly swap between USDC and EURC at parity.",
      details: [
        "Circle CCTP secure cross-chain routing",
        "Zero liquidity slippage swap rates",
        "Gas-less network onboarding",
      ],
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>The Workspace</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          A Unified Suite of Creative & On-chain Solutions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-start">
        {/* Tab Buttons */}
        <div className="flex flex-col gap-1.5">
          {verticals.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium transition-all ${
                activeTab === i
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-l-4 border-[var(--color-accent)]"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <v.icon size={16} />
              <div>
                <p className="font-semibold text-xs leading-none">{v.title}</p>
                <span className="text-[10px] opacity-80">{v.sub}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Detail Panel */}
        <div
          className="p-5 rounded-xl border flex flex-col justify-between min-h-[220px]"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            borderColor: "var(--color-bd)",
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                {verticals[activeTab].sub}
              </Badge>
              <Link href={verticals[activeTab].route} className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: "var(--color-accent)" }}>
                View Portal
                <ArrowUpRight size={12} />
              </Link>
            </div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-fg)" }}>
              {verticals[activeTab].title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
              {verticals[activeTab].desc}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
              {verticals[activeTab].details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
                  <CheckCircle2 size={12} style={{ color: "var(--color-success)" }} />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SLIDE 5: Core Technical Architecture ──────────────────────────────── */
function SlideArchitecture() {
  const [selectedBlock, setSelectedBlock] = useState<"dcw" | "scp" | "openai" | "x402">("dcw");

  const blockDetails = {
    dcw: {
      title: "Circle Developer-Controlled Wallets (DCW)",
      description: "Abstracts the cryptographic friction of Web3 completely. Upon signing up using standard Google or Email credentials, Arc Work dynamically spins up a secure API-controlled wallet. Gas stations relay gas costs on behalf of users, enabling zero seed phrase onboarding.",
      flows: ["Google Auth triggers wallet creation API", "Circle instantiates secure user key shards", "Gas fees sponsored via programmatic paymaster"],
    },
    scp: {
      title: "Circle Smart Contract Platform (SCP)",
      description: "Automates on-chain escrow operations. Next.js backend uses Circle's REST endpoints to programmatically deploy secure EIP-712 escrow contracts. This guarantees funds remain locked in contract code and cannot be modified by any third party.",
      flows: ["Gig poster deposits USDC into smart escrow contract", "EIP-712 signing secures milestone declarations", "Circle REST SDK initiates gasless contract calls"],
    },
    openai: {
      title: "AI Deliverable Verification Client",
      description: "An automated quality control validation script. When a freelancer (or agent) uploads a completed asset (like code, video transcripts, or screenshots), the backend feeds the data to OpenAI APIs to verify requirements. Successful validation calls the escrow's withdraw hook.",
      flows: ["Freelancer uploads gig deliverables", "OpenAI Vision inspects screenshots & verifies requirements", "Automatic escrow payout triggered in smart contract"],
    },
    x402: {
      title: "x402 Micropayment Gating Client",
      description: "Custom HTTP middleware client built to gate video lectures. When a request for media is received, the node checks the HTTP headers for an EIP-712 receipt validation string. The RPC node parses the ledger instantly to confirm ownership.",
      flows: ["Client requests video media file", "Middleware checks for valid x402 purchase receipt header", "Video URL decrypted and streamed to player client"],
    },
  };

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>Technical Architecture</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          Circle SDKs and OpenAI Validation Pipeline
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
        {/* Interactive Architecture Map */}
        <div className="flex flex-col justify-center gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedBlock("dcw")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedBlock === "dcw"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-transparent bg-[var(--color-bg-inset)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Key size={14} className={selectedBlock === "dcw" ? "text-[var(--color-accent)]" : "text-[var(--color-fg-muted)]"} />
                <span className="text-xs font-bold" style={{ color: "var(--color-fg)" }}>Circle DCW</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Seedless user wallets</p>
            </button>

            <button
              onClick={() => setSelectedBlock("scp")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedBlock === "scp"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-transparent bg-[var(--color-bg-inset)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building size={14} className={selectedBlock === "scp" ? "text-[var(--color-accent)]" : "text-[var(--color-fg-muted)]"} />
                <span className="text-xs font-bold" style={{ color: "var(--color-fg)" }}>Circle SCP</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Escrow deployment API</p>
            </button>

            <button
              onClick={() => setSelectedBlock("openai")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedBlock === "openai"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-transparent bg-[var(--color-bg-inset)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={14} className={selectedBlock === "openai" ? "text-[var(--color-accent)]" : "text-[var(--color-fg-muted)]"} />
                <span className="text-xs font-bold" style={{ color: "var(--color-fg)" }}>OpenAI Vision</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Auto-verify deliverables</p>
            </button>

            <button
              onClick={() => setSelectedBlock("x402")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedBlock === "x402"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-transparent bg-[var(--color-bg-inset)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} className={selectedBlock === "x402" ? "text-[var(--color-accent)]" : "text-[var(--color-fg-muted)]"} />
                <span className="text-xs font-bold" style={{ color: "var(--color-fg)" }}>x402 Protocol</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Micropayments gating</p>
            </button>
          </div>

          <div className="p-3 text-[11px] rounded-lg border flex items-center justify-between" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <span style={{ color: "var(--color-fg-secondary)" }}>Base Chain: **Arc L2 Testnet**</span>
            <span style={{ color: "var(--color-fg-muted)" }}>Token Standards: **ERC-20, EIP-712**</span>
          </div>
        </div>

        {/* Selected Component Description */}
        <div
          className="p-5 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            borderColor: "var(--color-bd)",
          }}
        >
          <div className="space-y-2">
            <h3 className="font-bold text-sm" style={{ color: "var(--color-fg)" }}>
              {blockDetails[selectedBlock].title}
            </h3>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
              {blockDetails[selectedBlock].description}
            </p>
          </div>
          <div className="space-y-1.5 pt-3 border-t" style={{ borderColor: "var(--color-bd)" }}>
            <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--color-fg-muted)" }}>Execution Pipeline Flow</p>
            {blockDetails[selectedBlock].flows.map((flow, index) => (
              <div key={index} className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--color-fg-secondary)" }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                  {index + 1}
                </span>
                {flow}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SLIDE 6: Market Opportunity & **Interactive Graph** ─────────────────── */
function SlideMarketOpportunity() {
  const [volume, setVolume] = useState(25000);
  const [showArc, setShowArc] = useState(true);
  const [showWhop, setShowWhop] = useState(true);
  const [showUpwork, setShowUpwork] = useState(true);

  // Constants
  const ARC_RATE = 0.025; // 2.5%
  const WHOP_RATE = 0.05; // 5%
  const UPWORK_RATE = 0.20; // 20%

  // Calculations
  const arcFee = volume * ARC_RATE;
  const whopFee = volume * WHOP_RATE;
  const upworkFee = volume * UPWORK_RATE;

  const arcNet = volume - arcFee;
  const whopNet = volume - whopFee;
  const upworkNet = volume - upworkFee;

  const maxVolume = 50000;

  // SVG Coordinates mapping
  const getX = (val: number) => 40 + (val / maxVolume) * 320;
  const getY = (val: number) => 220 - (val / maxVolume) * 190;

  // Selected value coordinate
  const currentX = getX(volume);

  return (
    <div className="space-y-4 h-full flex flex-col justify-center">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>Market Growth & Economics</span>
          <h2 className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-fg)" }}>
            Fee Savings & Cumulative Net Creator Earnings
          </h2>
        </div>
        <Badge variant="outline" className="shrink-0 self-start sm:self-center" style={{ borderColor: "var(--color-success)", color: "var(--color-success)" }}>
          Net Savings: ${Math.round(upworkFee - arcFee).toLocaleString()} vs Fiverr/Upwork
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-center">
        {/* Interactive SVG Chart Container */}
        <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
          <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--color-fg-muted)" }}>
            <span>Earnings Chart (USD)</span>
            <div className="flex gap-3">
              {showArc && <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[oklch(0.55_0.18_150)] rounded" /> Arc Work (2.5%)</span>}
              {showWhop && <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[oklch(0.60_0.16_80)] rounded" /> Whop (5%)</span>}
              {showUpwork && <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 bg-[oklch(0.55_0.20_30)] rounded" /> Legacy (20%)</span>}
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] min-h-[180px]">
            <svg viewBox="0 0 400 240" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="220" x2="380" y2="220" stroke="var(--color-bd)" strokeWidth="1" />
              <line x1="40" y1="30" x2="40" y2="220" stroke="var(--color-bd)" strokeWidth="1" />

              <line x1="40" y1="125" x2="380" y2="125" stroke="var(--color-bd)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="40" y1="30" x2="380" y2="30" stroke="var(--color-bd)" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Chart Axes Labels */}
              <text x="35" y="224" fontSize="8" fill="var(--color-fg-muted)" textAnchor="end">$0</text>
              <text x="35" y="129" fontSize="8" fill="var(--color-fg-muted)" textAnchor="end">$25K</text>
              <text x="35" y="34" fontSize="8" fill="var(--color-fg-muted)" textAnchor="end">$50K</text>

              <text x="40" y="234" fontSize="8" fill="var(--color-fg-muted)" textAnchor="middle">$0</text>
              <text x="200" y="234" fontSize="8" fill="var(--color-fg-muted)" textAnchor="middle">$25K</text>
              <text x="360" y="234" fontSize="8" fill="var(--color-fg-muted)" textAnchor="middle">$50K</text>

              {/* Legend Y Name */}
              <text x="12" y="120" fontSize="8" fill="var(--color-fg-muted)" transform="rotate(-90 12 120)" textAnchor="middle">Net Creator Revenue</text>

              {/* Lines */}
              {showUpwork && (
                <line
                  x1={getX(0)}
                  y1={getY(0)}
                  x2={getX(maxVolume)}
                  y2={getY(maxVolume * (1 - UPWORK_RATE))}
                  stroke="oklch(0.55 0.20 30)"
                  strokeWidth="2"
                />
              )}
              {showWhop && (
                <line
                  x1={getX(0)}
                  y1={getY(0)}
                  x2={getX(maxVolume)}
                  y2={getY(maxVolume * (1 - WHOP_RATE))}
                  stroke="oklch(0.60 0.16 80)"
                  strokeWidth="2"
                />
              )}
              {showArc && (
                <line
                  x1={getX(0)}
                  y1={getY(0)}
                  x2={getX(maxVolume)}
                  y2={getY(maxVolume * (1 - ARC_RATE))}
                  stroke="oklch(0.55 0.18 150)"
                  strokeWidth="2"
                />
              )}

              {/* Selected Volume Indicator Line */}
              <line
                x1={currentX}
                y1="30"
                x2={currentX}
                y2="220"
                stroke="var(--color-fg-muted)"
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Dots at intersections */}
              {showUpwork && <circle cx={currentX} cy={getY(volume * (1 - UPWORK_RATE))} r="4" fill="oklch(0.55 0.20 30)" />}
              {showWhop && <circle cx={currentX} cy={getY(volume * (1 - WHOP_RATE))} r="4" fill="oklch(0.60 0.16 80)" />}
              {showArc && <circle cx={currentX} cy={getY(volume * (1 - ARC_RATE))} r="4" fill="oklch(0.55 0.18 150)" />}
            </svg>
          </div>

          {/* Slider Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium">
              <span style={{ color: "var(--color-fg)" }}>Cumulative Transaction Volume (USD):</span>
              <span style={{ color: "var(--color-accent)" }}>${volume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max={maxVolume}
              step="1000"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--color-bd)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Comparison Details Dashboard */}
        <div className="space-y-4">
          <div className="p-3 border rounded-xl space-y-2" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Interactive Options</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArc}
                  onChange={(e) => setShowArc(e.target.checked)}
                  className="rounded border-[var(--color-bd)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                Arc Work (2.5%)
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showWhop}
                  onChange={(e) => setShowWhop(e.target.checked)}
                  className="rounded border-[var(--color-bd)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                Whop (5%)
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showUpwork}
                  onChange={(e) => setShowUpwork(e.target.checked)}
                  className="rounded border-[var(--color-bd)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                Upwork/Fiverr (20%)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            {showUpwork && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border text-xs" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
                <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--color-fg)" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.55_0.20_30)]" />
                  Legacy (20% fee)
                </span>
                <div className="text-right">
                  <p style={{ color: "var(--color-fg)" }}>Net Earned: **${Math.round(upworkNet).toLocaleString()}**</p>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Fees Paid: ${Math.round(upworkFee).toLocaleString()}</p>
                </div>
              </div>
            )}

            {showWhop && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border text-xs" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
                <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--color-fg)" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.60_0.16_80)]" />
                  Whop (5% fee avg)
                </span>
                <div className="text-right">
                  <p style={{ color: "var(--color-fg)" }}>Net Earned: **${Math.round(whopNet).toLocaleString()}**</p>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Fees Paid: ${Math.round(whopFee).toLocaleString()}</p>
                </div>
              </div>
            )}

            {showArc && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border text-xs" style={{ backgroundColor: "oklch(0.55 0.18 150 / 0.05)", borderColor: "oklch(0.55 0.18 150 / 0.3)" }}>
                <span className="flex items-center gap-1.5 font-bold" style={{ color: "var(--color-fg)" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.55_0.18_150)]" />
                  Arc Work (2.5% fee)
                </span>
                <div className="text-right">
                  <p className="font-bold" style={{ color: "var(--color-success)" }}>Net Earned: ${Math.round(arcNet).toLocaleString()}</p>
                  <p className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Fees Paid: ${Math.round(arcFee).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SLIDE 7: Business Model ───────────────────────────────────────────── */
function SlideBusinessModel() {
  const [projectedUsers, setProjectedUsers] = useState(10000);
  const [projectedMonthlyVolume, setProjectedMonthlyVolume] = useState(150); // average spend/sales in USDC per active user

  // Monthly Treasury Revenue
  // 1. Transaction volume fee: 2.5% of total volume (split: 1.5% to treasury, 1% back to ecosystem paymaster/gas sponsor)
  // Let's assume 1.5% pure platform net revenue
  const totalVolume = projectedUsers * projectedMonthlyVolume;
  const platformRevenue = totalVolume * 0.015;

  // 2. AI Execution surcharges: assume average 5 API runs per user per month @ $0.02
  const aiRevenue = projectedUsers * 5 * 0.02;

  // 3. Subscriptions (ERC-8191 SaaS): assume 5% of users pay for premium Tier @ $20/month
  const subRevenue = (projectedUsers * 0.05) * 20;

  const totalMonthlyRevenue = platformRevenue + aiRevenue + subRevenue;

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>Monetization & Economics</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          Platform Monetization and Treasury Projections
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "var(--color-fg-secondary)" }}>Platform Cut</p>
              <p className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>2.5% Fee</p>
              <p className="text-[9px]" style={{ color: "var(--color-fg-muted)" }}>1.5% to treasury, 1.0% to support gas sponsors</p>
            </div>
            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "var(--color-fg-secondary)" }}>AI Execution</p>
              <p className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>$0.02 avg</p>
              <p className="text-[9px]" style={{ color: "var(--color-fg-muted)" }}>Offsetting API call rendering costs</p>
            </div>
            <div className="p-3.5 rounded-xl border space-y-1" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "var(--color-fg-secondary)" }}>SaaS Tiers</p>
              <p className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>ERC-8191</p>
              <p className="text-[9px]" style={{ color: "var(--color-fg-muted)" }}>Monthly SaaS subscriptions on-chain</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--color-bg-inset)", borderColor: "var(--color-bd)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--color-fg)" }}>Interactive Projections Simulator</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: "var(--color-fg-secondary)" }}>Monthly Active Users:</span>
                <span className="font-semibold" style={{ color: "var(--color-fg)" }}>{projectedUsers.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={projectedUsers}
                onChange={(e) => setProjectedUsers(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--color-bd)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: "var(--color-fg-secondary)" }}>Average Creator Payout / Volume per User (USDC):</span>
                <span className="font-semibold" style={{ color: "var(--color-fg)" }}>${projectedMonthlyVolume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={projectedMonthlyVolume}
                onChange={(e) => setProjectedMonthlyVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--color-bd)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Calculated Revenue Dashboard */}
        <div
          className="p-5 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            borderColor: "var(--color-bd)",
          }}
        >
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--color-fg-muted)" }}>Projected Platform Revenue</h3>
            <div className="border-b pb-3" style={{ borderColor: "var(--color-bd)" }}>
              <span className="text-[10px]" style={{ color: "var(--color-fg-muted)" }}>Total Monthly Volume</span>
              <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-fg)" }}>${totalVolume.toLocaleString()} USDC</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-secondary)" }}>1.5% Treasury Net Cut:</span>
                <span style={{ color: "var(--color-fg)" }}>${platformRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-secondary)" }}>AI Execution Runs:</span>
                <span style={{ color: "var(--color-fg)" }}>${aiRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-fg-secondary)" }}>ERC-8191 Subscriptions:</span>
                <span style={{ color: "var(--color-fg)" }}>${subRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: "var(--color-bd)" }}>
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--color-fg-muted)" }}>Total Projected Monthly Treasury Revenue</span>
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-success)" }}>
              ${Math.round(totalMonthlyRevenue).toLocaleString()} <span className="text-xs font-normal">USDC / mo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SLIDE 8: Roadmap & Future Vision ──────────────────────────────────── */
function SlideRoadmap() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Core Infrastructure",
      status: "Complete",
      color: "var(--color-success)",
      bullets: [
        "Integrated Circle DCW seedless wallets.",
        "Deployed initial smart contract escrows on Arc L2.",
        "Launched OpenAI visual verification service.",
      ],
    },
    {
      phase: "Phase 2",
      title: "Navigation & Overhaul",
      status: "Complete",
      color: "var(--color-success)",
      bullets: [
        "Overhauled UI information architecture & navigation sidebars.",
        "Built seller analytics tools & product inventory controls.",
        "Implemented x402 on-chain video player gating rules.",
      ],
    },
    {
      phase: "Phase 3",
      title: "Mainnet Launch & Fiat Ramps",
      status: "Planned",
      color: "var(--color-accent)",
      bullets: [
        "Deploy to Arc Mainnet network layers.",
        "Integrate Circle on/off ramp credit card widgets.",
        "Deploy decentralized reputation identity imports.",
      ],
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col justify-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>Platform Milestones</span>
        <h2 className="text-3xl font-bold mt-1" style={{ color: "var(--color-fg)" }}>
          Arc Work Product Roadmap Timeline
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((p, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: "var(--color-bg-inset)",
              borderColor: p.status === "Complete" ? "oklch(0.55 0.18 150 / 0.3)" : "var(--color-bd)",
            }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
                  {p.phase}
                </span>
                <Badge
                  variant={p.status === "Complete" ? "secondary" : "outline"}
                  className="text-[9px]"
                  style={{
                    color: p.color,
                    borderColor: p.status === "Complete" ? "transparent" : p.color,
                    backgroundColor: p.status === "Complete" ? `${p.color} / 0.1` : "transparent",
                  }}
                >
                  {p.status}
                </Badge>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--color-fg)" }}>
                {p.title}
              </h3>

              <ul className="space-y-1.5 pt-2">
                {p.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-[10px] leading-relaxed flex items-start gap-1" style={{ color: "var(--color-fg-secondary)" }}>
                    <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
