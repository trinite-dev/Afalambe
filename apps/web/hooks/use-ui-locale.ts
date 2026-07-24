'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { getLocaleFromPathname, localizedPath } from '@/lib/localized-path';
import {
    getAlternateUiLocale,
    persistUiLocale,
    type UiLocale,
} from '@/lib/ui-locale';

export function useUiLocale(): {
    locale: UiLocale;
    setLocale: (locale: UiLocale) => void;
    toggleLocale: () => void;
    isReady: boolean;
} {
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const searchParams = useSearchParams();
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';

    const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

    useEffect(() => {
        persistUiLocale(locale);
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback(
        (next: UiLocale) => {
            router.push(localizedPath(pathname, next, search));
        },
        [pathname, router, search],
    );

    const toggleLocale = useCallback(() => {
        setLocale(getAlternateUiLocale(locale));
    }, [locale, setLocale]);

    return { locale, setLocale, toggleLocale, isReady: true };
}
