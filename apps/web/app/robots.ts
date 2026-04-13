import type { MetadataRoute } from 'next'

import { getMetadataBase, shouldAllowIndexing } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
    const base = getMetadataBase().toString().replace(/\/$/, '')
    if (!shouldAllowIndexing()) {
        return {
            rules: { userAgent: '*', disallow: '/' },
        }
    }
    return {
        rules: { userAgent: '*', allow: '/' },
        sitemap: `${base}/sitemap.xml`,
    }
}
