import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Web3Provider } from "@/components/providers/Web3Provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeScan AI · On-chain Vibe Intelligence",
  description:
    "VibeScan AI fuses social vibe and on-chain signals into a real-time intelligence dashboard for Solana and Ethereum traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-foreground">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
