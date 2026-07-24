import type { Metadata } from 'next'

import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { LocalizedAuthPageShell } from '@/components/localized-auth-page-shell'
import { createAuthPageMetadata } from '@/lib/page-metadata'

export async function generateMetadata(): Promise<Metadata> {
    return createAuthPageMetadata('verifyEmail')
}

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
    const params = await searchParams
    const email = typeof params.email === 'string' ? params.email : null

    return (
        <LocalizedAuthPageShell page="verifyEmail" backPath="/sign-up" footerVariant="backToSignUp">
            <VerifyEmailForm email={email} />
        </LocalizedAuthPageShell>
    )
}
