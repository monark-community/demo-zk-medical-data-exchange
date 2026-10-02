"use client"

import { fakeCid, randomId } from "./ids"
import { SOURCES } from "./seed"
import { update } from "./store"
import type { Activity, Consent, DemoState, Field, RecordSource, Role, Study } from "./types"

/**
 * State transitions applied after the simulated wallet/network confirms.
 * Each one appends an audit-trail entry, like a contract event would.
 */

const DAY = 86_400_000

function log(s: DemoState, entry: Omit<Activity, "id" | "at">): DemoState {
  return { ...s, activity: [{ id: randomId("act"), at: new Date().toISOString(), ...entry }, ...s.activity].slice(0, 200) }
}

export function setRole(role: Role) {
  update((s) => (s.role === role ? s : { ...s, role }))
}

export function markConnected() {
  update((s) => log({ ...s, wallet: { ...s.wallet, status: "connected" } }, { kind: "connect", role: s.role, params: {} }))
}

export function importRecord(source: RecordSource) {
  update((s) => {
    const meta = SOURCES[source]
    const rec = {
      id: randomId("rec"),
      source,
      importedAt: new Date().toISOString(),
      sizeKb: meta.sizeKb,
      entries: meta.entries,
      cid: fakeCid(),
      kinds: meta.kinds,
    }
    return log({ ...s, records: [rec, ...s.records.filter((r) => r.source !== source)] }, { kind: "import", role: "patient", params: { source } })
  })
}

export function deleteRecord(id: string) {
  update((s) => {
    const rec = s.records.find((r) => r.id === id)
    if (!rec) return s
    return log({ ...s, records: s.records.filter((r) => r.id !== id) }, { kind: "delete", role: "patient", params: { source: rec.source } })
  })
}

/** A private check ran on the device. Logged locally only: nothing left the vault. */
export function logLocalCheck(studyId: string, verdict: string) {
  update((s) => log(s, { kind: "check", role: "patient", params: { study: studyId, verdict }, local: true }))
}

export function logFailure(action: string, hash: string, role: Role) {
  update((s) => log(s, { kind: "failed", role, params: { action }, txHash: hash }))
}

export function enrol(
  study: Study,
  fields: Field[],
  proof: { id: string; nullifier: string },
  receipt: { hash: string; block: number }
) {
  update((s) => {
    const now = Date.now()
    const capDays = s.rules.consentCapMonths * 30
    const days = Math.min(study.durationWeeks * 7, capDays)
    const consent: Consent = {
      id: randomId("consent"),
      studyId: study.id,
      fields,
      grantedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + days * DAY).toISOString(),
      status: "active",
      nullifier: proof.nullifier,
      proofId: proof.id,
      // Enrolment milestone: a quarter of the reward unlocks on joining.
      accrued: Math.round(study.reward * 0.25 * 100) / 100,
      claimed: 0,
      txHash: receipt.hash,
    }
    return log(
      {
        ...s,
        consents: [consent, ...s.consents],
        studies: s.studies.map((x) => (x.id === study.id ? { ...x, enrolled: x.enrolled + 1 } : x)),
      },
      { kind: "enrol", role: "patient", params: { study: study.id }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

export function narrowConsent(consentId: string, fields: Field[], receipt: { hash: string; block: number }) {
  update((s) => {
    const c = s.consents.find((x) => x.id === consentId)
    if (!c) return s
    return log(
      { ...s, consents: s.consents.map((x) => (x.id === consentId ? { ...x, fields } : x)) },
      { kind: "narrow", role: "patient", params: { study: c.studyId }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

export function revokeConsent(consentId: string, receipt: { hash: string; block: number }) {
  update((s) => {
    const c = s.consents.find((x) => x.id === consentId)
    if (!c) return s
    return log(
      {
        ...s,
        consents: s.consents.map((x) =>
          x.id === consentId ? { ...x, status: "revoked", endedAt: new Date().toISOString(), endedBlock: receipt.block } : x
        ),
      },
      { kind: "revoke", role: "patient", params: { study: c.studyId }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

export function claimable(s: DemoState): number {
  return Math.round(s.consents.reduce((sum, c) => sum + (c.accrued - c.claimed), 0) * 100) / 100
}

export function claimRewards(receipt: { hash: string; block: number }) {
  update((s) => {
    const amount = claimable(s)
    if (amount <= 0) return s
    return log(
      {
        ...s,
        consents: s.consents.map((c) => ({ ...c, claimed: c.accrued })),
        wallet: {
          ...s.wallet,
          balances: {
            ...s.wallet.balances,
            patient: { ...s.wallet.balances.patient, tusdc: Math.round((s.wallet.balances.patient.tusdc + amount) * 100) / 100 },
          },
        },
      },
      { kind: "claim", role: "patient", params: { amount }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

export function publishStudy(study: Study, receipt: { hash: string; block: number }) {
  update((s) => {
    const escrow = study.reward * study.target
    return log(
      {
        ...s,
        studies: [{ ...study, escrowTx: receipt.hash }, ...s.studies],
        wallet: {
          ...s.wallet,
          balances: {
            ...s.wallet.balances,
            lab: { ...s.wallet.balances.lab, tusdc: s.wallet.balances.lab.tusdc - escrow },
          },
        },
      },
      { kind: "publish", role: "lab", params: { study: study.id, amount: escrow }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

export function castVote(proposalId: string, vote: "yes" | "no", receipt: { hash: string; block: number }) {
  update((s) => {
    const p = s.proposals.find((x) => x.id === proposalId)
    if (!p || p.myVote || p.status !== "open") return s
    return log(
      {
        ...s,
        proposals: s.proposals.map((x) =>
          x.id === proposalId ? { ...x, myVote: vote, yes: x.yes + (vote === "yes" ? 1 : 0), no: x.no + (vote === "no" ? 1 : 0) } : x
        ),
      },
      { kind: "vote", role: "patient", params: { proposal: p.number }, txHash: receipt.hash, block: receipt.block }
    )
  })
}

/** Demo helper: end the voting period now and apply the rule if it passed. */
export function closeProposal(proposalId: string) {
  update((s) => {
    const p = s.proposals.find((x) => x.id === proposalId)
    if (!p || p.status !== "open") return s
    const passed = p.yes > p.no
    const rules = passed && p.effect ? { ...s.rules, [p.effect.rule]: p.effect.value } : s.rules
    return log(
      {
        ...s,
        rules,
        proposals: s.proposals.map((x) =>
          x.id === proposalId ? { ...x, status: passed ? "passed" : "rejected", endsAt: new Date().toISOString() } : x
        ),
      },
      { kind: "proposal_closed", role: s.role, params: { proposal: p.number, outcome: passed ? "passed" : "rejected" } }
    )
  })
}
