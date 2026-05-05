import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PiRC Warehouse · Sovereign Monetary Standard",
    template: "%s · PiRC Warehouse",
  },
  description:
    "The official 7-layer Soroban/Stellar warehouse for the PiRC Sovereign Monetary Standard on Pi Network. Live contract registry, on-chain status, subscription gateway, and architecture explorer.",
  keywords: [
    "PiRC", "Pi Network", "Soroban", "Stellar", "Smart Contracts",
    "Sovereign Monetary Standard", "PiRC2", "7-Layer", "RWA",
  ],
  authors: [{ name: "Ze0ro99" }, { name: "Clawue884" }],
  openGraph: {
    title: "PiRC Warehouse · Sovereign Monetary Standard",
    description:
      "Live 7-layer Soroban warehouse: contract registry, on-chain status, subscription gateway, architecture.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="min-h-dvh font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
