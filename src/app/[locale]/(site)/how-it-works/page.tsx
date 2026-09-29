import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  FlaskConicalIcon,
  LandmarkIcon,
  SmartphoneIcon,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment } from "react"

import { SealStamp } from "@/components/diagrams/seal-stamp"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).how.meta
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const CONTRACT = `interface ICuraConsent {
  /// Verify an eligibility proof and record a consent slip.
  function enrol(
    bytes32 studyId,
    bytes calldata proof,     // 256 bytes, Groth16
    bytes32 nullifier,        // hash(vaultKey, studyId)
    uint16  fieldMask,        // fields the slip covers
    uint64  expiresAt
  ) external returns (bytes32 consentId);

  function narrow(bytes32 consentId, uint16 fieldMask) external;
  function revoke(bytes32 consentId) external;
  function claim(bytes32[] calldata consentIds) external;

  event Enrolled(bytes32 indexed studyId, bytes32 consentId, bytes32 nullifier);
  event Revoked(bytes32 indexed consentId, uint64 atBlock);
}`

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-seal">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-medium sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg text-muted-foreground">{body}</p>}
    </div>
  )
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const h = getDictionary(locale).how
  const zones = [
    { icon: SmartphoneIcon, label: h.parts.device },
    { icon: LandmarkIcon, label: h.parts.chain },
    { icon: FlaskConicalIcon, label: h.parts.lab },
  ]

  return (
    <>
      <section className="ruled border-b">
        <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-16 sm:px-6 lg:pt-20 lg:pb-20">
          <p className="eyebrow text-seal">{h.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-[2.5rem] leading-[1.05] font-medium sm:text-6xl">{h.hero.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">{h.hero.body}</p>
        </div>
      </section>

      {/* The three parts */}
      <section className="border-b bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-medium sm:text-4xl">{h.parts.title}</h2>
          <figure className="mt-10">
            <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {zones.map((z, i) => (
                <Fragment key={z.label}>
                  <div className="flex flex-col rounded-lg border bg-background p-5">
                    <span className="eyebrow inline-flex items-center gap-2 text-muted-foreground">
                      <z.icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      {z.label}
                    </span>
                    {i === 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="rounded-md border px-3 py-2 text-sm font-medium">{h.parts.items[0].title}</div>
                        <div className="rounded-md border border-seal/50 bg-seal-wash px-3 py-2 text-sm font-medium">
                          {h.parts.items[1].title}
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="mt-4 rounded-md border px-3 py-2 text-sm font-medium">{h.parts.items[2].title}</div>
                    )}
                    {i === 2 && (
                      <div className="mt-4 grid flex-1 place-items-center rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                        {h.parts.flows.labBox}
                      </div>
                    )}
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center gap-2 py-1 lg:flex-col lg:px-1">
                      <ArrowDownIcon className="size-4 text-seal lg:hidden" aria-hidden="true" />
                      <ArrowRightIcon className="hidden size-4 text-seal lg:block" aria-hidden="true" />
                      <span className="font-mono text-xs text-muted-foreground lg:max-w-[7rem] lg:text-center">
                        {i === 0 ? h.parts.flows.proof : h.parts.flows.verdict}
                      </span>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
            <figcaption className="mt-4 flex items-center gap-3 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
              <span aria-hidden="true" className="hatch h-2.5 w-10 shrink-0 rounded-[2px]" />
              {h.parts.flows.fields}
            </figcaption>
          </figure>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {h.parts.items.map((item, i) => (
              <div key={item.title} className="border-t-2 border-foreground pt-5">
                <span className="tnum font-serif text-2xl text-seal italic" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-medium">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Worked proof */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHead eyebrow={h.worked.eyebrow} title={h.worked.title} body={h.worked.body} />
          <div className="mt-10 overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                    {h.worked.head.criterion}
                  </th>
                  <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                    {h.worked.head.value}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                    {h.worked.head.out}
                  </th>
                </tr>
              </thead>
              <tbody>
                {h.worked.rows.map((r) => (
                  <tr key={r.criterion} className="border-b border-rule">
                    <td className="px-4 py-3 sm:px-5">
                      {r.criterion}
                      <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                        <span aria-hidden="true" className="hatch h-2 w-8 rounded-[2px]" />
                        {r.value}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="inline-flex items-center gap-3">
                        <span aria-hidden="true" className="hatch h-2.5 w-10 rounded-[2px]" />
                        <span className="tnum font-medium">{r.value}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-5">
                      <span className="inline-flex items-center gap-1.5 text-primary">
                        <CheckIcon className="size-4" strokeWidth={2.5} aria-hidden="true" />
                        {h.worked.pass}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col gap-4 bg-seal-wash/60 px-4 py-5 sm:flex-row sm:items-center sm:px-5">
              <SealStamp label={h.worked.outputs} />
              <div>
                <p className="text-sm font-medium">{h.worked.outputs}</p>
                <p className="mt-1 font-mono text-sm">{h.worked.eligible}</p>
                <p className="font-mono text-sm break-words text-muted-foreground">{h.worked.nullifier}</p>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-muted-foreground">{h.worked.note}</p>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="border-b bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHead eyebrow={h.lifecycle.eyebrow} title={h.lifecycle.title} body={h.lifecycle.body} />
          <ol className="mt-10 grid gap-3 md:grid-cols-4">
            {h.lifecycle.states.map((s, i) => {
              const last = i === h.lifecycle.states.length - 1
              return (
                <li
                  key={s.name}
                  className={`relative rounded-lg border p-5 ${last ? "border-dashed bg-background" : "bg-background"}`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full ${last ? "border border-destructive" : i === 0 ? "bg-seal" : "bg-primary"}`}
                    />
                    <span className="font-serif text-lg font-medium">{s.name}</span>
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Guardrails */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHead eyebrow={h.guardrails.eyebrow} title={h.guardrails.title} />
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {h.guardrails.items.map((g) => (
              <div key={g.title} className="border-t pt-5">
                <h3 className="text-xl font-medium">{g.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted-foreground">{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulation */}
      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <SectionHead eyebrow={h.regulation.eyebrow} title={h.regulation.title} body={h.regulation.body} />
          <div>
            <dl className="rounded-lg border bg-background">
              {h.regulation.items.map((r) => (
                <div key={r.title} className="border-b border-rule px-5 py-4 last:border-b-0">
                  <dt className="font-medium">{r.title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{r.body}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">{h.regulation.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* Developers */}
      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHead eyebrow={h.developers.eyebrow} title={h.developers.title} body={h.developers.body} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <pre
              tabIndex={0}
              className="overflow-x-auto rounded-lg border bg-[#16211c] p-5 font-mono text-[0.8125rem] leading-relaxed text-[#e9e4d8] dark:bg-card"
            >
              <code>{CONTRACT}</code>
            </pre>
            <div className="rounded-lg border bg-card">
              <h3 className="border-b px-5 py-3 font-sans text-sm font-semibold">{h.developers.mapTitle}</h3>
              <ul>
                {h.developers.map.map((m) => (
                  <li key={m.demo} className="border-b border-rule px-5 py-3 last:border-b-0">
                    <code className="font-mono text-sm text-primary">{m.demo}</code>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.real}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-medium">{h.cta.title}</h2>
            <p className="mt-2 text-primary-foreground/85">{h.cta.body}</p>
          </div>
          <Button asChild size="lg" variant="paper">
            <Link href={href(locale, "/app")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
