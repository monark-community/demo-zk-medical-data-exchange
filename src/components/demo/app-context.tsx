"use client"

import { createContext, useContext } from "react"

import type { Locale } from "@/i18n/config"
import type { AppDict, Dictionary, Labels } from "@/i18n/dictionaries/en"
import { t } from "@/i18n/t"
import type { Criterion, L10n } from "@/lib/demo/types"
import type { CriterionResult } from "@/lib/demo/prover"
import { formatNumber } from "@/lib/format"

export interface AppCopy {
  locale: Locale
  a: AppDict
  labels: Labels
  common: Pick<Dictionary["common"], "demoNotice" | "sampleNotice" | "testnetNotice" | "close" | "theme" | "language">
}

const Ctx = createContext<AppCopy | null>(null)

export const AppCopyProvider = Ctx.Provider

export function useCopy(): AppCopy {
  const v = useContext(Ctx)
  if (!v) throw new Error("useCopy outside AppCopyProvider")
  return v
}

/** Pick the visitor's language from a bilingual demo string. */
export function l10n(value: L10n, locale: Locale): string {
  return value[locale]
}

export function describeCriterion(c: Criterion, copy: AppCopy): string {
  const { a, labels, locale } = copy
  const n = (v: number, d = 0) => formatNumber(locale, v, d)
  switch (c.kind) {
    case "age":
      return t(a.criteria.age, { min: c.min, max: c.max })
    case "condition":
      return c.onsetBeforeAge
        ? t(a.criteria.conditionOnset, { condition: labels.conditions[c.condition], age: c.onsetBeforeAge })
        : t(a.criteria.condition, { condition: labels.conditions[c.condition] })
    case "hba1c":
      return t(a.criteria.hba1c, { min: n(c.min, 1), max: n(c.max, 1) })
    case "systolic":
      return t(a.criteria.systolic, { min: c.min })
    case "medication":
      return t(c.present ? a.criteria.medication : a.criteria.noMedication, {
        medication: labels.medicationPhrase[c.medication],
      })
    case "data":
      return t(a.criteria.data, { kind: labels.kinds[c.data] })
  }
}

/** The patient's private value for a criterion, as shown only on their side of the glass. */
export function describeValue(r: CriterionResult, copy: AppCopy): string {
  const { a, locale } = copy
  if (r.outcome === "missing" || !r.value) return a.proof.missingValue
  const v = r.value
  switch (v.kind) {
    case "age":
      return t(a.values.age, { age: v.age })
    case "condition":
      return v.present && v.onsetAge !== undefined ? t(a.values.diagnosed, { age: v.onsetAge }) : a.values.absent
    case "hba1c":
      return t(a.values.hba1c, { value: formatNumber(locale, v.value, 1) })
    case "systolic":
      return t(a.values.bp, { sys: v.systolic, dia: v.diastolic })
    case "medication":
      return v.present ? a.values.medPresent : a.values.medAbsent
    case "data":
      return a.values.dataPresent
  }
}
