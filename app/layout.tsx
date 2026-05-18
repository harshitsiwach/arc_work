/**
 * Arc Work - Root Layout
 * Premium minimal design with Inter font and page transitions
 */
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/lib/utils/supabase/check-env-vars";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { WalletProvider } from "@/lib/web3/wallet-provider";
import { WalletConnectButton } from "@/components/wallet-connect-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const defaultUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? process.env.NEXT_PUBLIC_VERCEL_URL
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Arc Work",
  description: "Decentralized freelance marketplace on Arc blockchain",
};

export default async function RootLayout({
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
          <WalletProvider>
          <div className="min-h-screen flex flex-col">
            {/* Fixed Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b" style={{ borderColor: "var(--color-bd)", backgroundColor: "color-mix(in srgb, var(--color-bg) 85%, transparent)", backdropFilter: "blur(12px)" }}>
              <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full px-6 text-sm">
                <div className="flex items-center gap-6">
                  <Link
                    href={"/"}
                    className="font-semibold text-base tracking-tight hover:opacity-70 transition-opacity"
                    style={{ color: "var(--color-fg)" }}
                  >
                    arc work
                  </Link>
                  <div className="flex items-center gap-1">
                    {[
                      { href: "/dashboard", label: "Dashboard" },
                      { href: "/dashboard/marketplace", label: "Marketplace" },
                      { href: "/dashboard/bridge", label: "Bridge" },
                      { href: "/dashboard/agents", label: "Agents" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-1.5 rounded-md text-sm transition-all duration-150"
                        style={{ color: "var(--color-fg-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-fg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-fg-secondary)")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeSwitcher />
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  <WalletConnectButton />
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center pt-20 px-6">
              <div className="w-full max-w-7xl animate-fade-in-up">
                {children}
              </div>
            </main>
          </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
