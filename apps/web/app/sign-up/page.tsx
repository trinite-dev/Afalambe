import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth'
import { AuthTopBackLink } from '@/components/auth-top-back-link'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
    title: 'Sign up',
    description: 'Create an Afalambe account.',
    robots: { index: false, follow: false },
}

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

function flatParams(raw: Record<string, string | string[] | undefined>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string') out[k] = v
    }
    return out
}

export default async function SignUpPage({ searchParams }: Props) {
    const params = flatParams(await searchParams)

    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/" />}
            topEndSlot={<ThemeToggle />}
            logo={<BrandLogo className="h-7 max-w-[10rem] sm:h-8 sm:max-w-[11rem]" width={160} height={35} priority />}
            title="Create your account"
            description="Start verifying claims in your language."
        >
            <SignUpForm searchParams={params} />
            <AuthCardFooter>
                <p>
                    Already have an account?{' '}
                    <Link
                        href={{ pathname: '/sign-in', query: params }}
                        className="font-medium text-[var(--lp-accent)] hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </AuthCardFooter>
        </AuthPageShell>
    )
}
