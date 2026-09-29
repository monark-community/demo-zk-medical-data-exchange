import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { CuraWordmark } from "./brand"
import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.common
  const items = [
    { href: href(locale, "/how-it-works"), label: c.nav.howItWorks },
    { href: href(locale, "/app"), label: c.nav.demo, prefix: true },
  ]
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={href(locale)} aria-label={c.home} className="-ml-1 rounded-md px-1 py-1">
          <CuraWordmark />
        </Link>
        <nav aria-label={c.nav.label} className="ml-4 hidden md:block">
          <NavLinks items={items} className="flex items-center gap-1" />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LocaleSwitch
            locale={locale}
            label={c.language.label}
            names={{ en: c.language.en, fr: c.language.fr }}
            short={c.language.short}
          />
          <ThemeToggle label={c.theme.toggle} />
          <Button asChild className="ml-1">
            <Link href={href(locale, "/app")}>{c.tryDemo}</Link>
          </Button>
        </div>
        <div className="ml-auto md:hidden">
          <MobileMenu
            locale={locale}
            items={items}
            appHref={href(locale, "/app")}
            labels={{
              open: c.openMenu,
              close: c.close,
              nav: c.nav.label,
              tagline: c.tagline,
              cta: c.tryDemo,
              theme: c.theme.toggle,
              language: c.language.label,
              names: { en: c.language.en, fr: c.language.fr },
              short: c.language.short,
            }}
          />
        </div>
      </div>
    </header>
  )
}
