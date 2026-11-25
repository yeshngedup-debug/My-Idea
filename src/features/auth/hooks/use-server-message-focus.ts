'use client';

/**
 * Focus a server-rendered alert whenever its message changes.
 *
 * Auth actions redirect back with `?error=...`, which can be a client-side
 * navigation; a mount-only effect would miss repeat failures. Attach the
 * returned ref to the alert element and pass the current error/status text.
 */
import { useEffect, useRef, type RefObject } from 'react';

export function useServerMessageFocus(
  message: string | undefined
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  return ref;
}
