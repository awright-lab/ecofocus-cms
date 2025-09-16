import type { PayloadRequest } from 'payload'
import { createHmac } from 'crypto'

// ---- helpers ---------------------------------------------------------------

type Dict = Record<string, unknown>

const isObject = (v: unknown): v is Dict => typeof v === 'object' && v !== null

const asString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

const fromQueryParam = (v: unknown): string | undefined => {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) {
    // Express can coerce ?x=a&x=b into string[]
    const first = v.find((x) => typeof x === 'string')
    return typeof first === 'string' ? first : undefined
  }
  return undefined
}

function readParam(req: PayloadRequest, key: string): string | undefined {
  const q = (req as unknown as { query?: unknown }).query
  const b = (req as unknown as { body?: unknown }).body

  // query: unknown -> narrow to object -> then read
  if (isObject(q) && key in q) {
    const val = (q as Dict)[key]
    const v = fromQueryParam(val)
    if (v !== undefined) return v
  }

  // body: unknown -> narrow to object -> then read
  if (isObject(b) && key in b) {
    const val = (b as Dict)[key]
    const v = asString(val)
    if (v !== undefined) return v
  }

  return undefined
}

function safeJson<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

function verifyHmac(base64urlData: string, secret: string, sig: string): boolean {
  const expected = createHmac('sha256', secret).update(base64urlData).digest('base64url')
  // timing-safe compare not critical here given one compute step + short lifetime,
  // but if you prefer: use crypto.timingSafeEqual on Buffers of same length.
  return expected === sig
}

// ---- main ------------------------------------------------------------------

export const verifyPreviewToken = (req?: PayloadRequest): boolean => {
  try {
    if (!req) return false

    // require draft=true
    const draft = readParam(req, 'draft')
    if (draft !== 'true') return false

    // read token
    const token = readParam(req, 'previewToken')
    if (!token) return false

    const secret = process.env.PREVIEW_SECRET || process.env.PAYLOAD_SECRET || ''
    if (!secret) return false

    const [data, sig] = token.split('.')
    if (!data || !sig) return false

    if (!verifyHmac(data, secret, sig)) return false

    // decode/validate payload
    const json = Buffer.from(data, 'base64url').toString('utf8')
    const parsed = safeJson<{ exp?: number }>(json)
    if (!parsed?.exp || Date.now() > parsed.exp) return false

    return true
  } catch {
    return false
  }
}
