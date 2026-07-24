import type { Metadata } from 'next';

import { RequestPasswordResetForm } from '@/components/auth/request-password-reset-form';
import { LocalizedAuthPageShell } from '@/components/localized-auth-page-shell';
import { createAuthPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
    return createAuthPageMetadata('forgotPassword');
}

export default function ForgotPasswordPage() {
    return (
        <LocalizedAuthPageShell
            page="forgotPassword"
            backPath="/sign-in"
            footerVariant="backToSignIn"
        >
            <RequestPasswordResetForm />
        </LocalizedAuthPageShell>
    );
}
