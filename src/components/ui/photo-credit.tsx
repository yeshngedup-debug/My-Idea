/**
 * Attribution for the Wikimedia Commons photographs used across the site.
 * Callers pass only the Commons file URL; the registry supplies the correct
 * author and licence so credits stay accurate when an image is reused.
 */
import styles from "@/styles/pressable.module.css";
const CREDITS: Record<string, { author: string; licence: string; licenceUrl: string }> = {
  "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg": {
    author: "Doctor 17",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg": {
    author: "Keith Mason",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg": {
    author: "Christopher J. Fynn",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
};

export function PhotoCredit({
  fileUrl,
  className = "",
}: {
  fileUrl: string;
  className?: string;
}) {
  const credit = CREDITS[fileUrl] ?? {
    author: "Wikimedia Commons",
    licence: "See source",
    licenceUrl: fileUrl,
  };

  return (
    <span className={`text-xs leading-5 ${className}`}>
      Photo:{" "}
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-6 items-center rounded-sm underline underline-offset-2 ${styles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b5c5c]`}
      >
        {credit.author} / Wikimedia Commons
      </a>{" "}
      ·{" "}
      <a
        href={credit.licenceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-6 items-center rounded-sm underline underline-offset-2 ${styles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b5c5c]`}
      >
        {credit.licence}
      </a>
    </span>
  );
}
