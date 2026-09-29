"use client"

import { InfoIcon } from "lucide-react"
import { useMemo } from "react"

import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { estimateFee } from "@/lib/demo/chain"
import { useDemo, usePrompt } from "@/lib/demo/store"
import { formatNumber } from "@/lib/format"

import { useCopy } from "./app-context"

/** The simulated wallet's signature request. Closing it counts as rejecting. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const state = useDemo()
  const copy = useCopy()
  const p = copy.a.prompt
  const summary = prompt?.summary
  // A fresh fee estimate per request (simulated).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fee = useMemo(() => estimateFee(), [summary])
  const address = state ? (state.role === "lab" ? state.wallet.labAddress : state.wallet.patientAddress) : ""
  const account = state?.role === "lab" ? copy.a.shell.labAccount : copy.a.shell.patientAccount

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && prompt?.resolve(false)}>
      <DialogContent closeLabel={p.reject} className="max-w-md gap-5">
        <DialogHeader>
          <p className="eyebrow text-seal">{p.title}</p>
          <DialogTitle>{summary?.title}</DialogTitle>
          <DialogDescription>{p.subtitle}</DialogDescription>
        </DialogHeader>
        {summary && (
          <dl className="overflow-hidden rounded-md border text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-rule bg-muted/50 px-4 py-2.5">
              <dt className="text-muted-foreground">{p.account}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                {address && <WalletAvatar address={address} size={20} />}
                <span className="truncate font-medium">{account}</span>
                {address && <WalletAddress address={address} className="text-xs text-muted-foreground max-sm:hidden" />}
              </dd>
            </div>
            {summary.rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 border-b border-rule px-4 py-2.5">
                <dt className="shrink-0 text-muted-foreground">{r.label}</dt>
                <dd className="min-w-0 text-right font-medium break-words">{r.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-b border-rule px-4 py-2.5">
              <dt className="text-muted-foreground">{p.network}</dt>
              <dd className="text-right">{copy.a.shell.network}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{p.fee}</dt>
              <dd className="tnum text-right">
                {summary.signatureOnly ? p.noFee : `${formatNumber(copy.locale, fee, 5)} tETH`}
              </dd>
            </div>
          </dl>
        )}
        {summary?.movesValue && (
          <p className="flex gap-2 rounded-md border border-seal/40 bg-seal-wash px-3 py-2 text-xs">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-seal" aria-hidden="true" />
            {copy.common.testnetNotice}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => prompt?.resolve(false)}>
            {p.reject}
          </Button>
          <Button onClick={() => prompt?.resolve(true)}>{p.confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
