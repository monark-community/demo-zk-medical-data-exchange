import type { Metadata } from "next"

import { StudyBuilder } from "@/components/demo/study-builder"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/lab/new">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/lab/new", d.app.shell.newStudy, d.meta.description)
}

export default function Page() {
  return <StudyBuilder />
}
