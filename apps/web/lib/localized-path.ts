import { type UiLocale } from '@/lib/ui-locale';

export const EN_LOCALE_PREFIX = '/en';

/** Canonical app paths (no locale prefix). */
export type CanonicalPath =
    | '/'
    | '/chat'
    | `/chat/${string}`
    | '/sign-in'
    | '/sign-up'
    | '/sign-up/verify'
    | '/forgot-password'
    | '/reset-password'
    | '/legal/privacy'
    | '/legal/terms'
    | '/admin'
    | '/admin/queue'
    | '/demo'
    | `/admin/claims/${string}`;

export function getLocaleFromPathname(pathname: string): UiLocale {
    if (pathname === EN_LOCALE_PREFIX || pathname.startsWith(`${EN_LOCALE_PREFIX}/`)) {
        return 'en';
    }
    return 'fr';
}

/** Strip `/en` prefix; `/en` becomes `/`. */
export function stripLocalePrefix(pathname: string): string {
    if (pathname === EN_LOCALE_PREFIX) {
        return '/';
    }
    if (pathname.startsWith(`${EN_LOCALE_PREFIX}/`)) {
        const stripped = pathname.slice(EN_LOCALE_PREFIX.length);
        return stripped.length > 0 ? stripped : '/';
    }
    return pathname;
}

/**
 * Build a locale-aware href from a canonical path (and optional query string).
 * `path` may include `?query`; locale prefix is applied to the pathname only.
 */
export function localizedHref(path: string, locale: UiLocale): string {
    const queryIndex = path.indexOf('?');
    const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
    const search = queryIndex === -1 ? '' : path.slice(queryIndex);

    const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const canonical = stripLocalePrefix(normalized);

    let localized: string;
    if (locale === 'en') {
        localized = canonical === '/' ? EN_LOCALE_PREFIX : `${EN_LOCALE_PREFIX}${canonical}`;
    } else {
        localized = canonical;
    }

    return `${localized}${search}`;
}

/** Switch the current pathname to another UI locale, preserving query string. */
export function localizedPath(pathname: string, targetLocale: UiLocale, search = ''): string {
    const canonical = stripLocalePrefix(pathname);
    const suffix = search || '';
    return localizedHref(`${canonical}${suffix}`, targetLocale);
}

export function localizedHrefFromPathname(pathname: string, targetLocale: UiLocale): string {
    const canonical = stripLocalePrefix(pathname);
    return localizedHref(canonical, targetLocale);
}

export function createLocaleAlternates(
    canonicalPath: string,
    locale: UiLocale,
): { canonical: string; languages: Record<string, string> } {
    return {
        canonical: localizedHref(canonicalPath, locale),
        languages: {
            fr: localizedHref(canonicalPath, 'fr'),
            en: localizedHref(canonicalPath, 'en'),
            'x-default': localizedHref(canonicalPath, 'fr'),
        },
    };
}
