'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { siteName } from '@/lib/site';

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

/**
 * Route-level error boundary (App Router). Catches errors in nested layouts/pages.
 */
export default function Error({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="max-w-md text-center">
                <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {siteName} hit an unexpected error. You can try again or return home.
                </p>
                {error.digest ? (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
                ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent/50"
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}
