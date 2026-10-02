"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDemo } from "@/lib/demo/store"
import type { Condition, DataKind } from "@/lib/demo/types"

import { useCopy } from "./app-context"
import { Empty, PageHead, StudyCard } from "./parts"

const CONDITIONS: Condition[] = ["t2d", "hypertension", "asthma", "sleep_apnea", "migraine"]
const KINDS: DataKind[] = ["clinic", "labs", "medications", "sleep", "activity", "genomic"]

export function StudiesView() {
  const state = useDemo()
  const { a, labels } = useCopy()
  const s = a.studies
  const [condition, setCondition] = useState<string>("all")
  const [kind, setKind] = useState<string>("all")
  if (!state) return null

  const studies = state.studies.filter((st) => {
    if (st.status !== "open") return false
    if (condition !== "all" && !st.criteria.some((c) => c.kind === "condition" && c.condition === condition)) return false
    if (kind !== "all") {
      const needs = st.criteria.some(
        (c) =>
          (c.kind === "data" && c.data === kind) ||
          (kind === "labs" && c.kind === "hba1c") ||
          (kind === "medications" && c.kind === "medication") ||
          (kind === "clinic" && (c.kind === "age" || c.kind === "condition" || c.kind === "systolic"))
      )
      if (!needs) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <PageHead title={s.title} info={s.info} />
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <div className="space-y-1.5">
          <Label htmlFor="f-condition">{s.filterCondition}</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="f-condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{s.filterAll}</SelectItem>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {labels.conditions[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-kind">{s.filterData}</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger id="f-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{s.filterAllData}</SelectItem>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {labels.kindNames[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {studies.length === 0 ? (
        <Empty
          action={
            <Button
              variant="outline"
              onClick={() => {
                setCondition("all")
                setKind("all")
              }}
            >
              {s.clear}
            </Button>
          }
        >
          {s.empty}
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {studies.map((st) => (
            <StudyCard key={st.id} state={state} study={st} />
          ))}
        </div>
      )}
    </div>
  )
}
