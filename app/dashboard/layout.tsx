/**
 * Arc Work — Dashboard Layout
 * Wraps all /dashboard/* pages with a sidebar navigation
 */
"use client";

import { useState } from "react";
import { DashboardSidebar, MobileSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
