import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth';
import { AuthTopBackLink } from '@/components/auth-top-back-link';
import { RequestPasswordResetForm } from '@/components/auth/request-password-reset-form';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
    title: 'Mot de passe oublie',
    description: 'Demander un lien de reinitialisation du mot de passe.',
    robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/sign-in" />}
            topEndSlot={<ThemeToggle />}
            title="Mot de passe oublie"
            description="Saisissez votre e-mail et nous enverrons un lien de reinitialisation."
        >
            <RequestPasswordResetForm />
            <AuthCardFooter>
                <Link href="/sign-in" className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]">
                    Retour a la connexion
                </Link>
            </AuthCardFooter>
        </AuthPageShell>
    );
}
