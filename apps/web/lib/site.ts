import type { UiLocale } from '@/lib/ui-locale';

export const siteName = 'Afalambe'

/** Served from `public/` (literal `@` in filename). */
export const siteIconPath = '/@afalambe-icon.png'

/** Horizontal wordmark for headers and auth (light surfaces). */
export const siteLogoPath = '/@afalambe-logo.png'

/** Wordmark for dark mode (`public/@afalambe-logo-dark.png`). */
export const siteLogoDarkPath = '/@afalambe-logo-dark.png'

/** Marketing landing hero (`public/@afalambe-hero.png`). */
export const siteHeroImagePath = '/@afalambe-hero.png'

export const siteDefaultDescription =
    "Soumettez des dossiers dans votre langue, y compris le fula et le peul. Quand le systeme peut verifier avec des sources selectionnees, vous obtenez une reponse claire ; sinon votre dossier est place en file d'attente pour verification humaine."

export const siteDescriptions: Record<UiLocale, string> = {
    fr: siteDefaultDescription,
    en: 'Submit claims in your language, including Fula and Peul. When the system can verify against selected sources, you get a clear answer; otherwise your claim is queued for human review.',
};

export function getSiteDescription(locale: UiLocale): string {
    return siteDescriptions[locale];
}

export const siteKeywordsByLocale: Record<UiLocale, string[]> = {
    fr: [
        'verification des faits',
        'verification des dossiers',
        'Fula',
        'Peul',
        'verification par IA',
        'verification humaine',
        'multilingue',
    ],
    en: [
        'fact checking',
        'claim verification',
        'Fula',
        'Peul',
        'AI verification',
        'human review',
        'multilingual',
    ],
};

export const siteKeywords = siteKeywordsByLocale.fr;

/** Browser chrome / PWA theme (brand red from Afalambe identity). */
export const siteThemeColor = '#9B1B30'

export function getMetadataBase(): URL {
    const raw = process.env.NEXT_PUBLIC_APP_URL
    if (!raw) {
        return new URL('http://localhost:3002')
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
    inLanguage?: UiLocale | UiLocale[]
}): Record<string, unknown> {
    const base = getMetadataBase().toString().replace(/\/$/, '')
    const inLanguage = overrides?.inLanguage ?? ['fr', 'en']
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: overrides?.name ?? siteName,
        description: overrides?.description ?? siteDefaultDescription,
        url: overrides?.url ?? base,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        inLanguage,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    }
}
