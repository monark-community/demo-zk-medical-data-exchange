"use client"

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CircleIcon, KeyRoundIcon, Loader2Icon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { sleep, useTx } from "@/lib/demo/chain"
import { shortHex } from "@/lib/demo/ids"
import { enrol, logFailure, logLocalCheck } from "@/lib/demo/ops"
import { constraintCount, evaluate, prove, type Evaluation, type Proof, type ProofStage } from "@/lib/demo/prover"
import { SAMPLE_FACTS } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { DataKind, Field, RecordSource, Study } from "@/lib/demo/types"
import { formatDate, formatNumber, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { describeCriterion, l10n, useCopy } from "./app-context"
import { ConsentSlip } from "./consent-slip"
import { EnrolmentBar, consentFor } from "./parts"
import { ProofGlass } from "./proof-glass"
import { TxFeedback } from "./tx-feedback"

const SOURCE_FOR: Partial<Record<DataKind, RecordSource>> = {
  sleep: "sleep_ring",
  activity: "phone",
  medications: "pharmacy",
  clinic: "clinic",
  labs: "clinic",
}

type Check =
  | { phase: "idle" }
  | { phase: "proving"; stage: ProofStage; progress: number }
  | { phase: "result"; evaluation: Evaluation; proof?: Proof }

const STAGES: ProofStage[] = ["reading", "witness", "proving"]

export function StudyView({ id }: { id: string }) {
  const state = useDemo()
  const copy = useCopy()
  const { a, labels, locale } = copy
  const study = state?.studies.find((s) => s.id === id)

  if (!state) return null
  if (!study)
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="text-muted-foreground">{a.study.notFound}</p>
      </div>
    )
  const consent = consentFor(state, study.id)

  return (
    <div className="space-y-8">
      <BackLink />
      <header className="border-b pb-6">
        <p className="eyebrow text-seal">{study.lab}</p>
        <h1 className="mt-2 max-w-3xl text-3xl leading-tight font-medium sm:text-4xl">{l10n(study.title, locale)}</h1>
        <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">{a.study.reward}</dt>
            <dd className="tnum font-medium">{formatToken(locale, study.reward)} tUSDC</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{a.study.duration}</dt>
            <dd className="font-medium">{t(a.studies.weeks, { weeks: study.durationWeeks })}</dd>
          </div>
          <div className="col-span-2">
            <dt className="mb-1.5 text-xs text-muted-foreground">{a.study.enrolment}</dt>
            <dd>
              <EnrolmentBar study={study} />
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] xl:grid-cols-[1fr_28rem]">
        <div className="space-y-8">
          <section>
            <h2 className="font-sans text-sm font-semibold">{a.study.question}</h2>
            <p className="mt-2 font-serif text-xl leading-snug">{l10n(study.question, locale)}</p>
          </section>
          <section>
            <h2 className="font-sans text-sm font-semibold">{a.study.criteria}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.study.criteriaNote}</p>
            <ol className="mt-3 divide-y divide-rule rounded-lg border bg-card">
              {study.criteria.map((c, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3 text-[0.9375rem]">
                  <span className="tnum w-5 font-serif text-seal italic" aria-hidden="true">
                    {i + 1}
                  </span>
                  {describeCriterion(c, copy)}
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-sans text-sm font-semibold">{a.study.asks}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.study.asksNote}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {study.fields.map((f) => (
                <li key={f} className="rounded-sm border bg-card px-2.5 py-1 text-sm">
                  {labels.fields[f]}
                  {study.optionalFields.includes(f) && <span className="ml-1.5 text-xs text-muted-foreground">({a.study.optional})</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {study.status === "closed" && !consent ? (
            <p className="rounded-lg border bg-card p-5 text-muted-foreground">{a.study.closed}</p>
          ) : (
            <ProofPanel key={study.id} study={study} />
          )}
        </aside>
      </div>
    </div>
  )
}

function BackLink() {
  const { a, locale } = useCopy()
  return (
    <Link
      href={href(locale, "/app/studies")}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden="true" />
      {a.study.back}
    </Link>
  )
}

function ProofPanel({ study }: { study: Study }) {
  const state = useDemo()
  const copy = useCopy()
  const { a, labels, locale } = copy
  const p = a.proof
  const [check, setCheck] = useState<Check>({ phase: "idle" })
  const [fields, setFields] = useState<Field[]>(study.fields)
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [justEnrolled, setJustEnrolled] = useState(false)
  const [now] = useState(() => Date.now())
  const tx = useTx()
  if (!state) return null

  const existing = consentFor(state, study.id)
  const capDays = state.rules.consentCapMonths * 30
  const until = new Date(now + Math.min(study.durationWeeks * 7, capDays) * 86_400_000).toISOString()

  async function runCheck() {
    if (!state) return
    tx.reset()
    const evaluation = evaluate(study.criteria, SAMPLE_FACTS, state.records)
    setCheck({ phase: "proving", stage: "reading", progress: 0 })
    if (evaluation.verdict !== "eligible") {
      await sleep(700)
      if (evaluation.verdict === "not_eligible") {
        setCheck({ phase: "proving", stage: "witness", progress: 0 })
        await sleep(700)
      }
      logLocalCheck(study.id, evaluation.verdict)
      setCheck({ phase: "result", evaluation })
      return
    }
    const proof = await prove(study.id, state.wallet.patientAddress, study.criteria, (stage, progress) =>
      setCheck({ phase: "proving", stage, progress })
    )
    logLocalCheck(study.id, "eligible")
    setCheck({ phase: "result", evaluation, proof })
  }

  async function submit(proof: Proof) {
    if (fields.length === 0) {
      setFieldError(a.slip.atLeastOne)
      return
    }
    const r = await tx.run(
      {
        title: a.slip.signTitle,
        rows: [
          { label: a.slip.rowStudy, value: l10n(study.title, locale) },
          { label: a.slip.rowFields, value: fields.map((f) => labels.fields[f]).join(", ") },
          { label: a.slip.rowUntil, value: formatDate(locale, until) },
          { label: a.slip.rowProof, value: shortHex(proof.id, 8, 6) },
        ],
      },
      (receipt) => enrol(study, fields, proof, receipt),
      (hash) => logFailure("enrol", hash, "patient")
    )
    if (r) {
      setJustEnrolled(true)
      toast.success(t(a.slip.enrolledToast, { study: l10n(study.title, locale) }))
    }
  }

  // Already enrolled (or enrolled before): the nullifier blocks a second enrolment.
  if (existing && !justEnrolled) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="font-medium">{existing.status === "active" ? a.study.yourStatus : a.study.endedStatus}</p>
          <p className="mt-2 text-sm text-muted-foreground">{existing.status === "active" ? p.already : p.alreadyEnded}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={href(locale, "/app/consents")}>
              {a.study.viewConsent}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ConsentSlip
          study={study}
          fields={existing.fields}
          until={existing.expiresAt}
          status={existing.status}
          proofId={existing.proofId}
          nullifier={existing.nullifier}
          grantedAt={existing.grantedAt}
        />
      </section>
    )
  }

  return (
    <section aria-labelledby="check-title" className="space-y-4 rounded-lg border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-seal/50 bg-seal-wash text-seal">
          <KeyRoundIcon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="check-title" className="text-xl font-medium">
            {p.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
        </div>
      </div>

      {check.phase === "idle" && (
        <Button className="w-full" size="lg" onClick={runCheck}>
          <KeyRoundIcon aria-hidden="true" />
          {p.start}
        </Button>
      )}

      {check.phase === "proving" && (
        <div aria-live="polite" className="space-y-3">
          <ol className="space-y-2 text-sm">
            {STAGES.map((s) => {
              const idx = STAGES.indexOf(s)
              const cur = STAGES.indexOf(check.stage === "done" ? "proving" : check.stage)
              const done = idx < cur || check.stage === "done"
              const active = idx === cur && check.stage !== "done"
              return (
                <li key={s} className={cn("flex items-center gap-2.5", !done && !active && "text-muted-foreground")}>
                  {done ? (
                    <CheckIcon className="size-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
                  ) : active ? (
                    <Loader2Icon className="size-4 animate-spin text-seal" aria-hidden="true" />
                  ) : (
                    <CircleIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  {p.stages[s]}
                </li>
              )
            })}
          </ol>
          {check.stage === "proving" && (
            <div>
              <Progress value={check.progress * 100} className="h-1.5" aria-label={p.stages.proving} />
              <p className="tnum mt-1.5 font-mono text-xs text-muted-foreground">
                {t(p.constraints, {
                  count: `${formatNumber(locale, Math.round(constraintCount(study.criteria) * check.progress))} / ${formatNumber(locale, constraintCount(study.criteria))}`,
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {check.phase === "result" && (
        <div className="space-y-4">
          <Verdict evaluation={check.evaluation} />
          <ProofGlass evaluation={check.evaluation} proof={check.proof} />
          {check.proof && !justEnrolled && (
            <>
              <ConsentSlip
                study={study}
                fields={fields}
                until={until}
                status="draft"
                proofId={check.proof.id}
                nullifier={check.proof.nullifier}
                editable={{
                  error: fieldError,
                  onToggle: (f, on) => {
                    setFieldError(undefined)
                    setFields((cur) => (on ? [...cur, f] : cur.filter((x) => x !== f)))
                  },
                }}
              />
              <p className="text-xs text-muted-foreground">{a.slip.submitHint}</p>
              <Button
                size="lg"
                className="w-full"
                disabled={tx.state.phase === "signing" || tx.state.phase === "pending"}
                onClick={() => check.proof && submit(check.proof)}
              >
                {a.slip.submit}
              </Button>
              <TxFeedback
                state={tx.state}
                pendingLabel={a.slip.verifying}
                onRetry={() => check.proof && submit(check.proof)}
              />
            </>
          )}
          {justEnrolled && (
            <div className="space-y-3">
              <TxFeedback state={tx.state} />
              <p className="flex items-center gap-2 font-medium text-primary">
                <CheckIcon className="size-4" strokeWidth={2.5} aria-hidden="true" />
                {a.slip.enrolled}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href={href(locale, "/app/consents")}>
                  {a.study.viewConsent}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}
          {!check.proof && (
            <Button variant="outline" className="w-full" onClick={runCheck}>
              <RotateCcwIcon aria-hidden="true" />
              {p.again}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

function Verdict({ evaluation }: { evaluation: Evaluation }) {
  const { a, labels, locale } = useCopy()
  const p = a.proof
  if (evaluation.verdict === "eligible")
    return (
      <div className="rounded-md border border-primary/40 bg-secondary p-4">
        <p className="font-serif text-lg font-medium text-primary">{p.eligible}</p>
        <p className="mt-1 text-sm text-muted-foreground">{p.eligibleBody}</p>
      </div>
    )
  if (evaluation.verdict === "not_eligible")
    return (
      <div role="status" className="rounded-md border p-4">
        <p className="font-serif text-lg font-medium">{p.notEligible}</p>
        <p className="mt-1 text-sm text-muted-foreground">{p.notEligibleBody}</p>
      </div>
    )
  const kinds = evaluation.missing.map((k) => labels.kinds[k]).join(", ")
  const source = evaluation.missing.map((k) => SOURCE_FOR[k]).find(Boolean)
  const importable = evaluation.missing.every((k) => SOURCE_FOR[k])
  return (
    <div role="status" className="rounded-md border border-seal/40 bg-seal-wash/60 p-4">
      <p className="font-serif text-lg font-medium">{t(p.missing, { kinds })}</p>
      <p className="mt-1 text-sm text-muted-foreground">{importable ? p.missingBody : t(p.missingNoSource, { kinds })}</p>
      {importable && source && (
        <Button asChild size="sm" className="mt-3">
          <Link href={`${href(locale, "/app/vault")}?import=${source}`}>{p.importCta}</Link>
        </Button>
      )}
    </div>
  )
}
