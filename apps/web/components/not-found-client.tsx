'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { siteName } from '@/lib/site';
import { SYSTEM_UI } from '@/lib/ui-locale';

export function NotFoundClient(): ReactElement {
    const { locale } = useUiLocale();
    const { href } = useLocalizedNavigation();
    const copy = SYSTEM_UI[locale];

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="max-w-md text-center">
                <p className="text-sm font-medium text-muted-foreground">{copy.notFoundCode}</p>
                <h1 className="mt-1 text-lg font-semibold text-foreground">{copy.notFoundTitle}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {copy.notFoundDescription(siteName)}
                </p>
            </div>
            <Link
                href={href('/')}
                className="inline-flex h-9 items-center justify-center rounded-none border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent/50"
            >
                {copy.backHome}
            </Link>
        </div>
    );
}
