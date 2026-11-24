import type { Metadata } from "next";

/**
 * Per-page social metadata. The root layout owns defaults, but Next does not
 * copy a page's title/description into its Open Graph fields, so every public
 * page must declare them explicitly or every share preview shows home copy.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  // The root layout appends " | Bhutan Tech Connect" via title.template.
  // Strip any brand already present in a caller's title so it appears once.
  const cleanTitle = title
    .replace(/^Bhutan Tech Connect\s*\|\s*/i, "")
    .replace(/\s*\|\s*Bhutan Tech Connect$/i, "");

  return {
    title: cleanTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: cleanTitle,
      description,
      url: path,
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: cleanTitle },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}
