import config from '@/payload.config'
import { getPayload } from 'payload'

import { calculateReadTimeMinutes } from '@/utils/readTime'

const PAGE_SIZE = 100

const run = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let page = 1
  let updated = 0
  let unchanged = 0
  let processed = 0

  while (true) {
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      sort: 'id',
      overrideAccess: true,
    })

    for (const post of result.docs) {
      processed++
      const nextReadTime = calculateReadTimeMinutes({
        dek: typeof post.dek === 'string' ? post.dek : undefined,
        body: Array.isArray(post.body) ? post.body : [],
      })

      if (post.readTime === nextReadTime) {
        unchanged++
        continue
      }

      await payload.update({
        collection: 'posts',
        id: post.id,
        overrideAccess: true,
        data: {
          readTime: nextReadTime,
        },
      })
      updated++
      console.log(`Updated post ${post.id} (${post.slug ?? 'no-slug'}) -> ${nextReadTime} min`)
    }

    if (page >= result.totalPages) break
    page++
  }

  console.log(
    `Read time backfill complete. Processed=${processed}, Updated=${updated}, Unchanged=${unchanged}`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Read time backfill failed', err)
    process.exit(1)
  })
