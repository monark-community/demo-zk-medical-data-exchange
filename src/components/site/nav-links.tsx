"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  /** Also active on sub-paths. */
  prefix?: boolean
}

export function NavLinks({
  items,
  className,
  itemClassName,
  onNavigate,
}: {
  items: NavItem[]
  className?: string
  itemClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = item.prefix
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : pathname === item.href
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "relative inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                "aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-seal",
                itemClassName
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
