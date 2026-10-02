import { cn } from "@/lib/utils"

/**
 * Cura's mark: the "half-disclosed seal". The filled half is what you prove,
 * the outlined half is what you keep. Colours follow currentColor.
 */
export function CuraMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-6", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill="currentColor" />
    </svg>
  )
}

/** Mark + lowercase italic wordmark. */
export function CuraWordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <CuraMark className={cn("size-[22px] text-primary", markClassName)} />
      <span className="font-serif text-[1.55rem] leading-none font-medium tracking-[-0.02em] italic">cura</span>
    </span>
  )
}
