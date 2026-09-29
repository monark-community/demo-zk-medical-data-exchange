import type { Locale } from "@/i18n/config"

/** Every photograph on the site, with its Unsplash credit (see docs/assets.md). */
export const PHOTOS: {
  file: string
  photographer: string
  profile: string
  page: string
  usedOn: Record<Locale, string>
}[] = [
  {
    file: "/images/patient-kitchen.jpg",
    photographer: "Caroline Badran",
    profile: "https://unsplash.com/@___atmos",
    page: "https://unsplash.com/photos/woman-in-red-dress-holding-coffee-cup-at-table-AlWdfqQO_hQ",
    usedOn: { en: "Home, “For patients”", fr: "Accueil, « Pour les patients »" },
  },
  {
    file: "/images/researcher-microscope.jpg",
    photographer: "CDC",
    profile: "https://unsplash.com/@cdc",
    page: "https://unsplash.com/photos/a-woman-looking-through-a-microscope-at-a-piece-of-paper-_YSrXCByqJQ",
    usedOn: { en: "Home, “For research teams”", fr: "Accueil, « Pour les équipes de recherche »" },
  },
  {
    file: "/images/member-window.jpg",
    photographer: "Tim Myrzakhan",
    profile: "https://unsplash.com/@myrz6han",
    page: "https://unsplash.com/photos/elderly-man-in-light-polo-shirt-K8yXdp7kAco",
    usedOn: { en: "Home, “For contributors”", fr: "Accueil, « Pour les contributeurs »" },
  },
]
