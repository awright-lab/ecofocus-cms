type BaseBlock = { blockType?: string | null } & Record<string, unknown>

type ParagraphBlock = BaseBlock & {
  blockType: 'paragraph'
  content?: unknown
}

type ImageCaptionBlock = BaseBlock & {
  blockType: 'imageBlock'
  caption?: string | null
}

type PullQuoteBlock = BaseBlock & {
  blockType: 'pullQuote'
  quote?: string | null
  attribution?: string | null
}

type KeyTakeawaysBlock = BaseBlock & {
  blockType: 'keyTakeaways'
  items?: { text?: string | null }[] | null
}

type CTAGroupBlock = BaseBlock & {
  blockType: 'ctaGroup'
  ctas?: { label?: string | null }[] | null
}

type ChartJSBlock = BaseBlock & {
  blockType: 'chartJS'
  caption?: string | null
}

type KnownBlocks =
  | ParagraphBlock
  | ImageCaptionBlock
  | PullQuoteBlock
  | KeyTakeawaysBlock
  | CTAGroupBlock
  | ChartJSBlock

const countWords = (text?: string | null): number => {
  if (!text) return 0
  return (text.trim().match(/\b\w+\b/g) || []).length
}

function isKnownBlock(b: unknown): b is KnownBlocks {
  return (
    typeof b === 'object' &&
    b !== null &&
    'blockType' in (b as Record<string, unknown>) &&
    typeof (b as Record<string, unknown>).blockType === 'string'
  )
}

const extractLexicalText = (value: unknown): string => {
  const words: string[] = []

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const child of node) visit(child)
      return
    }
    if (!node || typeof node !== 'object') return

    const rec = node as Record<string, unknown>

    if (typeof rec.text === 'string' && rec.text.trim()) {
      words.push(rec.text)
    }

    if (Array.isArray(rec.children)) {
      visit(rec.children)
    }

    // Support Payload/Lexical wrappers like { root: { ... } }
    if (rec.root && typeof rec.root === 'object') {
      visit(rec.root)
    }
  }

  visit(value)
  return words.join(' ')
}

export const extractBlockText = (blocks: unknown[]): string => {
  const parts: string[] = []
  for (const raw of blocks || []) {
    if (!isKnownBlock(raw)) continue
    switch (raw.blockType) {
      case 'paragraph': {
        const content = (raw as ParagraphBlock).content
        if (typeof content === 'string' && content.trim()) {
          parts.push(content)
          break
        }

        const lexicalText = extractLexicalText(content)
        if (lexicalText.trim()) parts.push(lexicalText)
        break
      }
      case 'imageBlock': {
        const caption = (raw as ImageCaptionBlock).caption
        if (typeof caption === 'string' && caption.trim()) parts.push(caption)
        break
      }
      case 'pullQuote': {
        const { quote, attribution } = raw as PullQuoteBlock
        if (typeof quote === 'string' && quote.trim()) parts.push(quote)
        if (typeof attribution === 'string' && attribution.trim()) parts.push(attribution)
        break
      }
      case 'keyTakeaways': {
        const items = (raw as KeyTakeawaysBlock).items || []
        if (Array.isArray(items) && items.length) {
          parts.push(
            items
              .map((i) => (typeof i?.text === 'string' ? i.text : ''))
              .filter(Boolean)
              .join(' '),
          )
        }
        break
      }
      case 'ctaGroup': {
        const ctas = (raw as CTAGroupBlock).ctas || []
        if (Array.isArray(ctas) && ctas.length) {
          parts.push(
            ctas
              .map((c) => (typeof c?.label === 'string' ? c.label : ''))
              .filter(Boolean)
              .join(' '),
          )
        }
        break
      }
      case 'chartJS': {
        const caption = (raw as ChartJSBlock).caption
        if (typeof caption === 'string' && caption.trim()) parts.push(caption)
        break
      }
      default:
        break
    }
  }
  return parts.join(' ')
}

export const calculateReadTimeMinutes = (input: { dek?: string | null; body?: unknown[] }): number => {
  const bodyBlocks: unknown[] = Array.isArray(input.body) ? input.body : []
  const words =
    countWords(typeof input.dek === 'string' ? input.dek : undefined) + countWords(extractBlockText(bodyBlocks))

  // 200 words per minute, minimum 1 minute
  return Math.max(1, Math.ceil(words / 200))
}
