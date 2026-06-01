"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, Package, Briefcase } from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const marketplaceLinks: SidebarLink[] = [
  { href: "/marketplace/agents", label: "Agents", icon: Bot },
  { href: "/marketplace/products", label: "Products", icon: Package },
  { href: "/marketplace/jobs", label: "Jobs", icon: Briefcase },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function MarketplaceSidebar() {
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
        <div>
          <p
            className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Browse
          </p>
          <div className="space-y-0.5">
            {marketplaceLinks.map((link) => {
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
                      color: active ? "var(--color-accent)" : "var(--color-fg-muted)",
                      flexShrink: 0,
                    }}
                  />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
