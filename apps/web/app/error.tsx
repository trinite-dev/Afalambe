'use client';

import { useEffect, type ReactElement } from 'react';
import Link from 'next/link';

import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { siteName } from '@/lib/site';
import { SYSTEM_UI } from '@/lib/ui-locale';

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

/**
 * Route-level error boundary (App Router). Catches errors in nested layouts/pages.
 */
export default function Error({ error, reset }: ErrorPageProps): ReactElement {
    const { locale } = useUiLocale();
    const { href } = useLocalizedNavigation();
    const copy = SYSTEM_UI[locale];

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="max-w-md text-center">
                <h1 className="text-lg font-semibold text-foreground">{copy.errorTitle}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {copy.errorDescription(siteName)}
                </p>
                {error.digest ? (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {copy.referenceLabel}: {error.digest}
                    </p>
                ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                    {copy.tryAgain}
                </button>
                <Link
                    href={href('/')}
                    className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent/50"
                >
                    {copy.backHome}
                </Link>
            </div>
        </div>
    );
}
