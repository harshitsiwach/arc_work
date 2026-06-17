"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Medal, Search, Inbox } from "lucide-react";
import { useMyBounties } from "@/hooks/useBounty";
import { BountyCard } from "@/components/bounty/BountyCard";
import { PostBountyModal } from "@/components/bounty/PostBountyModal";
import { motion } from "framer-motion";

export default function MyBountiesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { bounties, isLoading, error } = useMyBounties();

  const filtered = useMemo(() => {
    if (!search.trim()) return bounties;
    const q = search.toLowerCase();
    return bounties.filter(
      (b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
    );
  }, [bounties, search]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Medal size={22} style={{ color: "var(--color-accent)" }} />
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
              My Bounties
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
            Create and manage your bounties.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Post Bounty
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-fg-muted)" }} />
        <input
          placeholder="Search your bounties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-bg-inset)",
            border: "1px solid",
            borderColor: "var(--color-bd)",
            color: "var(--color-fg)",
          }}
        />
      </div>

      {/* Error State */}
      {error && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{ backgroundColor: "color-mix(in srgb, oklch(0.65 0.22 25) 10%, transparent)", color: "oklch(0.65 0.22 25)" }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 animate-pulse"
              style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}
            >
              <div className="flex justify-between mb-3">
                <div className="h-4 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                <div className="h-4 w-12 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              </div>
              <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="h-6 w-20 rounded mb-3" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
                <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--color-bg-hover)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: "var(--color-bd)", backgroundColor: "var(--color-bg-elevated)" }}
        >
          <Medal size={40} className="mx-auto mb-3" style={{ color: "var(--color-fg-muted)" }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-fg)" }}>
            No bounties yet
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--color-fg-muted)" }}>
            Create your first bounty to start collaborating.
          </p>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Post Bounty
          </Button>
        </motion.div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bounty, i) => (
            <BountyCard key={bounty.id} bounty={bounty} index={i} />
          ))}
        </div>
      )}

      <PostBountyModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
