"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Locale } from "@/i18n/config"

import { CuraWordmark } from "./brand"
import { LocaleSwitch } from "./locale-switch"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

export interface MobileMenuLabels {
  open: string
  close: string
  nav: string
  tagline: string
  cta: string
  theme: string
  language: string
  names: Record<Locale, string>
  short: Record<Locale, string>
}

export function MobileMenu({
  locale,
  items,
  appHref,
  labels,
}: {
  locale: Locale
  items: NavItem[]
  appHref: string
  labels: MobileMenuLabels
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="md:hidden">
          <MenuIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="w-full max-w-sm gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>
            <CuraWordmark />
          </SheetTitle>
          <SheetDescription>{labels.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label={labels.nav} className="flex-1 px-3 py-4">
          <NavLinks
            items={items}
            className="flex flex-col"
            itemClassName="h-12 w-full rounded-none border-b border-rule px-3 text-base aria-[current=page]:text-primary aria-[current=page]:after:hidden"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <div className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitch locale={locale} label={labels.language} names={labels.names} short={labels.short} />
            <ThemeToggle label={labels.theme} />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={appHref} onClick={() => setOpen(false)}>
              {labels.cta}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
