'use client';

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth';

import { AuthChromeToolbar } from '@/components/auth-chrome-toolbar';
import { AuthTopBackLink } from '@/components/auth-top-back-link';
import { BrandLogo } from '@/components/brand-logo';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { localizedHref } from '@/lib/localized-path';
import { AUTH_FOOTER, AUTH_PAGES, COMMON_UI, type AuthPageKey } from '@/lib/ui-locale';

type LocalizedAuthPageShellProps = {
    page: AuthPageKey;
    /** Canonical path without locale prefix (e.g. `/`, `/sign-in`). */
    backPath: string;
    children: ReactNode;
    footerVariant?: 'signIn' | 'signUp' | 'backToSignIn' | 'backToSignUp';
    signUpQuery?: Record<string, string>;
};

export function LocalizedAuthPageShell({
    page,
    backPath,
    children,
    footerVariant,
    signUpQuery,
}: LocalizedAuthPageShellProps): ReactElement {
    const { locale } = useUiLocale();
    const copy = AUTH_PAGES[locale][page];
    const footer = AUTH_FOOTER[locale];

    let footerNode: ReactNode = null;
    if (footerVariant === 'signIn') {
        footerNode = (
            <AuthCardFooter>
                <p>
                    {footer.signInPrompt}{' '}
                    <Link
                        href={{ pathname: localizedHref('/sign-up', locale), query: signUpQuery }}
                        className="font-medium text-[var(--lp-accent)] hover:underline"
                    >
                        {footer.signInLink}
                    </Link>
                </p>
            </AuthCardFooter>
        );
    } else if (footerVariant === 'signUp') {
        footerNode = (
            <AuthCardFooter>
                <p>
                    {footer.signUpPrompt}{' '}
                    <Link
                        href={{ pathname: localizedHref('/sign-in', locale), query: signUpQuery }}
                        className="font-medium text-[var(--lp-accent)] hover:underline"
                    >
                        {footer.signUpLink}
                    </Link>
                </p>
            </AuthCardFooter>
        );
    } else if (footerVariant === 'backToSignIn') {
        footerNode = (
            <AuthCardFooter>
                <Link
                    href={localizedHref('/sign-in', locale)}
                    className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]"
                >
                    {footer.backToSignIn}
                </Link>
            </AuthCardFooter>
        );
    } else if (footerVariant === 'backToSignUp') {
        footerNode = (
            <AuthCardFooter>
                <Link
                    href={localizedHref('/sign-up', locale)}
                    className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]"
                >
                    {footer.backToSignUp}
                </Link>
            </AuthCardFooter>
        );
    }

    return (
        <AuthPageShell
            topStartSlot={
                <AuthTopBackLink
                    href={localizedHref(backPath, locale)}
                    label={COMMON_UI[locale].back}
                />
            }
            topEndSlot={<AuthChromeToolbar />}
            logo={
                <BrandLogo
                    className="h-7 max-w-[10rem] sm:h-8 sm:max-w-[11rem]"
                    width={160}
                    height={35}
                    priority
                />
            }
            title={copy.title}
            description={copy.description}
        >
            {children}
            {footerNode}
        </AuthPageShell>
    );
}
