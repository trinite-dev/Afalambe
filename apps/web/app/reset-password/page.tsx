import type { Metadata } from 'next';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { LocalizedAuthPageShell } from '@/components/localized-auth-page-shell';
import { createAuthPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createAuthPageMetadata('resetPassword');
}

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
    const params = await searchParams;
    const token = typeof params.token === 'string' ? params.token : null;

    return (
        <LocalizedAuthPageShell
            page="resetPassword"
            backPath="/sign-in"
            footerVariant="backToSignIn"
        >
            <ResetPasswordForm token={token} />
        </LocalizedAuthPageShell>
    );
}
