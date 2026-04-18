import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import CustomCursor from "@/components/ui/cursor";

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
    default: "HuyHK — Fullstack Developer",
    template: "%s | HuyHK",
  },
  description:
    "Fullstack Developer specializing in React, Next.js, Node.js, and modern web technologies. Building seamless, optimized, and scalable web experiences.",
  keywords: ["fullstack developer", "react", "nextjs", "nodejs", "web developer", "HuyHK"],
  authors: [{ name: "HuyHK" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://huyhk.dev",
    title: "HuyHK — Fullstack Developer",
    description:
      "Fullstack Developer specializing in React, Next.js, Node.js, and modern web technologies.",
    siteName: "HuyHK.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "HuyHK — Fullstack Developer",
    description: "Fullstack Developer specializing in React, Next.js, Node.js.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark text-white`}>
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
