'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';

import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { LEGAL_DOCUMENT_UI } from '@/lib/ui-locale';

export type LegalSection = {
    title: string;
    paragraphs: string[];
};

type LegalDocumentProps = {
    title: string;
    updatedAt: string;
    intro: string;
    sections: LegalSection[];
};

export function LegalDocument({
    title,
    updatedAt,
    intro,
    sections,
}: LegalDocumentProps): ReactElement {
    const { locale } = useUiLocale();
    const { href } = useLocalizedNavigation();
    const ui = LEGAL_DOCUMENT_UI[locale];

    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <header className="mb-8 border-b border-[var(--lp-border)] pb-6">
                <h1 className="text-3xl font-semibold text-[var(--lp-fg)]">{title}</h1>
                <p className="mt-2 text-sm text-[var(--lp-fg-muted)]">
                    {ui.lastUpdated} {updatedAt}
                </p>
                <p className="mt-4 text-[var(--lp-fg-muted)]">{intro}</p>
                <p className="mt-4 rounded-[var(--lp-radius-sm)] border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-[var(--lp-fg-muted)]">
                    {ui.draftNotice}
                </p>
            </header>
            <div className="flex flex-col gap-8">
                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="text-xl font-medium text-[var(--lp-fg)]">{section.title}</h2>
                        <div className="mt-3 flex flex-col gap-3 text-[var(--lp-fg-muted)]">
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            <footer className="mt-10 border-t border-[var(--lp-border)] pt-6 text-sm text-[var(--lp-fg-muted)]">
                <Link href={href('/')} className="text-[var(--lp-accent)] hover:underline">
                    {ui.backHome}
                </Link>
            </footer>
        </article>
    );
}
