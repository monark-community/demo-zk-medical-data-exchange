import { CheckIcon, MinusIcon } from "lucide-react"

import { SealStamp } from "@/components/diagrams/seal-stamp"
import type { Dictionary } from "@/i18n"
import { cn } from "@/lib/utils"

type GlassCopy = Dictionary["home"]["glass"]

const ROWS = ["age", "diagnosis", "hba1c", "bp", "meds"] as const

/**
 * Signature moment 1, "two sides of the glass": the same record seen by the
 * patient (values) and by the lab (sealed bands with criterion checks). The
 * seal animation runs once in CSS; reduced motion shows the final state.
 */
export function Glass({ copy, className }: { copy: GlassCopy; className?: string }) {
  return (
    <figure className={cn("relative rounded-lg border bg-card shadow-[0_30px_60px_-36px_rgb(22_33_28/0.45)]", className)}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3 sm:px-5">
        <span className="eyebrow text-muted-foreground">{copy.caption}</span>
        <span className="text-xs text-muted-foreground">{copy.study}</span>
      </figcaption>
      <table className="w-full table-fixed border-collapse text-[0.8125rem] sm:text-sm">
        <caption className="sr-only">
          {copy.yours} / {copy.lab}
        </caption>
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[33%]" />
          <col className="w-[37%]" />
        </colgroup>
        <thead>
          <tr className="border-b text-left">
            <td className="px-4 py-2 sm:px-5" />
            <th scope="col" className="px-2 py-2 font-medium sm:px-3">
              {copy.yours}
            </th>
            <th scope="col" className="border-l border-dashed px-3 py-2 font-medium text-seal sm:px-4">
              {copy.lab}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            const asked = row !== "meds"
            const delay = 500 + i * 380
            return (
              <tr key={row} className="border-b border-rule last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left align-top font-normal text-muted-foreground sm:px-5">
                  {copy.rows[row]}
                </th>
                <td className="tnum px-2 py-3 align-top font-medium sm:px-3">{copy.values[row]}</td>
                <td className="border-l border-dashed px-3 py-2.5 align-top sm:px-4">
                  <span
                    className="animate-tick-in flex items-start gap-1.5 leading-snug"
                    style={{ animationDelay: `${delay + 260}ms` }}
                  >
                    {asked ? (
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2.5} aria-label={copy.met} />
                    ) : (
                      <MinusIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-label={copy.notAsked} />
                    )}
                    <span className={asked ? "" : "text-muted-foreground"}>{copy.checks[row]}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hatch animate-seal-band mt-1.5 block h-2.5 rounded-[2px]"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                  <span className="sr-only">{copy.sealed}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 border-t bg-seal-wash/60 px-4 py-4 sm:px-5">
        <SealStamp label={copy.proof} className="animate-seal-stamp shrink-0" style={{ animationDelay: "2500ms" }} />
        <p className="text-sm leading-snug">
          <span className="block font-medium">{copy.proof}</span>
          <span className="font-mono text-xs text-muted-foreground">0x9c4e…a71b</span>
          <span className="mt-1 block text-muted-foreground">{copy.revealed}</span>
        </p>
      </div>
    </figure>
  )
}
