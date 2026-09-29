"use client"

import type { ReactNode } from "react"

import { SealStamp } from "@/components/diagrams/seal-stamp"
import { Checkbox } from "@/components/ui/checkbox"
import { t } from "@/i18n/t"
import { shortHex } from "@/lib/demo/ids"
import type { Field, Study } from "@/lib/demo/types"
import { formatDate, formatNumber, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { l10n, useCopy } from "./app-context"

/**
 * Signature moment 3: the consent slip. A perforated record with a stub; when
 * revoked, the stub tears away and the slip is stamped.
 */
export function ConsentSlip({
  study,
  fields,
  until,
  status,
  proofId,
  nullifier,
  grantedAt,
  block,
  tearing,
  editable,
  footer,
}: {
  study: Study
  fields: Field[]
  until: string
  status: "draft" | "active" | "revoked" | "expired"
  proofId?: string
  nullifier?: string
  grantedAt?: string
  block?: number
  tearing?: boolean
  editable?: { onToggle: (f: Field, on: boolean) => void; error?: string }
  footer?: ReactNode
}) {
  const { a, labels, locale } = useCopy()
  const s = a.slip
  const ended = status === "revoked" || status === "expired"
  const shown = editable ? study.fields : fields

  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-lg border bg-card sm:flex-row", ended && "bg-muted/40")}>
      <div className="relative min-w-0 flex-1 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-seal">{s.title}</p>
          {status !== "draft" && (
            <span
              className={cn(
                "text-xs font-medium",
                status === "active" ? "text-primary" : status === "revoked" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {status === "active" ? s.active : status === "revoked" ? s.revoked : s.expired}
            </span>
          )}
        </div>
        <p className="mt-2 font-serif text-lg leading-snug font-medium">{l10n(study.title, locale)}</p>
        <p className="text-sm text-muted-foreground">{study.lab}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{s.fields}</dt>
            <dd className="mt-1.5">
              <ul className="space-y-1.5">
                {shown.map((f) => {
                  const optional = study.optionalFields.includes(f)
                  const on = fields.includes(f)
                  return (
                    <li key={f} className="flex items-center gap-2.5">
                      {editable ? (
                        <>
                          <Checkbox
                            id={`slip-${study.id}-${f}`}
                            checked={on}
                            disabled={!optional}
                            onCheckedChange={(v) => editable.onToggle(f, v === true)}
                          />
                          <label htmlFor={`slip-${study.id}-${f}`} className={cn(!on && "text-muted-foreground line-through")}>
                            {labels.fields[f]}
                            {optional && <span className="ml-1.5 text-xs text-muted-foreground no-underline">({a.study.optional})</span>}
                          </label>
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true" className={cn("size-1.5 rounded-full", ended ? "bg-muted-foreground" : "bg-primary")} />
                          <span className={cn(ended && "text-muted-foreground line-through")}>{labels.fields[f]}</span>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
              {editable?.error && (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {editable.error}
                </p>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-dashed pt-3">
            <div>
              <dt className="text-xs text-muted-foreground">{s.until}</dt>
              <dd className="tnum font-medium">{formatDate(locale, until)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{s.reward}</dt>
              <dd className="tnum font-medium">{formatToken(locale, study.reward)} tUSDC</dd>
            </div>
          </div>
          {status === "draft" && <p className="text-xs text-muted-foreground">{s.rewardNote}</p>}
        </dl>
        {status === "revoked" && (
          <span
            aria-hidden="true"
            className="animate-seal-stamp pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 -rotate-12 rounded-sm border-2 border-destructive px-3 py-1 font-serif text-2xl tracking-wider text-destructive uppercase opacity-90"
          >
            {s.revoked}
          </span>
        )}
        {footer && <div className="mt-5">{footer}</div>}
      </div>

      {/* Stub, behind a perforation */}
      <div
        className={cn(
          "relative flex shrink-0 flex-row items-center gap-4 px-5 py-4 sm:w-44 sm:flex-col sm:items-start sm:py-5",
          "perforation-top sm:perforation sm:border-t-0",
          tearing && "animate-tear"
        )}
      >
        <span aria-hidden="true" className="absolute -top-2 -left-2 hidden size-4 rounded-full border bg-background sm:block" />
        <span aria-hidden="true" className="absolute -bottom-2 -left-2 hidden size-4 rounded-full border bg-background sm:block" />
        <SealStamp size="sm" className={cn(ended && "border-muted-foreground text-muted-foreground [&>span]:border-muted-foreground/60")} />
        <div className="min-w-0 space-y-1.5 text-xs">
          <dl className="space-y-1.5">
          {proofId && (
            <div>
              <dt className="text-muted-foreground">{s.proof}</dt>
              <dd className="font-mono" title={proofId}>
                {shortHex(proofId, 6, 4)}
              </dd>
            </div>
          )}
          {nullifier && (
            <div>
              <dt className="text-muted-foreground">{s.nullifier}</dt>
              <dd className="font-mono" title={nullifier}>
                {shortHex(nullifier, 6, 4)}
              </dd>
            </div>
          )}
          </dl>
          {grantedAt && (
            <p className="text-muted-foreground">
              {t(s.granted, { date: formatDate(locale, grantedAt, false) })}
              {block ? ` · ${t(s.block, { block: formatNumber(locale, block) })}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
