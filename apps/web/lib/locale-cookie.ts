import { cookies, headers } from 'next/headers';

import { isUiLocale, UI_LOCALE_STORAGE_KEY, type UiLocale } from '@/lib/ui-locale';

export const UI_LOCALE_COOKIE_KEY = UI_LOCALE_STORAGE_KEY;

export async function getServerUiLocale(): Promise<UiLocale> {
    const headerLocale = (await headers()).get('x-ui-locale');
    if (headerLocale && isUiLocale(headerLocale)) {
        return headerLocale;
    }

    const cookieLocale = (await cookies()).get(UI_LOCALE_COOKIE_KEY)?.value;
    if (cookieLocale && isUiLocale(cookieLocale)) {
        return cookieLocale;
    }

    return 'fr';
}
