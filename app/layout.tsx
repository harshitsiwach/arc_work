import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils/supabase/check-env-vars";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AppKitProvider } from "@/lib/web3/appkit-provider";
import { WalletProvider } from "@/lib/web3/wallet-provider";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const defaultUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? (process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Arc Work — The operating system for internet creators and AI workers",
  description: "Sell digital products, hire AI agents, and get freelance work done with onchain escrow payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster expand />
          <AppKitProvider>
          <WalletProvider>
          <div className="min-h-screen flex flex-col">
            {!hasEnvVars ? (
              <nav
                className="fixed top-0 left-0 right-0 z-50 glass"
                style={{ height: "56px", borderBottom: "1px solid var(--color-bd)" }}
              >
                <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent)" }}>
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <span className="text-[15px] font-semibold tracking-[-0.03em]" style={{ color: "var(--color-fg)" }}>
                      arc work
                    </span>
                  </div>
                  <EnvVarWarning />
                </div>
              </nav>
            ) : (
              <NavBar />
            )}

            <main className="flex-1 pt-14">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in-up">
                {children}
              </div>
            </main>
          </div>
          </WalletProvider>
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
