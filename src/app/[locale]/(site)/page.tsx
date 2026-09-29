import { ArrowRightIcon, CheckIcon, MinusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Glass } from "@/components/home/glass"
import { SealStamp } from "@/components/diagrams/seal-stamp"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

import memberPhoto from "../../../../public/images/member-window.jpg"
import patientPhoto from "../../../../public/images/patient-kitchen.jpg"
import researcherPhoto from "../../../../public/images/researcher-microscope.jpg"

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return pageMetadata(locale, "/", null, getDictionary(locale).meta.description)
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).home

  return (
    <>
      {/* Hero */}
      <section className="ruled border-b">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-12 pb-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="text-[2.5rem] leading-[1.04] font-medium sm:text-6xl lg:text-[4rem]">{d.hero.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{d.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {d.hero.primary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{d.hero.secondary}</Link>
              </Button>
            </div>
          </div>
          <Glass copy={d.glass} />
        </div>
      </section>

      {/* Problem: before / after */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <h2 className="text-3xl leading-tight font-medium sm:text-4xl">{d.problem.title}</h2>
          <div className="grid overflow-hidden rounded-lg border sm:grid-cols-2">
            <div className="bg-muted/60 p-5 sm:p-6">
              <h3 className="font-sans text-sm font-semibold text-muted-foreground">{d.problem.before}</h3>
              <ul className="mt-4 space-y-3">
                {d.problem.beforeItems.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.9375rem] text-muted-foreground">
                    <MinusIcon className="mt-1 size-4 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t bg-card p-5 sm:border-t-0 sm:border-l sm:p-6">
              <h3 className="font-sans text-sm font-semibold text-primary">{d.problem.after}</h3>
              <ul className="mt-4 space-y-3">
                {d.problem.afterItems.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.9375rem]">
                    <CheckIcon className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-medium sm:text-4xl">{d.steps.title}</h2>
            <Link
              href={href(locale, "/how-it-works")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {d.steps.more}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {d.steps.items.map((step, i) => (
              <li key={step.title} className="border-t-2 border-foreground pt-5">
                <span className="tnum font-serif text-3xl text-seal italic" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-medium">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences: patients, labs, contributors (council) */}
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 lg:gap-8 lg:py-24">
          {(
            [
              { key: "patients", photo: patientPhoto, to: "/app", pos: "object-[50%_40%]" },
              { key: "labs", photo: researcherPhoto, to: "/app/lab", pos: "object-[50%_45%]" },
              { key: "council", photo: memberPhoto, to: "/app/council", pos: "object-[50%_35%]" },
            ] as const
          ).map(({ key, photo, to, pos }) => {
            const a = d.audiences[key]
            return (
              <article key={key} className="flex flex-col overflow-hidden rounded-lg border bg-card">
                <div className="relative aspect-[4/3] overflow-hidden border-b">
                  <Image
                    src={photo}
                    alt={a.alt}
                    fill
                    sizes="(min-width: 768px) 380px, 100vw"
                    className={`object-cover ${pos} dark:brightness-[0.85]`}
                    placeholder="blur"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow text-seal">{a.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-medium">{a.title}</h2>
                  <ul className="mt-5 space-y-2 border-t border-rule pt-5">
                    {a.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-[0.9375rem]">
                        <CheckIcon className="size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button asChild variant={key === "patients" ? "default" : "outline"}>
                      <Link href={href(locale, to)}>
                        {a.cta}
                        <ArrowRightIcon aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
          <h2 className="text-3xl font-medium sm:text-4xl">{d.faq.title}</h2>
          <Accordion type="single" collapsible className="border-t">
            {d.faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={`q${i}`}>
                <AccordionTrigger className="py-5 text-left font-serif text-lg font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[0.9375rem] text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-20">
          <div className="flex items-center gap-5">
            <SealStamp className="hidden border-primary-foreground/70 text-primary-foreground sm:grid" />
            <h2 className="text-3xl font-medium sm:text-4xl">{d.closing.title}</h2>
          </div>
          <Button asChild size="lg" variant="paper">
            <Link href={href(locale, "/app")}>
              {d.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
