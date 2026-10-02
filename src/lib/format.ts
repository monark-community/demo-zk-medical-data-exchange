import { intlLocale, type Locale } from "@/i18n/config"

export function formatNumber(locale: Locale, value: number, digits = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** tUSDC amounts: two decimals unless whole. */
export function formatToken(locale: Locale, value: number): string {
  const whole = Math.abs(value - Math.round(value)) < 0.005
  return formatNumber(locale, value, whole ? 0 : 2)
}

export function formatDate(locale: Locale, iso: string, withYear = true): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(iso))
}

export function formatDateTime(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** Token amounts for the registry TokenAmount component (6-decimal base units, like USDC). */
export function toBaseUnits(value: number, decimals = 6): bigint {
  return BigInt(Math.round(value * 10 ** decimals))
}
