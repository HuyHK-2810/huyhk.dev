import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/brand/theme-script";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://huyhk.dev"),
  title: {
    default: "huyHK — fullstack engineer who started as a tester",
    template: "%s",
  },
  description:
    "Personal site of Hồ Khắc Huy — fullstack engineer. 9 years building products with React, Next.js, Node.js, and Python. Stories from the tester-to-fullstack journey.",
  authors: [{ name: "Hồ Khắc Huy", url: "https://huyhk.dev" }],
  creator: "Hồ Khắc Huy",
  keywords: [
    "huyHK",
    "Hồ Khắc Huy",
    "fullstack engineer",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "TypeScript",
    "Penguin Secret Agency",
  ],
  openGraph: {
    title: "huyHK — fullstack engineer & writer",
    description:
      "Stories from 9 years in the trenches. Real bugs, real lessons, no listicles.",
    url: "https://huyhk.dev",
    siteName: "huyHK",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "huyHK — fullstack engineer & writer",
    description:
      "Stories from 9 years in the trenches. Real bugs, real lessons, no listicles.",
  },
  alternates: {
    canonical: "https://huyhk.dev",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-paper text-ink`}
      >
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
