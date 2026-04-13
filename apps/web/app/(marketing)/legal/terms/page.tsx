import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { LandingKitRoot } from '@afalambe/ui/landing'

import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
    title: 'Terms',
    description: 'Terms of use for Afalambè (draft placeholder).',
    alternates: {
        canonical: '/legal/terms',
    },
    robots: { index: false, follow: true },
}

export default function TermsPage(): ReactElement {
    return (
        <LandingKitRoot className="relative">
            <div className="fixed right-4 top-4 z-[60] flex justify-end">
                <ThemeToggle />
            </div>
            <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-semibold text-[var(--lp-fg)]">Terms</h1>
                <p className="mt-4 text-[var(--lp-fg-muted)]">
                    Placeholder page. Replace with approved legal copy before production (see specs/landing-page.md).
                </p>
            </article>
        </LandingKitRoot>
    )
}
