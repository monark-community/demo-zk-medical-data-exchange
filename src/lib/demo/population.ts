import type { Condition, Criterion, DataKind, Medication } from "./types"

/**
 * A synthetic population of vaults that opted in to anonymous discovery.
 * The lab's cohort estimate counts matches here. In a real deployment the
 * count would come from aggregated, noise-added proofs; the lab never sees
 * rows, only a rounded number above the council's minimum cohort size.
 */

export const POPULATION_SIZE = 6400

interface SynthVault {
  age: number
  conditions: Map<Condition, number>
  hba1c: number
  systolic: number
  meds: Set<Medication>
  kinds: Set<DataKind>
}

/** mulberry32: small, fast, deterministic PRNG. */
function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function normal(rand: () => number, mean: number, sd: number) {
  const u = Math.max(rand(), 1e-9)
  const v = rand()
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

let cache: SynthVault[] | null = null

function population(): SynthVault[] {
  if (cache) return cache
  const rand = prng(20260929)
  const out: SynthVault[] = []
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const age = Math.round(18 + Math.pow(rand(), 0.85) * 70)
    const conditions = new Map<Condition, number>()
    const older = age > 45 ? 1.8 : 0.7
    if (rand() < 0.1 * older) conditions.set("t2d", Math.max(25, age - Math.round(rand() * 15)))
    if (rand() < 0.2 * older) conditions.set("hypertension", Math.max(25, age - Math.round(rand() * 18)))
    if (rand() < 0.1) conditions.set("asthma", Math.round(3 + rand() * Math.min(age - 3, 50)))
    if (rand() < 0.06 * older) conditions.set("sleep_apnea", Math.max(25, age - Math.round(rand() * 10)))
    if (rand() < 0.13) conditions.set("migraine", Math.round(12 + rand() * Math.min(age - 12, 30)))
    const hasT2d = conditions.has("t2d")
    const hba1c = Math.round((hasT2d ? normal(rand, 7.3, 1.0) : normal(rand, 5.4, 0.35)) * 10) / 10
    const systolic = Math.round(normal(rand, conditions.has("hypertension") ? 142 : 122 + (age - 40) * 0.25, 12))
    const meds = new Set<Medication>()
    if (hasT2d && rand() < 0.8) meds.add("metformin")
    if (conditions.has("hypertension")) {
      if (rand() < 0.4) meds.add("amlodipine")
      if (rand() < 0.35) meds.add("ace_inhibitor")
    }
    if (age >= 45 && rand() < 0.28) meds.add("statin")
    if (conditions.has("asthma") && rand() < 0.6) meds.add("inhaled_steroid")
    const kinds = new Set<DataKind>(["clinic"])
    if (rand() < 0.85) kinds.add("labs")
    if (rand() < 0.7) kinds.add("medications")
    if (rand() < 0.22) kinds.add("sleep")
    if (rand() < 0.48) kinds.add("activity")
    if (rand() < 0.06) kinds.add("genomic")
    out.push({ age, conditions, hba1c, systolic, meds, kinds })
  }
  cache = out
  return out
}

function matches(v: SynthVault, c: Criterion): boolean {
  switch (c.kind) {
    case "age":
      return v.age >= c.min && v.age <= c.max
    case "condition": {
      const onset = v.conditions.get(c.condition)
      return onset !== undefined && (c.onsetBeforeAge === undefined || onset < c.onsetBeforeAge)
    }
    case "hba1c":
      return v.kinds.has("labs") && v.hba1c >= c.min && v.hba1c <= c.max
    case "systolic":
      return v.systolic >= c.min
    case "medication":
      return v.kinds.has("medications") && v.meds.has(c.medication) === c.present
    case "data":
      return v.kinds.has(c.data)
  }
}

export interface CohortEstimate {
  /** Rounded to the nearest 10, or null when below the minimum cohort size. */
  rounded: number | null
  hidden: boolean
}

export function estimateCohort(criteria: Criterion[], minCohort: number): CohortEstimate {
  const count = population().filter((v) => criteria.every((c) => matches(v, c))).length
  if (count < minCohort) return { rounded: null, hidden: true }
  return { rounded: Math.max(minCohort, Math.round(count / 10) * 10), hidden: false }
}
