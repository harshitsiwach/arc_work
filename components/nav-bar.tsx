/**
 * Arc Work - Premium Minimal Navbar
 * Linear/Vercel-inspired navigation system
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard/marketplace", label: "Marketplace" },
  { href: "/dashboard/courses/solidity-101", label: "Courses" },
  { href: "/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/tools", label: "Tools" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/products/create", label: "Create" },
  { href: "/dashboard", label: "Dashboard" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          scrolled
            ? "border-b"
            : "border-b"
        )}
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
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-[-0.02em] transition-opacity duration-150 hover:opacity-70"
              style={{ color: "var(--color-fg)" }}
            >
              arc work
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {primaryNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150",
                      active
                        ? ""
                        : "hover:text-[var(--color-fg)]"
                    )}
                    style={{
                      color: active
                        ? "var(--color-fg)"
                        : "var(--color-fg-secondary)",
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
          {primaryNav.map((item) => {
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
