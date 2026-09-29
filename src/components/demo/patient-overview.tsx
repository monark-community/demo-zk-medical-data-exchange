"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { TokenAmount } from "@/components/ui/token-amount"
import { href } from "@/i18n/config"
import { claimable } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import { intlLocale } from "@/i18n/config"
import { toBaseUnits } from "@/lib/format"

import { useCopy } from "./app-context"
import { ActivityList, PageHead, StatTile, StudyCard, consentFor } from "./parts"

export function PatientOverview() {
  const state = useDemo()
  const copy = useCopy()
  const { a, locale } = copy
  const o = a.overview
  if (!state) return null
  const active = state.consents.filter((c) => c.status === "active").length
  const suggested = state.studies.filter((s) => s.status === "open" && !consentFor(state, s.id)).slice(0, 3)
  const tourLinks = ["/app/studies/t2d-home-bp", "/app/vault", "/app/consents"]
  const link = "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"

  return (
    <div className="space-y-10">
      <PageHead eyebrow={o.eyebrow} title={o.title} />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label={o.records} href={href(locale, "/app/vault")}>
          {state.records.length}
        </StatTile>
        <StatTile label={o.activeConsents} href={href(locale, "/app/consents")}>
          {active}
        </StatTile>
        <StatTile label={o.claimable} href={href(locale, "/app/consents")}>
          <TokenAmount
            value={toBaseUnits(claimable(state))}
            decimals={6}
            fractionDigits={2}
            symbol="tUSDC"
            locale={intlLocale[locale]}
            className="[&_.font-mono]:font-serif"
          />
        </StatTile>
      </div>

      <section aria-labelledby="tour" className="rounded-lg border bg-seal-wash/50 p-5 sm:p-6">
        <h2 id="tour" className="text-xl font-medium">
          {o.tourTitle}
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {o.tour.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="tnum font-serif text-2xl leading-none text-seal italic" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <Link href={href(locale, tourLinks[i] ?? "/app")} className="font-medium underline-offset-4 hover:underline">
                  {step.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="suggested">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="suggested" className="text-2xl font-medium">
              {o.suggested}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{o.suggestedBody}</p>
          </div>
          <Link href={href(locale, "/app/studies")} className={link}>
            {o.browse}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggested.map((s) => (
            <StudyCard key={s.id} state={state} study={s} />
          ))}
        </div>
      </section>

      <section aria-labelledby="recent">
        <div className="flex items-end justify-between gap-3">
          <h2 id="recent" className="text-2xl font-medium">
            {o.recent}
          </h2>
          <Link href={href(locale, "/app/activity")} className={link}>
            {o.allActivity}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-4">
          <ActivityList state={state} entries={state.activity.filter((e) => e.role === "patient").slice(0, 4)} />
        </div>
      </section>
    </div>
  )
}
