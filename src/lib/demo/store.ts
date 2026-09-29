"use client"

import { useSyncExternalStore } from "react"

import { createSeed } from "./seed"
import type { DemoSettings, DemoState, TxSummary, WalletState } from "./types"

/**
 * The demo's single source of truth: a tiny external store persisted to
 * localStorage under one key, with every access wrapped in try/catch.
 * Swapping to a real chain means replacing this folder; components only
 * use the hooks and the actions in ops.ts.
 */

const STORAGE_KEY = "cura-demo-v1"

let state: DemoState | null = null
let storageOk = true
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== 1 || !Array.isArray(parsed.studies) || !Array.isArray(parsed.records)) return null
    // A reload never resumes a half-finished connection.
    if (parsed.wallet.status === "connecting") parsed.wallet.status = "disconnected"
    return parsed
  } catch {
    storageOk = false
    return null
  }
}

/** Load saved state, or seed a fresh demo. Idempotent. */
export function initDemo() {
  if (state) return
  state = load() ?? createSeed()
  persist()
  emit()
}

/** Start over, keeping the wallet connected if it was. */
export function resetDemo() {
  const connected = state?.wallet.status === "connected"
  const role = state?.role ?? "patient"
  state = createSeed()
  if (connected) state.wallet.status = "connected"
  state.role = role
  persist()
  emit()
}

export function update(fn: (s: DemoState) => DemoState) {
  if (!state) return
  state = fn(state)
  persist()
  emit()
}

export function setWallet(patch: Partial<WalletState>) {
  update((s) => ({ ...s, wallet: { ...s.wallet, ...patch } }))
}

export function setSettings(patch: Partial<DemoSettings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function getDemo(): DemoState | null {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current demo state, or null until it has loaded on the client. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(subscribe, () => state, () => null)
}

export function useStorageOk(): boolean {
  return useSyncExternalStore(subscribe, () => storageOk, () => true)
}

/* ---------------------------------------------------------------------------
 * Simulated wallet prompt: a promise resolved by the WalletPrompt dialog.
 * ------------------------------------------------------------------------ */

export interface PromptRequest {
  summary: TxSummary
  resolve: (approved: boolean) => void
}

let prompt: PromptRequest | null = null
const promptListeners = new Set<() => void>()

function emitPrompt() {
  for (const l of promptListeners) l()
}

export function requestSignature(summary: TxSummary): Promise<boolean> {
  return new Promise((resolve) => {
    prompt?.resolve(false)
    prompt = {
      summary,
      resolve: (ok) => {
        prompt = null
        emitPrompt()
        resolve(ok)
      },
    }
    emitPrompt()
  })
}

function subscribePrompt(listener: () => void) {
  promptListeners.add(listener)
  return () => {
    promptListeners.delete(listener)
  }
}

export function usePrompt(): PromptRequest | null {
  return useSyncExternalStore(subscribePrompt, () => prompt, () => null)
}
