"use client"

import {
  ArchiveIcon,
  CheckCircle2Icon,
  FlaskConicalIcon,
  KeyRoundIcon,
  LandmarkIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WalletIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { shortHex } from "@/lib/demo/ids"
import type { Activity, ActivityKind, Consent, DemoState, Study } from "@/lib/demo/types"
import { formatDateTime, formatNumber, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { describeCriterion, l10n, useCopy } from "./app-context"

export function PageHead({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string
  title: string
  body?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow text-seal">{eyebrow}</p>
        <h1 className="mt-2 text-3xl leading-tight font-medium sm:text-4xl">{title}</h1>
        {body && <p className="mt-3 text-muted-foreground">{body}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="ruled flex flex-col items-start gap-4 rounded-lg border border-dashed bg-card px-5 py-8 sm:items-center sm:text-center">
      <p className="max-w-md text-muted-foreground">{children}</p>
      {action}
    </div>
  )
}

export function StatTile({ label, children, href: to }: { label: string; children: ReactNode; href?: string }) {
  const inner = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="tnum mt-2 font-serif text-3xl font-medium">{children}</div>
    </>
  )
  const cls = "block rounded-lg border bg-card p-5 transition-colors"
  return to ? (
    <Link href={to} className={cn(cls, "hover:border-primary/60")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export function consentFor(state: DemoState, studyId: string): Consent | undefined {
  return state.consents.find((c) => c.studyId === studyId)
}

export function StudyStatusBadge({ state, study }: { state: DemoState; study: Study }) {
  const { a } = useCopy()
  const c = consentFor(state, study.id)
  if (c?.status === "active")
    return (
      <Badge variant="default">
        <CheckCircle2Icon aria-hidden="true" />
        {a.studies.joined}
      </Badge>
    )
  if (c) return <Badge variant="muted">{a.studies.ended}</Badge>
  return null
}

export function EnrolmentBar({ study }: { study: Study }) {
  const { a, locale } = useCopy()
  const pct = Math.min(100, Math.round((study.enrolled / study.target) * 100))
  return (
    <div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={study.target}
        aria-valuenow={study.enrolled}
        aria-label={a.study.enrolment}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="tnum mt-1.5 text-xs text-muted-foreground">
        {t(a.studies.enrolled, { enrolled: formatNumber(locale, study.enrolled), target: formatNumber(locale, study.target) })}
      </p>
    </div>
  )
}

export function StudyCard({ state, study }: { state: DemoState; study: Study }) {
  const copy = useCopy()
  const { a, locale } = copy
  return (
    <article className="group relative flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-primary/60">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">{study.lab}</p>
        <StudyStatusBadge state={state} study={study} />
      </div>
      <h3 className="mt-2 text-lg leading-snug font-medium">
        <Link
          href={href(locale, `/app/studies/${study.id}`)}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-ring"
        >
          {l10n(study.title, locale)}
        </Link>
      </h3>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={a.study.criteria}>
        {study.criteria.slice(0, 3).map((c, i) => (
          <li key={i} className="rounded-sm border border-rule bg-background px-1.5 py-0.5 text-xs">
            {describeCriterion(c, copy)}
          </li>
        ))}
        {study.criteria.length > 3 && (
          <li className="px-1 py-0.5 text-xs text-muted-foreground">+{study.criteria.length - 3}</li>
        )}
      </ul>
      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
          <span className="tnum font-medium">{t(a.studies.reward, { amount: formatToken(locale, study.reward) })}</span>
          <span className="text-muted-foreground">{t(a.studies.weeks, { weeks: study.durationWeeks })}</span>
        </div>
        <EnrolmentBar study={study} />
      </div>
    </article>
  )
}

const ICONS: Record<ActivityKind, LucideIcon> = {
  connect: WalletIcon,
  import: ArchiveIcon,
  delete: Trash2Icon,
  check: KeyRoundIcon,
  enrol: ShieldCheckIcon,
  narrow: ScissorsIcon,
  revoke: ScissorsIcon,
  claim: WalletIcon,
  publish: FlaskConicalIcon,
  vote: LandmarkIcon,
  proposal_closed: LandmarkIcon,
  failed: XCircleIcon,
}

export function activityText(entry: Activity, state: DemoState, copy: ReturnType<typeof useCopy>): string {
  const { a, labels, locale } = copy
  const e = a.activity
  const p = entry.params
  const studyTitle = (id: unknown) => {
    const s = state.studies.find((x) => x.id === id)
    return s ? l10n(s.title, locale) : String(id)
  }
  switch (entry.kind) {
    case "import":
    case "delete":
      return t(e.entries[entry.kind], { source: labels.sources[p.source as keyof typeof labels.sources]?.name ?? String(p.source) })
    case "check":
      return t(e.entries.check, {
        study: studyTitle(p.study),
        verdict: e.verdicts[p.verdict as keyof typeof e.verdicts] ?? String(p.verdict),
      })
    case "enrol":
    case "narrow":
    case "revoke":
      return t(e.entries[entry.kind], { study: studyTitle(p.study) })
    case "claim":
      return t(e.entries.claim, { amount: formatToken(locale, Number(p.amount)) })
    case "publish":
      return t(e.entries.publish, { study: studyTitle(p.study), amount: formatToken(locale, Number(p.amount)) })
    case "vote":
      return t(e.entries.vote, { proposal: p.proposal ?? "" })
    case "proposal_closed":
      return t(e.entries.proposal_closed, {
        proposal: p.proposal ?? "",
        outcome: e.outcomes[p.outcome as keyof typeof e.outcomes] ?? "",
      })
    case "failed":
      return t(e.entries.failed, { action: e.actions[p.action as keyof typeof e.actions] ?? String(p.action) })
    case "connect":
      return e.entries.connect
  }
}

export function ActivityList({ state, entries }: { state: DemoState; entries: Activity[] }) {
  const copy = useCopy()
  const { a, locale } = copy
  return (
    <ol className="divide-y divide-rule rounded-lg border bg-card">
      {entries.map((entry) => {
        const Icon = ICONS[entry.kind]
        return (
          <li key={entry.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
            <span
              className={cn(
                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border",
                entry.kind === "failed" && "border-destructive/50 text-destructive",
                entry.local && "border-dashed",
                entry.kind === "enrol" && "border-seal/60 bg-seal-wash text-seal"
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.9375rem] leading-snug">{activityText(entry, state, copy)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <time dateTime={entry.at}>{formatDateTime(locale, entry.at)}</time>
                <span>{entry.role === "lab" ? a.shell.lab : a.shell.patient}</span>
                {entry.local && (
                  <span className="rounded-sm border border-dashed px-1.5 py-px font-medium">{a.activity.local}</span>
                )}
                {entry.block && <span className="tnum">{t(a.activity.block, { block: formatNumber(locale, entry.block) })}</span>}
                {entry.txHash && (
                  <span className="font-mono" title={entry.txHash}>
                    {shortHex(entry.txHash, 8, 6)}
                  </span>
                )}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

