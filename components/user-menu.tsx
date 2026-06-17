/**
 * Arc Work - User Menu Dropdown
 * Premium avatar-based user menu with quick links
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, User, LogOut, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

function getInitials(email?: string): string {
  if (!email) return "?";
  const parts = email.replace(/@.*$/, "").split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function UserMenu({ email }: { email?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initials = getInitials(email);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    setSigningOut(false);
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="avatar-ring inline-flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-semibold transition-all duration-150 focus:outline-none"
          style={{
            backgroundColor: "var(--color-accent-soft)",
            color: "var(--color-accent)",
          }}
          aria-label="User menu"
        >
          {signingOut ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-bd)",
        boxShadow: "0 10px 40px oklch(0 0 0 / 0.35), 0 0 0 1px var(--color-bd)",
      }}>
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium" style={{ color: "var(--color-fg)" }}>
              {email?.split("@")[0] || "User"}
            </span>
            <span className="text-[11px] truncate" style={{ color: "var(--color-fg-muted)" }}>
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="cursor-pointer flex items-center gap-2">
              <User size={14} />
              Creator Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/explore" className="cursor-pointer flex items-center gap-2">
              <ShoppingBag size={14} />
              Browse Products
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/subscriptions" className="cursor-pointer flex items-center gap-2">
              <CreditCard size={14} />
              My Subscriptions
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-[13px] cursor-pointer rounded-sm outline-none transition-colors"
            style={{ color: "var(--color-error)" }}
          >
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
