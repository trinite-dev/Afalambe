import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth'
import { AuthTopBackLink } from '@/components/auth-top-back-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

export const metadata: Metadata = {
    title: 'Verify your email',
    description: 'Enter the code we sent to your email.',
    robots: { index: false, follow: false },
}

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
    const params = await searchParams
    const email = typeof params.email === 'string' ? params.email : null

    if (!email) {
        redirect('/sign-up')
    }

    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/sign-up" />}
            topEndSlot={<ThemeToggle />}
            title="Verify your email"
            description="One last step before you get started."
        >
            <VerifyEmailForm email={email} />
            <AuthCardFooter>
                <Link
                    href="/sign-up"
                    className="text-[var(--lp-fg-subtle)] hover:text-[var(--lp-fg-muted)]"
                >
                    Back to sign up
                </Link>
            </AuthCardFooter>
        </AuthPageShell>
    )
}
