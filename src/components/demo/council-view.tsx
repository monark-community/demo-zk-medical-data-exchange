"use client"

import { CheckIcon, FastForwardIcon, Loader2Icon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { sleep, useTx } from "@/lib/demo/chain"
import { castVote, closeProposal, logFailure } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { Proposal } from "@/lib/demo/types"
import { formatDate, formatNumber } from "@/lib/format"

import { l10n, useCopy } from "./app-context"
import { PageHead } from "./parts"
import { TxFeedback } from "./tx-feedback"

export function CouncilView() {
  const state = useDemo()
  const { a, locale } = useCopy()
  const c = a.council
  if (!state) return null
  const open = state.proposals.filter((p) => p.status === "open")
  const closed = state.proposals.filter((p) => p.status !== "open")

  return (
    <div className="space-y-10">
      <PageHead eyebrow={c.eyebrow} title={c.title} body={c.body} />

      <section aria-labelledby="rules" className="rounded-lg border bg-card">
        <h2 id="rules" className="border-b px-5 py-3 font-sans text-sm font-semibold">
          {c.rules}
        </h2>
        <dl className="grid sm:grid-cols-2">
          <div className="border-b border-rule px-5 py-4 sm:border-r sm:border-b-0">
            <dt className="text-sm text-muted-foreground">{c.minCohort}</dt>
            <dd className="tnum mt-1 font-serif text-2xl font-medium">{t(c.minCohortValue, { k: state.rules.minCohort })}</dd>
          </div>
          <div className="px-5 py-4">
            <dt className="text-sm text-muted-foreground">{c.consentCap}</dt>
            <dd className="tnum mt-1 font-serif text-2xl font-medium">
              {t(c.consentCapValue, { months: state.rules.consentCapMonths })}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="open-props" className="space-y-4">
        <h2 id="open-props" className="text-2xl font-medium">
          {c.open}
        </h2>
        {state.role === "lab" && <p className="text-sm text-muted-foreground">{c.labNote}</p>}
        {open.length === 0 ? (
          <p className="text-muted-foreground">—</p>
        ) : (
          open.map((p) => <OpenProposal key={p.id} proposal={p} canVote={state.role === "patient"} />)
        )}
      </section>

      <section aria-labelledby="closed-props" className="space-y-4">
        <h2 id="closed-props" className="text-2xl font-medium">
          {c.closed}
        </h2>
        <ul className="divide-y divide-rule rounded-lg border bg-card">
          {closed.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium">
                  <span className="tnum mr-2 text-muted-foreground">#{p.number}</span>
                  {l10n(p.title, locale)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(c.ended, { date: formatDate(locale, p.endsAt) })} · {c.yes} {formatNumber(locale, p.yes)} · {c.no}{" "}
                  {formatNumber(locale, p.no)}
                </p>
              </div>
              <Badge variant={p.status === "passed" ? "default" : "outline"} className="self-start">
                {p.status === "passed" ? c.passed : c.rejected}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function OpenProposal({ proposal: p, canVote }: { proposal: Proposal; canVote: boolean }) {
  const { a, locale } = useCopy()
  const c = a.council
  const tx = useTx()
  const [proving, setProving] = useState(false)
  const total = p.yes + p.no
  const yesPct = total ? Math.round((p.yes / total) * 100) : 0
  const busy = proving || tx.state.phase === "signing" || tx.state.phase === "pending"

  async function vote(v: "yes" | "no") {
    setProving(true)
    await sleep(900)
    setProving(false)
    await tx.run(
      {
        title: c.signTitle,
        rows: [
          { label: c.rowProposal, value: `#${p.number} · ${l10n(p.title, locale)}` },
          { label: c.rowVote, value: v === "yes" ? c.yes : c.no },
        ],
      },
      (receipt) => {
        castVote(p.id, v, receipt)
        toast.success(c.voted)
      },
      (hash) => logFailure("vote", hash, "patient")
    )
  }

  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="tnum text-xs text-muted-foreground">
          #{p.number} · {t(c.endsIn, { date: formatDate(locale, p.endsAt) })}
        </p>
        <p className="tnum text-xs text-muted-foreground">{t(c.votes, { count: formatNumber(locale, total) })}</p>
      </div>
      <h3 className="mt-2 text-xl font-medium">{l10n(p.title, locale)}</h3>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground">{l10n(p.summary, locale)}</p>

      <div className="mt-5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${yesPct}%` }} />
          <div className="h-full flex-1 bg-chart-4/70" />
        </div>
        <div className="tnum mt-2 flex justify-between text-sm">
          <span>
            <span className="font-medium text-primary">{c.yes}</span> {formatNumber(locale, p.yes)} · {yesPct} %
          </span>
          <span>
            <span className="font-medium text-destructive">{c.no}</span> {formatNumber(locale, p.no)} · {100 - yesPct} %
          </span>
        </div>
      </div>

      {canVote && (
        <div className="mt-5 space-y-3 border-t border-rule pt-4">
          {p.myVote ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckIcon className="size-4" strokeWidth={2.5} aria-hidden="true" />
                {t(c.youVoted, { vote: p.myVote === "yes" ? c.yes : c.no })}
              </p>
              <Button
                variant="outline"
                size="sm"
                title={c.closeHint}
                onClick={() => {
                  closeProposal(p.id)
                  toast(t(c.closedToast, { n: p.number, outcome: p.yes > p.no ? c.passed.toLowerCase() : c.rejected.toLowerCase() }))
                }}
              >
                <FastForwardIcon aria-hidden="true" />
                {c.closeNow}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => vote("yes")} disabled={busy}>
                <ThumbsUpIcon aria-hidden="true" />
                {c.voteYes}
              </Button>
              <Button variant="outline" onClick={() => vote("no")} disabled={busy}>
                <ThumbsDownIcon aria-hidden="true" />
                {c.voteNo}
              </Button>
            </div>
          )}
          {proving && (
            <p aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin text-seal" aria-hidden="true" />
              {c.proving}
            </p>
          )}
          <TxFeedback state={tx.state} />
          {p.myVote && <p className="text-xs text-muted-foreground">{c.closeHint}</p>}
        </div>
      )}
    </article>
  )
}
