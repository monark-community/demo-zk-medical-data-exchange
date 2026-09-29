"use client"

import { Loader2Icon, RotateCcwIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import { t } from "@/i18n/t"
import type { TxState } from "@/lib/demo/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"

/**
 * Inline status for one transaction: waiting for signature, pending on the
 * network (registry tx-status), confirmed with its block, or failed.
 */
export function TxFeedback({
  state,
  pendingLabel,
  onRetry,
  className,
}: {
  state: TxState
  pendingLabel?: string
  onRetry?: () => void
  className?: string
}) {
  const { a, locale } = useCopy()
  const x = a.tx
  if (state.phase === "idle") return null
  return (
    <div aria-live="polite" className={cn("text-sm", className)}>
      {state.phase === "signing" && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          {x.signing}
        </p>
      )}
      {state.phase === "pending" && state.hash && (
        <div className="space-y-2">
          <p className="text-muted-foreground">{pendingLabel ?? x.pending}</p>
          <TxStatus status="pending" hash={state.hash} label={x.statusPending} />
        </div>
      )}
      {state.phase === "confirmed" && state.hash && (
        <TxStatus
          status="confirmed"
          hash={state.hash}
          label={state.block ? t(x.confirmed, { block: formatNumber(locale, state.block) }) : x.statusConfirmed}
        />
      )}
      {state.phase === "failed" && (
        <div role="alert" className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-card p-3 sm:flex-row sm:items-center">
          <p className="flex flex-1 gap-2 text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{state.error === "rejected" ? x.rejected : x.failed}</span>
          </p>
          {state.hash && <TxStatus status="failed" hash={state.hash} label={x.statusFailed} className="self-start" />}
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0">
              <RotateCcwIcon aria-hidden="true" />
              {x.retry}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
