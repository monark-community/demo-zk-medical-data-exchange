import type { Metadata } from "next"

import { LabOverview } from "@/components/demo/lab-overview"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/lab">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/lab", d.app.shell.myStudies, d.meta.description)
}

export default function Page() {
  return <LabOverview />
}
