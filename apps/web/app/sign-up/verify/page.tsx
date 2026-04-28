import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth'
import { AuthTopBackLink } from '@/components/auth-top-back-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

export const metadata: Metadata = {
    title: 'Verification de votre e-mail',
    description: 'Verifiez votre e-mail pour continuer.',
    robots: { index: false, follow: false },
}

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
    const params = await searchParams
    const email = typeof params.email === 'string' ? params.email : null

    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/sign-up" />}
            topEndSlot={<ThemeToggle />}
            title="Verification de votre e-mail"
            description="Une derniere etape avant de commencer."
        >
            <VerifyEmailForm email={email} />
            <AuthCardFooter>
                <Link
                    href="/sign-up"
                    className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]"
                >
                    Retour a l&apos;inscription
                </Link>
            </AuthCardFooter>
        </AuthPageShell>
    )
}
