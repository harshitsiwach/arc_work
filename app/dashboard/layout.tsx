/**
 * Arc Work — Dashboard Layout
 * Wraps all /dashboard/* pages with a sidebar navigation
 */
"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";

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
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
