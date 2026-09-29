"use client"

import { CheckIcon, Loader2Icon, WalletIcon } from "lucide-react"
import { useState } from "react"

import { SealStamp } from "@/components/diagrams/seal-stamp"
import { Button } from "@/components/ui/button"
import { sleep } from "@/lib/demo/chain"
import { markConnected } from "@/lib/demo/ops"
import { requestSignature, setWallet } from "@/lib/demo/store"

import { useCopy } from "./app-context"

/** Flow 1, step 1: connect the demo wallet (sign-in message, no fee). */
export function Gate() {
  const copy = useCopy()
  const g = copy.a.gate
  const [phase, setPhase] = useState<"idle" | "signing" | "connecting" | "rejected">("idle")

  async function connect() {
    setPhase("signing")
    const ok = await requestSignature({
      title: g.connect,
      rows: [{ label: copy.a.prompt.account, value: copy.a.shell.patientAccount }],
      signatureOnly: true,
    })
    if (!ok) {
      setPhase("rejected")
      return
    }
    setPhase("connecting")
    setWallet({ status: "connecting" })
    await sleep(900)
    markConnected()
  }

  const busy = phase === "signing" || phase === "connecting"
  return (
    <section className="ruled mx-auto grid max-w-5xl items-center gap-10 rounded-lg border bg-card px-5 py-10 sm:px-10 sm:py-14 md:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="eyebrow text-seal">{g.eyebrow}</p>
        <h1 className="mt-3 text-3xl leading-tight font-medium sm:text-4xl">{g.title}</h1>
        <p className="mt-4 text-muted-foreground">{g.body}</p>
        <ul className="mt-6 space-y-2">
          {g.points.map((pt) => (
            <li key={pt} className="flex gap-2.5 text-[0.9375rem]">
              <CheckIcon className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
              {pt}
            </li>
          ))}
        </ul>
        <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={connect} disabled={busy}>
          {busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
          {phase === "connecting" ? g.connecting : g.connect}
        </Button>
        <div aria-live="polite" className="min-h-6">
          {phase === "rejected" && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {g.rejected}
            </p>
          )}
        </div>
      </div>
      <div className="hidden justify-center md:flex">
        <SealStamp size="lg" className="size-40 border-[3px] [&_svg]:size-16" />
      </div>
    </section>
  )
}
