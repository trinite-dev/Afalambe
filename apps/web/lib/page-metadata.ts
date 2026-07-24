import type { Metadata } from 'next';

import { getServerUiLocale } from '@/lib/locale-cookie';
import { DEMO_PAGE_META } from '@/lib/demo-ui';
import { createLocaleAlternates } from '@/lib/localized-path';
import { ADMIN_PAGE_META, AUTH_PAGES, CHAT_PAGE_META, LEGAL_PAGE_META, type AuthPageKey } from '@/lib/ui-locale';

const AUTH_PAGE_PATHS: Record<AuthPageKey, string> = {
    signIn: '/sign-in',
    signUp: '/sign-up',
    verifyEmail: '/sign-up/verify',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
};

export async function createAuthPageMetadata(page: AuthPageKey): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const copy = AUTH_PAGES[locale][page];
    const canonicalPath = AUTH_PAGE_PATHS[page];

    return {
        title: copy.metadataTitle,
        description: copy.metadataDescription,
        alternates: createLocaleAlternates(canonicalPath, locale),
        robots: { index: false, follow: false },
    };
}

export async function createLegalPageMetadata(page: 'privacy' | 'terms'): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const copy = LEGAL_PAGE_META[locale][page];
    const canonicalPath = page === 'privacy' ? '/legal/privacy' : '/legal/terms';

    return {
        title: copy.title,
        description: copy.description,
        alternates: createLocaleAlternates(canonicalPath, locale),
        robots: { index: false, follow: true },
    };
}

export async function createAdminPageMetadata(page: 'queue' | 'claimDetail'): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const canonicalPath = page === 'queue' ? '/admin/queue' : '/admin';

    return {
        title: ADMIN_PAGE_META[locale][page],
        alternates: createLocaleAlternates(canonicalPath, locale),
        robots: { index: false, follow: false },
    };
}

export async function createChatPageMetadata(): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const copy = CHAT_PAGE_META[locale];

    return {
        title: copy.title,
        description: copy.description,
        alternates: createLocaleAlternates('/chat', locale),
        robots: { index: false, follow: false },
    };
}

export async function createDemoPageMetadata(): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const copy = DEMO_PAGE_META[locale];

    return {
        title: copy.title,
        description: copy.description,
        alternates: createLocaleAlternates('/demo', locale),
        robots: { index: false, follow: false },
    };
}
