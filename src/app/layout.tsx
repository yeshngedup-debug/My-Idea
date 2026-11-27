import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { MotionProvider } from "@/components/ui/motion-provider";
import { OfflineStatus } from "@/components/network/offline-status";
import { APP_CONTACT, APP_URL } from "@/config/app";
import "./globals.css";

/* Geist is the single product typeface. Its open counters stay legible in
   dense tables and its tight display sizes work on small phones. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Bhutan Tech Connect | Paid project work in Bhutan",
    template: "%s | Bhutan Tech Connect",
  },
  description:
    "Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.",
  applicationName: "Bhutan Tech Connect",
  /* A10: the site is intentionally English-only for now. The root `lang="en"
     dir="ltr"` below and `og:locale: "en_BT"` here are deliberate; no fake
     localized routes or invented alternates are added. When translated routes
     ship, add `alternates.languages`/`hreflang` metadata and a locale switcher. */
  openGraph: {
    type: "website",
    siteName: "Bhutan Tech Connect",
    locale: "en_BT",
    url: "/",
    title: "Bhutan Tech Connect | Paid project work in Bhutan",
    description:
      "Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bhutan Tech Connect, paid project work in Bhutan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhutan Tech Connect | Paid project work in Bhutan",
    description:
      "Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eaf6f6",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const organizationJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bhutan Tech Connect",
    url: `${APP_URL}/`,
    email: APP_CONTACT.email,
    logo: `${APP_URL}/icon-512.png`,
  }).replace(/</g, "\\u003c");

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geist.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        {/* Title, description, OG and Twitter tags come from the Metadata API
            above. Manual duplicates here previously produced two titles and two
            descriptions on every route. */}

        {/* Favicons & app icons. */}
        {/* Preferred: the vector mark (primary teal + decorative teal arch). */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* PNG/ICO fallbacks for browsers without SVG favicon support. All are
            regenerated from /favicon.svg in the canonical teal palette. */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48.png"
        />
        {/* iOS requires a PNG apple-touch-icon; this 180px asset is regenerated
            from /favicon.svg with the canonical teal mark. */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* JSON-LD Organization. No SearchAction: the site has no search route. */}
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
      </head>
      <body
        className="font-sans"
        style={{
          fontFamily:
            "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:bg-[#ffffff] focus:text-[#0b5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
        >
          Skip to main content
        </a>
        {/* Single polite live region for app-wide status messages. */}
        <div id="global-status" aria-live="polite" className="sr-only" />
        <OfflineStatus />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
