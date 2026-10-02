import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "Cura"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const PAPER = "#f6f3ec"
const INK = "#16211c"
const PINE = "#1f4d3a"
const SEAL = "#8a5d0c"
const WASH = "#f1e7cd"

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const g = d.home.glass
  const rows = (["age", "diagnosis", "hba1c", "bp"] as const).map((k) => ({ label: g.rows[k], value: g.values[k], check: g.checks[k] }))

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9.25" fill="none" stroke={PINE} strokeWidth="1.5" />
              <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill={PINE} />
            </svg>
            <span style={{ fontSize: 52, fontStyle: "italic", fontFamily: "serif" }}>cura</span>
          </div>
          <div style={{ fontSize: 60, lineHeight: 1.08, letterSpacing: -1.5, fontFamily: "serif" }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#566159" }}>{d.common.demoNotice}</div>
        </div>
        <div
          style={{
            marginLeft: 48,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "2px solid #d6cebd",
            borderRadius: 10,
            background: "#fbf9f4",
          }}
        >
          <div style={{ display: "flex", padding: "18px 22px", borderBottom: "2px solid #d6cebd", fontSize: 20 }}>
            <span style={{ width: 200 }}>{g.yours}</span>
            <span style={{ color: SEAL }}>{g.lab}</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", padding: "16px 22px", borderBottom: "1px solid #e6dfd0", fontSize: 22 }}>
              <span style={{ width: 200, fontWeight: 600 }}>{r.value}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ color: PINE, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={PINE} strokeWidth="3" /></svg>
                  {r.check}
                </span>
                <div style={{ width: 170, height: 10, background: WASH, border: `1px solid ${SEAL}55`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: WASH, marginTop: "auto", borderRadius: "0 0 8px 8px" }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 54,
                border: `3px solid ${SEAL}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: SEAL,
                fontSize: 26,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.25" fill="none" stroke={SEAL} strokeWidth="1.5" /><path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill={SEAL} /></svg>
            </div>
            <span style={{ fontSize: 22 }}>{g.proof}</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
