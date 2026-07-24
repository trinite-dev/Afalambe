import type { Metadata } from 'next'

import { SignInForm } from '@/components/auth/sign-in-form'
import { LocalizedAuthPageShell } from '@/components/localized-auth-page-shell'
import { createAuthPageMetadata } from '@/lib/page-metadata'

export async function generateMetadata(): Promise<Metadata> {
    return createAuthPageMetadata('signIn')
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
        <LocalizedAuthPageShell page="signIn" backPath="/" footerVariant="signIn" signUpQuery={params}>
            <SignInForm searchParams={params} />
        </LocalizedAuthPageShell>
    )
}
