/**
 * Compatibility alias for the canonical landing page at "/".
 *
 * The server redirect in next.config.ts sends /public to / while preserving
 * query strings. This page is the route-level safety net if that redirect is
 * ever removed; both paths render the same content and metadata.
 */
export { default, metadata } from "../page";
