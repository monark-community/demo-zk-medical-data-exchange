"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { LocaleSwitch } from "@/components/site/locale-switch"
import { ThemeToggle } from "@/components/site/theme"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { resetDemo, setSettings, useDemo } from "@/lib/demo/store"

import { useCopy } from "./app-context"

export function DemoControls() {
  const copy = useCopy()
  const c = copy.a.controls
  const state = useDemo()
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label={c.title} title={c.title} className="lg:w-auto lg:px-3">
          <SlidersHorizontalIcon strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden lg:inline">{c.title}</span>
          {state?.settings.failNext && <span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={copy.common.close} className="w-full max-w-sm">
        <SheetHeader className="text-left">
          <SheetTitle>{c.title}</SheetTitle>
          <SheetDescription>{c.body}</SheetDescription>
        </SheetHeader>
        <div className="divide-y divide-rule border-y">
          <div className="flex items-start justify-between gap-4 py-4">
            <div>
              <Label htmlFor="fail-next" className="text-sm font-medium">
                {c.failNext}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.failNextHint}</p>
            </div>
            <Switch
              id="fail-next"
              checked={!!state?.settings.failNext}
              onCheckedChange={(v) => setSettings({ failNext: v })}
            />
          </div>
          <div className="flex items-start justify-between gap-4 py-4">
            <div>
              <Label htmlFor="slow-net" className="text-sm font-medium">
                {c.slow}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.slowHint}</p>
            </div>
            <Switch id="slow-net" checked={!!state?.settings.slow} onCheckedChange={(v) => setSettings({ slow: v })} />
          </div>
          <div className="py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                resetDemo()
                setOpen(false)
                toast.success(c.resetDone)
              }}
            >
              <RotateCcwIcon aria-hidden="true" />
              {c.reset}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{c.resetHint}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <LocaleSwitch
            locale={copy.locale}
            label={copy.common.language.label}
            names={{ en: copy.common.language.en, fr: copy.common.language.fr }}
            short={copy.common.language.short}
          />
          <ThemeToggle label={copy.common.theme.toggle} />
        </div>
        <p className="mt-auto text-xs text-muted-foreground">
          {copy.common.demoNotice} · {copy.common.sampleNotice}
        </p>
      </SheetContent>
    </Sheet>
  )
}
