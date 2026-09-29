"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useDemo } from "@/lib/demo/store"
import type { Role } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"
import { ActivityList, Empty, PageHead } from "./parts"

const PAGE = 6

export function ActivityView() {
  const state = useDemo()
  const { a } = useCopy()
  const x = a.activity
  const [filter, setFilter] = useState<Role | "all">("all")
  const [shown, setShown] = useState(PAGE)
  if (!state) return null
  const entries = state.activity.filter((e) => filter === "all" || e.role === filter)
  const options: { key: Role | "all"; label: string }[] = [
    { key: "all", label: x.filterAll },
    { key: "patient", label: x.filterPatient },
    { key: "lab", label: x.filterLab },
  ]
  return (
    <div className="space-y-6">
      <PageHead title={x.title} info={x.info} />
      <div role="group" aria-label={x.title} className="inline-flex rounded-md border bg-muted p-0.5">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={filter === o.key}
            onClick={() => {
              setFilter(o.key)
              setShown(PAGE)
            }}
            className={cn(
              "h-9 rounded-[4px] px-3 text-sm font-medium",
              filter === o.key ? "bg-card shadow-[0_1px_0_var(--border)]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <Empty>{x.empty}</Empty>
      ) : (
        <>
          <ActivityList state={state} entries={entries.slice(0, shown)} />
          {entries.length > shown && (
            <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
              {x.more}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
