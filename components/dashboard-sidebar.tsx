"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Wallet, BarChart3, Package, Bot, PlusCircle,
  Plus, ShoppingCart, BadgeCheck, User, Settings, Briefcase,
  TrendingUp, Rocket,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  accent?: boolean;
}

const sidebarSections: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Workspace",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/bridge", label: "Wallet", icon: Wallet },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/dashboard/products/create", label: "New Product", icon: Plus, accent: true },
      { href: "/dashboard/marketplace/post", label: "New Gig", icon: PlusCircle, accent: true },
      { href: "/agents/create", label: "New Agent", icon: Rocket, accent: true },
    ],
  },
  {
    title: "Manage",
    links: [
      { href: "/dashboard/my-products", label: "My Products", icon: Package },
      { href: "/agents", label: "My Agents", icon: Bot },
      { href: "/jobs", label: "My Gigs", icon: Briefcase },
      { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/verify", label: "Verify", icon: BadgeCheck },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-[56px] border-r overflow-y-auto"
      style={{
        width: "220px",
        minWidth: "220px",
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div className="flex-1 flex flex-col gap-4 py-4 px-3">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <p
              className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--color-fg-muted)" }}
            >
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = isActive(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    data-active={active}
                    className="sidebar-item"
                  >
                    <Icon
                      size={15}
                      style={{
                        color: active ? "var(--color-accent)" : link.accent ? "var(--color-accent)" : "var(--color-fg-muted)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
