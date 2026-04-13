import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import {
    LandingBullets,
    LandingFaq,
    LandingHero,
    LandingKitRoot,
    LandingSiteFooter,
    LandingSiteHeader,
    LandingSteps,
} from '@afalambe/ui/landing'

import { LandingFeatures } from '@/components/landing-features'
import { ThemeToggle } from '@/components/theme-toggle'
import { buildJsonLd, siteDefaultDescription, siteLogoDarkPath, siteLogoPath, siteName } from '@/lib/site'

export const metadata: Metadata = {
    title: siteName,
    description: siteDefaultDescription,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: siteName,
        description: siteDefaultDescription,
        url: '/',
    },
    twitter: {
        title: siteName,
        description: siteDefaultDescription,
    },
}

const steps = [
    {
        title: 'Sign in',
        description: 'Create an account or return with your email. Verification keeps the queue trustworthy.',
    },
    {
        title: 'Describe your claim in chat',
        description: 'Use any language you need, including Fula and Peul. The assistant reads your full context.',
    },
    {
        title: 'Get an outcome or a human handoff',
        description: 'High-confidence matches produce a clear answer. Otherwise you join the human review queue.',
    },
]

const bullets = [
    {
        title: 'Curated knowledge',
        body: 'Responses are grounded in approved sources and policies, not the open web.',
    },
    {
        title: 'Confidence you can see',
        body: 'We show when the model is sure, when it is not, and when humans must decide.',
    },
    {
        title: 'Human escalation',
        body: 'Sensitive or unmatched claims are queued for reviewers with full context preserved.',
    },
    {
        title: 'Privacy-aware',
        body: 'Encryption in transit, minimal data in prompts, and retention rules documented for operators.',
    },
]

const faqItems = [
    {
        question: 'Which languages are supported?',
        answer: 'The product chrome is available in French and English. Claim text can be written in Unicode, including Fula and Peul scripts.',
    },
    {
        question: 'Is this legal advice?',
        answer: 'No. Afalambè assists with verification against curated material. Operators remain responsible for official determinations.',
    },
    {
        question: 'What happens if the AI is unsure?',
        answer: 'Your claim is placed in a human queue. You receive status updates by email when templates are enabled.',
    },
    {
        question: 'Who can see my claim?',
        answer: 'You, automated systems involved in processing, and authorised reviewers for the queue. Exact roles are defined in programme policy.',
    },
    {
        question: 'Can I use this without signing in?',
        answer: 'The public landing and this chat preview are available. Submitting real claims requires an account per the API specification.',
    },
    {
        question: 'Where does the chat UI live?',
        answer: 'Use the Chat link for the full assistant shell. The authenticated product will follow the same layout tokens.',
    },
]

export default function LandingPage(): ReactElement {
    const jsonLd = buildJsonLd()
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    }

    return (
        <LandingKitRoot>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <LandingSiteHeader
                brand={siteName}
                brandLogoSrc={siteLogoPath}
                brandLogoDarkSrc={siteLogoDarkPath}
                brandLogoAlt={siteName}
                headerActions={<ThemeToggle />}
                signInHref="/sign-in"
                primaryCtaHref="/sign-up"
                primaryCtaLabel="Get started"
            />
            <LandingHero
                title="Verify claims with clear limits"
                subtitle={siteDefaultDescription}
                primaryHref="/sign-up"
                primaryLabel="Start in chat"
                secondaryHref="/sign-in"
                secondaryLabel="Sign in"
            />
            <LandingFeatures />
            <LandingSteps id="how" heading="How it works" steps={steps} />
            <LandingBullets id="why" heading="Why Afalambè" items={bullets} />
            <LandingFaq id="faq" heading="Frequently asked questions" items={faqItems} />
            <LandingSiteFooter
                brand={siteName}
                brandLogoSrc={siteLogoPath}
                brandLogoDarkSrc={siteLogoDarkPath}
                brandLogoAlt={siteName}
            />
        </LandingKitRoot>
    )
}
