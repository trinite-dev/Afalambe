/**
 * Home-screen example prompts drawn from `_data/fact-checks` (feat-0038).
 * Shown as questions so users can submit them directly in chat.
 */

import type { SupportedLanguage } from '@/lib/languages';

export type HomeExampleClaim = {
    id: string;
    fr: string;
    en: string;
    ff: string;
};

/** Four curated AFA rows covering politics, WhatsApp rumor, social image, health. */
export const HOME_EXAMPLE_CLAIMS: HomeExampleClaim[] = [
    {
        id: 'AFA-001',
        fr: "Est-ce que cette vidéo montre vraiment une manifestation pour libérer Alpha Condé après le coup d'État ?",
        en: 'Does this video really show a protest to free Alpha Condé after the coup?',
        ff: "Ndee widewoo hollataa demokaraasi ngam liberude Alpha Condé caggal coup d'État?",
    },
    {
        id: 'AFA-004',
        fr: 'Est-ce vrai que le FMI a publié un rapport demandant aux Guinéens de retirer leur argent des banques ?',
        en: 'Is it true that the IMF published a report telling Guineans to withdraw their money from banks?',
        ff: 'Ko goonga woni FMI yaltinii rapport ngam yamire Guinéens yo ndokka kaalis mum en e banqueeji?',
    },
    {
        id: 'AFA-002',
        fr: 'Ces images montrent-elles vraiment des mineurs maliens cherchant des diamants en Guinée ?',
        en: 'Do these images really show Malian miners searching for diamonds in Guinea?',
        ff: 'Ɗee nateeji kollataa mineurs maliens ɗaɓɓooɓe diamants e Guinée?',
    },
    {
        id: 'AFA-008',
        fr: 'Le vaccin contre le Mpox provoque-t-il la stérilité ?',
        en: 'Does the Mpox vaccine cause sterility?',
        ff: 'Vaccin Mpox addanta stérilité?',
    },
];

export function getCorpusPromptSuggestions(language: SupportedLanguage): string[] {
    return HOME_EXAMPLE_CLAIMS.map((claim) => claim[language] ?? claim.fr);
}
