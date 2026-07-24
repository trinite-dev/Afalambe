import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { LandingPageClient } from '@/components/landing-page-client';
import { getServerUiLocale } from '@/lib/locale-cookie';
import { createLocaleAlternates } from '@/lib/localized-path';
import { getSiteDescription, siteName } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerUiLocale();
    const description = getSiteDescription(locale);

    return {
        title: siteName,
        description,
        alternates: createLocaleAlternates('/', locale),
        openGraph: {
            title: siteName,
            description,
            url: createLocaleAlternates('/', locale).canonical,
        },
        twitter: {
            title: siteName,
            description,
        },
    };
}

export default function LandingPage(): ReactElement {
    return <LandingPageClient />;
}
