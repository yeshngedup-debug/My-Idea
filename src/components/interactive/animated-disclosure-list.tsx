"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/**
 * Disclosure list with native button/region semantics.
 *
 * Open and close are immediate. The chevron changes glyph rather than rotating,
 * and no panel starts at zero opacity.
 */

export type DisclosureItem = {
  id: string;
  trigger: ReactNode;
  children: ReactNode;
};

type DisclosureValue = string | string[] | null;

/** Caller ids can contain spaces or punctuation; IDREFs must contain neither. */
function idPart(id: string, index: number): string {
  const slug = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `item-${index}`;
}

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
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
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
      {items.map((item, index) => {
        const open = isOpen(item.id);
        const part = idPart(item.id, index);
        const triggerId = `${uid}-${part}-trigger`;
        const panelId = `${uid}-${part}-panel`;

        return (
          <div
            key={item.id}
            data-expanded={open}
            className={cn(
              "group border-t last:border-b",
              dark ? "border-white/15" : "border-border",
            )}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-4 rounded-sm px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none",
                dark
                  ? "text-white focus-visible:ring-white focus-visible:ring-offset-foreground"
                  : "text-foreground focus-visible:ring-ring focus-visible:ring-offset-background",
              )}
            >
              <span className="min-w-0 flex-1">{item.trigger}</span>
              <CaretRight
                aria-hidden="true"
                weight="light"
                size={16}
                className={cn(
                  "h-4 w-4 shrink-0 group-data-[expanded=true]:hidden",
                  dark ? "text-white/70" : "text-muted-foreground",
                )}
              />
              <CaretDown
                aria-hidden="true"
                weight="light"
                size={16}
                className={cn(
                  "hidden h-4 w-4 shrink-0 group-data-[expanded=true]:block",
                  dark ? "text-white/70" : "text-muted-foreground",
                )}
              />
            </button>
            {open ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="px-2 pb-5 pr-8 text-sm leading-7 sm:text-base"
              >
                <div
                  className={cn(
                    dark ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {item.children}
                </div>
              </div>
            ) : (
              <span id={panelId} hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AnimatedDisclosureList;
