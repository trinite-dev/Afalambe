import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth';
import { AuthTopBackLink } from '@/components/auth-top-back-link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
    title: 'Reinitialiser le mot de passe',
    description: 'Definir un nouveau mot de passe de compte.',
    robots: { index: false, follow: false },
};

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
    const params = await searchParams;
    const token = typeof params.token === 'string' ? params.token : null;

    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/sign-in" />}
            topEndSlot={<ThemeToggle />}
            title="Reinitialiser le mot de passe"
            description="Choisissez un nouveau mot de passe pour votre compte."
        >
            <ResetPasswordForm token={token} />
            <AuthCardFooter>
                <Link href="/sign-in" className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]">
                    Retour a la connexion
                </Link>
            </AuthCardFooter>
        </AuthPageShell>
    );
}
