import type { Metadata } from "next"

import { ConsentsView } from "@/components/demo/consents-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/consents">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/consents", d.app.shell.consents, d.meta.description)
}

export default function Page() {
  return <ConsentsView />
}
