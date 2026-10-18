"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {src ? (
        <AvatarPrimitive.Image src={src} alt={name} className="aspect-square size-full object-cover" />
      ) : null}
      <AvatarPrimitive.Fallback
        className={cn(
          "flex size-full items-center justify-center rounded-full brand-gradient text-sm font-bold text-white",
          !src && "bg-primary/15 text-primary",
        )}
      >
        {initialsOf(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
