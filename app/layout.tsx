import type { Metadata, Viewport } from "next";
import {
  Familjen_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Minicente — Fintech for Emerging Markets",
  description:
    "Stablecoins, savings, remittance, loans, and agency banking in one mobile-first app.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Minicente",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-bg2">
      <body
        className={`${familjenGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans bg-bg text-ink antialiased`}
      >
        <Providers>
          {/* Centered mobile container with side borders */}
          <div className="mx-auto max-w-[480px] min-h-screen bg-bg border-x border-line relative">
            <TopNav />
            <main className="pb-[88px]">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
