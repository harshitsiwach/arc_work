/**
 * Arc Work - Premium Minimal Navbar
 * Clean app bar — page links live in the dashboard sidebar now
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { UserMenu } from "@/components/user-menu";
import { MobileSidebar } from "@/components/dashboard-sidebar";
import { cn } from "@/lib/utils";

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
  const isDashboard = pathname.startsWith("/dashboard");

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b"
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
        <div className="h-full max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + optional mobile menu trigger */}
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle — only on dashboard pages */}
            {isDashboard && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150"
                style={{ color: "var(--color-fg-secondary)" }}
                aria-label="Toggle sidebar"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}

            <Link
              href="/"
              className="text-[15px] font-semibold tracking-[-0.02em] transition-opacity duration-150 hover:opacity-70"
              style={{ color: "var(--color-fg)" }}
            >
              arc work
            </Link>

            {/* Show minimal nav links for non-dashboard public pages */}
            {!isDashboard && (
              <div className="hidden md:flex items-center gap-0.5 ml-4">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/dashboard/products", label: "Products" },
                  { href: "/dashboard/marketplace", label: "Gigs" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
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
          </div>
        </div>
      </nav>

      {/* Mobile sidebar drawer — only on dashboard pages */}
      {isDashboard && (
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}
    </>
  );
}
