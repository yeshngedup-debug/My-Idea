import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { MotionProvider } from "@/components/ui/motion-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bhutantech.bt"),
  title: {
    default: "Bhutan Tech Connect | Paid project work in Bhutan",
    template: "%s | Bhutan Tech Connect",
  },
  description:
    "Bhutan Tech Connect connects Bhutanese students and startup founders through focused, paid project work.",
  applicationName: "Bhutan Tech Connect",
  alternates: { canonical: "/" },
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
  themeColor: "#f5f2ea",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

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

        {/* Favicons & app icons (new logo mark) */}
        {/* Preferred: the vector mark (forest #17352b + amber #e0ad3c arch cap). */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* PNG/ICO fallbacks for browsers without SVG favicon support. All were
            regenerated deterministically from /favicon.svg in the canonical
            forest + amber palette (see reports/icon-fix.md). */}
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
        {/* iOS requires a PNG apple-touch-icon; this 180px asset was regenerated
            from /favicon.svg with the canonical forest + amber mark. */}
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bhutan Tech Connect",
              url: "https://bhutantech.bt/",
              email: "hello@bhutantech.bt",
              logo: "https://bhutantech.bt/icon-512.png",
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:bg-[#fffefa] focus:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]"
        >
          Skip to main content
        </a>
        {/* Single polite live region for app-wide status messages. */}
        <div id="global-status" aria-live="polite" className="sr-only" />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
