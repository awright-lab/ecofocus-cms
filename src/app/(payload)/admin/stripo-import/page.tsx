'use client'

import React, { useEffect, useMemo, useState } from 'react'

type Option = { id: string | number; name?: string; label?: string }
type PreviewBlock = {
  blockType: 'paragraph' | 'imageBlock' | 'pullQuote' | 'keyTakeaways' | 'ctaGroup'
  preview: string
  alt?: string
}

type PreviewData = {
  title: string
  dek: string
  blocks: PreviewBlock[]
  counts: {
    total: number
    paragraphs: number
    images: number
    pullQuotes: number
    keyTakeaways: number
    ctaGroups: number
  }
}

const panelStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: '24px auto',
  padding: 20,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 10,
  background: 'var(--theme-elevation-0)',
}

export default function StripoImportPage() {
  const [html, setHtml] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [authors, setAuthors] = useState<Option[]>([])
  const [topicOptions, setTopicOptions] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [result, setResult] = useState<null | { id: string | number; title: string; slug: string }>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewSignature, setPreviewSignature] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/stripo-import')
        const data = await res.json()
        if (!active) return
        setAuthors(Array.isArray(data?.authors) ? data.authors : [])
        setTopicOptions(Array.isArray(data?.topics) ? data.topics : [])
        const firstAuthor = Array.isArray(data?.authors) ? data.authors[0]?.id : ''
        if (firstAuthor) setAuthor(String(firstAuthor))
      } catch {
        if (!active) return
        setError('Failed to load authors/topics.')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const htmlSignature = useMemo(() => `${html.length}:${html.slice(0, 120)}`, [html])
  const canSubmit = useMemo(
    () => html.trim().length > 0 && !isLoading && previewSignature === htmlSignature,
    [html, isLoading, previewSignature, htmlSignature],
  )

  const onPreview = async () => {
    if (!html.trim()) return
    setIsPreviewLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/stripo-import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          html,
          title: title || undefined,
          previewOnly: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Preview failed.')
        setPreview(null)
        return
      }
      setPreview(data.parsed as PreviewData)
      setPreviewSignature(htmlSignature)
    } catch {
      setError('Preview failed. Check server logs for details.')
      setPreview(null)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/stripo-import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          html,
          title: title || undefined,
          author: author || undefined,
          topics,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Import failed.')
        return
      }
      setResult({
        id: data.post.id,
        title: data.post.title,
        slug: data.post.slug,
      })
      setHtml('')
    } catch {
      setError('Import failed. Check server logs for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={panelStyle}>
      <h1 style={{ marginTop: 0 }}>Stripo HTML Import</h1>
      <p style={{ color: 'var(--theme-elevation-700)' }}>
        Paste Stripo export HTML and create a Payload post using your existing content blocks.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Title override (optional)</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Author</span>
          <select value={author} onChange={(e) => setAuthor(e.target.value)}>
            {authors.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.name || item.label || item.id}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Topics (optional)</span>
          <select
            multiple
            value={topics}
            onChange={(event) => {
              const next: string[] = []
              for (const option of Array.from(event.currentTarget.selectedOptions)) {
                next.push(option.value)
              }
              setTopics(next)
            }}
            style={{ minHeight: 120 }}
          >
            {topicOptions.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.label || item.name || item.id}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Stripo HTML</span>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={18}
            placeholder="Paste full Stripo HTML export..."
            style={{ fontFamily: 'monospace' }}
          />
        </label>

        <button type="submit" disabled={!canSubmit}>
          {isLoading ? 'Importing...' : 'Import Stripo HTML'}
        </button>
        <button type="button" onClick={onPreview} disabled={!html.trim() || isPreviewLoading || isLoading}>
          {isPreviewLoading ? 'Parsing Preview...' : 'Preview Parsed Blocks'}
        </button>
        {previewSignature !== htmlSignature ? (
          <p style={{ margin: 0, color: 'var(--theme-warning-700)' }}>
            HTML changed since last preview. Run preview again before importing.
          </p>
        ) : null}
      </form>

      {error ? (
        <p style={{ color: '#b42318', marginTop: 14 }}>{error}</p>
      ) : null}

      {preview ? (
        <div style={{ marginTop: 18, borderTop: '1px solid var(--theme-elevation-150)', paddingTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Parsed Preview</h2>
          <p style={{ margin: '0 0 10px' }}>
            <strong>Title:</strong> {preview.title}
          </p>
          <p style={{ margin: '0 0 12px' }}>
            <strong>Dek:</strong> {preview.dek}
          </p>
          <p style={{ margin: '0 0 12px' }}>
            <strong>Counts:</strong> {preview.counts.total} total, {preview.counts.paragraphs} paragraphs,{' '}
            {preview.counts.images} images, {preview.counts.pullQuotes} pull quotes,{' '}
            {preview.counts.keyTakeaways} key takeaways, {preview.counts.ctaGroups} CTA groups
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            {preview.blocks.map((block, index) => (
              <div
                key={`${block.blockType}-${index}`}
                style={{
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 8,
                  padding: 10,
                  background: 'var(--theme-elevation-50)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{index + 1}. {block.blockType}</p>
                <p style={{ margin: '6px 0 0' }}>{block.preview || '(empty)'}</p>
                {block.alt ? <p style={{ margin: '4px 0 0' }}><strong>alt:</strong> {block.alt}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ margin: 0 }}>
            Imported post: <strong>{result.title}</strong>
          </p>
          <p style={{ margin: '6px 0 0' }}>
            <a href={`/admin/collections/posts/${result.id}`}>Open in admin</a> |{' '}
            <a href={`/posts/${result.slug}`} target="_blank" rel="noreferrer">
              Open frontend
            </a>
          </p>
        </div>
      ) : null}
    </div>
  )
}
