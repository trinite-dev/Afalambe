'use client';

import type { ReactElement } from 'react';
import { LandingKitRoot } from '@afalambe/ui/landing';

import { LegalDocument } from '@/components/legal-document';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { getPrivacyContent, getTermsContent } from '@/lib/legal-content';

export function PrivacyPageClient(): ReactElement {
    const { locale } = useUiLocale();
    const content = getPrivacyContent(locale);

    return (
        <LandingKitRoot className="relative">
            <div className="fixed right-4 top-4 z-[70] flex items-center gap-2">
                <LocaleSwitcher variant="landing" />
                <ThemeToggle />
            </div>
            <LegalDocument
                title={content.title}
                updatedAt={content.updatedAt}
                intro={content.intro}
                sections={content.sections}
            />
        </LandingKitRoot>
    );
}

export function TermsPageClient(): ReactElement {
    const { locale } = useUiLocale();
    const content = getTermsContent(locale);

    return (
        <LandingKitRoot className="relative">
            <div className="fixed right-4 top-4 z-[70] flex items-center gap-2">
                <LocaleSwitcher variant="landing" />
                <ThemeToggle />
            </div>
            <LegalDocument
                title={content.title}
                updatedAt={content.updatedAt}
                intro={content.intro}
                sections={content.sections}
            />
        </LandingKitRoot>
    );
}
