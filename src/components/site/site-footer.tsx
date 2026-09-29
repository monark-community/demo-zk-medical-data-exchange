import Link from "next/link"

import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import { t, type Dictionary } from "@/i18n"

import { CuraWordmark } from "./brand"

export function SiteFooter({ locale, dict, compact = false }: { locale: Locale; dict: Dictionary; compact?: boolean }) {
  const c = dict.common
  const year = new Date().getFullYear()
  const link = "rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {!compact && (
          <div className="grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-sm">
              <CuraWordmark />
              <p className="mt-3 text-sm text-muted-foreground">{c.footer.line}</p>
            </div>
            <nav aria-label={c.footer.product}>
              <h2 className="eyebrow font-sans text-muted-foreground">{c.footer.product}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className={link} href={href(locale, "/how-it-works")}>
                    {c.nav.howItWorks}
                  </Link>
                </li>
                <li>
                  <Link className={link} href={href(locale, "/app")}>
                    {c.nav.demo}
                  </Link>
                </li>
                <li>
                  <Link className={link} href={href(locale, "/credits")}>
                    {c.footer.photos}
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label={c.footer.project}>
              <h2 className="eyebrow font-sans text-muted-foreground">{c.footer.project}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className={link} href={PROJECT_DOC_URL} target="_blank" rel="noopener noreferrer">
                    {c.footer.projectPage}
                  </a>
                </li>
                <li>
                  <a className={link} href={REPO_URL} target="_blank" rel="noopener noreferrer">
                    {c.footer.repo}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-rule py-5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <span>{t(c.footer.copyright, { year })}</span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-seal" />
            {c.demoNotice}
          </span>
          <span>{c.sampleNotice}</span>
          <a
            href={MONARK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.8125rem] text-muted-foreground underline-offset-4 hover:underline sm:ml-auto"
          >
            {c.footer.builtWith}
          </a>
        </div>
      </div>
    </footer>
  )
}
