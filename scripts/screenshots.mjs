// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start        (serves on port 3135)
//        pnpm screenshots                (BASE_URL defaults to http://localhost:3135)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3135"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY ?? process.argv[2] // optional filter on the variant tag, e.g. "en-390-light"

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
// French: home page and one key flow, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    connect: "Connect demo wallet",
    confirm: "Confirm",
    reject: "Reject",
    overview: "Your vault, your studies",
    check: "Check privately",
    qualify: "You qualify.",
    labView: "What the lab sees",
    submit: "Submit proof and consent",
    enrolled: "Enrolled. Your consent slip is on the record.",
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    confirm: "Confirmer",
    reject: "Refuser",
    overview: "Votre coffre, vos études",
    check: "Vérifier en privé",
    qualify: "Vous êtes admissible.",
    labView: "Ce que voit le labo",
    submit: "Soumettre la preuve et le consentement",
    enrolled: "Inscription faite. Votre bon de consentement est consigné.",
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  const path = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  if (fullPage) {
    // Grow the viewport to the page height so sticky header and tab bar sit where a reader sees them.
    await page.evaluate(() => window.scrollTo(0, 0))
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width: sizes[v.w].width, height: Math.max(height, sizes[v.w].height) })
    await page.waitForTimeout(500)
    await page.screenshot({ path })
    await page.setViewportSize(sizes[v.w])
    console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
    return
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const main = (page) => page.getByRole("main")
const dialog = (page) => page.getByRole("dialog").last()
const confirm = async (page, v) => {
  await dialog(page).waitFor()
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).click()
}
const go = (page, v, path) => page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
const setFailNext = async (page) => {
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).getByRole("switch", { name: "Fail the next transaction" }).click()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}

async function connect(page, v, capture) {
  await go(page, v, "/app")
  const btn = main(page).getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "flow1-01-gate", true)
  await btn.click()
  await dialog(page).waitFor()
  if (capture) await shot(page, v, "flow1-02-connect-prompt")
  if (capture) {
    await dialog(page).getByRole("button", { name: L[v.locale].reject, exact: true }).click()
    await page.getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-03-connect-rejected")
    await btn.click()
  }
  await confirm(page, v)
  await page.getByRole("heading", { level: 1, name: L[v.locale].overview }).waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await go(page, v, path)
    await page.waitForTimeout(3200) // let the hero seal animation finish
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await go(page, v, "")
    await page.getByRole("button", { name: "Open menu" }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  // Flow 1: connect (gate, prompt, rejected) and the vault
  await connect(page, v, true)
  await shot(page, v, "app-overview", true)
  await go(page, v, "/app/vault")
  await shot(page, v, "flow1-04-vault", true)

  // Flow 2: private check and enrolment (with one forced failure)
  await go(page, v, "/app/studies")
  await shot(page, v, "flow2-01-studies", true)
  await go(page, v, "/app/studies/t2d-home-bp")
  await page.getByRole("button", { name: "Check privately", exact: true }).click()
  await page.waitForTimeout(1500)
  await shot(page, v, "flow2-02-proving")
  await page.getByText("You qualify.").waitFor({ timeout: 10000 })
  await page.getByText("You qualify.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-03-eligible-your-view")
  await page.getByRole("button", { name: "What the lab sees" }).click()
  await page.waitForTimeout(2200)
  await shot(page, v, "flow2-04-eligible-lab-view")
  await setFailNext(page)
  await page.getByRole("button", { name: "Submit proof and consent" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-05-sign-prompt")
  await confirm(page, v)
  await page.getByText("Verifying proof on-chain…").waitFor()
  await page.getByText("Verifying proof on-chain…").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-06-pending")
  await page.getByText(/confirm the transaction\. Nothing was recorded/).waitFor({ timeout: 10000 })
  await page.getByRole("alert").first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-07-failed")
  await page.getByRole("button", { name: "Submit proof and consent" }).click()
  await confirm(page, v)
  await page.getByText("Enrolled. Your consent slip is on the record.").waitFor({ timeout: 10000 })
  await page.getByText("Enrolled. Your consent slip is on the record.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-08-enrolled")

  // Flow 2, unhappy verdicts: not eligible, missing data -> import -> eligible
  await go(page, v, "/app/studies/childhood-asthma")
  await page.getByRole("button", { name: "Check privately", exact: true }).click()
  await page.getByText(/meet this study.s criteria/).waitFor({ timeout: 10000 })
  await page.getByText(/meet this study.s criteria/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-09-not-eligible")
  await go(page, v, "/app/studies/statin-genomics")
  await page.getByRole("button", { name: "Check privately", exact: true }).click()
  await page.getByText(/needs genomic data/).waitFor({ timeout: 10000 })
  await page.getByText(/needs genomic data/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-10-missing-no-source")
  await go(page, v, "/app/studies/metformin-sleep")
  await page.getByRole("button", { name: "Check privately", exact: true }).click()
  await page.getByRole("link", { name: "Import sample data" }).waitFor({ timeout: 10000 })
  await page.getByRole("link", { name: "Import sample data" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow1-05-import-sheet")
  await dialog(page).getByRole("button", { name: "Import", exact: true }).first().click()
  await confirm(page, v)
  await page.getByText("Storing sealed copy…").waitFor({ timeout: 10000 })
  await shot(page, v, "flow1-06-import-encrypting")
  await page.getByText("Already in your vault").nth(3).waitFor({ timeout: 10000 })
  await page.keyboard.press("Escape")
  await shot(page, v, "flow1-07-vault-imported", true)
  await go(page, v, "/app/studies/metformin-sleep")
  await page.getByRole("button", { name: "Check privately", exact: true }).click()
  await page.getByText("You qualify.").waitFor({ timeout: 10000 })
  await page.getByText("You qualify.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-11-eligible-after-import")

  // Flow 3: consents: narrow, revoke (the torn slip), claim
  await go(page, v, "/app/consents")
  await shot(page, v, "flow3-01-consents", true)
  await page.getByRole("button", { name: "Change fields" }).first().click()
  await dialog(page).waitFor()
  await dialog(page).getByRole("checkbox").last().click()
  await shot(page, v, "flow3-02-narrow-dialog")
  await dialog(page).getByRole("button", { name: "Sign the change" }).click()
  await confirm(page, v)
  await page.getByText(/Confirmed in block/).first().waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: "Revoke" }).last().click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-03-revoke-confirm")
  await dialog(page).getByRole("button", { name: "Revoke consent" }).click()
  await confirm(page, v)
  await page.getByText("Revoked", { exact: true }).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(900)
  await page.getByText("Revoked", { exact: true }).first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-04-revoked-torn")
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole("button", { name: "Claim rewards" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-05-claim-prompt")
  await confirm(page, v)
  await page.getByText(/Confirmed in block/).first().waitFor({ timeout: 10000 })
  await shot(page, v, "flow3-06-claimed")

  // Flow 4: the lab designs and publishes a study
  await go(page, v, "/app/lab")
  await shot(page, v, "flow4-01-lab-overview", true)
  await go(page, v, "/app/lab/new")
  await page.getByRole("button", { name: "Fund escrow and publish" }).last().click()
  await shot(page, v, "flow4-02-builder-errors", true)
  await page.getByRole("button", { name: "Fill an example" }).click()
  await shot(page, v, "flow4-03-builder-filled", true)
  await page.getByRole("button", { name: "Fund escrow and publish" }).last().click()
  await dialog(page).waitFor()
  await shot(page, v, "flow4-04-publish-prompt")
  await confirm(page, v)
  await page.waitForURL(/\/app\/lab$/, { timeout: 15000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow4-05-published")

  // Flow 5: council vote, then close the vote so the rule changes
  await page.getByRole("button", { name: "Patient", exact: true }).first().click()
  await page.getByRole("heading", { level: 1, name: L.en.overview }).waitFor()
  await go(page, v, "/app/council")
  await shot(page, v, "flow5-01-council", true)
  await page.getByRole("button", { name: "Vote yes" }).first().click()
  await page.getByText("Generating membership proof…").waitFor()
  await shot(page, v, "flow5-02-membership-proof")
  await confirm(page, v)
  await page.getByText(/You voted Yes/).waitFor({ timeout: 10000 })
  await shot(page, v, "flow5-03-voted")
  await page.getByRole("button", { name: "Close voting now" }).first().click()
  await page.waitForTimeout(600)
  await shot(page, v, "flow5-04-rule-changed", true)

  await go(page, v, "/app/activity")
  await shot(page, v, "app-activity", true)
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "app-demo-controls")
}

async function frenchFlow(page, v) {
  await go(page, v, "")
  await page.waitForTimeout(3200)
  await shot(page, v, "page-home", true)
  await connect(page, v, false)
  await shot(page, v, "app-overview", true)
  await go(page, v, "/app/studies/t2d-home-bp")
  await page.getByRole("button", { name: L.fr.check, exact: true }).click()
  await page.getByText(L.fr.qualify).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: L.fr.labView }).click()
  await page.waitForTimeout(2200)
  await page.getByText(L.fr.qualify).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-04-eligible-lab-view")
  await page.getByRole("button", { name: L.fr.submit }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-05-sign-prompt")
  await confirm(page, v)
  await page.getByText(L.fr.enrolled).waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-08-enrolled", true)
  await go(page, v, "/app/consents")
  await shot(page, v, "flow3-01-consents", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
