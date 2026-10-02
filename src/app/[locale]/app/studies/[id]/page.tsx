import type { Metadata } from "next"

import { StudyView } from "@/components/demo/study-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { createSeed } from "@/lib/demo/seed"
import { pageMetadata } from "@/lib/metadata"

/** Seeded studies prerender; studies published in the demo render on demand. */
export function generateStaticParams() {
  return locales.flatMap((locale) => createSeed(0).studies.map((s) => ({ locale, id: s.id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/studies/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  const seeded = createSeed(0).studies.find((s) => s.id === id)
  return pageMetadata(locale, `/app/studies/${id}`, seeded ? seeded.title[locale] : d.app.shell.studies, d.meta.description)
}

export default async function Page({ params }: PageProps<"/[locale]/app/studies/[id]">) {
  const { id } = await params
  return <StudyView id={id} />
}
