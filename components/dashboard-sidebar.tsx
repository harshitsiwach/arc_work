/**
 * Arc Work — Contextual Dashboard Sidebar
 * Dynamically adapts based on current route section
 */
"use client";

import { useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Settings,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Layers,
  Zap,
  Rocket,
  Search,
  Database,
  Image,
  Cpu,
} from "lucide-react";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

type SidebarContext = "explore" | "agents" | "dashboard";

function detectContext(pathname: string): SidebarContext {
  if (pathname.startsWith("/agents")) return "agents";
  if (pathname.startsWith("/explore") ||
      pathname.startsWith("/dashboard/products") ||
      pathname.startsWith("/dashboard/marketplace") ||
      pathname.startsWith("/dashboard/courses") ||
      pathname.startsWith("/dashboard/subscriptions") ||
      pathname.startsWith("/dashboard/clipper")) return "explore";
  return "dashboard";
}

const exploreLinks: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Marketplace",
    links: [
      { href: "/explore", label: "Trending", icon: TrendingUp },
      { href: "/agents/marketplace", label: "AI Marketplace", icon: Bot },
      { href: "/dashboard/marketplace", label: "Gigs", icon: Briefcase },
      { href: "/explore", label: "Products", icon: ShoppingBag },
      { href: "/dashboard/courses", label: "Courses", icon: GraduationCap },
      { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Categories",
    links: [
      { href: "/agents/marketplace?cat=inference", label: "Inference", icon: Cpu },
      { href: "/agents/marketplace?cat=automation", label: "Automation", icon: Zap },
      { href: "/agents/marketplace?cat=search", label: "Search", icon: Search },
      { href: "/agents/marketplace?cat=data", label: "Data", icon: Database },
      { href: "/agents/marketplace?cat=media", label: "Media", icon: Image },
      { href: "/agents/marketplace?cat=trading", label: "Trading", icon: DollarSign },
    ],
  },
];

const agentsLinks: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Agents",
    links: [
      { href: "/agents", label: "Featured", icon: Layers },
      { href: "/agents/create", label: "Templates", icon: Rocket },
      { href: "/agents", label: "My Agents", icon: Bot },
      { href: "/agents/marketplace", label: "AI Marketplace", icon: Bot },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/agents", label: "Deployments", icon: Zap },
      { href: "/agents", label: "Analytics", icon: BarChart3 },
      { href: "/agents", label: "Earnings", icon: DollarSign },
    ],
  },
];

const dashboardLinks: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Workspace",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/bridge", label: "Wallet & Bridge", icon: Wallet },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Creator",
    links: [
      { href: "/dashboard/my-products", label: "My Products", icon: Package },
      { href: "/agents", label: "My Agents", icon: Bot },
      { href: "/dashboard/marketplace/post", label: "Post a Gig", icon: PlusCircle },
      { href: "/dashboard/products/create", label: "Create Product", icon: Plus },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
      { href: "/dashboard/verify", label: "Verify Socials", icon: BadgeCheck },
      { href: "/dashboard/profile", label: "Creator Profile", icon: User },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  if (href === "/explore") return pathname === "/explore" || pathname === "/explore/";
  if (href === "/agents") return pathname === "/agents" || pathname === "/agents/";
  if (href === "/agents/marketplace") return pathname.startsWith("/agents/marketplace");
  return pathname.startsWith(href);
}

function SidebarGroup({
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
    <div
      className="rounded-lg p-1.5"
      style={{ backgroundColor: "var(--color-bg-elevated)" }}
    >
      {!collapsed && (
        <p
          className="px-2 pt-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              data-active={active}
              className={cn(
                "sidebar-item",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon
                size={15}
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
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const context = detectContext(pathname);

  const sections = context === "explore" ? exploreLinks : 
                   context === "agents" ? agentsLinks : 
                   dashboardLinks;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-[56px] border-r transition-all duration-200 overflow-y-auto",
        collapsed ? "w-[56px]" : "w-[216px]"
      )}
      style={{
        borderColor: "var(--color-bd)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div className="flex-1 flex flex-col gap-2 py-3 px-1.5">
        {sections.map((section) => (
          <SidebarGroup
            key={section.title}
            title={section.title}
            links={section.links}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Collapse toggle */}
      <div
        className="px-1.5 py-2 border-t"
        style={{ borderColor: "var(--color-bd)" }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "sidebar-item w-full",
            collapsed && "justify-center px-2"
          )}
          style={{ color: "var(--color-fg-muted)", fontSize: "0.75rem" }}
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
  const context = detectContext(pathname);

  const sections = context === "explore" ? exploreLinks : 
                   context === "agents" ? agentsLinks : 
                   dashboardLinks;

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
          "fixed top-[56px] left-0 bottom-0 z-50 w-[256px] lg:hidden transition-transform duration-200 ease-out overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--color-bg)",
          borderRight: "1px solid",
          borderColor: "var(--color-bd)",
        }}
      >
        <div className="flex flex-col gap-2 py-3 px-1.5">
          {sections.map((section) => (
            <SidebarGroup
              key={section.title}
              title={section.title}
              links={section.links}
              pathname={pathname}
              collapsed={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
