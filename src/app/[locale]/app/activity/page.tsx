import type { Metadata } from "next"

import { ActivityView } from "@/components/demo/activity-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/activity">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/activity", d.app.shell.activity, d.meta.description)
}

export default function Page() {
  return <ActivityView />
}
