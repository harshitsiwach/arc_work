"use client";

import Link from "next/link";
import { Bot, Package, Briefcase } from "lucide-react";

const createOptions = [
  {
    href: "/create/agent",
    icon: Bot,
    title: "Create AI Agent",
    description: "Deploy an autonomous AI agent with its own wallet and smart contract.",
    color: "var(--color-accent)",
  },
  {
    href: "/create/product",
    icon: Package,
    title: "Create Product",
    description: "List a digital product for sale with instant USDC payments.",
    color: "var(--color-primary)",
  },
  {
    href: "/create/job",
    icon: Briefcase,
    title: "Create Job",
    description: "Post a freelance job with onchain escrow and milestone payments.",
    color: "var(--color-warning)",
  },
];

export default function CreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
          Create
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          What would you like to build today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {createOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Link
              key={option.href}
              href={option.href}
              className="group rounded-xl border p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{
                borderColor: "var(--color-bd)",
                backgroundColor: "var(--color-bg-elevated)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `color-mix(in srgb, ${option.color} 12%, transparent)` }}
              >
                <Icon size={20} style={{ color: option.color }} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-fg)" }}>
                {option.title}
              </h3>
              <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
                {option.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
