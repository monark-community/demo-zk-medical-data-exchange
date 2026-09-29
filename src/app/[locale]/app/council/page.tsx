import type { Metadata } from "next"

import { CouncilView } from "@/components/demo/council-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/council">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/council", d.app.shell.council, d.meta.description)
}

export default function Page() {
  return <CouncilView />
}
