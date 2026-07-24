'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { localizedHref, localizedPath } from '@/lib/localized-path';
import { useUiLocale } from '@/hooks/use-ui-locale';

export function useLocalizedNavigation(): {
    locale: ReturnType<typeof useUiLocale>['locale'];
    href: (path: string) => string;
    push: (path: string) => void;
    replace: (path: string) => void;
    switchLocalePath: (targetLocale: ReturnType<typeof useUiLocale>['locale']) => string;
} {
    const { locale } = useUiLocale();
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const searchParams = useSearchParams();
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';

    const href = useCallback((path: string) => localizedHref(path, locale), [locale]);

    const push = useCallback(
        (path: string) => {
            router.push(localizedHref(path, locale));
        },
        [locale, router],
    );

    const replace = useCallback(
        (path: string) => {
            router.replace(localizedHref(path, locale));
        },
        [locale, router],
    );

    const switchLocalePath = useMemo(
        () => (targetLocale: ReturnType<typeof useUiLocale>['locale']) =>
            localizedPath(pathname, targetLocale, search),
        [pathname, search],
    );

    return { locale, href, push, replace, switchLocalePath };
}
