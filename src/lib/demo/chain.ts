"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, requestSignature, setSettings, update } from "./store"
import type { TxState, TxSummary } from "./types"

/**
 * Simulated chain. A transaction is: wallet prompt (sign or reject) ->
 * pending with a hash for a realistic block time -> confirmed or reverted.
 * "Fail the next transaction" in Demo controls forces one failure.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3200, 5600] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

/** Consume the "fail next" switch. Also used for signature-only steps like storage. */
export function consumeFailure(): boolean {
  if (getDemo()?.settings.failNext) {
    setSettings({ failNext: false })
    return true
  }
  return false
}

/** Mine one block. Returns the block number, or null if the transaction reverted. */
async function mine(): Promise<number | null> {
  await sleep(blockTime())
  if (consumeFailure()) return null
  let block = 0
  update((s) => {
    block = s.block + 1 + Math.floor(Math.random() * 3)
    return { ...s, block }
  })
  return block
}

/** Estimated network fee shown in the wallet prompt (simulated, in tETH). */
export function estimateFee(): number {
  return Number((0.00028 + Math.random() * 0.00024).toFixed(5))
}

export interface TxReceipt {
  hash: string
  block: number
}

/**
 * One transaction's lifecycle for a component. `apply` runs only on
 * confirmation. `onFail` runs when the network rejects it (not when the
 * visitor declines the signature).
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(
    async (
      summary: TxSummary,
      apply: (receipt: TxReceipt) => void,
      onFail?: (hash: string) => void
    ): Promise<TxReceipt | null> => {
      if (busy.current) return null
      busy.current = true
      try {
        setState({ phase: "signing" })
        const ok = await requestSignature(summary)
        if (!ok) {
          setState({ phase: "failed", error: "rejected" })
          return null
        }
        const hash = randomHash()
        setState({ phase: "pending", hash })
        const block = await mine()
        if (block === null) {
          setState({ phase: "failed", hash, error: "reverted" })
          onFail?.(hash)
          return null
        }
        apply({ hash, block })
        setState({ phase: "confirmed", hash, block })
        return { hash, block }
      } finally {
        busy.current = false
      }
    },
    []
  )

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset }
}

export { sleep }
