/**
 * Arc Work - User Menu Dropdown
 * Premium avatar-based user menu with quick links
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, User, LogOut, ShoppingBag, CreditCard, Settings } from "lucide-react";
import { signOutAction } from "@/app/actions";

function getInitials(email?: string): string {
  if (!email) return "?";
  const parts = email.replace(/@.*$/, "").split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function UserMenu({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(email);

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
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
            <Link href="/dashboard/products" className="cursor-pointer flex items-center gap-2">
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
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex items-center gap-2 w-full cursor-pointer" style={{ color: "var(--color-error)" }}>
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
