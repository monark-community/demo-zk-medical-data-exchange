# Cura

**Join medical research without handing over your chart.**

Cura is a zero-knowledge medical data exchange. Patients keep their records in an encrypted vault that only their wallet key opens. When a study posts its eligibility criteria, the patient's device answers with a zero-knowledge proof ("meets every criterion") instead of a file. Consent is a revocable on-chain slip that names the fields shared and an end date, and rewards come from an escrow the study funds up front. Contributors govern the exchange's privacy rules through an anonymous council.

This repository is the product site and an interactive demo. Everything in the demo is simulated: sample records, a simulated prover, a simulated wallet and a simulated test network. There is no backend and nothing is sent anywhere.

- Project page: https://www.monark.io/en/project/zk-medical-data-exchange
- Site plan (product brief, flows, copy, identity, pricing): [`docs/site-plan.md`](docs/site-plan.md)
- Image credits: [`docs/assets.md`](docs/assets.md)

Cura is an independent product incubated by [Monark](https://www.monark.io).

## Run it locally

Requirements: Node.js 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3135
```

Other scripts:

| Script | What it does |
|-|-|
| `pnpm build` / `pnpm start` | Production build, then serve it on port 3135 |
| `pnpm lint` | ESLint (Next.js core web vitals + TypeScript rules) |
| `pnpm typecheck` | Generates route types, then `tsc --noEmit` (strict) |
| `pnpm screenshots` | Playwright screenshots of every page and key flow into `docs/screenshots/` (needs a running server; pass a variant filter such as `en-390-light` as an argument) |

No environment variables are required. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL used in metadata, the sitemap and robots (default `https://cura.monark.io`).

## What the demo lets you do

1. **Connect and fill the vault.** Connect a demo wallet (sign-in, no fee), import sample records (a sleep ring, a home blood pressure cuff), delete one.
2. **Check eligibility privately and join.** Run the private check on a study, watch the proof stages and constraint counter, flip between *your view* and *what the lab sees*, then sign the consent slip. Also see *not eligible*, *missing data* and *already enrolled* (nullifier) outcomes.
3. **Manage consent.** Narrow a slip's fields, revoke it (the stub tears and is stamped), claim accrued rewards.
4. **Design a study as a lab.** Set criteria against a live, privacy-floored cohort estimate, then fund the escrow and publish. The study then appears for patients.
5. **Vote on a rule.** Cast an anonymous vote on raising the minimum cohort size, close the vote, and see the lab's cohort builder use the new threshold.

Every signature goes through a wallet prompt with Confirm / Reject. **Demo controls** can force the next transaction to fail, slow the network down, or reset the demo.

## How the simulation works

All simulated behaviour lives in `src/lib/demo/`, behind a small typed API, so it can be swapped for wagmi/viem and a real prover without touching UI code.

| Module | Simulates | Real counterpart |
|-|-|-|
| `types.ts` | Domain types: studies, criteria, vault records, consents, proposals, activity | Contract structs and events |
| `store.ts` | Single external store (`useSyncExternalStore`) persisted to `localStorage` under `cura-demo-v1`, every access in try/catch; the wallet prompt queue | Contract state read through an indexer |
| `chain.ts` | `useTx()`: signature prompt, pending hash, 1.2–2.4 s block time (3–6 s on "slow network"), confirmed or reverted | `writeContract` + `waitForTransactionReceipt` |
| `prover.ts` | Evaluates criteria against the sample patient's facts, fakes proof stages, constraint count, proof bytes and a deterministic per-study nullifier | Circuit compiled to WASM, proving in a Web Worker |
| `population.ts` | 6,400 synthetic opted-in vaults (seeded PRNG); cohort counts rounded to 10 and hidden below the council's minimum | Aggregated, noise-added cohort counts |
| `ops.ts` | State transitions applied on confirmation, each appending an audit-trail entry | Contract calls and their events |
| `seed.ts` | The sample patient, six fictional studies and labs, consents, proposals | — |

All people, labs and studies are fictional. The demo never asks for real health information.

## Project structure

```
src/
  app/
    [locale]/            en and fr routes (proxy.ts redirects / by Accept-Language)
      (site)/            home, how-it-works, credits, pricing (unlinked, noindex), 404 catch-all
      app/               the demo: overview, vault, studies/[id], consents, lab, lab/new, council, activity
      opengraph-image.tsx
    globals.css          Cura design tokens (light and dark) over the Monark UI registry theme
    sitemap.ts, robots.ts, icon.svg
  components/
    ui/                  shadcn/ui + Monark registry components, re-themed
    site/                header, footer, wordmark, locale and theme switches
    home/, diagrams/     the "two sides of the glass" hero and the proof seal
    demo/                app shell, wallet prompt, demo controls and every demo view
  i18n/                  typed EN/FR dictionaries
  lib/demo/              the simulated data layer (see above)
scripts/screenshots.mjs  Playwright visual check
docs/                    site plan, asset credits, screenshots
```

## Deploy to Vercel

Import the repository in Vercel and keep the defaults: framework Next.js, install `pnpm install`, build `pnpm build`. No `vercel.json` and no environment variables are needed; the Node version comes from `engines` in `package.json`. Every page prerenders except studies published inside the demo, which render on demand.

## Disclaimers

Demo · simulated data. Sample records only, not medical advice. Testnet demo, not financial advice, no real funds. Nothing here is a HIPAA, GDPR or Law 25 certification or legal advice.
