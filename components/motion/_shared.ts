"use client";

/**
 * One registration point for the scroll runtime. This module is imported only
 * by client components; registration is skipped during server rendering.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
