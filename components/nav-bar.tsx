"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, ShoppingBag, LayoutDashboard, Search } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const navLinks = [
  { href: "/create", label: "Create", icon: Plus },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/create") return pathname.startsWith("/create");
  if (href === "/marketplace") return pathname.startsWith("/marketplace");
  if (href === "/dashboard") return pathname.startsWith("/dashboard");
  return pathname === href;
}

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string } | null } }) => {
      if (user) setUser(user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user?: { email?: string } } | null) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass-heavy transition-all duration-300"
        style={{
          height: "56px",
          borderBottom: scrolled ? "1px solid color-mix(in srgb, var(--color-bd) 60%, transparent)" : "1px solid transparent",
        }}
      >
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center group" prefetch={false}>
              <img
                src="/img/arc_work_logo_dark.png"
                alt="Arc Work"
                className="block dark:hidden h-9 w-auto transition-transform group-hover:scale-105"
              />
              <img
                src="/img/arc_work_logo.png"
                alt="Arc Work"
                className="hidden dark:block h-9 w-auto transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                      active ? "nav-link-active" : "hover:text-[var(--color-fg)]"
                    )}
                    style={{
                      color: active ? "var(--color-fg)" : "var(--color-fg-muted)",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">


            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <WalletConnectButton />
            {isAuthenticated ? (
              <UserMenu email={user?.email} />
            ) : (
              <Link
                href="/sign-in"
                prefetch={false}
                className="btn-primary text-[13px] py-1.5 px-3"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
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
          "fixed top-[56px] right-0 bottom-0 z-50 w-72 md:hidden transition-transform duration-300 ease-out glass-heavy",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col p-4 gap-1">
          {navLinks.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors"
                style={{
                  color: active ? "var(--color-fg)" : "var(--color-fg-secondary)",
                  backgroundColor: active ? "var(--color-accent-soft)" : "transparent",
                }}
              >
                <Icon size={16} style={{ color: active ? "var(--color-accent)" : "var(--color-fg-muted)" }} />
                {item.label}
              </Link>
            );
          })}

          <div className="my-2" style={{ borderTop: "1px solid var(--color-bd)" }} />

          <div className="flex items-center gap-2 px-3 py-2">
            <ThemeSwitcher />
            <span className="text-[13px]" style={{ color: "var(--color-fg-secondary)" }}>Theme</span>
          </div>

          {!isAuthenticated && (
            <Link
              href="/sign-in"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              className="mt-2 btn-primary text-center"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
