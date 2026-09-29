"use client"

import { CheckIcon, MinusIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { SealStamp } from "@/components/diagrams/seal-stamp"
import { t } from "@/i18n/t"
import { shortHex } from "@/lib/demo/ids"
import type { Evaluation, Proof } from "@/lib/demo/prover"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { describeCriterion, describeValue, useCopy } from "./app-context"

/**
 * The app's "two sides of the glass": after a private check, flip between the
 * patient's values and exactly what the lab would receive.
 */
export function ProofGlass({ evaluation, proof }: { evaluation: Evaluation; proof?: Proof }) {
  const copy = useCopy()
  const { a, locale } = copy
  const p = a.proof
  const [view, setView] = useState<"yours" | "lab">("yours")
  const labView = view === "lab" && !!proof

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      {proof && (
        <div role="group" aria-label={p.viewToggle} className="grid grid-cols-2 border-b bg-muted p-1">
          {(["yours", "lab"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "h-9 rounded-[4px] text-sm font-medium transition-colors",
                view === v ? "bg-card shadow-[0_1px_0_var(--border)]" : "text-muted-foreground hover:text-foreground",
                v === "lab" && view === v && "text-seal"
              )}
            >
              {v === "yours" ? p.yourView : p.labView}
            </button>
          ))}
        </div>
      )}
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">{labView ? p.labView : p.yourView}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{p.criterion}</th>
            <th scope="col">{p.value}</th>
          </tr>
        </thead>
        <tbody key={view}>
          {evaluation.results.map((r, i) => (
            <tr key={i} className="border-b border-rule last:border-b-0">
              <th scope="row" className="w-[52%] px-3 py-2.5 text-left align-top font-normal">
                {describeCriterion(r.criterion, copy)}
              </th>
              <td className="px-3 py-2.5 align-top">
                {labView ? (
                  <span className="block">
                    <span className="animate-tick-in flex items-center gap-1.5 text-primary" style={{ animationDelay: `${250 + i * 220}ms` }}>
                      <CheckIcon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                      {p.pass}
                    </span>
                    <span
                      aria-hidden="true"
                      className="hatch animate-seal-band mt-1 block h-2 rounded-[2px]"
                      style={{ animationDelay: `${i * 220}ms` }}
                    />
                    <span className="sr-only">{p.sealed}</span>
                  </span>
                ) : (
                  <span className="flex items-start justify-between gap-2">
                    <span className={cn("tnum", r.outcome === "missing" && "text-muted-foreground")}>{describeValue(r, copy)}</span>
                    {r.outcome === "pass" && (
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-label={p.pass} />
                    )}
                    {r.outcome === "fail" && <XIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-label={p.fail} />}
                    {r.outcome === "missing" && (
                      <MinusIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label={p.missingValue} />
                    )}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {proof && (
        <div className="flex items-center gap-4 border-t bg-seal-wash/60 px-3 py-3">
          <SealStamp
            size="sm"
            label={p.proofId}
            className={labView ? "animate-seal-stamp" : ""}
            style={labView ? { animationDelay: `${evaluation.results.length * 220 + 200}ms` } : undefined}
          />
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="min-w-0">
              <dt className="text-muted-foreground">{p.proofId}</dt>
              <dd className="truncate font-mono" title={proof.id}>
                {shortHex(proof.id, 8, 4)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">{p.nullifier}</dt>
              <dd className="truncate font-mono" title={proof.nullifier}>
                {shortHex(proof.nullifier, 8, 4)}
              </dd>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {t(p.size, { bytes: proof.bytes, ms: formatNumber(locale, proof.ms) })} ·{" "}
              {t(p.constraints, { count: formatNumber(locale, proof.constraints) })}
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
