"use client"

import { ArrowRightIcon, InfoIcon, ScissorsIcon, SlidersHorizontalIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TokenAmount } from "@/components/ui/token-amount"
import { href, intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { claimRewards, claimable, logFailure, narrowConsent, revokeConsent } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { Consent, Field, Study } from "@/lib/demo/types"
import { formatDate, formatToken, toBaseUnits } from "@/lib/format"

import { l10n, useCopy } from "./app-context"
import { ConsentSlip } from "./consent-slip"
import { Empty, PageHead } from "./parts"
import { TxFeedback } from "./tx-feedback"

export function ConsentsView() {
  const state = useDemo()
  const copy = useCopy()
  const { a, locale } = copy
  const c = a.consents
  const claimTx = useTx()
  // Slips revoked in this visit stay in place so the tear is visible.
  const [torn, setTorn] = useState<string[]>([])
  if (!state) return null

  const active = state.consents.filter((x) => x.status === "active" || torn.includes(x.id))
  const ended = state.consents.filter((x) => x.status !== "active" && !torn.includes(x.id))
  const amount = claimable(state)
  const study = (id: string) => state.studies.find((s) => s.id === id)

  async function claim() {
    await claimTx.run(
      { title: c.claimTitle, rows: [{ label: c.claimRow, value: `${formatToken(locale, amount)} tUSDC` }], movesValue: true },
      (receipt) => {
        claimRewards(receipt)
        toast.success(t(c.claimed, { amount: formatToken(locale, amount) }))
      },
      (hash) => logFailure("claim", hash, "patient")
    )
  }

  return (
    <div className="space-y-10">
      <PageHead eyebrow={c.eyebrow} title={c.title} body={c.body} />

      <section aria-labelledby="rewards" className="rounded-lg border bg-card">
        <h2 id="rewards" className="border-b px-5 py-3 font-sans text-sm font-semibold">
          {c.rewardsTitle}
        </h2>
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">{c.claimable}</p>
            <TokenAmount
              value={toBaseUnits(amount)}
              decimals={6}
              fractionDigits={2}
              symbol="tUSDC"
              locale={intlLocale[locale]}
              className="mt-1 text-3xl [&_.font-mono]:font-serif"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{c.balance}</p>
            <TokenAmount
              value={toBaseUnits(state.wallet.balances.patient.tusdc)}
              decimals={6}
              fractionDigits={2}
              symbol="tUSDC"
              locale={intlLocale[locale]}
              className="mt-1 text-xl"
            />
          </div>
          <Button
            size="lg"
            onClick={claim}
            disabled={amount <= 0 || claimTx.state.phase === "signing" || claimTx.state.phase === "pending"}
          >
            <WalletIcon aria-hidden="true" />
            {c.claim}
          </Button>
        </div>
        <div className="space-y-3 border-t border-rule px-5 py-3">
          {amount <= 0 && claimTx.state.phase === "idle" && <p className="text-sm text-muted-foreground">{c.nothing}</p>}
          <TxFeedback state={claimTx.state} onRetry={claim} />
          <p className="flex gap-2 text-xs text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0 text-seal" aria-hidden="true" />
            {copy.common.testnetNotice}
          </p>
        </div>
      </section>

      <section aria-labelledby="active-slips" className="space-y-4">
        <h2 id="active-slips" className="text-2xl font-medium">
          {c.active}
        </h2>
        {active.length === 0 ? (
          <Empty
            action={
              <Button asChild>
                <Link href={href(locale, "/app/studies")}>
                  {c.findStudy}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            {c.empty}
          </Empty>
        ) : (
          active.map((consent) => {
            const s = study(consent.studyId)
            return s ? (
              <ActiveSlip key={consent.id} consent={consent} study={s} onRevoked={() => setTorn((cur) => [...cur, consent.id])} />
            ) : null
          })
        )}
      </section>

      <section aria-labelledby="ended-slips" className="space-y-4">
        <h2 id="ended-slips" className="text-2xl font-medium">
          {c.ended}
        </h2>
        {ended.length === 0 ? (
          <p className="text-muted-foreground">{c.emptyEnded}</p>
        ) : (
          ended.map((consent) => {
            const s = study(consent.studyId)
            return s ? (
              <ConsentSlip
                key={consent.id}
                study={s}
                fields={consent.fields}
                until={consent.expiresAt}
                status={consent.status}
                proofId={consent.proofId}
                nullifier={consent.nullifier}
                grantedAt={consent.grantedAt}
                footer={
                  consent.endedAt && (
                    <p className="text-xs text-muted-foreground">{t(c.endedOn, { date: formatDate(locale, consent.endedAt) })}</p>
                  )
                }
              />
            ) : null
          })
        )}
      </section>
    </div>
  )
}

function ActiveSlip({ consent, study, onRevoked }: { consent: Consent; study: Study; onRevoked: () => void }) {
  const copy = useCopy()
  const { a, labels, locale } = copy
  const c = a.consents
  const tx = useTx()
  const [narrowOpen, setNarrowOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [draft, setDraft] = useState<Field[]>(consent.fields)
  const [tearing, setTearing] = useState(false)
  const busy = tx.state.phase === "signing" || tx.state.phase === "pending"

  async function narrow() {
    setNarrowOpen(false)
    const fields = draft
    await tx.run(
      {
        title: c.narrowSign,
        rows: [
          { label: a.slip.rowStudy, value: l10n(study.title, locale) },
          { label: a.slip.rowFields, value: fields.map((f) => labels.fields[f]).join(", ") },
        ],
      },
      (receipt) => {
        narrowConsent(consent.id, fields, receipt)
        toast.success(t(c.narrowed, { count: fields.length }))
      },
      (hash) => logFailure("narrow", hash, "patient")
    )
  }

  async function revoke() {
    setRevokeOpen(false)
    await tx.run(
      { title: c.revokeSign, rows: [{ label: a.slip.rowStudy, value: l10n(study.title, locale) }] },
      (receipt) => {
        setTearing(true)
        onRevoked()
        revokeConsent(consent.id, receipt)
        toast(c.revoked)
      },
      (hash) => logFailure("revoke", hash, "patient")
    )
  }

  return (
    <div className="space-y-3">
      <ConsentSlip
        study={study}
        fields={consent.fields}
        until={consent.expiresAt}
        status={consent.status}
        proofId={consent.proofId}
        nullifier={consent.nullifier}
        grantedAt={consent.grantedAt}
        tearing={tearing}
        footer={
          consent.status === "active" && <div className="flex flex-wrap items-center gap-2">
            <span className="tnum mr-auto text-sm text-muted-foreground">
              {t(c.accrued, { amount: formatToken(locale, consent.accrued) })}
            </span>
            {study.optionalFields.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setDraft(consent.fields)
                  setNarrowOpen(true)
                }}
              >
                <SlidersHorizontalIcon aria-hidden="true" />
                {c.narrow}
              </Button>
            )}
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setRevokeOpen(true)} className="text-destructive">
              <ScissorsIcon aria-hidden="true" />
              {c.revoke}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={href(locale, `/app/studies/${study.id}`)}>{c.viewStudy}</Link>
            </Button>
          </div>
        }
      />
      <TxFeedback state={tx.state} />

      <Dialog open={narrowOpen} onOpenChange={setNarrowOpen}>
        <DialogContent closeLabel={copy.common.close}>
          <DialogHeader>
            <DialogTitle>{c.narrowTitle}</DialogTitle>
            <DialogDescription>{c.narrowBody}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {consent.fields.map((f) => {
              const locked = !study.optionalFields.includes(f)
              return (
                <li key={f} className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                  <Checkbox
                    id={`narrow-${consent.id}-${f}`}
                    checked={draft.includes(f)}
                    disabled={locked}
                    onCheckedChange={(v) => setDraft((cur) => (v === true ? [...cur, f] : cur.filter((x) => x !== f)))}
                  />
                  <label htmlFor={`narrow-${consent.id}-${f}`} className="text-sm">
                    {labels.fields[f]}
                    {!locked && <span className="ml-1.5 text-xs text-muted-foreground">({a.study.optional})</span>}
                  </label>
                </li>
              )
            })}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNarrowOpen(false)}>
              {a.vault.cancel}
            </Button>
            <Button onClick={narrow} disabled={draft.length === 0 || draft.length === consent.fields.length}>
              {c.narrowSave}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent closeLabel={copy.common.close}>
          <DialogHeader>
            <DialogTitle>{c.revokeTitle}</DialogTitle>
            <DialogDescription>{c.revokeBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>
              {c.cancel}
            </Button>
            <Button variant="destructive" onClick={revoke}>
              <ScissorsIcon aria-hidden="true" />
              {c.revokeConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
