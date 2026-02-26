type LexicalTextNode = {
  type: 'text'
  text: string
  version: 1
}

type LexicalParagraphNode = {
  type: 'paragraph'
  children: LexicalTextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  textFormat: 0
  textStyle: ''
  version: 1
}

type LexicalRoot = {
  root: {
    type: 'root'
    children: LexicalParagraphNode[]
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
  }
}

type ParagraphBlock = {
  blockType: 'paragraph'
  content: LexicalRoot
}

type PullQuoteBlock = {
  blockType: 'pullQuote'
  quote: string
}

type KeyTakeawaysBlock = {
  blockType: 'keyTakeaways'
  items: { text: string }[]
}

type CTAGroupBlock = {
  blockType: 'ctaGroup'
  ctas: { label: string; href: string; style: 'primary' | 'secondary' }[]
}

type PendingImageBlock = {
  blockType: 'imageBlock'
  externalSrc: string
  alt: string
  caption?: string
}

export type StripoPendingBlock =
  | ParagraphBlock
  | PullQuoteBlock
  | KeyTakeawaysBlock
  | CTAGroupBlock
  | PendingImageBlock

export type StripoTransformResult = {
  title: string
  dek: string
  body: StripoPendingBlock[]
}

type ParsedToken =
  | { type: 'text'; value: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'cta'; label: string; href: string }

const decodeEntities = (input: string): string =>
  input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const stripTags = (input: string): string => input.replace(/<[^>]*>/g, ' ')

const normalizeText = (input: string): string =>
  decodeEntities(stripTags(input).replace(/\s+/g, ' ').trim())

const lexicalParagraph = (text: string): LexicalRoot => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const removeEmailScaffolding = (html: string): string =>
  html
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<xml[\s\S]*?<\/xml>/gi, '')

const extractTitle = (rawHtml: string): string => {
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? normalizeText(titleMatch[1] || '') : ''
  return title || 'Imported Stripo Post'
}

const parseTokens = (html: string): ParsedToken[] => {
  const tokenRegex = /<img\b[^>]*>|<a\b[^>]*>[\s\S]*?<\/a>|<p\b[^>]*>[\s\S]*?<\/p>|<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi
  const tokens: ParsedToken[] = []

  for (const match of html.matchAll(tokenRegex)) {
    const raw = match[0]
    const lower = raw.toLowerCase()

    if (lower.startsWith('<img')) {
      const src = (raw.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] || '').trim()
      if (!src) continue
      const alt = normalizeText(raw.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] || '')
      tokens.push({ type: 'image', src, alt: alt || 'Stripo image' })
      continue
    }

    if (lower.startsWith('<a')) {
      const href = (raw.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || '').trim()
      const label = normalizeText(raw)
      if (!href || !label) continue
      const isLikelyButton = /es-button|border-radius|padding:/i.test(raw)
      if (isLikelyButton) {
        tokens.push({ type: 'cta', href, label })
      } else {
        tokens.push({ type: 'text', value: `${label} (${href})` })
      }
      continue
    }

    const value = normalizeText(raw)
    if (value) tokens.push({ type: 'text', value })
  }

  return tokens
}

const toParagraphBlock = (value: string): ParagraphBlock => ({
  blockType: 'paragraph',
  content: lexicalParagraph(value),
})

export const transformStripoHtml = (rawHtml: string): StripoTransformResult => {
  const html = removeEmailScaffolding(rawHtml || '')
  const title = extractTitle(rawHtml || '')
  const tokens = parseTokens(html)

  const body: StripoPendingBlock[] = []
  let expectInsightQuote = false
  let expectTakeaway = false
  let firstParagraph = ''

  const pushCtas = (ctas: { label: string; href: string }[]) => {
    if (!ctas.length) return
    body.push({
      blockType: 'ctaGroup',
      ctas: ctas.map((cta, index) => ({
        label: cta.label,
        href: cta.href,
        style: index === 0 ? 'primary' : 'secondary',
      })),
    })
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'cta') {
      const ctas: { label: string; href: string }[] = [token]
      while (i + 1 < tokens.length && tokens[i + 1]?.type === 'cta') {
        const next = tokens[i + 1] as { type: 'cta'; label: string; href: string }
        ctas.push({ label: next.label, href: next.href })
        i++
      }
      pushCtas(ctas)
      continue
    }

    if (token.type === 'image') {
      body.push({
        blockType: 'imageBlock',
        externalSrc: token.src,
        alt: token.alt || 'Imported image',
      })
      continue
    }

    const text = token.value.trim()
    if (!text) continue

    if (/^insight$/i.test(text)) {
      expectInsightQuote = true
      continue
    }

    if (/^what'?s the takeaway\??$/i.test(text)) {
      expectTakeaway = true
      continue
    }

    if (expectInsightQuote && text.length <= 280) {
      body.push({ blockType: 'pullQuote', quote: text })
      expectInsightQuote = false
      continue
    }
    expectInsightQuote = false

    if (expectTakeaway) {
      body.push({ blockType: 'keyTakeaways', items: [{ text }] })
      expectTakeaway = false
      continue
    }

    body.push(toParagraphBlock(text))
    if (!firstParagraph) firstParagraph = text
  }

  const dek = firstParagraph ? firstParagraph.slice(0, 220) : 'Imported from Stripo.'
  return { title, dek, body }
}
