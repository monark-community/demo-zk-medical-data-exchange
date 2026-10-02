# Cura: assets

## Photographs

All photographs are from Unsplash under the [Unsplash License](https://unsplash.com/license) (free; none are Unsplash+). Each was downloaded, resized to 1600px on its long edge, compressed (JPEG quality 76) and is served with `next/image` from `public/images/`. They are credited on `/en/credits` and `/fr/credits`, linked from the footer.

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/patient-kitchen.jpg` | https://unsplash.com/photos/woman-in-red-dress-holding-coffee-cup-at-table-AlWdfqQO_hQ | [Caroline Badran](https://unsplash.com/@___atmos) | Home, "For patients" panel |
| `public/images/researcher-microscope.jpg` | https://unsplash.com/photos/a-woman-looking-through-a-microscope-at-a-piece-of-paper-_YSrXCByqJQ | [CDC](https://unsplash.com/@cdc) | Home, "For research teams" panel |
| `public/images/member-window.jpg` | https://unsplash.com/photos/elderly-man-in-light-polo-shirt-K8yXdp7kAco | [Tim Myrzakhan](https://unsplash.com/@myrz6han) | Home, governance ("The people in the data set the rules") |

Selection: warm, natural light, documentary rather than staged; no stethoscope close-ups or smiling doctors facing the camera. In dark mode the photos are dimmed slightly (`brightness-[0.85]`).

## Built in code

| Asset | Where |
|-|-|
| Wordmark and "half-disclosed seal" mark (`CuraMark`, `CuraWordmark`) | `src/components/site/brand.tsx`; header, footer, 404 |
| Favicon | `src/app/icon.svg` |
| Open Graph image (per locale) | `src/app/[locale]/opengraph-image.tsx` |
| Two sides of the glass (hero) | `src/components/home/glass.tsx` |
| Proof seal stamp | `src/components/diagrams/seal-stamp.tsx` |
| Proof glass (app) | `src/components/demo/proof-glass.tsx` |
| Perforated consent slip | `src/components/demo/consent-slip.tsx` |
| Three-parts diagram, worked proof, consent lifecycle | `src/app/[locale]/(site)/how-it-works/page.tsx` |
| Ruled paper, hatched "sealed" band, perforation utilities | `src/app/globals.css` |

## Icons and type

- Icons: `lucide-react`, stroke 1.5–1.75.
- Fonts via `next/font/google`: Newsreader (display) and Instrument Sans (UI and body); hashes use the system monospace stack.
