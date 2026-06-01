import { MarketplaceSidebar } from "@/components/marketplace-sidebar";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <MarketplaceSidebar />
      <main className="flex-1 min-w-0">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
