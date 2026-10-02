import type { Metadata } from "next"

import { StudiesView } from "@/components/demo/studies-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/studies">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/studies", d.app.shell.studies, d.meta.description)
}

export default function Page() {
  return <StudiesView />
}
