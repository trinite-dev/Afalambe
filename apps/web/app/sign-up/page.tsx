import type { Metadata } from 'next'

import { SignUpForm } from '@/components/auth/sign-up-form'
import { LocalizedAuthPageShell } from '@/components/localized-auth-page-shell'
import { createAuthPageMetadata } from '@/lib/page-metadata'

export async function generateMetadata(): Promise<Metadata> {
    return createAuthPageMetadata('signUp')
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
        <LocalizedAuthPageShell page="signUp" backPath="/" footerVariant="signUp" signUpQuery={params}>
            <SignUpForm searchParams={params} />
        </LocalizedAuthPageShell>
    )
}
