/**
 * Arc Work - Premium Navigation Bar
 * Explore | Agents | Dashboard + Global Create CTA
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, Sparkles, Bot, Package, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/agents", label: "Agents" },
  { href: "/dashboard", label: "Dashboard" },
];

const createOptions = [
  { href: "/dashboard/marketplace/post", label: "Create Gig", desc: "Post a freelance job", icon: Briefcase },
  { href: "/agents/create", label: "Launch AI Agent", desc: "Deploy an autonomous worker", icon: Bot },
  { href: "/dashboard/products/create", label: "Upload Product", desc: "List a digital product", icon: Package },
  { href: "/dashboard/courses", label: "Create Course", desc: "Teach your expertise", icon: GraduationCap },
  { href: "/agents/marketplace", label: "Browse AI Marketplace", desc: "Discover AI tools & APIs", icon: Wrench },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  if (href === "/explore") return pathname.startsWith("/explore");
  if (href === "/agents") return pathname.startsWith("/agents");
  return pathname.startsWith(href);
}

export function NavBar({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen || createOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, createOpen]);

  // Close create menu on route change
  useEffect(() => {
    setCreateOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b"
        style={{
          height: "56px",
          borderColor: "color-mix(in srgb, var(--color-bd) 50%, transparent)",
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--color-bg) 92%, transparent)"
            : "color-mix(in srgb, var(--color-bg) 80%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-[-0.02em] transition-opacity duration-150 hover:opacity-70"
              style={{ color: "var(--color-fg)" }}
            >
              arc work
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150",
                      active ? "" : "hover:text-[var(--color-fg)]"
                    )}
                    style={{
                      color: active ? "var(--color-fg)" : "var(--color-fg-secondary)",
                    }}
                  >
                    {item.label}
                    {active && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                          width: "16px",
                          height: "2px",
                          backgroundColor: "var(--color-accent)",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Global Create Button */}
            {isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setCreateOpen(!createOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                >
                  <Plus size={14} />
                  Create
                </button>

                {/* Create Dropdown */}
                {createOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCreateOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl overflow-hidden shadow-lg animate-scale-in"
                      style={{
                        backgroundColor: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-bd)",
                        boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)",
                      }}
                    >
                      <div className="p-2">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
                          Quick Create
                        </p>
                        {createOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <Link
                              key={option.href}
                              href={option.href}
                              onClick={() => setCreateOpen(false)}
                              className="flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-150 group"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                                style={{ backgroundColor: "var(--color-accent-soft)" }}
                              >
                                <Icon size={14} style={{ color: "var(--color-accent)" }} />
                              </div>
                              <div className="text-left">
                                <p className="text-[13px] font-medium group-hover:text-[var(--color-fg)] transition-colors duration-150" style={{ color: "var(--color-fg)" }}>
                                  {option.label}
                                </p>
                                <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>{option.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <WalletConnectButton />
            {isAuthenticated ? (
              <UserMenu email={userEmail} />
            ) : (
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150"
              style={{ color: "var(--color-fg-secondary)" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 60%, transparent)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed top-[56px] right-0 bottom-0 z-50 w-72 md:hidden transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderLeft: "1px solid",
          borderColor: "var(--color-bd)",
        }}
      >
        <div className="flex flex-col p-4 gap-1">
          {/* Mobile Create Button */}
          {isAuthenticated && (
            <div className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--color-bd)" }}>
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
                Quick Create
              </p>
              {createOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.href}
                    href={option.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-soft)" }}>
                      <Icon size={14} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-medium" style={{ color: "var(--color-fg)" }}>{option.label}</p>
                      <p className="text-[11px]" style={{ color: "var(--color-fg-muted)" }}>{option.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {navLinks.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-150"
                style={{
                  color: active ? "var(--color-fg)" : "var(--color-fg-secondary)",
                  backgroundColor: active ? "var(--color-bg-hover)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="my-2" style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }} />

          <div className="flex items-center gap-2 px-3 py-2">
            <ThemeSwitcher />
            <span className="text-[13px]" style={{ color: "var(--color-fg-secondary)" }}>Theme</span>
          </div>

          {!isAuthenticated && (
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center px-3 py-2.5 rounded-lg text-[14px] font-medium"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
