/**
 * Arc Work — Courses Catalog
 * Browse gated courses from creators, unlocked via x402 USDC payments
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Search,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";

const COURSES = [
  {
    id: "solidity-101",
    title: "Solidity & Smart Contract Development 101",
    creator: "Arc Academy",
    creatorAddress: "0x37fc98997055b4be246d698b131cabc2c4ab34a3",
    price: 5.0,
    modules: 3,
    freeModules: 1,
    description:
      "Master smart contract development from zero to hero. Learn EVM architecture, ERC20 tokens, and escrow protocols.",
    tags: ["Solidity", "EVM", "Smart Contracts", "Web3"],
    level: "Beginner",
    duration: "2.5 hours",
  },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");

  const filtered = COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--color-accent-soft)" }}
          >
            <GraduationCap className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>
              Courses & Learning
            </h1>
            <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
              Unlock premium content from top creators — pay once with USDC via x402
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none transition-colors"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            borderColor: "var(--color-bd)",
            color: "var(--color-fg)",
          }}
        />
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}>
          <GraduationCap className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>No courses found</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="hover-lift transition-all duration-200 h-full cursor-pointer" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
                {/* Gradient header */}
                <div className="h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.30 0.03 125), oklch(0.25 0.03 125))" }}>
                  <GraduationCap className="h-12 w-12 text-white/20" />
                  <div className="absolute top-3 right-3">
                    <Badge className="text-[10px] font-medium" style={{ backgroundColor: "oklch(0.75 0.18 125 / 0.2)", color: "var(--color-accent)", border: "none" }}>
                      {course.freeModules} free module
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold leading-tight" style={{ color: "var(--color-fg)" }}>{course.title}</h3>
                  <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
                    by <span style={{ color: "var(--color-fg-secondary)" }}>{course.creator}</span>
                  </p>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--color-fg-secondary)" }}>{course.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5" style={{ borderColor: "var(--color-bd)", color: "var(--color-fg-muted)" }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-bd)" }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-fg-muted)" }}>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules} modules</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>{course.price} USDC</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Coming soon */}
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-bd)" }}>
        <Sparkles className="h-6 w-6 mx-auto mb-2" style={{ color: "var(--color-accent)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>More courses coming soon</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>Creators can publish gated courses with per-module USDC pricing</p>
      </div>
    </div>
  );
}
