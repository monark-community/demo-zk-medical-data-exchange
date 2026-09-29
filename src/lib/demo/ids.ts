/** Deterministic hex from a seed string (FNV-1a then xorshift32), for believable seeded data. */
export function seededHex(seed: string, length: number): string {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  let x = h || 1
  let out = ""
  while (out.length < length) {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    out += x.toString(16).padStart(8, "0")
  }
  return out.slice(0, length)
}

export const seededAddress = (seed: string) => `0x${seededHex(`addr:${seed}`, 40)}`
export const seededHash = (seed: string) => `0x${seededHex(`tx:${seed}`, 64)}`

/**
 * Random hex for objects created at runtime. Math.random on purpose:
 * crypto.randomUUID is unavailable on plain-http LAN previews.
 */
export function randomHex(length: number): string {
  let out = ""
  while (out.length < length) out += Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0")
  return out.slice(0, length)
}

export const randomHash = () => `0x${randomHex(64)}`
export const randomId = (prefix: string) => `${prefix}-${randomHex(10)}`

/** Content id in the style of an IPFS CIDv1 (base32), simulated. */
export function fakeCid(seed?: string): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567"
  const hex = seed ? seededHex(`cid:${seed}`, 104) : randomHex(104)
  let out = "bafkrei"
  for (let i = 0; i < 52; i++) out += alphabet[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % 32]
  return out
}

export function shortHex(value: string, start = 6, end = 4): string {
  if (value.length <= start + end + 1) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}
