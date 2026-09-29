/**
 * Cura demo domain types. Everything the UI knows about the "chain", the
 * wallet, the vault and the prover goes through these shapes, so the
 * simulated layer in this folder can later be swapped for wagmi/viem and a
 * real proving backend without touching components.
 */

export type Lang = "en" | "fr"
export type L10n = Record<Lang, string>

export type Role = "patient" | "lab"

export type Condition = "t2d" | "hypertension" | "asthma" | "sleep_apnea" | "migraine"
export type Medication = "metformin" | "amlodipine" | "statin" | "ace_inhibitor" | "inhaled_steroid"
/** Kinds of data a vault can hold (each record contributes some). */
export type DataKind = "clinic" | "labs" | "medications" | "sleep" | "activity" | "genomic"
/** Fields a study can ask for once a participant consents. */
export type Field = "hba1c" | "bp" | "medications" | "sleep" | "steps" | "bmi" | "diagnoses"

export type Criterion =
  | { kind: "age"; min: number; max: number }
  | { kind: "condition"; condition: Condition; onsetBeforeAge?: number }
  | { kind: "hba1c"; min: number; max: number }
  | { kind: "systolic"; min: number }
  | { kind: "medication"; medication: Medication; present: boolean }
  | { kind: "data"; data: DataKind }

export type CriterionOutcome = "pass" | "fail" | "missing"

export interface Study {
  id: string
  title: L10n
  question: L10n
  lab: string
  /** Address of the lab account that published it. */
  owner: string
  criteria: Criterion[]
  /** Fields shared after consent. `optional` ones can be unticked on the slip. */
  fields: Field[]
  optionalFields: Field[]
  durationWeeks: number
  /** Reward per participant, in tUSDC. */
  reward: number
  target: number
  enrolled: number
  publishedAt: string
  status: "open" | "closed"
  /** Hex id of the escrow funding transaction. */
  escrowTx: string
}

export type RecordSource = "clinic" | "pharmacy" | "phone" | "sleep_ring" | "bp_cuff"

export interface VaultRecord {
  id: string
  source: RecordSource
  importedAt: string
  sizeKb: number
  entries: number
  /** Content id of the sealed (encrypted) blob. */
  cid: string
  kinds: DataKind[]
}

/** What the patient's vault knows. Only read on the device, by the prover. */
export interface PatientFacts {
  birthYear: number
  conditions: { condition: Condition; diagnosedAge: number }[]
  hba1c: number
  systolic: number
  diastolic: number
  bmi: number
  medications: Medication[]
  sleepHours: number
  steps: number
}

export interface Consent {
  id: string
  studyId: string
  fields: Field[]
  grantedAt: string
  expiresAt: string
  status: "active" | "revoked" | "expired"
  endedAt?: string
  endedBlock?: number
  nullifier: string
  proofId: string
  /** Rewards accrued / claimed, in tUSDC. */
  accrued: number
  claimed: number
  txHash: string
}

export interface Proposal {
  id: string
  number: number
  title: L10n
  summary: L10n
  status: "open" | "passed" | "rejected"
  yes: number
  no: number
  endsAt: string
  /** Rule change applied if it passes. */
  effect?: { rule: "minCohort" | "consentCapMonths"; value: number }
  myVote?: "yes" | "no"
}

export interface Rules {
  minCohort: number
  consentCapMonths: number
}

export type ActivityKind =
  | "connect"
  | "import"
  | "delete"
  | "check"
  | "enrol"
  | "narrow"
  | "revoke"
  | "claim"
  | "publish"
  | "vote"
  | "proposal_closed"
  | "failed"

export interface Activity {
  id: string
  at: string
  kind: ActivityKind
  role: Role
  /** Free parameters used to render the localized line. */
  params: Record<string, string | number>
  txHash?: string
  block?: number
  /** True when nothing left the device (local proof checks). */
  local?: boolean
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  patientAddress: string
  labAddress: string
  balances: {
    patient: { teth: number; tusdc: number }
    lab: { teth: number; tusdc: number }
  }
}

export interface DemoSettings {
  failNext: boolean
  slow: boolean
}

export interface DemoState {
  version: 1
  role: Role
  wallet: WalletState
  settings: DemoSettings
  records: VaultRecord[]
  studies: Study[]
  consents: Consent[]
  proposals: Proposal[]
  rules: Rules
  activity: Activity[]
  block: number
}

/** What the wallet prompt shows. Labels are already localized by the caller. */
export interface TxSummary {
  title: string
  rows: { label: string; value: string }[]
  /** Signature only (no fee, nothing on-chain), e.g. sign-in or key derivation. */
  signatureOnly?: boolean
  /** Moves value: show the testnet / not-financial-advice notice. */
  movesValue?: boolean
}

export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"

export interface TxState {
  phase: TxPhase
  hash?: string
  block?: number
  error?: "rejected" | "reverted"
}
