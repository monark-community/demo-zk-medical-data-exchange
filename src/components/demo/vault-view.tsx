"use client"

import { CheckIcon, Loader2Icon, MinusIcon, PlusIcon, Trash2Icon, XCircleIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { t } from "@/i18n/t"
import { consumeFailure, sleep } from "@/lib/demo/chain"
import { shortHex } from "@/lib/demo/ids"
import { deleteRecord, importRecord, logFailure } from "@/lib/demo/ops"
import { SOURCES } from "@/lib/demo/seed"
import { requestSignature, useDemo } from "@/lib/demo/store"
import type { DataKind, RecordSource } from "@/lib/demo/types"
import { formatDate } from "@/lib/format"

import { useCopy } from "./app-context"
import { Empty, PageHead } from "./parts"

const ALL_SOURCES: RecordSource[] = ["clinic", "pharmacy", "phone", "sleep_ring", "bp_cuff"]
const ALL_KINDS: DataKind[] = ["clinic", "labs", "medications", "sleep", "activity", "genomic"]

type ImportPhase =
  | { phase: "idle" }
  | { phase: "signing" | "encrypting" | "storing"; source: RecordSource; progress: number }
  | { phase: "done"; source: RecordSource }
  | { phase: "failed" | "rejected"; source: RecordSource }

export function VaultView() {
  const state = useDemo()
  const copy = useCopy()
  const { a, labels, locale } = copy
  const v = a.vault
  const params = useSearchParams()
  // Deep link from a study's "missing data" state: /app/vault?import=sleep_ring
  const wanted = params.get("import")
  const [sheetOpen, setSheetOpen] = useState(() => !!wanted)
  const [imp, setImp] = useState<ImportPhase>({ phase: "idle" })
  const [toDelete, setToDelete] = useState<string | null>(null)

  if (!state) return null
  const have = new Set(state.records.map((r) => r.source))
  const kinds = new Set(state.records.flatMap((r) => r.kinds))
  const busy = imp.phase === "signing" || imp.phase === "encrypting" || imp.phase === "storing"

  async function runImport(source: RecordSource) {
    const name = labels.sources[source].name
    setImp({ phase: "signing", source, progress: 0 })
    const ok = await requestSignature({
      title: v.signKey,
      rows: [{ label: v.signKeyRow, value: t(v.signKeyValue, { source: name }) }],
      signatureOnly: true,
    })
    if (!ok) {
      setImp({ phase: "rejected", source })
      return
    }
    for (let i = 1; i <= 8; i++) {
      setImp({ phase: "encrypting", source, progress: i * 6 })
      await sleep(110)
    }
    for (let i = 1; i <= 8; i++) {
      setImp({ phase: "storing", source, progress: 50 + i * 6 })
      await sleep(state?.settings.slow ? 330 : 140)
    }
    if (consumeFailure()) {
      logFailure("import", "", "patient")
      setImp({ phase: "failed", source })
      return
    }
    importRecord(source)
    setImp({ phase: "done", source })
  }

  const ordered = [...ALL_SOURCES].sort((x, y) => {
    const w = (s: RecordSource) => (s === wanted ? -2 : have.has(s) ? 1 : 0)
    return w(x) - w(y)
  })

  return (
    <div className="space-y-8">
      <PageHead
        title={v.title}
        info={v.info}
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <PlusIcon aria-hidden="true" />
            {v.import}
          </Button>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <div>
          {state.records.length === 0 ? (
            <Empty
              action={
                <Button onClick={() => setSheetOpen(true)}>
                  <PlusIcon aria-hidden="true" />
                  {v.import}
                </Button>
              }
            >
              {v.empty}
            </Empty>
          ) : (
            <ul className="space-y-3">
              {state.records.map((r) => {
                const src = labels.sources[r.source]
                return (
                  <li key={r.id} className="rounded-lg border bg-card">
                    <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                      <div className="min-w-0">
                        <h2 className="font-serif text-lg font-medium">{src.name}</h2>
                        <p className="text-sm text-muted-foreground">{src.detail}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setToDelete(r.id)} className="text-muted-foreground">
                        <Trash2Icon aria-hidden="true" />
                        {v.delete}
                      </Button>
                    </div>
                    <dl className="grid gap-x-6 gap-y-3 border-t border-rule px-4 py-3 text-sm sm:grid-cols-3 sm:px-5">
                      <div>
                        <dt className="text-xs text-muted-foreground">{t(v.imported, { date: "" }).trim()}</dt>
                        <dd>{formatDate(locale, r.importedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">{v.provides}</dt>
                        <dd className="mt-0.5 flex flex-wrap gap-1">
                          {r.kinds.map((k) => (
                            <Badge key={k} variant="secondary">
                              {labels.kindNames[k]}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{v.cid}</dt>
                        <dd className="flex items-center gap-2">
                          <span aria-hidden="true" className="hatch h-2 w-8 shrink-0 rounded-[2px]" />
                          <span
                            className="truncate font-mono text-xs"
                            title={`${r.cid} · ${t(v.size, { size: r.sizeKb, entries: r.entries })}`}
                          >
                            {shortHex(r.cid, 12, 6)}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <aside aria-labelledby="vault-knows" className="h-fit rounded-lg border bg-card p-5">
          <h2 id="vault-knows" className="font-sans text-sm font-semibold">
            {v.what}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {ALL_KINDS.map((k) => (
              <li key={k} className={kinds.has(k) ? "flex items-center gap-2" : "flex items-center gap-2 text-muted-foreground"}>
                {kinds.has(k) ? (
                  <CheckIcon className="size-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <MinusIcon className="size-4" aria-hidden="true" />
                )}
                {labels.kindNames[k]}
                <span className="sr-only">{kinds.has(k) ? a.values.dataPresent : a.proof.missingValue}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(o) => !busy && setSheetOpen(o)}>
        <SheetContent side="right" closeLabel={copy.common.close} className="w-full max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle>{v.sheetTitle}</SheetTitle>
            <SheetDescription>{v.sheetBody}</SheetDescription>
          </SheetHeader>
          <ul className="space-y-2">
            {ordered.map((source) => {
              const src = labels.sources[source]
              const present = have.has(source)
              const mine = "source" in imp && imp.source === source ? imp : null
              return (
                <li key={source} className={`rounded-md border p-4 ${source === wanted && !present ? "border-seal/60 bg-seal-wash/50" : "bg-card"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{src.name}</p>
                      <p className="text-sm text-muted-foreground">{src.detail}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {SOURCES[source].kinds.map((k) => (
                          <Badge key={k} variant="secondary">
                            {labels.kindNames[k]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {present ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-primary">
                        <CheckIcon className="size-3.5" aria-hidden="true" />
                        {v.already}
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => runImport(source)} disabled={busy}>
                        {v.importOne}
                      </Button>
                    )}
                  </div>
                  {mine && mine.phase !== "done" && (
                    <div aria-live="polite" className="mt-3 text-sm">
                      {(mine.phase === "encrypting" || mine.phase === "storing" || mine.phase === "signing") && (
                        <>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                            {mine.phase === "signing" ? a.tx.signing : mine.phase === "encrypting" ? v.encrypting : v.storing}
                          </p>
                          <Progress value={mine.progress} className="mt-2 h-1.5" aria-label={v.storing} />
                        </>
                      )}
                      {(mine.phase === "failed" || mine.phase === "rejected") && (
                        <p role="alert" className="flex gap-2 text-destructive">
                          <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                          {mine.phase === "failed" ? v.storageFailed : a.tx.rejected}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </SheetContent>
      </Sheet>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent closeLabel={copy.common.close}>
          <DialogHeader>
            <DialogTitle>{v.deleteTitle}</DialogTitle>
            <DialogDescription>{v.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              {v.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (toDelete) deleteRecord(toDelete)
                setToDelete(null)
              }}
            >
              {v.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
