import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeInit } from "@/components/ThemeInit";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "A collection of personal projects — web apps, infra, and experiments.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sacenpapier.org"),
  title: {
    default: "sacenpapier.org",
    template: "%s · sacenpapier.org",
  },
  description,
  alternates: {
    types: { "application/rss+xml": "/updates/rss.xml" },
  },
  openGraph: {
    title: "sacenpapier.org",
    description,
    url: "https://sacenpapier.org",
    siteName: "sacenpapier.org",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sacenpapier.org",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <ThemeInit />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
