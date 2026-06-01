"use client";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-page-enter">
      {children}
    </div>
  );
}
