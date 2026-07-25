import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getLocaleFromPathname } from '@/lib/localized-path';
import { UI_LOCALE_STORAGE_KEY, type UiLocale } from '@/lib/ui-locale';

function withLocale(request: NextRequest, locale: UiLocale): NextResponse {
    const response = NextResponse.next();
    response.cookies.set(UI_LOCALE_STORAGE_KEY, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
    });
    response.headers.set('x-ui-locale', locale);
    return response;
}

export function middleware(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    if (pathname === '/fr' || pathname.startsWith('/fr/')) {
        const url = request.nextUrl.clone();
        const stripped = pathname === '/fr' ? '/' : pathname.slice(3);
        url.pathname = stripped || '/';
        return NextResponse.redirect(url, 301);
    }

    const locale = getLocaleFromPathname(pathname);
    return withLocale(request, locale);
}

export const config = {
    // Exclude API routes (tRPC, webhooks, cron, health) from locale middleware.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
