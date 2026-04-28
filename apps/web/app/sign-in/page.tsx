import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthCardFooter, AuthPageShell } from '@afalambe/ui/auth'
import { AuthTopBackLink } from '@/components/auth-top-back-link'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = {
    title: 'Connexion',
    description: 'Connectez-vous a Afalambe.',
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

export default async function SignInPage({ searchParams }: Props) {
    const params = flatParams(await searchParams)

    return (
        <AuthPageShell
            topStartSlot={<AuthTopBackLink href="/" />}
            topEndSlot={<ThemeToggle />}
            logo={<BrandLogo className="h-7 max-w-[10rem] sm:h-8 sm:max-w-[11rem]" width={160} height={35} priority />}
            title="Connexion"
            description="Saisissez vos identifiants pour continuer."
        >
            <SignInForm searchParams={params} />
            <AuthCardFooter>
                <p>
                    Vous n&apos;avez pas de compte ?{' '}
                    <Link
                        href={{ pathname: '/sign-up', query: params }}
                        className="font-medium text-[var(--lp-accent)] hover:underline"
                    >
                        Inscription
                    </Link>
                </p>
            </AuthCardFooter>
        </AuthPageShell>
    )
}
