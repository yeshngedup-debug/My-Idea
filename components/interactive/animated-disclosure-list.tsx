"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/**
 * Disclosure list with a real height tween, derived from the Motion Primitives
 * accordion pattern (MIT). The state, markup and styling here are local: a
 * controlled value, a native button per row, and one chevron rotated through a
 * data attribute. Reduced motion gets an instant open/close.
 */

export type DisclosureItem = {
  id: string;
  trigger: ReactNode;
  children: ReactNode;
};

type DisclosureValue = string | string[] | null;

export function AnimatedDisclosureList({
  items,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  tone = "light",
  label,
  className,
}: {
  items: DisclosureItem[];
  value?: DisclosureValue;
  defaultValue?: DisclosureValue;
  onValueChange?: (value: DisclosureValue) => void;
  multiple?: boolean;
  tone?: "light" | "dark";
  label: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [internal, setInternal] = useState<DisclosureValue>(
    defaultValue ?? items[0]?.id ?? null,
  );
  const active = value !== undefined ? value : internal;
  const dark = tone === "dark";

  function isOpen(id: string) {
    return multiple
      ? Array.isArray(active) && active.includes(id)
      : active === id;
  }

  function toggle(id: string) {
    let next: DisclosureValue;
    if (multiple) {
      const current = Array.isArray(active) ? active : [];
      next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
    } else {
      next = active === id ? null : id;
    }
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("w-full", className)} role="group" aria-label={label}>
      {items.map((item) => {
        const open = isOpen(item.id);
        const triggerId = `${uid}-${item.id}-trigger`;
        const panelId = `${uid}-${item.id}-panel`;

        return (
          <div
            key={item.id}
            data-expanded={open}
            className={cn(
              "group border-t last:border-b",
              dark ? "border-white/15" : "border-[#18251f]/15",
            )}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-4 rounded-sm px-2 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                dark
                  ? "focus-visible:ring-[#fbbf24] focus-visible:ring-offset-[#17352b]"
                  : "focus-visible:ring-[#d84f37] focus-visible:ring-offset-[#f5f2ea]",
              )}
            >
              <span className="min-w-0 flex-1">{item.trigger}</span>
              <CaretRight
                aria-hidden="true"
                weight="light"
                size={16}
                strokeWidth={1.5}
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-data-[expanded=true]:rotate-90 motion-reduce:transition-none",
                  dark ? "text-[#e7b648]" : "text-[#b23c26]",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  key="panel"
                  aria-labelledby={triggerId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={
                    reduce
                      ? { height: 0, opacity: 0, transition: { duration: 0 } }
                      : { height: 0, opacity: 0 }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.18 },
                        }
                  }
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "px-2 pb-5 pr-8 text-sm leading-7 sm:text-base",
                      dark ? "text-white/70" : "text-[#18251f]/70",
                    )}
                  >
                    {item.children}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default AnimatedDisclosureList;
