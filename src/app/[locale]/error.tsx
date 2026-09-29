"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { errorCopy } from "@/i18n/dictionaries/errors"

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() ?? ""
  const copy = pathname.startsWith("/fr") ? errorCopy.fr : errorCopy.en
  return (
    <main id="main" className="flex flex-1 flex-col">
      <section
        role="alert"
        className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-20 sm:px-6"
      >
        <h1 className="text-3xl font-medium sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 text-muted-foreground">{copy.body}</p>
        <Button className="mt-8" size="lg" onClick={reset}>
          {copy.retry}
        </Button>
      </section>
    </main>
  )
}
