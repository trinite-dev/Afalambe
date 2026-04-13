import Link from 'next/link';
import type { Metadata } from 'next';

import { siteName } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Page not found',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="max-w-md text-center">
                <p className="text-sm font-medium text-muted-foreground">404</p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">Page not found</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The page you requested does not exist on {siteName}.
                </p>
            </div>
            <Link
                href="/"
                className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent/50"
            >
                Back to home
            </Link>
        </div>
    );
}
