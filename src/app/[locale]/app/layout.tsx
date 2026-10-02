import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/demo/app-shell"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: LayoutProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app", d.common.nav.demo, d.meta.description)
}

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale)
  const { demoNotice, sampleNotice, testnetNotice, close, theme, language } = d.common
  return (
    <AppShell
      copy={{
        locale,
        a: d.app,
        labels: d.labels,
        common: { demoNotice, sampleNotice, testnetNotice, close, theme, language },
      }}
      homeLabel={d.common.home}
    >
      {children}
    </AppShell>
  )
}
