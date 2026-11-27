import type { ReactNode } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";

/**
 * Auth shell. One shared chrome for every auth route: the header, the single
 * work column and the footer live here, so each page only renders its own
 * form card and help panel.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
