"use client"

import {
  ArchiveIcon,
  ArrowLeftIcon,
  EllipsisIcon,
  FilePlus2Icon,
  FlaskConicalIcon,
  HouseIcon,
  LandmarkIcon,
  ScrollTextIcon,
  SignatureIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { CuraMark, CuraWordmark } from "@/components/site/brand"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { NetworkBadge } from "@/components/ui/network-badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { href } from "@/i18n/config"
import { setRole } from "@/lib/demo/ops"
import { initDemo, setWallet, useDemo, useStorageOk } from "@/lib/demo/store"
import type { Role } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { AppCopyProvider, type AppCopy } from "./app-context"
import { DemoControls } from "./demo-controls"
import { Gate } from "./gate"
import { WalletPrompt } from "./wallet-prompt"

interface NavEntry {
  path: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

function useNav(copy: AppCopy, role: Role) {
  const s = copy.a.shell
  const patient: NavEntry[] = [
    { path: "/app", label: s.overview, icon: HouseIcon, exact: true },
    { path: "/app/vault", label: s.vault, icon: ArchiveIcon },
    { path: "/app/studies", label: s.studies, icon: FlaskConicalIcon },
    { path: "/app/consents", label: s.consents, icon: SignatureIcon },
    { path: "/app/council", label: s.council, icon: LandmarkIcon },
    { path: "/app/activity", label: s.activity, icon: ScrollTextIcon },
  ]
  const lab: NavEntry[] = [
    { path: "/app/lab", label: s.myStudies, icon: HouseIcon, exact: true },
    { path: "/app/lab/new", label: s.newStudy, icon: FilePlus2Icon },
    { path: "/app/council", label: s.council, icon: LandmarkIcon },
    { path: "/app/activity", label: s.activity, icon: ScrollTextIcon },
  ]
  return role === "lab" ? lab : patient
}

function isActive(pathname: string, full: string, exact?: boolean) {
  return exact ? pathname === full : pathname === full || pathname.startsWith(`${full}/`)
}

/** Route decides the role on role-specific pages; shared pages keep the last one. */
function roleForPath(rest: string): Role | null {
  if (rest.startsWith("/app/lab")) return "lab"
  if (rest === "/app" || /^\/app\/(vault|studies|consents)/.test(rest)) return "patient"
  return null
}

function RoleSwitch({ copy, role, className }: { copy: AppCopy; role: Role; className?: string }) {
  const router = useRouter()
  const s = copy.a.shell
  const go = (r: Role) => {
    setRole(r)
    router.push(href(copy.locale, r === "lab" ? "/app/lab" : "/app"))
  }
  return (
    <div role="group" aria-label={s.role} className={cn("grid grid-cols-2 rounded-md border bg-muted p-0.5", className)}>
      {(["patient", "lab"] as const).map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={role === r}
          onClick={() => go(r)}
          className={cn(
            "h-9 rounded-[4px] px-3 text-sm font-medium transition-colors",
            role === r ? "bg-card text-foreground shadow-[0_1px_0_var(--border)]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r === "lab" ? s.lab : s.patient}
        </button>
      ))}
    </div>
  )
}

export function AppShell({ copy, homeLabel, children }: { copy: AppCopy; homeLabel: string; children: ReactNode }) {
  const state = useDemo()
  const storageOk = useStorageOk()
  const pathname = usePathname() ?? ""
  const [moreOpen, setMoreOpen] = useState(false)
  const s = copy.a.shell
  const rest = pathname.replace(/^\/(en|fr)/, "") || "/"

  useEffect(() => {
    initDemo()
  }, [])

  useEffect(() => {
    if (!state) return
    const r = roleForPath(rest)
    if (r && r !== state.role) setRole(r)
  }, [rest, state])

  const role = state ? (roleForPath(rest) ?? state.role) : "patient"
  const nav = useNav(copy, role)
  const connected = state?.wallet.status === "connected"
  const address = state ? (role === "lab" ? state.wallet.labAddress : state.wallet.patientAddress) : ""
  const mobileNav = role === "patient" ? nav.slice(0, 4) : nav

  return (
    <AppCopyProvider value={copy}>
      <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href={href(copy.locale)} aria-label={homeLabel} className="-ml-1 shrink-0 rounded-md px-1 py-1">
            <CuraWordmark className="max-sm:hidden" />
            <CuraMark className="size-7 text-primary sm:hidden" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-seal/40 bg-seal-wash px-2 py-0.5 text-xs font-medium whitespace-nowrap">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-seal" />
            {s.demoBadge}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <NetworkBadge
              name={s.network}
              variant="outline"
              className="hidden rounded-sm lg:inline-flex"
              icon={<span className="block size-full rounded-full bg-primary" />}
            />
            {connected && state && (
              <ConnectWallet
                status="connected"
                address={address}
                name={role === "lab" ? s.labAccount : s.patientAccount}
                disconnectLabel={copy.a.wallet.disconnect}
                onDisconnect={() => setWallet({ status: "disconnected" })}
                className="max-md:[&>div:nth-of-type(2)]:hidden"
              />
            )}
            <DemoControls />
          </div>
        </div>
        {connected && (
          <div className="border-t px-4 py-2 lg:hidden">
            <RoleSwitch copy={copy} role={role} className="mx-auto max-w-sm" />
          </div>
        )}
      </header>

      {!storageOk && (
        <div role="status" className="border-b bg-seal-wash px-4 py-2 text-center text-sm">
          <TriangleAlertIcon className="mr-1.5 inline size-4 text-seal" aria-hidden="true" />
          {s.storageOff}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {connected && (
          <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r py-6 pr-5 pl-6 lg:flex">
            <p className="eyebrow mb-2 text-muted-foreground">{s.role}</p>
            <RoleSwitch copy={copy} role={role} />
            <nav aria-label={s.nav} className="mt-6">
              <ul className="space-y-0.5">
                {nav.map((item) => {
                  const full = href(copy.locale, item.path)
                  const active = isActive(pathname, full, item.exact)
                  return (
                    <li key={item.path}>
                      <Link
                        href={full}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                          active && "bg-card text-foreground ring-1 ring-border"
                        )}
                      >
                        <item.icon className={cn("size-4", active && "text-primary")} strokeWidth={1.75} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="mt-auto space-y-3 border-t pt-4 text-xs text-muted-foreground">
              <p>{copy.common.sampleNotice}</p>
              <Link href={href(copy.locale)} className="inline-flex items-center gap-1.5 font-medium hover:text-foreground">
                <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
                {s.backToSite}
              </Link>
            </div>
          </aside>
        )}
        <main
          id="main"
          tabIndex={-1}
          className={cn("min-w-0 flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-10 lg:pt-8 lg:pb-16")}
        >
          {!state ? (
            <p role="status" className="py-20 text-center text-muted-foreground">
              {s.loading}
            </p>
          ) : connected ? (
            children
          ) : (
            <Gate />
          )}
        </main>
      </div>

      {connected && (
        <nav
          aria-label={s.nav}
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${role === "patient" ? 5 : 4}, minmax(0, 1fr))` }}>
            {mobileNav.map((item) => {
              const full = href(copy.locale, item.path)
              const active = isActive(pathname, full, item.exact)
              return (
                <li key={item.path}>
                  <Link
                    href={full}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground",
                      active && "text-primary"
                    )}
                  >
                    <item.icon className="size-5" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
                    <span className="max-w-full truncate px-1">{item.label}</span>
                  </Link>
                </li>
              )
            })}
            {role === "patient" && (
              <li>
                <button
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  aria-haspopup="dialog"
                  className={cn(
                    "flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground",
                    nav.slice(4).some((i) => isActive(pathname, href(copy.locale, i.path))) && "text-primary"
                  )}
                >
                  <EllipsisIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  {s.more}
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" closeLabel={copy.common.close} className="rounded-t-lg pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="text-left">
            <SheetTitle>{s.more}</SheetTitle>
            <SheetDescription className="sr-only">{s.nav}</SheetDescription>
          </SheetHeader>
          <ul className="border-t">
            {nav.slice(4).map((item) => (
              <li key={item.path}>
                <Link
                  href={href(copy.locale, item.path)}
                  onClick={() => setMoreOpen(false)}
                  className="flex h-12 items-center gap-3 border-b border-rule px-1 text-base"
                >
                  <item.icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(copy.locale)} onClick={() => setMoreOpen(false)} className="flex h-12 items-center gap-3 px-1 text-base">
                <ArrowLeftIcon className="size-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                {s.backToSite}
              </Link>
            </li>
          </ul>
        </SheetContent>
      </Sheet>

      <footer className="hidden border-t py-4 text-center text-xs text-muted-foreground lg:block">
        {copy.common.demoNotice} · {copy.common.sampleNotice}
      </footer>

      <WalletPrompt />
      {/* Toasts sit over the app header, never over the content they report on. */}
      <Toaster position="top-center" offset={{ top: 6 }} mobileOffset={{ top: 6, left: 12, right: 12 }} />
    </AppCopyProvider>
  )
}
