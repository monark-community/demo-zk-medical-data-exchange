"use client"

import { InfoIcon, SparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { randomHex } from "@/lib/demo/ids"
import { logFailure, publishStudy } from "@/lib/demo/ops"
import { estimateCohort, POPULATION_SIZE } from "@/lib/demo/population"
import { LAB_NAME } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { Condition, Criterion, DataKind, Field, Medication, Study } from "@/lib/demo/types"
import { formatNumber, formatToken } from "@/lib/format"
import { cn } from "@/lib/utils"

import { describeCriterion, useCopy } from "./app-context"
import { PageHead } from "./parts"
import { TxFeedback } from "./tx-feedback"

const CONDITIONS: Condition[] = ["t2d", "hypertension", "asthma", "sleep_apnea", "migraine"]
const MEDS: Medication[] = ["metformin", "amlodipine", "statin", "ace_inhibitor", "inhaled_steroid"]
const DATA: DataKind[] = ["medications", "sleep", "activity", "genomic"]
const FIELDS: Field[] = ["hba1c", "bp", "medications", "sleep", "steps", "bmi", "diagnoses"]
const DURATIONS = [4, 8, 12, 16, 26, 52]

interface Draft {
  title: string
  question: string
  age: [number, number]
  condition: Condition | "none"
  useHba1c: boolean
  hba1c: [number, number]
  useSystolic: boolean
  systolic: number
  requireMed: Medication | "none"
  excludeMed: Medication | "none"
  data: DataKind[]
  fields: Field[]
  duration: number
  reward: string
  target: string
}

const BLANK: Draft = {
  title: "",
  question: "",
  age: [18, 80],
  condition: "none",
  useHba1c: false,
  hba1c: [6.5, 9],
  useSystolic: false,
  systolic: 130,
  requireMed: "none",
  excludeMed: "none",
  data: [],
  fields: [],
  duration: 12,
  reward: "40",
  target: "60",
}

function criteriaOf(d: Draft): Criterion[] {
  const out: Criterion[] = [{ kind: "age", min: d.age[0], max: d.age[1] }]
  if (d.condition !== "none") out.push({ kind: "condition", condition: d.condition })
  if (d.useHba1c) out.push({ kind: "hba1c", min: d.hba1c[0], max: d.hba1c[1] })
  if (d.useSystolic) out.push({ kind: "systolic", min: d.systolic })
  if (d.requireMed !== "none") out.push({ kind: "medication", medication: d.requireMed, present: true })
  if (d.excludeMed !== "none") out.push({ kind: "medication", medication: d.excludeMed, present: false })
  for (const k of d.data) out.push({ kind: "data", data: k })
  return out
}

type ErrorKey = "title" | "question" | "criteria" | "fields" | "reward" | "target"

export function StudyBuilder() {
  const state = useDemo()
  const copy = useCopy()
  const { a, labels, locale } = copy
  const b = a.builder
  const router = useRouter()
  const tx = useTx()
  const [d, setD] = useState<Draft>(BLANK)
  const [showErrors, setShowErrors] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }))

  const criteria = useMemo(() => criteriaOf(d), [d])
  const k = state?.rules.minCohort ?? 10
  const cohort = useMemo(() => estimateCohort(criteria, k), [criteria, k])
  if (!state) return null

  const reward = Number(d.reward.replace(",", "."))
  const target = Math.floor(Number(d.target))
  const escrow = Number.isFinite(reward * target) ? reward * target : 0
  const balance = state.wallet.balances.lab.tusdc

  const errors: Partial<Record<ErrorKey | "summary", string>> = {}
  if (d.title.trim().length < 6) errors.title = b.errors.title
  if (d.question.trim().length < 20) errors.question = b.errors.question
  if (criteria.length < 2) errors.criteria = b.errors.criteria
  if (d.fields.length === 0) errors.fields = b.errors.fields
  if (!(reward > 0)) errors.reward = b.errors.reward
  if (!(target >= k)) errors.target = t(b.errors.target, { k })
  else if (cohort.hidden) errors.target = b.errors.hidden
  else if (cohort.rounded !== null && target > cohort.rounded) errors.target = b.errors.cohort
  if (escrow > balance) errors.reward = b.errors.balance
  const valid = Object.keys(errors).length === 0
  const err = (key: ErrorKey) => (showErrors ? errors[key] : undefined)

  function fillExample() {
    setShowErrors(false)
    setD({
      ...BLANK,
      title: b.exampleTitle,
      question: b.exampleQuestion,
      age: [40, 75],
      condition: "sleep_apnea",
      useSystolic: true,
      systolic: 130,
      fields: ["bp", "diagnoses"],
      duration: 12,
      reward: "40",
      target: "60",
    })
  }

  async function publish() {
    setShowErrors(true)
    if (!valid || !state) return
    const study: Study = {
      id: `${d.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)}-${randomHex(4)}`,
      title: { en: d.title.trim(), fr: d.title.trim() },
      question: { en: d.question.trim(), fr: d.question.trim() },
      lab: LAB_NAME,
      owner: state.wallet.labAddress,
      criteria,
      fields: d.fields,
      optionalFields: [],
      durationWeeks: d.duration,
      reward,
      target,
      enrolled: 0,
      publishedAt: new Date().toISOString(),
      status: "open",
      escrowTx: "",
    }
    const receipt = await tx.run(
      {
        title: b.publishTitle,
        rows: [
          { label: b.rowStudy, value: study.title.en },
          { label: b.rowCriteria, value: String(criteria.length) },
          { label: b.rowEscrow, value: `${formatToken(locale, escrow)} tUSDC` },
        ],
        movesValue: true,
      },
      (r) => publishStudy(study, r),
      (hash) => logFailure("publish", hash, "lab")
    )
    if (receipt) {
      toast.success(t(a.lab.published_toast, { study: study.title.en }))
      router.push(href(locale, "/app/lab"))
    }
  }

  const busy = tx.state.phase === "signing" || tx.state.phase === "pending"

  return (
    <div className="space-y-8">
      <PageHead
        eyebrow={b.eyebrow}
        title={b.title}
        body={b.body}
        actions={
          <Button variant="outline" onClick={fillExample}>
            <SparklesIcon aria-hidden="true" />
            {b.example}
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        <form
          className="space-y-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            publish()
          }}
        >
          <Card title={b.basics}>
            <FieldBox id="b-title" label={b.titleLabel} error={err("title")}>
              <Input
                id="b-title"
                value={d.title}
                placeholder={b.titlePlaceholder}
                aria-invalid={!!err("title")}
                onChange={(e) => set("title", e.target.value)}
              />
            </FieldBox>
            <FieldBox id="b-question" label={b.questionLabel} error={err("question")}>
              <Textarea
                id="b-question"
                rows={3}
                value={d.question}
                placeholder={b.questionPlaceholder}
                aria-invalid={!!err("question")}
                onChange={(e) => set("question", e.target.value)}
              />
            </FieldBox>
          </Card>

          <Card title={b.criteria} hint={b.criteriaHint}>
            <div>
              <div className="flex items-baseline justify-between">
                <Label>{b.age}</Label>
                <span className="tnum text-sm font-medium">
                  {d.age[0]}–{d.age[1]}
                </span>
              </div>
              <Slider
                className="mt-1"
                min={18}
                max={90}
                step={1}
                value={d.age}
                thumbLabels={[b.ageMin, b.ageMax]}
                onValueChange={(v) => set("age", [v[0] ?? 18, v[1] ?? 90])}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldBox id="b-condition" label={b.condition}>
                <Select value={d.condition} onValueChange={(v) => set("condition", v as Draft["condition"])}>
                  <SelectTrigger id="b-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{b.conditionNone}</SelectItem>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {labels.conditions[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBox>
              <FieldBox id="b-med" label={b.medication}>
                <Select value={d.requireMed} onValueChange={(v) => set("requireMed", v as Draft["requireMed"])}>
                  <SelectTrigger id="b-med">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{b.medicationNone}</SelectItem>
                    {MEDS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {labels.medications[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBox>
              <FieldBox id="b-exmed" label={b.excludeMedication}>
                <Select value={d.excludeMed} onValueChange={(v) => set("excludeMed", v as Draft["excludeMed"])}>
                  <SelectTrigger id="b-exmed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{b.medicationNone}</SelectItem>
                    {MEDS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {labels.medications[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBox>
            </div>
            <Toggleable
              id="b-hba1c"
              label={b.hba1c}
              use={b.use}
              on={d.useHba1c}
              onToggle={(v) => set("useHba1c", v)}
              value={`${formatNumber(locale, d.hba1c[0], 1)}–${formatNumber(locale, d.hba1c[1], 1)} %`}
            >
              <Slider
                min={4}
                max={12}
                step={0.1}
                value={d.hba1c}
                thumbLabels={[b.hba1cMin, b.hba1cMax]}
                onValueChange={(v) => set("hba1c", [v[0] ?? 4, v[1] ?? 12])}
              />
            </Toggleable>
            <Toggleable
              id="b-sys"
              label={b.systolic}
              use={b.use}
              on={d.useSystolic}
              onToggle={(v) => set("useSystolic", v)}
              value={`≥ ${d.systolic} mmHg`}
            >
              <Slider
                min={100}
                max={180}
                step={5}
                value={[d.systolic]}
                thumbLabels={[b.systolic]}
                onValueChange={(v) => set("systolic", v[0] ?? 130)}
              />
            </Toggleable>
            <fieldset>
              <legend className="text-sm font-medium">{b.data}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {DATA.map((k) => (
                  <label key={k} className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 text-sm">
                    <Checkbox
                      checked={d.data.includes(k)}
                      onCheckedChange={(v) => set("data", v === true ? [...d.data, k] : d.data.filter((x) => x !== k))}
                    />
                    {labels.kindNames[k]}
                  </label>
                ))}
              </div>
            </fieldset>
            {err("criteria") && (
              <p role="alert" className="text-sm text-destructive">
                {err("criteria")}
              </p>
            )}
          </Card>

          <Card title={b.fields} hint={b.fieldsHint}>
            <fieldset aria-invalid={!!err("fields")}>
              <legend className="sr-only">{b.fields}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <label key={f} className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 text-sm">
                    <Checkbox
                      checked={d.fields.includes(f)}
                      onCheckedChange={(v) => set("fields", v === true ? [...d.fields, f] : d.fields.filter((x) => x !== f))}
                    />
                    {labels.fields[f]}
                  </label>
                ))}
              </div>
            </fieldset>
            {err("fields") && (
              <p role="alert" className="text-sm text-destructive">
                {err("fields")}
              </p>
            )}
          </Card>

          <Card title={b.terms}>
            <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <FieldBox id="b-duration" label={b.duration}>
                <Select value={String(d.duration)} onValueChange={(v) => set("duration", Number(v))}>
                  <SelectTrigger id="b-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {t(b.weeks, { weeks: w })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBox>
              <FieldBox id="b-reward" label={b.reward} error={err("reward")}>
                <Input
                  id="b-reward"
                  inputMode="decimal"
                  value={d.reward}
                  aria-invalid={!!err("reward")}
                  onChange={(e) => set("reward", e.target.value)}
                />
              </FieldBox>
              <FieldBox id="b-target" label={b.target} error={err("target")}>
                <Input
                  id="b-target"
                  inputMode="numeric"
                  value={d.target}
                  aria-invalid={!!err("target")}
                  onChange={(e) => set("target", e.target.value)}
                />
              </FieldBox>
            </div>
          </Card>

          <div className="lg:hidden">
            {renderSummary()}
          </div>
        </form>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {renderSummary()}
          </div>
        </aside>
      </div>
    </div>
  )

  function renderSummary() {
    const pct = cohort.rounded ? Math.min(100, (cohort.rounded / POPULATION_SIZE) * 100 * 4) : 0
    return (
      <div className="space-y-4 rounded-lg border bg-card p-5">
        <div>
          <p className="text-sm font-semibold">{b.cohort}</p>
          <div aria-live="polite" className="mt-3">
            {cohort.hidden ? (
              <div className="space-y-2">
                <div aria-hidden="true" className="hatch h-10 rounded-md" />
                <p className="text-sm">{t(b.cohortHidden, { k })}</p>
              </div>
            ) : (
              <>
                <p className="tnum font-serif text-4xl font-medium">
                  {t(b.cohortApprox, { count: formatNumber(locale, cohort.rounded ?? 0) })}
                </p>
                <p className="text-sm text-muted-foreground">{t(b.cohortOf, { total: formatNumber(locale, POPULATION_SIZE) })}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
                </div>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t(b.cohortNote, { k })}</p>
        </div>
        <ul className="space-y-1 border-t border-rule pt-3 text-xs text-muted-foreground">
          {criteria.map((c, i) => (
            <li key={i}>· {describeCriterion(c, copy)}</li>
          ))}
        </ul>
        <div className="border-t border-rule pt-3">
          <p className="text-sm text-muted-foreground">{b.escrow}</p>
          <p className="tnum font-serif text-2xl font-medium">{formatToken(locale, escrow)} tUSDC</p>
          <p className="text-xs text-muted-foreground">{b.escrowNote}</p>
        </div>
        {showErrors && !valid && (
          <p role="alert" className="text-sm text-destructive">
            {b.fixErrors}
          </p>
        )}
        <Button type="button" size="lg" className="w-full" disabled={busy} onClick={publish}>
          {b.publish}
        </Button>
        <TxFeedback state={tx.state} pendingLabel={b.funding} onRetry={publish} />
        <p className="flex gap-2 text-xs text-muted-foreground">
          <InfoIcon className="mt-px size-3.5 shrink-0 text-seal" aria-hidden="true" />
          {copy.common.testnetNotice}
        </p>
      </div>
    )
  }
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3">
        <h2 className="font-sans text-sm font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  )
}

function FieldBox({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p role="alert" id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function Toggleable({
  id,
  label,
  use,
  on,
  onToggle,
  value,
  children,
}: {
  id: string
  label: string
  use: string
  on: boolean
  onToggle: (v: boolean) => void
  value: string
  children: ReactNode
}) {
  return (
    <div className={cn("rounded-md border px-3 py-3", on ? "bg-background" : "bg-muted/40")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Switch id={id} checked={on} onCheckedChange={onToggle} aria-label={`${use}: ${label}`} />
          <Label htmlFor={id} className="text-sm">
            {label}
          </Label>
        </div>
        {on && <span className="tnum text-sm font-medium">{value}</span>}
      </div>
      {on && <div className="mt-2">{children}</div>}
    </div>
  )
}
