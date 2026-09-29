import { fakeCid, seededAddress, seededHash, seededHex } from "./ids"
import type {
  Activity,
  Consent,
  DataKind,
  DemoState,
  PatientFacts,
  Proposal,
  RecordSource,
  Study,
  VaultRecord,
} from "./types"

/**
 * Seed data for the demo. All people, labs and studies are fictional; the
 * records are a single believable sample patient, never the visitor's own.
 */

export const DEMO_NETWORK = "Sepolia"
export const START_BLOCK = 7_412_305

/** The sample patient behind the demo vault (read only by the simulated prover). */
export const SAMPLE_FACTS: PatientFacts = {
  birthYear: 1974,
  conditions: [
    { condition: "t2d", diagnosedAge: 45 },
    { condition: "hypertension", diagnosedAge: 47 },
  ],
  hba1c: 7.1,
  systolic: 138,
  diastolic: 86,
  bmi: 29.4,
  medications: ["metformin", "amlodipine"],
  sleepHours: 6.1,
  steps: 6420,
}

/** What each sample source contributes when imported. */
export const SOURCES: Record<RecordSource, { kinds: DataKind[]; sizeKb: number; entries: number }> = {
  clinic: { kinds: ["clinic", "labs"], sizeKb: 142, entries: 38 },
  pharmacy: { kinds: ["medications"], sizeKb: 24, entries: 17 },
  phone: { kinds: ["activity"], sizeKb: 310, entries: 180 },
  sleep_ring: { kinds: ["sleep"], sizeKb: 486, entries: 90 },
  bp_cuff: { kinds: ["clinic"], sizeKb: 12, entries: 60 },
}

/** Sources the visitor can import in the demo (the others are pre-loaded). */
export const IMPORTABLE: RecordSource[] = ["sleep_ring", "bp_cuff"]

const DAY = 86_400_000
const ago = (days: number, now: number) => new Date(now - days * DAY).toISOString()
const ahead = (days: number, now: number) => new Date(now + days * DAY).toISOString()

export const PATIENT_ADDRESS = seededAddress("cura-patient-demo")
export const LAB_ADDRESS = seededAddress("beaulac-cardiometabolic-lab")
export const LAB_NAME = "Beaulac Cardiometabolic Lab"

function record(source: RecordSource, days: number, now: number): VaultRecord {
  const s = SOURCES[source]
  return {
    id: `rec-${source}`,
    source,
    importedAt: ago(days, now),
    sizeKb: s.sizeKb,
    entries: s.entries,
    cid: fakeCid(source),
    kinds: s.kinds,
  }
}

function studies(now: number): Study[] {
  return [
    {
      id: "t2d-home-bp",
      title: {
        en: "Home blood pressure and glucose control in type 2 diabetes",
        fr: "Tension artérielle à domicile et contrôle glycémique dans le diabète de type 2",
      },
      question: {
        en: "Does twice-weekly home blood pressure monitoring change HbA1c over 16 weeks in adults with type 2 diabetes?",
        fr: "La prise de tension à domicile deux fois par semaine modifie-t-elle l'HbA1c sur 16 semaines chez les adultes vivant avec un diabète de type 2 ?",
      },
      lab: LAB_NAME,
      owner: LAB_ADDRESS,
      criteria: [
        { kind: "age", min: 40, max: 70 },
        { kind: "condition", condition: "t2d" },
        { kind: "hba1c", min: 6.5, max: 9 },
        { kind: "systolic", min: 130 },
      ],
      fields: ["hba1c", "bp", "medications"],
      optionalFields: ["medications"],
      durationWeeks: 16,
      reward: 48,
      target: 400,
      enrolled: 212,
      publishedAt: ago(19, now),
      status: "open",
      escrowTx: seededHash("escrow-t2d-home-bp"),
    },
    {
      id: "metformin-sleep",
      title: {
        en: "Metformin and sleep quality",
        fr: "Metformine et qualité du sommeil",
      },
      question: {
        en: "Is long-term metformin use associated with shorter or more fragmented sleep, measured by a consumer sleep ring?",
        fr: "L'usage prolongé de la metformine est-il associé à un sommeil plus court ou plus fragmenté, mesuré par une bague de sommeil ?",
      },
      lab: "Harbourline Sleep Institute",
      owner: seededAddress("harbourline"),
      criteria: [
        { kind: "age", min: 35, max: 75 },
        { kind: "condition", condition: "t2d" },
        { kind: "medication", medication: "metformin", present: true },
        { kind: "data", data: "sleep" },
      ],
      fields: ["sleep", "medications"],
      optionalFields: [],
      durationWeeks: 12,
      reward: 36,
      target: 250,
      enrolled: 97,
      publishedAt: ago(8, now),
      status: "open",
      escrowTx: seededHash("escrow-metformin-sleep"),
    },
    {
      id: "childhood-asthma",
      title: {
        en: "Adult outcomes of childhood-onset asthma",
        fr: "L'asthme apparu dans l'enfance, à l'âge adulte",
      },
      question: {
        en: "How do lung-related hospital visits in adulthood differ between people whose asthma began before age 12 and later-onset asthma?",
        fr: "Les consultations hospitalières liées aux poumons à l'âge adulte diffèrent-elles selon que l'asthme est apparu avant 12 ans ou plus tard ?",
      },
      lab: "Ashgrove Respiratory Cohort",
      owner: seededAddress("ashgrove"),
      criteria: [
        { kind: "age", min: 18, max: 60 },
        { kind: "condition", condition: "asthma", onsetBeforeAge: 12 },
      ],
      fields: ["diagnoses", "medications"],
      optionalFields: [],
      durationWeeks: 26,
      reward: 30,
      target: 600,
      enrolled: 341,
      publishedAt: ago(33, now),
      status: "open",
      escrowTx: seededHash("escrow-childhood-asthma"),
    },
    {
      id: "statin-genomics",
      title: {
        en: "Genetic markers of statin response",
        fr: "Marqueurs génétiques de la réponse aux statines",
      },
      question: {
        en: "Which common genetic variants predict muscle side effects in people starting a statin after 45?",
        fr: "Quels variants génétiques courants prédisent les effets musculaires chez les personnes qui commencent une statine après 45 ans ?",
      },
      lab: "Kestrel Genomics Group",
      owner: seededAddress("kestrel"),
      criteria: [
        { kind: "age", min: 45, max: 80 },
        { kind: "data", data: "genomic" },
        { kind: "medication", medication: "statin", present: true },
      ],
      fields: ["medications", "diagnoses"],
      optionalFields: [],
      durationWeeks: 52,
      reward: 75,
      target: 300,
      enrolled: 58,
      publishedAt: ago(4, now),
      status: "open",
      escrowTx: seededHash("escrow-statin-genomics"),
    },
    {
      id: "steps-mood",
      title: {
        en: "Daily steps and mood in midlife",
        fr: "Pas quotidiens et humeur au mitan de la vie",
      },
      question: {
        en: "Do weeks with more walking predict better self-reported mood the following week in adults aged 45 to 65?",
        fr: "Les semaines où l'on marche davantage annoncent-elles une meilleure humeur la semaine suivante chez les 45 à 65 ans ?",
      },
      lab: "Maple Row Digital Health Lab",
      owner: seededAddress("maple-row"),
      criteria: [
        { kind: "age", min: 45, max: 65 },
        { kind: "data", data: "activity" },
      ],
      fields: ["steps", "bmi"],
      optionalFields: ["bmi"],
      durationWeeks: 26,
      reward: 30,
      target: 800,
      enrolled: 764,
      publishedAt: ago(71, now),
      status: "open",
      escrowTx: seededHash("escrow-steps-mood"),
    },
    {
      id: "bp-pilot",
      title: {
        en: "Home blood pressure pilot",
        fr: "Projet pilote de tension artérielle à domicile",
      },
      question: {
        en: "Can adults with high blood pressure keep a twice-weekly home measurement routine for eight weeks?",
        fr: "Les adultes hypertendus peuvent-ils maintenir une routine de mesure à domicile deux fois par semaine pendant huit semaines ?",
      },
      lab: LAB_NAME,
      owner: LAB_ADDRESS,
      criteria: [
        { kind: "age", min: 30, max: 80 },
        { kind: "condition", condition: "hypertension" },
      ],
      fields: ["bp"],
      optionalFields: [],
      durationWeeks: 8,
      reward: 20,
      target: 120,
      enrolled: 120,
      publishedAt: ago(180, now),
      status: "closed",
      escrowTx: seededHash("escrow-bp-pilot"),
    },
  ]
}

function consents(now: number): Consent[] {
  return [
    {
      id: "consent-steps-mood",
      studyId: "steps-mood",
      fields: ["steps", "bmi"],
      grantedAt: ago(58, now),
      expiresAt: ahead(26 * 7 - 58, now),
      status: "active",
      nullifier: `0x${seededHex("nullifier-steps-mood", 64)}`,
      proofId: `0x${seededHex("proof-steps-mood", 64)}`,
      accrued: 18.5,
      claimed: 0,
      txHash: seededHash("enrol-steps-mood"),
    },
    {
      id: "consent-bp-pilot",
      studyId: "bp-pilot",
      fields: ["bp"],
      grantedAt: ago(172, now),
      expiresAt: ago(116, now),
      status: "expired",
      endedAt: ago(116, now),
      endedBlock: START_BLOCK - 812_450,
      nullifier: `0x${seededHex("nullifier-bp-pilot", 64)}`,
      proofId: `0x${seededHex("proof-bp-pilot", 64)}`,
      accrued: 20,
      claimed: 20,
      txHash: seededHash("enrol-bp-pilot"),
    },
  ]
}

function proposals(now: number): Proposal[] {
  return [
    {
      id: "prop-14",
      number: 14,
      title: {
        en: "Raise the minimum cohort size from 10 to 20",
        fr: "Faire passer la taille minimale de cohorte de 10 à 20",
      },
      summary: {
        en: "Labs would see cohort estimates only when at least 20 vaults match, making it harder to single out someone with a rare combination of conditions.",
        fr: "Les labos ne verraient une estimation de cohorte que si au moins 20 coffres correspondent, ce qui rend plus difficile d'isoler une personne ayant une combinaison rare de conditions.",
      },
      status: "open",
      yes: 1284,
      no: 702,
      endsAt: ahead(3, now),
      effect: { rule: "minCohort", value: 20 },
    },
    {
      id: "prop-15",
      number: 15,
      title: {
        en: "Require a separate opt-in for AI model training",
        fr: "Exiger un consentement distinct pour l'entraînement de modèles d'IA",
      },
      summary: {
        en: "Studies that train machine-learning models on consented fields would have to show a second, unticked checkbox on the consent slip.",
        fr: "Les études qui entraînent des modèles d'apprentissage automatique sur les champs consentis devraient afficher une deuxième case, non cochée, sur le bon de consentement.",
      },
      status: "open",
      yes: 2106,
      no: 311,
      endsAt: ahead(6, now),
    },
    {
      id: "prop-12",
      number: 12,
      title: {
        en: "Cap consent at 12 months by default",
        fr: "Limiter le consentement à 12 mois par défaut",
      },
      summary: {
        en: "Every consent slip expires after 12 months at most; longer studies must ask again.",
        fr: "Tout bon de consentement expire au plus tard après 12 mois ; les études plus longues doivent redemander.",
      },
      status: "passed",
      yes: 2410,
      no: 188,
      endsAt: ago(41, now),
      effect: { rule: "consentCapMonths", value: 12 },
    },
    {
      id: "prop-11",
      number: 11,
      title: {
        en: "Let studies request exact birth dates",
        fr: "Permettre aux études de demander la date de naissance exacte",
      },
      summary: {
        en: "Studies could ask for a full date of birth instead of an age band after consent.",
        fr: "Les études pourraient demander la date de naissance complète plutôt qu'une tranche d'âge après le consentement.",
      },
      status: "rejected",
      yes: 402,
      no: 1977,
      endsAt: ago(77, now),
    },
  ]
}

function activity(now: number): Activity[] {
  const a = (days: number, rest: Omit<Activity, "id" | "at">, key: string): Activity => ({
    id: `act-seed-${key}`,
    at: ago(days, now),
    ...rest,
  })
  return [
    a(172, { kind: "enrol", role: "patient", params: { study: "bp-pilot" }, txHash: seededHash("enrol-bp-pilot"), block: START_BLOCK - 1_130_220 }, "1"),
    a(110, { kind: "claim", role: "patient", params: { amount: 20 }, txHash: seededHash("claim-bp-pilot"), block: START_BLOCK - 760_118 }, "2"),
    a(63, { kind: "import", role: "patient", params: { source: "phone" } }, "3"),
    a(58, { kind: "enrol", role: "patient", params: { study: "steps-mood" }, txHash: seededHash("enrol-steps-mood"), block: START_BLOCK - 417_902 }, "4"),
    a(41, { kind: "import", role: "patient", params: { source: "clinic" } }, "5"),
    a(41, { kind: "import", role: "patient", params: { source: "pharmacy" } }, "6"),
    a(19, { kind: "publish", role: "lab", params: { study: "t2d-home-bp", amount: 19200 }, txHash: seededHash("escrow-t2d-home-bp"), block: START_BLOCK - 136_004 }, "7"),
  ].reverse()
}

export function createSeed(now = Date.now()): DemoState {
  return {
    version: 1,
    role: "patient",
    wallet: {
      status: "disconnected",
      patientAddress: PATIENT_ADDRESS,
      labAddress: LAB_ADDRESS,
      balances: {
        patient: { teth: 0.248, tusdc: 20 },
        lab: { teth: 1.5, tusdc: 48000 },
      },
    },
    settings: { failNext: false, slow: false },
    records: [record("clinic", 41, now), record("pharmacy", 41, now), record("phone", 63, now)],
    studies: studies(now),
    consents: consents(now),
    proposals: proposals(now),
    rules: { minCohort: 10, consentCapMonths: 12 },
    activity: activity(now),
    block: START_BLOCK,
  }
}
