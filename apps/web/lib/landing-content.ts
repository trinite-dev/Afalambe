import { localizedHref } from '@/lib/localized-path';
import type { UiLocale } from '@/lib/ui-locale';

export type LandingStep = { title: string; description: string };
export type LandingBullet = { title: string; body: string };
export type LandingFaqItem = { question: string; answer: string };

export type LandingFeatureCard = {
    title: string;
    description: string;
};

export type LandingFooterColumn = {
    heading: string;
    links: Array<{ label: string; href: string }>;
};

export type LandingFooterContent = {
    tagline: string;
    columns: LandingFooterColumn[];
    rightsReserved: string;
    legalNavAria: string;
};

export type LandingContent = {
    navAriaLabel: string;
    navItems: Array<{ href: string; label: string }>;
    chatNavLabel: string;
    demoNavLabel: string;
    signInLabel: string;
    primaryCtaLabel: string;
    heroTitle: string;
    heroPrimaryLabel: string;
    heroSecondaryLabel: string;
    heroComposerPlaceholder: string;
    heroSamplePrompts: string[];
    stepsHeading: string;
    steps: LandingStep[];
    whyHeading: string;
    bullets: LandingBullet[];
    faqHeading: string;
    faqItems: LandingFaqItem[];
    featuresHeading: string;
    featuresSubtitle: string;
    featureCards: LandingFeatureCard[];
    footer: LandingFooterContent;
};

const LANDING_CONTENT: Record<UiLocale, LandingContent> = {
    fr: {
        navAriaLabel: 'Navigation principale',
        navItems: [
            { href: '#how', label: 'Fonctionnement' },
            { href: '#why', label: 'Pourquoi Afalambè' },
            { href: '#faq', label: 'FAQ' },
        ],
        chatNavLabel: 'Chat',
        demoNavLabel: 'Demonstration',
        signInLabel: 'Connexion',
        primaryCtaLabel: 'Commencer',
        heroTitle: 'Verifier les dossiers avec des limites claires',
        heroPrimaryLabel: 'Demarrer dans le chat',
        heroSecondaryLabel: 'Connexion',
        heroComposerPlaceholder: 'Posez votre question...',
        heroSamplePrompts: [
            'Verifier une affirmation electorale en fulfulde',
            'Cette legende sur des inondations locales est-elle exacte ?',
            'Verifier un message WhatsApp sur les calendriers vaccinaux',
            'Comparer une declaration aux directives sanitaires officielles',
            'File d attente humaine quand aucune source ne correspond',
            'Soumettre un dossier en francais avec captures',
            'Que pouvez-vous confirmer ou envoyer aux relecteurs ?',
            'Comprendre les limites avant de partager un contexte sensible',
            'Verifier une transcription radio contre les sources',
            'Verifier un titre partage en peul',
            'Saisie multilingue : fula, peul, FR, EN',
            'Obtenir une reponse claire quand la base de connaissances correspond',
        ],
        stepsHeading: 'Fonctionnement',
        steps: [
            {
                title: 'Connexion',
                description:
                    "Creez un compte ou revenez avec votre e-mail. La verification maintient une file d'attente fiable.",
            },
            {
                title: 'Decrivez votre dossier dans le chat',
                description:
                    "Utilisez la langue de votre choix, y compris le fula et le peul. L'assistant lit tout votre contexte.",
            },
            {
                title: 'Recevez un resultat ou un relais humain',
                description:
                    'Les correspondances a forte confiance donnent une reponse claire. Sinon, votre dossier passe en verification humaine.',
            },
        ],
        whyHeading: 'Pourquoi Afalambè',
        bullets: [
            {
                title: 'Connaissances selectionnees',
                body: "Les reponses s'appuient sur des sources et politiques validees, pas sur le web ouvert.",
            },
            {
                title: 'Confiance visible',
                body: "Nous montrons quand le modele est confiant, quand il ne l'est pas, et quand une decision humaine est requise.",
            },
            {
                title: 'Escalade humaine',
                body: 'Les dossiers sensibles ou sans correspondance sont envoyes aux relecteurs avec tout le contexte conserve.',
            },
            {
                title: 'Respect de la confidentialite',
                body: 'Chiffrement en transit, donnees minimales dans les prompts et regles de retention documentees pour les operateurs.',
            },
        ],
        faqHeading: 'Questions frequentes',
        faqItems: [
            {
                question: 'Quelles langues sont prises en charge ?',
                answer: "L'interface produit est disponible en francais et en anglais. Le texte des dossiers peut etre saisi en Unicode, y compris en fula et en peul.",
            },
            {
                question: 'Est-ce un conseil juridique ?',
                answer: 'Non. Afalambè aide a verifier avec des sources selectionnees. Les operateurs restent responsables des decisions officielles.',
            },
            {
                question: "Que se passe-t-il si l'IA n'est pas certaine ?",
                answer: 'Votre dossier est place en file de verification humaine. Vous recevez des mises a jour par e-mail lorsque les templates sont actives.',
            },
            {
                question: 'Qui peut voir mon dossier ?',
                answer: "Vous, les systemes automatises impliques dans le traitement, et les relecteurs autorises. Les roles exacts sont definis par la politique du programme.",
            },
            {
                question: 'Puis-je utiliser cela sans me connecter ?',
                answer: "La page publique et cet apercu du chat sont accessibles. L'envoi de dossiers reels necessite un compte selon la specification API.",
            },
            {
                question: "Ou se trouve l'interface de chat ?",
                answer: "Utilisez le lien Chat pour l'interface complete de l'assistant. Le produit authentifie suivra les memes tokens de mise en page.",
            },
        ],
        featuresHeading: 'Concu pour une verification fiable',
        featuresSubtitle:
            'Des sources selectionnees, des signaux de confiance clairs, et une verification humaine quand l automatisation atteint ses limites.',
        featureCards: [
            {
                title: 'Saisie multilingue',
                description:
                    'Le chat et les formulaires acceptent les langues de votre communaute, y compris le fula et le peul.',
            },
            {
                title: 'Confiance explicite',
                description:
                    "Quand un dossier correspond a des sources selectionnees, vous obtenez une reponse directe ; sinon, l'incertitude est explicite.",
            },
            {
                title: 'Limites transparentes',
                description:
                    'Les politiques et le perimetre des sources sont visibles pour que les equipes sachent ce qui peut etre verifie automatiquement.',
            },
            {
                title: 'Supervision humaine',
                description:
                    'Les escalades conservent tout le contexte pour les relecteurs quand le modele ne peut pas confirmer avec certitude.',
            },
        ],
        footer: {
            tagline:
                'Saisie de dossiers avec supervision humaine. Verifiez contre des sources selectionnees, avec confiance explicite et escalade quand cela compte.',
            columns: [
                {
                    heading: 'Produit',
                    links: [
                        { label: 'Fonctionnalites', href: '/#why' },
                        { label: 'Integrations', href: '#' },
                        { label: 'Tarifs', href: '#' },
                        { label: 'Journal des versions', href: '#' },
                    ],
                },
                {
                    heading: 'Entreprise',
                    links: [
                        { label: 'A propos', href: '#' },
                        { label: 'Blog', href: '#' },
                        { label: 'Carrieres', href: '#' },
                        { label: 'Contact', href: '#' },
                    ],
                },
                {
                    heading: 'Ressources',
                    links: [
                        { label: 'Documentation', href: '#' },
                        { label: 'Centre d aide', href: '#' },
                        { label: 'Communaute', href: '#' },
                        { label: 'Modeles', href: '#' },
                    ],
                },
                {
                    heading: 'Legal',
                    links: [
                        { label: 'Confidentialite', href: '/legal/privacy' },
                        { label: 'Conditions', href: '/legal/terms' },
                        { label: 'Cookies', href: '#' },
                    ],
                },
            ],
            rightsReserved: 'Tous droits reserves.',
            legalNavAria: 'Liens legaux',
        },
    },
    en: {
        navAriaLabel: 'Main navigation',
        navItems: [
            { href: '#how', label: 'How it works' },
            { href: '#why', label: 'Why Afalambè' },
            { href: '#faq', label: 'FAQ' },
        ],
        chatNavLabel: 'Chat',
        demoNavLabel: 'Demo',
        signInLabel: 'Sign in',
        primaryCtaLabel: 'Get started',
        heroTitle: 'Verify claims with clear boundaries',
        heroPrimaryLabel: 'Start in chat',
        heroSecondaryLabel: 'Sign in',
        heroComposerPlaceholder: 'Ask anything...',
        heroSamplePrompts: [
            'Verify this election claim I saw in Fulfulde',
            'Is this video caption about local flooding accurate?',
            'Check a WhatsApp forward about vaccine schedules',
            'Compare this statement to official health guidance',
            'Queue for human review when no source matches',
            'Submit a claim in French with screenshots',
            'What can you confirm vs send to reviewers?',
            'Understand limits before I share sensitive context',
            'Verify a radio clip transcript against sources',
            'Fact-check a headline shared in Peul',
            'Multilingual intake: Fula, Peul, FR, EN',
            'Get a clear answer when the knowledge base matches',
        ],
        stepsHeading: 'How it works',
        steps: [
            {
                title: 'Sign in',
                description:
                    'Create an account or return with your email. Verification keeps the review queue reliable.',
            },
            {
                title: 'Describe your claim in chat',
                description:
                    'Use the language you prefer, including Fula and Peul. The assistant reads your full context.',
            },
            {
                title: 'Get a result or human handoff',
                description:
                    'High-confidence matches return a clear answer. Otherwise your claim goes to human review.',
            },
        ],
        whyHeading: 'Why Afalambè',
        bullets: [
            {
                title: 'Curated knowledge',
                body: 'Answers draw on validated sources and policies, not the open web.',
            },
            {
                title: 'Visible confidence',
                body: 'We show when the model is confident, when it is not, and when a human decision is required.',
            },
            {
                title: 'Human escalation',
                body: 'Sensitive or unmatched claims go to reviewers with full context preserved.',
            },
            {
                title: 'Privacy respect',
                body: 'Encryption in transit, minimal prompt data, and documented retention rules for operators.',
            },
        ],
        faqHeading: 'Frequently asked questions',
        faqItems: [
            {
                question: 'Which languages are supported?',
                answer: 'The product interface is available in French and English. Claim text can be entered in Unicode, including Fula and Peul.',
            },
            {
                question: 'Is this legal advice?',
                answer: 'No. Afalambè helps verify against selected sources. Operators remain responsible for official decisions.',
            },
            {
                question: 'What happens when the AI is uncertain?',
                answer: 'Your claim is placed in the human review queue. You receive email updates when templates are active.',
            },
            {
                question: 'Who can see my claim?',
                answer: 'You, automated systems involved in processing, and authorized reviewers. Exact roles are defined by program policy.',
            },
            {
                question: 'Can I use this without signing in?',
                answer: 'The public page and this chat preview are accessible. Submitting real claims requires an account per the API specification.',
            },
            {
                question: 'Where is the chat interface?',
                answer: 'Use the Chat link for the full assistant interface. The authenticated product uses the same layout tokens.',
            },
        ],
        featuresHeading: 'Built for reliable verification',
        featuresSubtitle:
            'Selected sources, clear confidence signals, and human review when automation reaches its limits.',
        featureCards: [
            {
                title: 'Multilingual intake',
                description:
                    'Chat and forms accept the languages your community uses, including Fula and Peul.',
            },
            {
                title: 'Explicit confidence',
                description:
                    'When a claim matches selected sources you get a direct answer; otherwise uncertainty is stated clearly.',
            },
            {
                title: 'Transparent limits',
                description:
                    'Policies and source scope are visible so teams know what can be verified automatically.',
            },
            {
                title: 'Human oversight',
                description:
                    'Escalations keep full context for reviewers when the model cannot confirm with certainty.',
            },
        ],
        footer: {
            tagline:
                'Claims intake with human oversight. Verify against curated sources, with clear confidence and escalation when it matters.',
            columns: [
                {
                    heading: 'Product',
                    links: [
                        { label: 'Features', href: '/#why' },
                        { label: 'Integrations', href: '#' },
                        { label: 'Pricing', href: '#' },
                        { label: 'Changelog', href: '#' },
                    ],
                },
                {
                    heading: 'Company',
                    links: [
                        { label: 'About', href: '#' },
                        { label: 'Blog', href: '#' },
                        { label: 'Careers', href: '#' },
                        { label: 'Contact', href: '#' },
                    ],
                },
                {
                    heading: 'Resources',
                    links: [
                        { label: 'Documentation', href: '#' },
                        { label: 'Help Center', href: '#' },
                        { label: 'Community', href: '#' },
                        { label: 'Templates', href: '#' },
                    ],
                },
                {
                    heading: 'Legal',
                    links: [
                        { label: 'Privacy', href: '/legal/privacy' },
                        { label: 'Terms', href: '/legal/terms' },
                        { label: 'Cookie Policy', href: '#' },
                    ],
                },
            ],
            rightsReserved: 'All rights reserved.',
            legalNavAria: 'Legal',
        },
    },
};

export function getLandingContent(locale: UiLocale): LandingContent {
    const content = LANDING_CONTENT[locale];
    return {
        ...content,
        navItems: [
            ...content.navItems,
            { href: localizedHref('/demo', locale), label: content.demoNavLabel },
        ],
        footer: {
            ...content.footer,
            columns: content.footer.columns.map((column) => ({
                ...column,
                links: column.links.map((link) => ({
                    ...link,
                    href: link.href.startsWith('/legal/')
                        ? localizedHref(link.href, locale)
                        : link.href,
                })),
            })),
        },
    };
}
