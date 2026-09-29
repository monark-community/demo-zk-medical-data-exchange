import type { Metadata } from "next"
import { Suspense } from "react"

import { VaultView } from "@/components/demo/vault-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/vault">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/vault", d.app.shell.vault, d.meta.description)
}

export default function Page() {
  return (
    <Suspense>
      <VaultView />
    </Suspense>
  )
}
