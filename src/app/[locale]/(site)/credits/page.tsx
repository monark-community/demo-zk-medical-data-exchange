import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).credits.meta
  return pageMetadata(locale, "/credits", m.title, m.description)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const c = getDictionary(locale).credits
  const link = "text-primary underline underline-offset-4 hover:decoration-2"
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
      <h1 className="text-4xl font-medium sm:text-5xl">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.body}</p>
      <ul className="mt-10 border-t">
        {PHOTOS.map((p) => (
          <li key={p.file} className="flex gap-4 border-b py-5 sm:gap-6">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border sm:h-28 sm:w-24">
              <Image src={p.file} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-serif text-lg font-medium">
                {t(c.photo, { name: "" })}
                <a className={link} href={p.profile} target="_blank" rel="noopener noreferrer">
                  {p.photographer}
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">{t(c.usedOn, { place: p.usedOn[locale] })}</p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <a className={link} href={p.page} target="_blank" rel="noopener noreferrer">
                  {c.view}
                </a>
                <a className={link} href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
                  {c.license}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-2xl font-medium">{c.code}</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{c.codeBody}</p>
    </section>
  )
}
