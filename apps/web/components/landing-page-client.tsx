'use client';

import type { ReactElement } from 'react';
import {
    LandingBullets,
    LandingFaq,
    LandingHero,
    LandingKitRoot,
    LandingSiteFooter,
    LandingSiteHeader,
    LandingSteps,
} from '@afalambe/ui/landing';

import { AuthChromeToolbar } from '@/components/auth-chrome-toolbar';
import { LandingFeatures } from '@/components/landing-features';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { getLandingContent } from '@/lib/landing-content';
import {
    buildJsonLd,
    getSiteDescription,
    siteLogoDarkPath,
    siteLogoPath,
    siteName,
} from '@/lib/site';

export function LandingPageClient(): ReactElement {
    const { locale } = useUiLocale();
    const { href } = useLocalizedNavigation();
    const content = getLandingContent(locale);
    const description = getSiteDescription(locale);

    const jsonLd = buildJsonLd({ description, inLanguage: locale });
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: content.faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

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
                brandHref={href('/')}
                brandLogoSrc={siteLogoPath}
                brandLogoDarkSrc={siteLogoDarkPath}
                brandLogoAlt={siteName}
                headerActions={<AuthChromeToolbar localeSwitcherVariant="landing" />}
                navItems={content.navItems}
                navAriaLabel={content.navAriaLabel}
                chatNavHref={href('/chat')}
                chatNavLabel={content.chatNavLabel}
                signInHref={href('/sign-in')}
                signInLabel={content.signInLabel}
                primaryCtaHref={href('/sign-up')}
                primaryCtaLabel={content.primaryCtaLabel}
            />
            <LandingHero
                title={content.heroTitle}
                subtitle={description}
                primaryHref={href('/sign-up')}
                primaryLabel={content.heroPrimaryLabel}
                secondaryHref={href('/sign-in')}
                secondaryLabel={content.heroSecondaryLabel}
                samplePrompts={content.heroSamplePrompts}
                composerPlaceholder={content.heroComposerPlaceholder}
            />
            <LandingFeatures content={content} />
            <LandingSteps id="how" heading={content.stepsHeading} steps={content.steps} />
            <LandingBullets id="why" heading={content.whyHeading} items={content.bullets} />
            <LandingFaq id="faq" heading={content.faqHeading} items={content.faqItems} />
            <LandingSiteFooter
                brand={siteName}
                brandHref={href('/')}
                brandLogoSrc={siteLogoPath}
                brandLogoDarkSrc={siteLogoDarkPath}
                brandLogoAlt={siteName}
                tagline={content.footer.tagline}
                columns={content.footer.columns}
                rightsReserved={content.footer.rightsReserved}
                legalNavAria={content.footer.legalNavAria}
            />
        </LandingKitRoot>
    );
}
