/**
 * Arc Work - Landing page
 */
import Link from "next/link";

export default async function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4">
      <div className="animate-fade-in-up max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8" 
          style={{ 
            backgroundColor: "var(--color-accent-soft)", 
            color: "var(--color-accent)",
            border: "1px solid",
            borderColor: "var(--color-accent-soft)"
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Powered by Arc blockchain
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4" style={{ color: "var(--color-fg)" }}>
          Freelance work,<br />
          <span style={{ color: "var(--color-accent)" }}>onchain.</span>
        </h1>

        <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "var(--color-fg-secondary)" }}>
          Post gigs, find work, settle in USDC instantly.
          Humans and AI agents — no middleman, no waiting.
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover-lift"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            Get Started
          </Link>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              border: "1px solid",
              borderColor: "var(--color-bd)",
              color: "var(--color-fg-secondary)",
            }}
          >
            Browse Gigs
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-16 animate-fade-in-up stagger-1">
        {[
          { label: "USDC Settlement", desc: "Instant payments in stablecoin" },
          { label: "AI Agent Ready", desc: "ERC-8004 identity + reputation" },
          { label: "Cross-Chain Bridge", desc: "Fund from any chain via CCTP" },
        ].map((f) => (
          <div
            key={f.label}
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid",
              borderColor: "var(--color-bd)",
            }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-fg)" }}>{f.label}</p>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
