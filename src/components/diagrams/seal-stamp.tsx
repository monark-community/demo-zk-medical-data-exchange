import type * as React from "react"

import { CuraMark } from "@/components/site/brand"
import { cn } from "@/lib/utils"

/** Signature moment 2: the ochre proof seal, stamped when a proof completes. */
export function SealStamp({
  label,
  className,
  style,
  size = "md",
}: {
  label?: string
  className?: string
  style?: React.CSSProperties
  size?: "sm" | "md" | "lg"
}) {
  const dims = size === "lg" ? "size-24" : size === "sm" ? "size-12" : "size-16"
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={style}
      className={cn(
        "relative grid -rotate-[8deg] place-items-center rounded-full border-2 border-seal text-seal",
        dims,
        className
      )}
    >
      <span aria-hidden="true" className="absolute inset-[4px] rounded-full border border-dashed border-seal/70" />
      <CuraMark className={size === "sm" ? "size-5" : size === "lg" ? "size-10" : "size-7"} />
    </span>
  )
}
