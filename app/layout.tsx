import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils/supabase/check-env-vars";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AppKitProvider } from "@/lib/web3/appkit-provider";
import { WalletProvider } from "@/lib/web3/wallet-provider";
import { NavBar } from "@/components/nav-bar";

const spaceGrotesk = Space_Grotesk({
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
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
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
          <div className="min-h-screen flex flex-col relative">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float-subtle"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float-subtle" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/5 to-transparent rounded-full"></div>
            </div>
            {!hasEnvVars ? (
              <nav
                className="fixed top-0 left-0 right-0 z-50 glass"
                style={{ height: "56px", borderBottom: "1px solid var(--color-bd)" }}
              >
                <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center">
                    <img
                      src="/img/arc_work_logo.png"
                      alt="Arc Work"
                      className="h-7 w-auto"
                    />
                  </div>
                  <EnvVarWarning />
                </div>
              </nav>
            ) : (
              <NavBar />
            )}

            <main className="flex-1 pt-14">
              {children}
            </main>
          </div>
          </WalletProvider>
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
