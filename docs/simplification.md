# Simplification pass

Owner feedback: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."*

Cura is an independent brand, so its header and footer keep their own identity. This pass applies only the "Restraint" rules (`monark-brand-guidelines.md` end of §8), the one-top-bar rule, and §11 (disclaimers). It follows the checklist in `sites/address-review-system/docs/simplification.md` §4.

How the numbers are measured (both scripts are in `scripts/`, run against `pnpm build && pnpm start`, port 3135):

- `node scripts/wordcount.mjs`: words per page, English, at 1440px. *Visible* is the `innerText` of `<main>`; *total* also counts closed disclosures and popovers; *chrome* is everything outside `<main>` (site header and footer, or the app header and sidebar). App pages include seeded data (study titles, criteria, proposals, activity).
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

Already compliant: marketing pages had one top bar (the header); the testnet notice was already in the wallet prompt.

Too loaded:

- **Home**: hero eyebrow, a 25-word subline and a note under the buttons; **7 sections** after the hero (problem with a 45-word body, steps, two audience panels with 25-word bodies, "What leaves your vault" (three columns that restated the hero glass), a council band with a 35-word body and a rules table, a 6-question FAQ with 25–40-word answers, closing with a body line). Six eyebrows.
- **How it works**: eyebrow on every section, 20–35-word intros, 30–40-word card bodies, a 55-word regulation paragraph, the contract interface always open.
- **Footer**: "Demo · simulated data" **and** "Sample records only · not medical advice".
- **App**: every page opened with an eyebrow, a title and an intro paragraph. The "not medical advice" line showed three more times (sidebar, app footer, vault panel) and the demo notice twice (header badge, app footer). The testnet line was also shown permanently under the claim button and the publish button. Permanent help panels: "What you can see" on the lab overview, criteria/fields hints in the builder, "Public inputs…" and "Only after you sign…" notes on each study, an explanation paragraph in the proof panel, a "you'll sign once" hint under the submit button. Gate: eyebrow, 25-word paragraph, three bullets. Toasts repeated what the screen already showed (enrol, narrow, revoke, claim, vote, import, delete, publish). Demo control hints 8–10 words.

| Page | Visible in main | Total in main (incl. collapsed) | Chrome |
|-|-:|-:|-:|
| Home | 676 | 676 | 61 |
| How it works | 757 | 764 | 61 |
| Credits | 88 | 88 | 61 |
| 404 | 30 | 30 | 61 |
| App: connect gate | 58 | 58 | 21 |
| App: patient overview | 216 | 216 | 44 |
| App: vault | 131 | 131 | 44 |
| App: studies | 153 | 153 | 44 |
| App: study (before check) | 126 | 126 | 44 |
| App: study (eligible) | 253 | 253 | 44 |
| App: consents | 124 | 124 | 44 |
| App: council | 173 | 175 | 44 |
| App: activity | 177 | 177 | 44 |
| App: lab overview | 100 | 108 | 44 |
| App: new study | 214 | 261 | 44 |
| **Total** | **3,276** | **3,340** | **705** |

Dictionary copy: **EN 3,677 words** (home 857 · how 693 · app 1,590 · common 111); **FR 4,160**.

## 2. What changed

No feature or flow was removed.

### Shell
- Footer legal band: "Demo · simulated data" only; the "not medical advice" line now lives once, in the Demo controls sheet. Footer product line 17 → 9 words.
- App: removed the app footer (it repeated the header's Demo badge) and the sidebar's disclaimer. The header keeps one Demo badge.

### Home (hero + 7 sections → hero + 5)
- Hero: no eyebrow, subline 25 → 15 words, note line removed.
- Problem: heading + before/after panel only (body removed); 4 → 3 items per side, 3–8 words each.
- Steps: no eyebrow; step lines 12–15 → 7–9 words.
- **Merged** the council band into the audience row: three cards (patients, research teams, contributors), each eyebrow + heading + 3 checks + button. The council's rules became the contributors card's checks.
- **Removed** "What leaves your vault": it restated the hero glass and the before/after panel.
- FAQ: 6 → 4 questions, answers 25–40 → 12–15 words, the only FAQ on the site. "Why a wallet?" is covered by the gate; "How are rewards paid?" became the "Active" line on `/how-it-works`.
- Closing: heading + button.

### How it works
- No eyebrows anywhere; intro 20 → 9 words.
- Card bodies cut to 10–15 words; worked-proof intro and note to one line each; consent states to one line; guardrails to one line; the regulation paragraph removed (the principles list and the disclaimer carry it).
- For developers: one line; the contract interface and module map sit behind "Show the contract interface".
- CTA: heading + button.

### App
- **Page heads**: no eyebrow, no intro paragraph. The page's context (vault, studies, consents, lab, council, activity) is in an info popover next to the title (`src/components/ui/info-tip.tsx`, copied from the TrustRate pilot; opens on click or tap).
- **Gate**: title + one 9-word line + button (eyebrow and three bullets removed).
- **Overview**: tour items are links only (no body lines); suggested studies 3 → 2; recent activity 4 → 2 (the full log is one tap away).
- **Study page**: "Public inputs…" and "Only after you sign…" notes, and the proof panel's explanation, moved into info popovers. Verdict lines cut to 4–8 words. "You'll sign once…" hint removed (the wallet prompt says it). Study cards show the enrolment bar only; the count is in its tooltip and accessible name (the study page still shows it).
- **Consent slip**: "Stub" label removed (the perforation shows it); reward note 9 → 7 words.
- **Consents**: testnet line removed from the rewards panel (it is in the claim's wallet prompt); empty state one line + "Find a study"; narrow and revoke dialogs one line each, keeping the consequence ("You can't re-enrol").
- **Lab overview**: the "What you can see" panel moved into the title's info popover.
- **Builder**: intro removed; criteria and fields hints behind info icons; cohort and escrow notes 3–5 words; testnet line removed from the summary (it is in the publish wallet prompt).
- **Council**: open proposal summaries cut to one short line; the "Demo helper" line under "Close voting now" is the button's tooltip only.
- **Activity**: 6 entries at a time with "Show more".
- **Vault**: record size moved into the sealed copy's tooltip; the side panel lost its disclaimer; sheet description 13 → 3 words.
- **Demo controls**: hints 3–5 words.
- **One message, once**: no toast on enrol, narrow, revoke, claim, vote, import, delete or publish, because the slip, the tx status, the list or the next screen already confirm it. The two remaining toasts ("Proposal #n passed", "Demo reset.") report something not otherwise visible.
- Empty and error states are one line plus the next action.

French was rewritten to the same brevity in `src/i18n/dictionaries/fr.ts`; EN and FR keys are identical (typed dictionary), and the keys this pass stopped using were removed.

## 3. After

| Page | Visible before | Visible after | Change | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|
| Home | 676 | 316 | −53% | 316 | 61 | 46 |
| How it works | 757 | 392 | −48% | 501 | 61 | 46 |
| Credits | 88 | 74 | −16% | 74 | 61 | 46 |
| 404 | 30 | 20 | −33% | 20 | 61 | 46 |
| App: connect gate | 58 | 20 | −66% | 20 | 21 | 12 |
| App: patient overview | 216 | 110 | −49% | 110 | 44 | 29 |
| App: vault | 131 | 92 | −30% | 92 | 44 | 29 |
| App: studies | 153 | 119 | −22% | 119 | 44 | 29 |
| App: study (before check) | 126 | 82 | −35% | 82 | 44 | 29 |
| App: study (eligible) | 253 | 184 | −27% | 184 | 44 | 29 |
| App: consents | 124 | 98 | −21% | 98 | 44 | 29 |
| App: council | 173 | 124 | −28% | 126 | 44 | 29 |
| App: activity | 177 | 108 | −39% | 108 | 44 | 29 |
| App: lab overview | 100 | 56 | −44% | 64 | 44 | 29 |
| App: new study | 214 | 150 | −30% | 178 | 44 | 29 |
| **Total** | **3,276** | **1,945** | **−41%** | **2,092** | **705** | **486** |

Marketing pages alone (home, how it works, credits, 404): 1,551 → 802 visible words (−48%). Including chrome, the site goes from 3,981 to 2,431 words (−39%). The remaining app words are mostly seeded data (study titles, criteria, proposals, activity) and form labels.

Dictionary copy: **EN 3,677 → 2,538 words (−31%)**, FR 4,160 → 2,865 (−31%). Per section (EN): home 857 → 402 · how 693 → 430 · app 1,590 → 1,212 · common 111 → 92 · credits 66 → 51 · pricing 214 (internal, unlinked, left as is).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow2-04-eligible-lab-view.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow2-04-eligible-lab-view.png`, and every other page and flow step in `docs/screenshots/` (EN 390/1440 light/dark, FR 390/1440 light). No file was renamed or removed, so the project image was not re-rendered.
