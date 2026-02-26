import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { randomUUID } from 'crypto'

import { transformStripoHtml, type StripoPendingBlock } from '@/lib/stripoToBlocks'
import type { Post } from '@/payload-types'

type ImportRequestBody = {
  html?: string
  title?: string
  author?: string | number
  topics?: Array<string | number>
  status?: 'draft' | 'published'
  previewOnly?: boolean
}

const getAuthorizedUser = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  const role = ((user as { role?: string } | null)?.role || '').toLowerCase()
  if (!user) return null
  if (role !== 'admin' && role !== 'editor') return null
  return user
}

const pickFirstAuthorId = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  const authors = await payload.find({
    collection: 'authors',
    limit: 1,
    sort: 'name',
    depth: 0,
  })
  return authors.docs[0]?.id
}

const toNumericId = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const parseFilenameFromUrl = (urlString: string): string => {
  try {
    const url = new URL(urlString)
    const rawName = url.pathname.split('/').pop() || ''
    const clean = rawName.replace(/[^a-zA-Z0-9._-]/g, '')
    return clean || `stripo-${randomUUID()}.jpg`
  } catch {
    return `stripo-${randomUUID()}.jpg`
  }
}

const uploadRemoteImage = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  src: string,
  alt: string,
): Promise<number | null> => {
  const response = await fetch(src)
  if (!response.ok) return null

  const data = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const filename = parseFilenameFromUrl(src)

  const created = await payload.create({
    collection: 'media',
    data: { alt, altText: alt },
    file: {
      data,
      name: filename,
      size: data.byteLength,
      mimetype: contentType,
    },
  })

  return toNumericId(created.id)
}

const mapAndUploadBody = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  blocks: StripoPendingBlock[],
) => {
  type BodyBlock = NonNullable<Post['body']>[number]
  const uploadedByUrl = new Map<string, number>()
  const resolved: BodyBlock[] = []
  let firstImageId: number | null = null

  for (const block of blocks) {
    if (block.blockType !== 'imageBlock') {
      resolved.push(block)
      continue
    }

    const src = block.externalSrc
    if (!src) continue

    let mediaId = uploadedByUrl.get(src)
    if (mediaId == null) {
      try {
        const uploaded = await uploadRemoteImage(payload, src, block.alt || 'Imported image')
        if (uploaded == null) continue
        mediaId = uploaded
        uploadedByUrl.set(src, mediaId)
      } catch {
        continue
      }
    }

    if (firstImageId == null) firstImageId = mediaId
    resolved.push({
      blockType: 'imageBlock',
      image: mediaId,
      caption: block.caption || '',
    })
  }

  return { resolvedBody: resolved, firstImageId }
}

export const GET = async () => {
  const payload = await getPayload({ config: configPromise })
  const user = await getAuthorizedUser(payload)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const [authors, topics] = await Promise.all([
    payload.find({ collection: 'authors', limit: 100, sort: 'name', depth: 0 }),
    payload.find({ collection: 'topics', limit: 200, sort: 'label', depth: 0 }),
  ])

  return Response.json({
    authors: authors.docs.map((doc) => ({ id: doc.id, name: doc.name })),
    topics: topics.docs.map((doc) => ({ id: doc.id, label: doc.label })),
  })
}

export const POST = async (request: Request) => {
  const payload = await getPayload({ config: configPromise })
  const user = await getAuthorizedUser(payload)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as ImportRequestBody

  if (!body?.html || typeof body.html !== 'string') {
    return Response.json({ error: 'Missing `html` in request body.' }, { status: 400 })
  }

  const transformed = transformStripoHtml(body.html)
  if (body.previewOnly) {
    const preview = transformed.body.map((block) => {
      if (block.blockType === 'paragraph') {
        const text = block.content.root.children
          .flatMap((child) => child.children)
          .map((node) => node.text)
          .join(' ')
          .trim()
        return {
          blockType: 'paragraph',
          preview: text.slice(0, 260),
        }
      }
      if (block.blockType === 'imageBlock') {
        return {
          blockType: 'imageBlock',
          preview: block.externalSrc,
          alt: block.alt,
        }
      }
      if (block.blockType === 'pullQuote') {
        return {
          blockType: 'pullQuote',
          preview: block.quote,
        }
      }
      if (block.blockType === 'keyTakeaways') {
        return {
          blockType: 'keyTakeaways',
          preview: block.items.map((item) => item.text).join(' | '),
        }
      }
      return {
        blockType: 'ctaGroup',
        preview: block.ctas.map((cta) => `${cta.label} -> ${cta.href}`).join(' | '),
      }
    })

    return Response.json({
      ok: true,
      parsed: {
        title: transformed.title,
        dek: transformed.dek,
        blocks: preview,
        counts: {
          total: transformed.body.length,
          paragraphs: transformed.body.filter((b) => b.blockType === 'paragraph').length,
          images: transformed.body.filter((b) => b.blockType === 'imageBlock').length,
          pullQuotes: transformed.body.filter((b) => b.blockType === 'pullQuote').length,
          keyTakeaways: transformed.body.filter((b) => b.blockType === 'keyTakeaways').length,
          ctaGroups: transformed.body.filter((b) => b.blockType === 'ctaGroup').length,
        },
      },
    })
  }

  const author = toNumericId(body.author) ?? toNumericId(await pickFirstAuthorId(payload))
  if (author == null) {
    return Response.json(
      { error: 'No author provided and no existing author found. Create an author first.' },
      { status: 400 },
    )
  }

  const { resolvedBody, firstImageId } = await mapAndUploadBody(payload, transformed.body)
  const title = (body.title || transformed.title || 'Imported Stripo Post').trim()
  const topics = Array.isArray(body.topics)
    ? body.topics.map((topic) => toNumericId(topic)).filter((topic): topic is number => topic != null)
    : []

  const created = await payload.create({
    collection: 'posts',
    data: {
      title,
      dek: transformed.dek,
      author,
      topics,
      heroImage: firstImageId ?? undefined,
      status: body.status === 'published' ? 'published' : 'draft',
      body: resolvedBody,
    },
  })

  return Response.json({
    ok: true,
    post: {
      id: created.id,
      title: created.title,
      slug: created.slug,
      status: created.status,
    },
    counts: {
      blocks: resolvedBody.length,
      images: resolvedBody.filter((b) => (b as { blockType?: string }).blockType === 'imageBlock')
        .length,
    },
  })
}
