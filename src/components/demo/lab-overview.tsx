"use client"

import { FilePlus2Icon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { href, intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import { formatDate, formatNumber, formatToken, toBaseUnits } from "@/lib/format"

import { l10n, useCopy } from "./app-context"
import { Empty, EnrolmentBar, PageHead, StatTile } from "./parts"

export function LabOverview() {
  const state = useDemo()
  const { a, locale } = useCopy()
  const l = a.lab
  if (!state) return null
  const mine = state.studies.filter((s) => s.owner === state.wallet.labAddress)
  const escrow = mine.filter((s) => s.status === "open").reduce((sum, s) => sum + s.reward * s.target, 0)
  const participants = mine.reduce((sum, s) => sum + s.enrolled, 0)
  const newBtn = (
    <Button asChild>
      <Link href={href(locale, "/app/lab/new")}>
        <FilePlus2Icon aria-hidden="true" />
        {l.newStudy}
      </Link>
    </Button>
  )

  return (
    <div className="space-y-8">
      <PageHead title={l.title} info={l.info} actions={newBtn} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label={l.balance}>
          <TokenAmount
            value={toBaseUnits(state.wallet.balances.lab.tusdc)}
            decimals={6}
            fractionDigits={0}
            symbol="tUSDC"
            locale={intlLocale[locale]}
            className="[&_.font-mono]:font-serif"
          />
        </StatTile>
        <StatTile label={l.escrowed}>
          <TokenAmount
            value={toBaseUnits(escrow)}
            decimals={6}
            fractionDigits={0}
            symbol="tUSDC"
            locale={intlLocale[locale]}
            className="[&_.font-mono]:font-serif"
          />
        </StatTile>
        <StatTile label={l.participants}>{formatNumber(locale, participants)}</StatTile>
      </div>

      <div>
        {mine.length === 0 ? (
          <Empty action={newBtn}>{l.empty}</Empty>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {l.table.study}
                  </th>
                  <th scope="col" className="hidden w-48 px-4 py-3 font-medium md:table-cell">
                    {l.table.enrolment}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    {l.table.escrow}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    {l.table.status}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mine.map((s) => (
                  <tr key={s.id} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-4 align-top">
                      <Link href={href(locale, `/app/studies/${s.id}`)} className="font-serif text-base font-medium underline-offset-4 hover:underline">
                        {l10n(s.title, locale)}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{t(l.published, { date: formatDate(locale, s.publishedAt) })}</p>
                      <div className="mt-3 md:hidden">
                        <EnrolmentBar study={s} />
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 align-top md:table-cell">
                      <EnrolmentBar study={s} />
                    </td>
                    <td className="tnum hidden px-4 py-4 text-right align-top whitespace-nowrap sm:table-cell">
                      {formatToken(locale, s.reward * s.target)} tUSDC
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <Badge variant={s.status === "open" ? "default" : "muted"}>{s.status === "open" ? l.open : l.closed}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
