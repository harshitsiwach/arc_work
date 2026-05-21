/**
 * Arc Work — Dashboard Sidebar
 * Role-based navigation for buyers and sellers
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Wrench,
  CreditCard,
  Scissors,
  Package,
  Bot,
  PlusCircle,
  Plus,
  BadgeCheck,
  User,
  Wallet,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const buyerLinks: SidebarLink[] = [
  { href: "/dashboard/products", label: "Browse Products", icon: ShoppingBag },
  { href: "/dashboard/marketplace", label: "Gigs & Freelance", icon: Briefcase },
  { href: "/dashboard/courses", label: "Courses", icon: GraduationCap },
  { href: "/dashboard/tools", label: "Tools & APIs", icon: Wrench },
  { href: "/dashboard/subscriptions", label: "My Subscriptions", icon: CreditCard },
  { href: "/dashboard/clipper", label: "Video Clipper", icon: Scissors },
];

const sellerLinks: SidebarLink[] = [
  { href: "/dashboard/my-products", label: "My Products", icon: Package },
  { href: "/dashboard/agents", label: "My Agents", icon: Bot },
  { href: "/dashboard/marketplace/post", label: "Post a Gig", icon: PlusCircle },
  { href: "/dashboard/products/create", label: "Create Product", icon: Plus },
  { href: "/dashboard/verify", label: "Verify Socials", icon: BadgeCheck },
  { href: "/dashboard/profile", label: "Creator Profile", icon: User },
];

const accountLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bridge", label: "Wallet & Bridge", icon: Wallet },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function SidebarSection({
  title,
  links,
  pathname,
  collapsed,
}: {
  title: string;
  links: SidebarLink[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {title}
        </p>
      )}
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
              collapsed && "justify-center px-2"
            )}
            style={{
              color: active ? "var(--color-fg)" : "var(--color-fg-secondary)",
              backgroundColor: active ? "var(--color-bg-hover)" : "transparent",
            }}
            title={collapsed ? link.label : undefined}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                style={{
                  height: "18px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
            )}
            <Icon
              size={16}
              style={{
                color: active ? "var(--color-accent)" : "var(--color-fg-muted)",
                flexShrink: 0,
              }}
            />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // On mobile, sidebar is hidden (handled by parent layout)
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-[56px] border-r transition-all duration-200 overflow-y-auto",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Sidebar content */}
      <div className="flex-1 flex flex-col gap-4 py-4 px-2">
        <SidebarSection
          title="For You"
          links={buyerLinks}
          pathname={pathname}
          collapsed={collapsed}
        />

        <div
          className="mx-3"
          style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}
        />

        <SidebarSection
          title="For Creators"
          links={sellerLinks}
          pathname={pathname}
          collapsed={collapsed}
        />

        <div
          className="mx-3"
          style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}
        />

        <SidebarSection
          title="Account"
          links={accountLinks}
          pathname={pathname}
          collapsed={collapsed}
        />
      </div>

      {/* Collapse toggle */}
      <div
        className="px-2 py-3 border-t"
        style={{ borderColor: "var(--color-bd)" }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150",
            collapsed && "justify-center px-2"
          )}
          style={{ color: "var(--color-fg-muted)" }}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/** Mobile sidebar — used as a slide-over drawer */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-bg) 60%, transparent)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-[56px] left-0 bottom-0 z-50 w-[260px] lg:hidden transition-transform duration-200 ease-out overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderRight: "1px solid",
          borderColor: "var(--color-bd)",
        }}
      >
        <div className="flex flex-col gap-4 py-4 px-2">
          <SidebarSection
            title="For You"
            links={buyerLinks}
            pathname={pathname}
            collapsed={false}
          />

          <div
            className="mx-3"
            style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}
          />

          <SidebarSection
            title="For Creators"
            links={sellerLinks}
            pathname={pathname}
            collapsed={false}
          />

          <div
            className="mx-3"
            style={{ borderTop: "1px solid", borderColor: "var(--color-bd)" }}
          />

          <SidebarSection
            title="Account"
            links={accountLinks}
            pathname={pathname}
            collapsed={false}
          />
        </div>
      </div>
    </>
  );
}
