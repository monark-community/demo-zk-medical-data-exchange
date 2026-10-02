import { randomHex, seededHex } from "./ids"
import type { Criterion, CriterionOutcome, DataKind, PatientFacts, VaultRecord } from "./types"

/**
 * Simulated eligibility prover. In a real deployment this is a circuit
 * (e.g. Groth16 over BN254, or a Semaphore-style membership proof) compiled
 * to WASM and run in the browser: study criteria are public inputs, vault
 * values are private inputs, and the only outputs are `eligible` and a
 * per-study nullifier. Here we evaluate the same logic in plain TypeScript
 * and fake the timing, constraint count and proof bytes.
 */

/** Which data kind a criterion needs before it can be evaluated at all. */
function requiredKind(c: Criterion): DataKind {
  switch (c.kind) {
    case "age":
    case "condition":
    case "systolic":
      return "clinic"
    case "hba1c":
      return "labs"
    case "medication":
      return "medications"
    case "data":
      return c.data
  }
}

export interface CriterionResult {
  criterion: Criterion
  outcome: CriterionOutcome
  /** The private value the check used (shown only on the patient's side). */
  value?: { kind: "age"; age: number }
    | { kind: "condition"; present: boolean; onsetAge?: number }
    | { kind: "hba1c"; value: number }
    | { kind: "systolic"; systolic: number; diastolic: number }
    | { kind: "medication"; present: boolean }
    | { kind: "data"; present: boolean }
}

export interface Evaluation {
  results: CriterionResult[]
  verdict: "eligible" | "not_eligible" | "missing"
  missing: DataKind[]
}

export function vaultKinds(records: VaultRecord[]): Set<DataKind> {
  return new Set(records.flatMap((r) => r.kinds))
}

export function ageOf(facts: PatientFacts, now = new Date()): number {
  return now.getFullYear() - facts.birthYear
}

export function evaluate(criteria: Criterion[], facts: PatientFacts, records: VaultRecord[]): Evaluation {
  const kinds = vaultKinds(records)
  const results: CriterionResult[] = criteria.map((criterion) => {
    const need = requiredKind(criterion)
    if (!kinds.has(need)) return { criterion, outcome: "missing" }
    switch (criterion.kind) {
      case "age": {
        const age = ageOf(facts)
        return { criterion, outcome: age >= criterion.min && age <= criterion.max ? "pass" : "fail", value: { kind: "age", age } }
      }
      case "condition": {
        const found = facts.conditions.find((c) => c.condition === criterion.condition)
        const ok = !!found && (criterion.onsetBeforeAge === undefined || found.diagnosedAge < criterion.onsetBeforeAge)
        return {
          criterion,
          outcome: ok ? "pass" : "fail",
          value: { kind: "condition", present: !!found, onsetAge: found?.diagnosedAge },
        }
      }
      case "hba1c":
        return {
          criterion,
          outcome: facts.hba1c >= criterion.min && facts.hba1c <= criterion.max ? "pass" : "fail",
          value: { kind: "hba1c", value: facts.hba1c },
        }
      case "systolic":
        return {
          criterion,
          outcome: facts.systolic >= criterion.min ? "pass" : "fail",
          value: { kind: "systolic", systolic: facts.systolic, diastolic: facts.diastolic },
        }
      case "medication": {
        const present = facts.medications.includes(criterion.medication)
        return { criterion, outcome: present === criterion.present ? "pass" : "fail", value: { kind: "medication", present } }
      }
      case "data":
        return { criterion, outcome: "pass", value: { kind: "data", present: true } }
    }
  })
  const missing = [...new Set(results.filter((r) => r.outcome === "missing").map((r) => requiredKind(r.criterion)))]
  const verdict = missing.length ? "missing" : results.every((r) => r.outcome === "pass") ? "eligible" : "not_eligible"
  return { results, verdict, missing }
}

export type ProofStage = "reading" | "witness" | "proving" | "done"

export interface Proof {
  id: string
  nullifier: string
  constraints: number
  bytes: number
  ms: number
}

/** Constraint count grows with the number of criteria, like a real circuit would. */
export function constraintCount(criteria: Criterion[]): number {
  return 4096 + criteria.length * 3112 + (criteria.some((c) => c.kind === "condition") ? 1840 : 0)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Run the (simulated) prover. Reports stages and a constraint counter; the
 * evaluation itself never leaves this function except as the verdict.
 */
export async function prove(
  studyId: string,
  vaultKey: string,
  criteria: Criterion[],
  onStage: (stage: ProofStage, progress: number) => void
): Promise<Proof> {
  const started = Date.now()
  onStage("reading", 0)
  await sleep(650)
  onStage("witness", 0)
  await sleep(700)
  const steps = 14
  for (let i = 1; i <= steps; i++) {
    onStage("proving", i / steps)
    await sleep(95)
  }
  onStage("done", 1)
  return {
    id: `0x${randomHex(64)}`,
    // Deterministic per (vault, study): the same person can't enrol twice,
    // and two studies can't link their participants.
    nullifier: `0x${seededHex(`nullifier:${vaultKey}:${studyId}`, 64)}`,
    constraints: constraintCount(criteria),
    bytes: 256,
    ms: Date.now() - started,
  }
}
