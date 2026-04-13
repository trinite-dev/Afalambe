export const siteName = 'Afalambe'

/** Served from `public/` (literal `@` in filename). */
export const siteIconPath = '/@afalambe-icon.png'

/** Horizontal wordmark for headers and auth (light surfaces). */
export const siteLogoPath = '/@afalambe-logo.png'

/** Wordmark for dark mode (`public/@Afalambè.png`). */
export const siteLogoDarkPath = '/@Afalambè.png'

/** Marketing landing hero (`public/@afalambe-hero.png`). */
export const siteHeroImagePath = '/@afalambe-hero.png'

export const siteDefaultDescription =
    'Submit claims in your language, including Fula and Peul. When the system can verify against curated knowledge, you get a clear answer; otherwise your claim is queued for human review.'

export const siteKeywords = [
    'fact-checking',
    'claims verification',
    'Fula',
    'Peul',
    'AI verification',
    'human review',
    'multilingual',
]

/** Browser chrome / PWA theme (brand red from Afalambe identity). */
export const siteThemeColor = '#9B1B30'

export function getMetadataBase(): URL {
    const raw = process.env.NEXT_PUBLIC_APP_URL
    if (!raw) {
        return new URL('http://localhost:3000')
    }
    return new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw)
}

export function shouldAllowIndexing(): boolean {
    return process.env.VERCEL_ENV === 'production'
}

export function buildJsonLd(overrides?: {
    name?: string
    description?: string
    url?: string
}): Record<string, unknown> {
    const base = getMetadataBase().toString().replace(/\/$/, '')
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: overrides?.name ?? siteName,
        description: overrides?.description ?? siteDefaultDescription,
        url: overrides?.url ?? base,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        inLanguage: ['en', 'fr'],
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    }
}
