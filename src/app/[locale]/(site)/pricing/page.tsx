import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Internal strategy review only. Never linked from anywhere, excluded from
 * the sitemap, and marked noindex/nofollow.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).pricing.meta
  return { title: m.title, description: m.description, robots: { index: false, follow: false } }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing
  return (
    <>
      <section className="ruled border-b">
        <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-14 sm:px-6 lg:pt-20">
          <p className="eyebrow text-seal">{p.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-[2.5rem] leading-[1.05] font-medium sm:text-6xl">{p.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{p.body}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {p.plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-lg border bg-card p-6",
                plan.featured && "border-primary ring-1 ring-primary"
              )}
            >
              <h2 className="font-sans text-sm font-semibold">{plan.name}</h2>
              <p className="mt-4 font-serif text-4xl font-medium">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.cadence}</p>
              <p className="mt-4 border-t border-rule pt-4 text-sm">{plan.for}</p>
              <ul className="mt-4 space-y-2">
                {plan.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <h2 className="mt-14 text-2xl font-medium">{p.reasoningTitle}</h2>
        <ol className="mt-4 max-w-3xl list-decimal space-y-2 pl-5 text-muted-foreground marker:text-seal">
          {p.reasoning.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>
    </>
  )
}
