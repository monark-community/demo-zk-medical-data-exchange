# Cura: site plan

- Project id: `zk-medical-data-exchange` · Monark-branded: **false** (independent product incubated by Monark)
- Authoritative description: https://www.monark.io/en/project/zk-medical-data-exchange
- Old Lovable site (reference only, kept on `main`): https://demo-zk-medical-data-exchange.vercel.app/
- Canonical site URL assumed: `https://cura.monark.io` (the project page links there; override with `NEXT_PUBLIC_SITE_URL`)

This file always describes what shipped. Decisions made while working unattended are marked **Decision**.

---

## 1. Product brief

**Target users.** Two sides of one exchange, plus the people who govern it:

- **Data providers (patients).** Adults living with a chronic condition (type 2 diabetes, hypertension, sleep problems, asthma) who would help research if it did not mean emailing their chart to strangers. They are not crypto people: the wallet is only their key.
- **Researchers.** Clinical and academic study teams, and health-AI groups, who need a specific, verified cohort and would rather not become custodians of raw health records their ethics board then has to worry about.
- **Members (the council).** Everyone who has contributed data can vote on the exchange's privacy rules.

**Core job to be done.** "Let me take part in a study I qualify for, prove it without handing over my record, and stay in control of what the lab gets afterwards." For researchers: "Find and enrol people who verifiably meet my criteria without collecting identifiable data I don't need."

**Domain concepts** (from the documentation page, which wins over the old site):

| Concept | Meaning in Cura |
|-|-|
| Vault | The patient's encrypted, off-chain store of records (clinic export, lab results, wearable data). Only their wallet key opens it. Upload, view and delete. |
| Study | A research project with a question, **eligibility criteria**, the fields it asks for after enrolment, a duration and a reward per participant. |
| Eligibility proof | A zero-knowledge proof generated on the patient's device: "this vault satisfies every criterion", with no values revealed. Verified by an on-chain verifier contract. |
| Nullifier | A per-study value derived from the vault key, so one person cannot enrol twice and two studies cannot link the same person. |
| Consent grant | A smart-contract record: which study, which fields, until when. Dynamic: it can be narrowed or revoked at any time. |
| Reward escrow | The study funds participant rewards up front; rewards accrue while consent is active and are claimed by the patient. |
| Minimum cohort size (k) | Cohort counts shown to researchers are rounded and hidden below k, so a study can't single anyone out. Set by the council. |
| Council | Proposal and vote system (one member, one vote, anonymous membership proof) for the exchange's rules, with a full audit trail. |
| Audit trail | Every proof, consent, revocation, access and payment, as a readable log. |

**What the Lovable version got wrong or left out.**

- It never showed zero knowledge. "Privacy Score 100%", "256-bit" and a lock icon replaced any explanation of what is proven and what stays hidden. Cura's whole point, *prove without revealing*, was invisible.
- No vault flow, no eligibility check, no consent grant, no revocation: the three things the documentation calls the core were missing. "Join study" buttons did nothing meaningful.
- The researcher side had no way to define criteria or see a cohort; it was a list of papers ("Breakthroughs").
- Fabricated social proof (10K+ contributors, $2M+ distributed, 99.9% privacy guaranteed) and real institution names (Stanford, Mayo Clinic, Johns Hopkins) attached to invented studies. That is exactly the kind of trust shortcut a medical-data product can't take.
- Generic dark-blue shadcn look with gradient headings; no identity.
- It claimed a specific network ("Midnight Network") that the documentation doesn't mention.

## 2. Value proposition

> **For patients who want to help medical research, and the teams who need them, Cura matches people to studies with a zero-knowledge proof instead of a file transfer, so eligibility is verified and consent is enforced on-chain without anyone copying a medical record.**

Supporting benefits (outcomes, not features):

1. **Your chart stays where it is.** A study learns that you qualify, not your lab values. Nothing leaves your vault until you sign a consent that names exactly what goes out.
2. **You can change your mind, and it sticks.** Consent is time-limited and revocable in one step; the lab's access ends on-chain, not when someone reads an email.
3. **Researchers enrol a verified cohort without holding raw records.** Every participant is proven eligible, counted once and consented on the record, which is the audit trail an ethics board asks for.

## 3. Hero

- **Headline:** "Join research without handing over your chart." (7 words) · FR: « Participez à la recherche sans céder votre dossier. »
- **Subheadline:** "Cura answers a study's eligibility criteria with a zero-knowledge proof. The lab learns that you qualify; your record stays sealed in your own vault." · FR: « Cura répond aux critères d'une étude avec une preuve à divulgation nulle. Le labo apprend que vous êtes admissible ; votre dossier reste scellé dans votre coffre. »
- **Primary CTA:** "Try the demo" → `/{locale}/app` · FR « Essayer la démo »
- **Secondary CTA:** "How a proof works" → `/{locale}/how-it-works` · FR « Comment fonctionne une preuve »
- **Hero visual: "Two sides of the glass"**, built in code, not a photo. A single record card split down the middle: on the left, *your view* (age 52, HbA1c 7.1 %, metformin 1,000 mg, diagnosis 2019); on the right, *the lab's view* of the same rows, where each value is replaced by a sealed band and a check against the study's criterion ("Age 40–70 ✓"). It animates once on load: criteria tick in, the right-hand values seal, a round proof seal stamps the bottom with a short proof id. **Why:** the product's one idea is that the two sides see different things. A photo of a doctor can't show that; the UI can, in two seconds, and it doubles as a preview of the real demo.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects by `Accept-Language` (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Explain the idea and send people into the demo. | Hero with the glass · "Today, your data is either locked away or given away" (the problem, as a before/after of how a study recruits) · How a match happens (4 steps: vault → criteria → proof → consent) · For patients / For researchers (two photo panels with outcomes and a role-specific CTA into the demo) · What leaves your vault (three columns: stays sealed / proven / shared only with consent) · The council sets the rules (k, consent caps; photo) · FAQ · Closing CTA |
| `/{locale}/how-it-works` | The mechanics for careful patients, researchers, ethics boards and developers. **Justified:** ZK is the product; nobody should trust a medical-data exchange that can't explain exactly what is proven. | Intro · The three parts (vault, proof, consent contract) · A worked proof (one study's criteria against one record, public inputs vs private inputs) · The life of a consent (state diagram: granted → active → narrowed → revoked / expired) · Guardrails (nullifiers, minimum cohort size, audit trail, council) · Regulation (built around minimisation, explicit consent and withdrawal; not a certification) · For developers (contract interface sketch and how the demo's data layer maps to it) · CTA |
| `/{locale}/app` | Demo home. Gate (connect demo wallet) then a role overview: patient home (vault summary, suggested studies, active consents, rewards) or lab home (studies, cohort, escrow). | Role switch · summary tiles · next actions |
| `/{locale}/app/vault` | Patient vault: records, import, delete. | Records list · Import sheet · empty state |
| `/{locale}/app/studies` | Browse open studies (patient). | Filters (condition, data type) · study cards · empty state |
| `/{locale}/app/studies/[id]` | One study: criteria, what it asks for, private eligibility check, join. | Header · Criteria · "What the lab gets" · Check privately (proof panel) · Consent slip · Status |
| `/{locale}/app/consents` | Patient consents and rewards: narrow, revoke, claim. | Rewards summary + claim · active slips · ended slips |
| `/{locale}/app/lab` | Researcher: my studies, enrolment, escrow. | Study table · per-study cohort and enrolment |
| `/{locale}/app/lab/new` | Researcher: design and publish a study with a live cohort estimate. | Question · Criteria builder · Fields requested · Reward and size · Live cohort · Publish |
| `/{locale}/app/council` | Proposals and anonymous voting. | Current rules · Open proposals · Closed proposals |
| `/{locale}/app/activity` | Audit trail of everything the demo did. | Filterable log with receipts |
| `/{locale}/credits` | Photo credits (linked from the footer). | List |
| `/{locale}/pricing` | Internal strategy review only. **Never linked**, not in sitemap, `noindex, nofollow`. | Model · plans · reasoning |
| 404 | Localized not-found with links home and to the demo. | |

**Decision:** the app is split into sub-routes (not tabs on one page) so each flow has a shareable URL and a clear back path, and so screenshots can target each step.

**Header** (site): wordmark left; links "How it works", "Demo"; right: EN/FR switch, theme toggle, primary "Try the demo". Mobile: wordmark + menu button opening a sheet with links, switches, action.
**App header**: wordmark (links back to the site), "Demo · simulated data" badge, network badge (desktop), the registry `connect-wallet` account menu, and Demo controls (fail next transaction, slow network, reset, plus EN/FR and theme). Desktop: a left rail with the role switch (Patient / Lab) and the nav. Patient nav: Overview, Vault, Studies, Consents, Council, Activity. Lab nav: Overview, New study, Council, Activity. Mobile: the role switch sits in a bar under the header, and a sticky bottom tab bar holds Overview, Vault, Studies, Consents and More (Council, Activity, back to site); the lab bar has its four items directly.

**Decision:** the role follows the route (`/app/lab*` is the lab, `/app`, vault, studies and consents are the patient; council and activity keep the last role). Switching role navigates to that role's overview, so there is never a page shown for the wrong role. The two demo accounts (patient, "Beaulac Cardiometabolic Lab") live in the same demo wallet.
**Footer**: one-line description; links (How it works, Demo, Credits); "Demo · simulated data" notice; "Not medical advice · sample records only"; "Built with Monark" credit (muted, 12–13px, links to monark.io); GitHub repo link; © year.

## 5. Feature highlights

| Feature | User benefit | Where on the site | Proven by flow |
|-|-|-|-|
| Private eligibility check | Know whether you qualify without anyone else knowing anything | Home hero (glass), how-it-works worked proof, study page | Flow 2 |
| Encrypted vault | Records stay on your side, under your key | Home "What leaves your vault", app vault | Flow 1 |
| Dynamic consent slips | Share exactly these fields, until this date, and take it back | Home steps, how-it-works consent lifecycle, consents page | Flow 3 |
| Live cohort with privacy floor | Researchers size a study before spending, without seeing individuals | Home "For researchers", lab builder | Flow 4 |
| Council rules | The people in the data set the rules, e.g. minimum cohort size | Home council band, council page | Flow 5 |
| Audit trail | Every proof, grant, revocation and payment has a receipt | How-it-works guardrails, activity page | All flows |

## 6. Key flows

The simulated wallet asks for every signature in a dialog (Confirm / Reject). The network takes 1.2–2.4 s. A "Fail the next transaction" switch in Demo controls forces a network failure. All states below are reachable.

**Flow 1: Connect and fill the vault.**
1. `/app` shows the gate; "Connect demo wallet" opens the wallet prompt (sign-in message, no fee). Reject → inline error "You declined the sign-in. Nothing was shared." Confirm → pending "Connecting…" → connected; the address appears in the header.
2. Vault starts with one record. "Import records" opens a sheet with three sample sources (family clinic export, pharmacy history, sleep ring). Picking one asks the wallet to sign an encryption key derivation (no fee).
3. Pending: "Encrypting on this device…" then "Storing sealed copy…" with the content id. Confirmed: the record is listed with its size, fields and "Sealed" status. Failed (forced): "Storage didn't confirm. Nothing was uploaded." with Try again.
4. Delete a record: confirmation dialog, then it's gone (with the audit entry).

**Flow 2: Check eligibility privately and join a study.**
1. `/app/studies` lists open studies; open "Metformin and sleep in type 2 diabetes".
2. "Check privately" runs on the device: stages "Reading your vault (on this device)" → "Building the witness" → "Generating proof" with a constraint counter → result.
3. Eligible: the glass panel shows your values on the left and sealed checks on the right, and the proof seal. Not eligible (asthma study): "You don't meet this study's criteria. Nothing was shared: the check ran on this device." Missing data (genomics study): "This study needs genomic data your vault doesn't hold."
4. The consent slip lists fields, duration and reward; toggle optional fields. "Submit proof and consent" → wallet prompt (fee in test ETH) → pending "Verifying proof on-chain…" (tx-status) → confirmed with block and tx hash; the study now shows "Enrolled". Failed: "The network didn't confirm the transaction. Nothing was recorded." Rejected: "You declined the signature. Nothing was sent." Already enrolled: the nullifier blocks a second enrolment with an explanation.

**Flow 3: Manage consent and rewards.**
1. `/app/consents` shows active slips with accrued rewards (token-amount, tUSDC).
2. Narrow a slip (untick a field) → wallet prompt → pending → confirmed "Consent updated".
3. Revoke → confirm dialog explaining what revocation does and doesn't undo → wallet prompt → pending → the slip tears along its perforation and is stamped "Revoked". Failed state as above.
4. Claim rewards → wallet prompt with "Testnet demo · not financial advice · no real funds" → pending → confirmed; balance updates.

**Flow 4: Design and publish a study (Lab role).**
1. Switch role to Lab; `/app/lab/new`. Start from a template or blank.
2. Criteria builder (age range, condition, HbA1c range, minimum systolic BP, medication required / excluded, data types needed). A live cohort estimate recalculates against a synthetic population of opted-in vaults: rounded to the nearest 10, hidden under the council's k ("Fewer than 10 — hidden to protect participants").
3. Validation errors inline (missing title, reward 0, target above cohort).
4. Publish → wallet prompt showing escrow (reward × target in tUSDC) with the testnet notice → pending "Funding escrow…" → confirmed; redirect to `/app/lab` with the new study. Failed state as above.
5. Switch back to Patient: the new study appears in the list and can be checked (closing the loop).

**Flow 5: Vote on a rule (council).**
1. `/app/council`: current rules (minimum cohort size 10, default consent cap 12 months) and open proposals ("Raise the minimum cohort size from 10 to 20").
2. Vote Yes / No → "Generating membership proof" (anonymous) → wallet prompt → pending → confirmed; the tally settles and your vote is marked "counted anonymously". Double vote blocked by nullifier.
3. Demo helper "Close voting now" finalizes: if Yes wins, the rule changes and the lab's cohort builder immediately uses k = 20.

## 7. Content

Tone: calm, exact and warm, like a good nurse explaining a consent form. Short sentences, concrete nouns, no hype, no "revolutionize", no fear-mongering. Say what happens to data in plain words. French is written natively (Quebec-neutral, *vous*), with "portefeuille" for wallet, "preuve à divulgation nulle de connaissance" introduced once then "preuve ZK"/« preuve ».

The complete strings live in `src/i18n/dictionaries/en.ts` and `fr.ts`; this is the draft copy they implement.

### Home

| Section | English | Français |
|-|-|-|
| Eyebrow | Private medical research matching | Jumelage de recherche médicale, en toute confidentialité |
| H1 | Join research without handing over your chart. | Participez à la recherche sans céder votre dossier. |
| Sub | Cura answers a study's eligibility criteria with a zero-knowledge proof. The lab learns that you qualify; your record stays sealed in your own vault. | Cura répond aux critères d'une étude avec une preuve à divulgation nulle. Le labo apprend que vous êtes admissible ; votre dossier reste scellé dans votre coffre. |
| CTAs | Try the demo · How a proof works | Essayer la démo · Comment fonctionne une preuve |
| Glass labels | Your view · What the lab sees · Proof verified | Ce que vous voyez · Ce que voit le labo · Preuve vérifiée |
| Problem H2 | Today, your data is either locked away or given away. | Aujourd'hui, vos données sont soit sous clé, soit cédées. |
| Problem body | A study needs 400 people with type 2 diabetes. Either a hospital shares records under an agreement you never saw, or a recruiter sends you a 40-question screener and asks for your lab results by email. Cura replaces both with a proof. | Une étude cherche 400 personnes vivant avec le diabète de type 2. Soit un hôpital transmet des dossiers en vertu d'une entente que vous n'avez jamais vue, soit un recruteur vous envoie un questionnaire de 40 questions et vous demande vos résultats par courriel. Cura remplace les deux par une preuve. |
| Before / after labels | The usual way · With Cura | La façon habituelle · Avec Cura |
| Steps H2 | How a match happens | Comment se fait un jumelage |
| Step 1 | **Seal your records.** Import a clinic export or wearable data into a vault only your key opens. | **Scellez vos dossiers.** Importez un export de clinique ou des données de montre dans un coffre que seule votre clé ouvre. |
| Step 2 | **A study posts its criteria.** Age 40–70, type 2 diabetes, on metformin. Public, precise, nothing else. | **Une étude publie ses critères.** De 40 à 70 ans, diabète de type 2, sous metformine. Publics, précis, rien de plus. |
| Step 3 | **Your device proves the match.** The check runs locally; only a proof that you qualify leaves it. | **Votre appareil prouve la correspondance.** La vérification se fait sur place ; seule la preuve de votre admissibilité en sort. |
| Step 4 | **You sign a consent slip.** It names the fields, the end date and the reward. Revoke it whenever you like. | **Vous signez un bon de consentement.** Il précise les champs, la date de fin et la récompense. Révocable en tout temps. |
| Patients panel | For patients · Help research on your terms. Qualify privately, share only what a slip names, earn a reward while your consent is active, and take it back in one step. · CTA: Try it as a patient | Pour les patients · Aidez la recherche à vos conditions. Qualifiez-vous en privé, ne partagez que ce que le bon précise, recevez une récompense tant que votre consentement est actif, et retirez-le en un geste. · CTA : Essayer comme patient |
| Researchers panel | For research teams · Recruit a verified cohort, not a data liability. Size your study against live, privacy-floored counts, enrol only proven-eligible participants, and hand your ethics board an audit trail. · CTA: Try it as a lab | Pour les équipes de recherche · Recrutez une cohorte vérifiée, pas un risque. Dimensionnez votre étude avec des effectifs en direct protégés par un seuil, n'inscrivez que des personnes dont l'admissibilité est prouvée, et remettez une piste d'audit à votre comité d'éthique. · CTA : Essayer comme labo |
| Leaves-your-vault H2 | What leaves your vault, and what never does | Ce qui sort de votre coffre, et ce qui n'en sort jamais |
| Columns | **Never leaves:** your values, diagnoses, dates and identity. · **Proven, not shown:** that you meet each criterion, and that you haven't enrolled twice. · **Shared only on a signed slip:** the fields a study names, for the period it names. | **N'en sort jamais :** vos valeurs, diagnostics, dates et identité. · **Prouvé, pas montré :** que vous répondez à chaque critère et que vous n'êtes pas inscrit deux fois. · **Partagé seulement avec un bon signé :** les champs nommés par l'étude, pour la durée prévue. |
| Council H2 | The people in the data set the rules. | Les personnes derrière les données fixent les règles. |
| Council body | Contributors vote, one member one anonymous vote, on how small a cohort a lab may see, how long consent can last, and which kinds of studies are allowed. Every decision is on the record. | Les contributeurs votent, une personne, un vote anonyme, sur la taille minimale d'une cohorte visible par un labo, la durée maximale d'un consentement et les types d'études permises. Chaque décision est consignée. |
| Closing CTA | See both sides of the glass. · Try the demo | Voyez les deux côtés de la vitre. · Essayer la démo |

### FAQ (home)

| Q (EN) | A (EN) | Q (FR) | R (FR) |
|-|-|-|-|
| Does Cura store my medical records? | No. They sit in an encrypted vault that only your wallet key opens. Cura's contracts hold proofs, consent terms and rewards, never values. | Cura conserve-t-il mon dossier médical ? | Non. Il se trouve dans un coffre chiffré que seule la clé de votre portefeuille ouvre. Les contrats de Cura contiennent des preuves, des conditions de consentement et des récompenses, jamais de valeurs. |
| What does a lab actually learn about me? | At first, only that an anonymous participant meets every criterion. After you sign a slip, the fields it names, for as long as it lasts. | Qu'apprend réellement un labo à mon sujet ? | Au départ, seulement qu'une personne anonyme répond à tous les critères. Une fois le bon signé, les champs qu'il précise, pour sa durée. |
| Can I withdraw? | Any time. Revoking ends the lab's access on-chain immediately. Results already computed in aggregate can't be un-computed, and every study says so before you join. | Puis-je me retirer ? | En tout temps. La révocation met fin sur la chaîne à l'accès du labo, immédiatement. Les résultats déjà calculés de façon agrégée ne peuvent pas être effacés, et chaque étude le précise avant votre inscription. |
| Why do I need a wallet? | It is your key. It opens your vault, signs your consents and receives rewards. In this demo it is simulated. | Pourquoi un portefeuille ? | C'est votre clé : il ouvre votre coffre, signe vos consentements et reçoit vos récompenses. Dans cette démo, il est simulé. |
| Is Cura HIPAA or GDPR compliant? | Cura is built around their principles: collect the minimum, get explicit consent, honour withdrawal. This demo is not certified and is not legal advice. | Cura est-il conforme à HIPAA ou au RGPD ? | Cura s'appuie sur leurs principes : minimiser la collecte, obtenir un consentement explicite, respecter le retrait. Cette démo n'est pas certifiée et ne constitue pas un avis juridique. |
| How are participants rewarded? | A study funds an escrow before it opens. Rewards accrue while your consent is active and you claim them yourself. The demo uses test tokens on a test network. | Comment les participants sont-ils récompensés ? | L'étude approvisionne un séquestre avant d'ouvrir. Les récompenses s'accumulent tant que votre consentement est actif, et vous les réclamez vous-même. La démo utilise des jetons de test sur un réseau de test. |

### How it works (headings and leads)

| EN | FR |
|-|-|
| H1: One idea: prove the answer, keep the record. | H1 : Une idée : prouver la réponse, garder le dossier. |
| Lead: Cura is three parts that never trust each other more than they must: your vault, a proof, and a consent contract. | Chapeau : Cura repose sur trois pièces qui ne se font jamais plus confiance que nécessaire : votre coffre, une preuve et un contrat de consentement. |
| The vault · Encrypted on your device with a key derived from your wallet signature, stored as sealed blobs. Cura can host the ciphertext; it can't read it. | Le coffre · Chiffré sur votre appareil avec une clé dérivée de la signature de votre portefeuille, stocké en blocs scellés. Cura peut héberger le texte chiffré, pas le lire. |
| The proof · The study's criteria are public inputs; your values are private inputs. The circuit outputs one bit, "meets all criteria", plus a nullifier. | La preuve · Les critères de l'étude sont des entrées publiques ; vos valeurs, des entrées privées. Le circuit produit un seul bit, « répond à tous les critères », et un nullificateur. |
| The consent contract · Records who may read which fields until when, releases rewards, and honours revocation. | Le contrat de consentement · Consigne qui peut lire quels champs et jusqu'à quand, libère les récompenses et applique la révocation. |
| A worked proof | Une preuve, pas à pas |
| The life of a consent: Granted → Active → Narrowed → Revoked or Expired | La vie d'un consentement : Accordé → Actif → Restreint → Révoqué ou Expiré |
| Guardrails: nullifiers, minimum cohort size, audit trail, council | Garde-fous : nullificateurs, taille minimale de cohorte, piste d'audit, conseil |
| Regulation: built around minimisation, explicit consent and withdrawal. Not a certification, not legal advice. | Réglementation : conçu autour de la minimisation, du consentement explicite et du retrait. Ni une certification, ni un avis juridique. |
| For developers: contract interface and the demo data layer | Pour les développeurs : interface des contrats et couche de données de la démo |

### App: empty, error and status states

| Key | English | Français |
|-|-|-|
| Gate | Connect a demo wallet to open your vault. Nothing here is real: sample records, test tokens, simulated network. | Connectez un portefeuille de démo pour ouvrir votre coffre. Rien n'est réel : dossiers d'exemple, jetons de test, réseau simulé. |
| Connect rejected | You declined the sign-in. Nothing was shared. | Vous avez refusé la connexion. Rien n'a été partagé. |
| Vault empty | Your vault is empty. Import a sample record to see how Cura keeps it sealed. | Votre coffre est vide. Importez un dossier d'exemple pour voir comment Cura le garde scellé. |
| Encrypting | Encrypting on this device… | Chiffrement sur cet appareil… |
| Storage failed | Storage didn't confirm. Nothing was uploaded. | Le stockage n'a pas confirmé. Rien n'a été téléversé. |
| No studies | No studies match these filters. | Aucune étude ne correspond à ces filtres. |
| Not eligible | You don't meet this study's criteria. Nothing was shared: the check ran on this device. | Vous ne répondez pas aux critères de cette étude. Rien n'a été partagé : la vérification s'est faite sur cet appareil. |
| Missing data | This study needs {type} data your vault doesn't hold. | Cette étude requiert des données de type {type} que votre coffre ne contient pas. |
| Already enrolled | You're already enrolled. Your nullifier for this study has been used, so a second enrolment is impossible. | Vous êtes déjà inscrit. Votre nullificateur pour cette étude a servi : une deuxième inscription est impossible. |
| Tx pending | Waiting for the network… | En attente du réseau… |
| Tx failed | The network didn't confirm the transaction. Nothing was recorded. | Le réseau n'a pas confirmé la transaction. Rien n'a été consigné. |
| Signature rejected | You declined the signature. Nothing was sent. | Vous avez refusé la signature. Rien n'a été envoyé. |
| No consents | You haven't joined a study yet. Your consent slips will appear here. | Vous n'avez encore rejoint aucune étude. Vos bons de consentement apparaîtront ici. |
| Revoke confirm | Revoking ends the lab's access now and stops new rewards. Results already computed in aggregate stay computed. | La révocation met fin à l'accès du labo maintenant et arrête les nouvelles récompenses. Les résultats déjà calculés de façon agrégée demeurent. |
| Cohort hidden | Fewer than {k}: hidden to protect participants. | Moins de {k} : masqué pour protéger les participants. |
| No lab studies | You haven't published a study yet. | Vous n'avez encore publié aucune étude. |
| Activity empty | Nothing yet. Every proof, consent and payment will be listed here. | Rien pour l'instant. Chaque preuve, consentement et paiement sera listé ici. |
| Storage unavailable | Your browser blocked storage, so the demo won't remember your progress. | Votre navigateur bloque le stockage : la démo ne retiendra pas votre progression. |
| 404 | This page isn't in the record. · Back home · Open the demo | Cette page n'est pas au dossier. · Retour à l'accueil · Ouvrir la démo |

Disclaimers (both languages, everywhere required): "Demo · simulated data" / « Démo · données simulées »; near anything that moves value: "Testnet demo · not financial advice · no real funds" / « Démo sur réseau de test · pas un conseil financier · aucun fonds réel »; health-specific addition: "Sample records only · not medical advice" / « Dossiers d'exemple seulement · pas un avis médical ».

## 8. Aesthetics

**Concept: "Archival, exact, sealed, humane."** Cura should feel like a well-kept medical file and a wax-sealed letter, not a crypto dashboard or a hospital portal. Patients are handing over the most personal thing they have; they need calm, legibility and the sense of a careful clerk, not a trading screen. Researchers and ethics boards need precision: ruled lines, tabular numbers, exact wording. Warm paper and pine ink say "record kept with care"; the ochre seal is the one flourish, and it only appears where something has been proven or signed.

**Palette.** Hex values are defined as CSS variables on `:root` and `.dark` (shadcn roles), overriding the Monark base theme.

| Role | Light | Dark |
|-|-|-|
| background | `#F6F3EC` bone paper | `#101714` pine night |
| foreground | `#16211C` pine ink | `#E9E4D8` paper |
| card / popover | `#FBF9F4` | `#16201B` |
| primary | `#1F4D3A` pine | `#8CC7A7` sage |
| primary-foreground | `#F6F3EC` | `#0E1A14` |
| secondary | `#E3E9E2` sage wash | `#1F2B25` |
| muted | `#ECE7DC` | `#1D2823` |
| muted-foreground | `#566159` | `#A3ADA7` |
| accent (manila) | `#EADFC4` | `#3A3120` |
| accent-foreground | `#4A3808` | `#F0DDAF` |
| seal (custom) | `#8A5D0C` ochre ink | `#E0B55A` |
| border (decorative hairlines) | `#D6CEBD` | `#2C3A33` |
| input (control outlines, switch track) | `#8F8877` (3.35:1 on card) | `#66786D` (3.56:1 on card) |
| ring | `#1F4D3A` | `#8CC7A7` |
| destructive | `#A8321F` brick | `#F08A76` |
| chart-1…5 | `#1F4D3A` `#946A1A` `#5B7768` `#A8321F` `#3E5C76` | `#8CC7A7` `#E0B55A` `#A9BFB2` `#F08A76` `#8FB0CC` |

WCAG AA contrast (computed with the WCAG relative-luminance formula):

| Pair | Light | Dark |
|-|-|-|
| foreground / background | 14.94 | 14.34 |
| foreground / card | 15.73 | 13.17 |
| foreground / muted | 13.43 | 12.00 |
| primary-foreground / primary | 8.69 | 9.22 |
| primary (as text) / background | 8.69 | 9.39 |
| muted-foreground / background | 5.83 | 7.87 |
| muted-foreground / muted | 5.24 | 6.59 |
| muted-foreground / card | 6.14 | 7.24 |
| accent-foreground / accent | 8.52 | 9.55 |
| primary / accent | 7.27 | n/a |
| destructive / background | 6.03 | 7.45 |
| destructive / card | 6.35 | 6.85 |
| seal / background | 5.19 | 9.46 |
| chart-1…5 / background (graphics, ≥3:1) | 8.69 · 4.37 · 4.42 · 6.03 · 6.32 | 9.39 · 9.46 · 9.34 · 7.45 · 8.01 |
| ring / background (focus, ≥3:1) | 8.69 | 9.39 |

The seal colour is never used as text on the manila accent (4.34:1); accent surfaces use accent-foreground.

**Type.** Two families via `next/font/google`:

- **Newsreader** (display and long-form headings; 400, 500, 600 and italic 400). A text-optimised serif with optical sizes: it reads like a printed form or a journal, which fits consent and research. Used for H1–H3, the wordmark, pull quotes and study titles.
- **Instrument Sans** (UI and body; 400, 500, 600). Narrow-ish, neutral, very legible at 14–16px, with good figures. Numbers use `tabular-nums`.
- Hashes, addresses and proof ids use the system monospace stack (`ui-monospace`, no extra download).
- Scale (rem): 0.75 · 0.8125 · 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3 · 3.75 (display, desktop only). Headings 500 weight with slight negative tracking; body 400; labels 500 with small caps-like uppercase eyebrows at 0.75rem, 0.08em tracking.

**Logo.** Wordmark "cura" in Newsreader italic, lowercase, preceded by a mark: a circle whose left half is filled pine and right half is an outline, the "half-disclosed seal" (what you prove vs. what you keep). Built as inline SVG (`CuraMark`), used as favicon (`src/app/icon.svg`) and in the OG image.

**Shape.** Radius 6px (`--radius: 0.375rem`) on controls and cards, full-round only for the seal and status dots. 1px hairline borders everywhere, ruled rows (like a chart form) instead of shadowed cards; depth only on dialogs and sheets (one soft shadow). Perforated edges (dashed border + notch circles) on consent slips. Motion: 180–240ms ease-out; the seal stamp is a 320ms scale-and-settle; everything respects `prefers-reduced-motion`.

**Imagery.** Photography: documentary, warm natural light, people in ordinary places (a kitchen table, a lab bench under a lamp, a window at home). Never a stethoscope close-up, never smiling doctors facing camera. Three photos, all warm-graded, displayed with a subtle paper-tone overlay in dark mode. Illustration: none; diagrams are built in code with hairlines, ruled rows and the seal.

**Signature moments.**

1. **Two sides of the glass.** The hero and the study page show the same record twice: your values on the left, sealed bands with criterion checks on the right. In the app, after a proof, a toggle flips the whole panel between "Your view" and "What the lab sees".
2. **The seal.** When a proof completes, the right-hand values are covered one by one with a hatched sealed band, a constraint counter settles, and a round ochre seal stamps in with the proof id.
3. **The torn slip.** Consent grants are perforated slips. Revoking one tears the stub along the perforation and stamps "Revoked · block #…" across it.

**What we deliberately avoid, and why.** Hospital blue and teal (every health portal, and it reads institutional, not personal); purple/blue "AI" gradients, frosted glass, neon and glowing shields or padlocks (crypto clichés that make a medical product look like a token launch); DNA helices and 3D blobs; stock doctors with stethoscopes; big fabricated stats; the default shadcn zinc look and pill-everything. Pine, paper and ochre come from the world of records, pharmacies and sealed letters, which is exactly what Cura is.

## 9. Assets

| Image | Purpose | Placement |
|-|-|-|
| `patient-kitchen.jpg`: woman at a kitchen table with a coffee, window light (Caroline Badran) | The patient, at home, in control | Home, "For patients" panel |
| `researcher-microscope.jpg`: researcher at a microscope under warm light (CDC) | The research team | Home, "For research teams" panel |
| `member-window.jpg`: older man by a window (Tim Myrzakhan) | The people who set the rules | Home, council band; how-it-works intro is diagram-only |

All free-licensed Unsplash photos, resized to ≤2000px and compressed; full credits in `docs/assets.md` and on `/credits`.

Built in code: the glass (hero, study page), step diagram, "What leaves your vault" columns, worked-proof table, consent lifecycle diagram, seal, perforated slip, cohort meter, OG image (via `next/og`), favicon (`icon.svg`). Icons: `lucide-react` only, stroke 1.5.

## 10. Pricing strategy

**Model: free for patients, paid by the studies.** Patients never pay and keep 100% of the rewards a study offers; charging the people whose data it is would undercut the trust the product sells. Research pays because research gets the value (faster, verified recruitment without custody risk):

| Plan | Price | For | Reasoning |
|-|-|-|-|
| Patients | Free, always | Data providers | They are the supply and the point. |
| Academic | Free up to 250 enrolled participants a year, then $4 per enrolment | University and hospital research without industry sponsor | Grants are small; academic studies build the cohort and the reputation. |
| Sponsored study | 12% of the reward escrow, charged on top (never deducted from participants), minimum $1,500 per study | Pharma, medtech, health-AI data sponsors | Scales with study size; comparable to or cheaper than recruitment agency fees, which typically run per-patient in the hundreds of dollars. |
| Custodian | From $2,400 / month, annual | Hospitals and clinics that connect their records to patient vaults | Integration, audit exports, SSO and on-premise proving are real operating costs. |

`/{locale}/pricing` exists as a designed page for internal review only: never linked anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. Prices are mentioned nowhere else on the site; the app shows escrow amounts (what a study commits to participants) but no fees.

## 11. Out of scope

- No real zero-knowledge circuits, chain, wallet, encryption or storage: all simulated behind `src/lib/demo/`, with realistic latency and failure.
- No real health data: sample records only, and the UI never asks visitors to type their own values.
- No accounts, email, backend, analytics or third-party calls.
- No researcher data-access workspace (querying consented data); the demo stops at enrolment and consent.
- No mobile wallet deep links, no multi-chain, no fiat.
- No `/brand` page.

## 12. Build notes

- Next.js 16 App Router, TypeScript strict, `src/`, pnpm, Tailwind v4, shadcn/ui on the Monark UI registry (theme installed then fully re-themed; registry components used: button, badge, dialog, sheet, switch, input, textarea, select, label, slider (extended to label one thumb per value), checkbox, sonner, accordion, progress, dropdown-menu (through `connect-wallet`), `connect-wallet`/`wallet`, `token-amount` (patched to use the locale's decimal separator), `network-badge`, `tx-status`). Registry components were given localizable close labels and restyled (radius, borders, no shadows). `connect-wallet` and `wallet` were copied from the registry JSON because the CLI could not resolve the bare `wallet` dependency.
- Only extra dependency beyond the stack: `react-jazzicon` (required by the registry `wallet` avatar, desaturated to fit the palette). `playwright` is a dev dependency for screenshots.
- i18n: typed dictionaries (`src/i18n/dictionaries/en.ts`, `fr.ts`, and a small `errors.ts` for the client error boundary), locale routes, `proxy.ts` redirect by `Accept-Language`, hreflang alternates, typographic apostrophes in both languages. Studies a visitor publishes keep the title they typed in both languages.
- Demo state: tiny external store persisted to `localStorage` under `cura-demo-v1`, every access in try/catch; "Reset demo" in Demo controls.
- Toasts: top-center, laid over the app header on every width, so they never cover the panel, slip or form they report on; transaction status is always shown inline next to the action as well.
- The sitemap lists the marketing pages, `/app`, `/app/studies` and `/app/council` in both languages; `/pricing` is excluded.
