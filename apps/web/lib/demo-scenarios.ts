import { classifyMessageIntent, type ChatMessageIntent } from '@afalambe/ai/intent';
import { HOME_EXAMPLE_CLAIMS } from '@/lib/home-examples';
import type { UiLocale } from '@/lib/ui-locale';

export type DemoScenarioId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'UNMATCHED';

export type DemoFactCheckStatus =
    | 'VERIFIED'
    | 'DEBUNKED'
    | 'MISLEADING'
    | 'PARTIALLY_TRUE'
    | 'PENDING';

export type DemoScenarioClaimMetadata = {
    sourceName?: string;
    sourceType?: string;
    platform?: string;
    topicCategory?: string;
    location?: string;
    claimLanguage?: string;
    claimDate?: string;
    factCheckDate?: string;
    sourceUrl?: string;
    sourceUrls?: string[];
};

export type DemoScenario = {
    id: DemoScenarioId | 'META' | 'FOLLOW_UP' | 'OFF_TOPIC';
    corpusId?: 'AFA-001' | 'AFA-002' | 'AFA-004' | 'AFA-008';
    exampleLine: string;
    triggers: string[];
    assistantReply: string;
    factCheckStatus?: DemoFactCheckStatus;
    claimMetadata: DemoScenarioClaimMetadata;
    /** When false, do not append fact-check details footer (meta / off-topic). */
    includeFactCheckDetails?: boolean;
};

const DEMO_LINK_FACTUEL = 'https://www.factuel.info/';
const DEMO_LINK_AFRICA_GUINEE = 'https://www.africaguinee.com/';
const DEMO_LINK_AFRICA_CHECK = 'https://africacheck.org/fr';

const HOME_BY_ID = Object.fromEntries(HOME_EXAMPLE_CLAIMS.map((claim) => [claim.id, claim])) as Record<
    'AFA-001' | 'AFA-002' | 'AFA-004' | 'AFA-008',
    (typeof HOME_EXAMPLE_CLAIMS)[number]
>;

function exampleLineFor(corpusId: keyof typeof HOME_BY_ID, locale: UiLocale): string {
    return HOME_BY_ID[corpusId][locale];
}

const DEMO_SCENARIOS: Record<UiLocale, DemoScenario[]> = {
    fr: [
        {
            id: 'D1',
            corpusId: 'AFA-001',
            exampleLine: exampleLineFor('AFA-001', 'fr'),
            triggers: [
                'alpha',
                'conde',
                'condé',
                'manifestation',
                'coup',
                'video',
                'vidéo',
                'liberer',
                'libérer',
                'afa-001',
            ],
            assistantReply:
                "Verdict : FAUX (dementi).\n\nCette video ne montre pas une manifestation pour liberer Alpha Conde apres le coup d'Etat. Le contenu a ete presente hors contexte.\n\nSource de demonstration : corpus Afalambe AFA-001 (Factuel). Ceci est un exemple guide — inscrivez-vous pour une verification reelle.",
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Compte Facebook',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'facebook',
                topicCategory: 'POLITICS',
                location: 'Guinee',
                claimLanguage: 'fr',
                claimDate: '2021-09-29',
                factCheckDate: '2021-10-05T14:30:00.000Z',
                sourceUrls: [DEMO_LINK_FACTUEL],
            },
        },
        {
            id: 'D2',
            corpusId: 'AFA-002',
            exampleLine: exampleLineFor('AFA-002', 'fr'),
            triggers: [
                'mineurs',
                'maliens',
                'diamants',
                'diamant',
                'images',
                'guinee',
                'guinée',
                'afa-002',
            ],
            assistantReply:
                "Verdict : FAUX (dementi).\n\nCes images ont ete sorties de leur contexte et ne montrent pas des mineurs maliens cherchant des diamants en Guinee.\n\nSource de demonstration : corpus Afalambe AFA-002 (Factuel). Ceci est un exemple guide — inscrivez-vous pour une verification reelle.",
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Compte Facebook',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'facebook',
                topicCategory: 'POLITICS',
                location: 'Guinee',
                claimLanguage: 'fr',
                claimDate: '2021-07-13',
                factCheckDate: '2021-07-20T11:00:00.000Z',
                sourceUrls: [DEMO_LINK_FACTUEL],
            },
        },
        {
            id: 'D3',
            corpusId: 'AFA-004',
            exampleLine: exampleLineFor('AFA-004', 'fr'),
            triggers: [
                'fmi',
                'imf',
                'banques',
                'banque',
                'argent',
                'retirer',
                'rapport',
                'guineens',
                'guinéens',
                'afa-004',
            ],
            assistantReply:
                "Verdict : FAUX (dementi).\n\nLe pretendu rapport du FMI demandant aux Guineens de retirer leur argent des banques est un faux (souvent genere par IA). Aucune publication officielle du FMI ne confirme cette consigne.\n\nSource de demonstration : corpus Afalambe AFA-004 (Africa Guinee). Ceci est un exemple guide — inscrivez-vous pour une verification reelle.",
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Audio viral',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'whatsapp',
                topicCategory: 'FINANCE',
                location: 'Guinee',
                claimLanguage: 'fr',
                claimDate: '2025-08-30',
                factCheckDate: '2025-09-02T09:15:00.000Z',
                sourceUrls: [DEMO_LINK_AFRICA_GUINEE],
            },
        },
        {
            id: 'D4',
            corpusId: 'AFA-008',
            exampleLine: exampleLineFor('AFA-008', 'fr'),
            triggers: [
                'mpox',
                'vaccin',
                'vaccine',
                'sterilite',
                'stérilité',
                'sterility',
                'afa-008',
            ],
            assistantReply:
                "Verdict : FAUX (dementi).\n\nAucun element scientifique ne demontre que le vaccin contre le Mpox provoque la sterilite. Ce message WhatsApp mele peur et desinformation sanitaire.\n\nSource de demonstration : corpus Afalambe AFA-008 (Africa Check). Ceci est un exemple guide — inscrivez-vous pour une verification reelle.",
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Utilisateurs reseaux sociaux',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'whatsapp',
                topicCategory: 'HEALTH',
                location: 'Afrique',
                claimLanguage: 'fr',
                claimDate: '2024-06-01',
                factCheckDate: '2024-06-15T16:45:00.000Z',
                sourceUrl: DEMO_LINK_AFRICA_CHECK,
            },
        },
        {
            id: 'D5',
            exampleLine: 'Pouvez-vous verifier cette rumeur sans source claire ?',
            triggers: ['rumeur sans source', 'sans source claire', 'non verifiable', 'non vérifiable'],
            assistantReply:
                "Verdict : EN ATTENTE (file humaine).\n\nNous ne pouvons pas confirmer cette affirmation avec les sources disponibles. Dans le produit reel, le dossier serait place en file de verification humaine.\n\nCeci est un exemple guide pour montrer l'escalade — choisissez aussi les exemples AFA ci-dessus pour voir des verdicts dementis.",
            factCheckStatus: 'PENDING',
            claimMetadata: {
                platform: 'whatsapp',
                sourceType: 'SOCIAL_MEDIA',
                topicCategory: 'POLITICS',
                claimLanguage: 'fr',
            },
        },
        {
            id: 'UNMATCHED',
            exampleLine: '',
            triggers: [],
            assistantReply:
                "Demonstration uniquement : je n'ai pas de reponse guidee pour cette formulation exacte.\n\nEssayez un des exemples proposes (Alpha Conde, mineurs / diamants, FMI / banques, vaccin Mpox), ou creez un compte pour une verification reelle avec l'IA.",
            claimMetadata: {},
        },
    ],
    en: [
        {
            id: 'D1',
            corpusId: 'AFA-001',
            exampleLine: exampleLineFor('AFA-001', 'en'),
            triggers: [
                'alpha',
                'conde',
                'condé',
                'protest',
                'coup',
                'video',
                'free',
                'afa-001',
            ],
            assistantReply:
                'Verdict: FALSE (debunked).\n\nThis video does not show a protest to free Alpha Condé after the coup. The footage was presented out of context.\n\nDemo source: Afalambe corpus AFA-001 (Factuel). This is a guided example — sign up for a real verification.',
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Facebook account',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'facebook',
                topicCategory: 'POLITICS',
                location: 'Guinea',
                claimLanguage: 'en',
                claimDate: '2021-09-29',
                factCheckDate: '2021-10-05T14:30:00.000Z',
                sourceUrls: [DEMO_LINK_FACTUEL],
            },
        },
        {
            id: 'D2',
            corpusId: 'AFA-002',
            exampleLine: exampleLineFor('AFA-002', 'en'),
            triggers: [
                'miners',
                'malian',
                'mali',
                'diamonds',
                'diamond',
                'images',
                'guinea',
                'afa-002',
            ],
            assistantReply:
                'Verdict: FALSE (debunked).\n\nThese images were taken out of context and do not show Malian miners searching for diamonds in Guinea.\n\nDemo source: Afalambe corpus AFA-002 (Factuel). This is a guided example — sign up for a real verification.',
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Facebook account',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'facebook',
                topicCategory: 'POLITICS',
                location: 'Guinea',
                claimLanguage: 'en',
                claimDate: '2021-07-13',
                factCheckDate: '2021-07-20T11:00:00.000Z',
                sourceUrls: [DEMO_LINK_FACTUEL],
            },
        },
        {
            id: 'D3',
            corpusId: 'AFA-004',
            exampleLine: exampleLineFor('AFA-004', 'en'),
            triggers: [
                'imf',
                'fmi',
                'banks',
                'bank',
                'withdraw',
                'money',
                'report',
                'guineans',
                'afa-004',
            ],
            assistantReply:
                'Verdict: FALSE (debunked).\n\nThe supposed IMF report telling Guineans to withdraw money from banks is a fake (often AI-generated). No official IMF publication supports that instruction.\n\nDemo source: Afalambe corpus AFA-004 (Africa Guinée). This is a guided example — sign up for a real verification.',
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Viral audio',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'whatsapp',
                topicCategory: 'FINANCE',
                location: 'Guinea',
                claimLanguage: 'en',
                claimDate: '2025-08-30',
                factCheckDate: '2025-09-02T09:15:00.000Z',
                sourceUrls: [DEMO_LINK_AFRICA_GUINEE],
            },
        },
        {
            id: 'D4',
            corpusId: 'AFA-008',
            exampleLine: exampleLineFor('AFA-008', 'en'),
            triggers: [
                'mpox',
                'vaccine',
                'vaccin',
                'sterility',
                'sterile',
                'afa-008',
            ],
            assistantReply:
                'Verdict: FALSE (debunked).\n\nNo scientific evidence shows that the Mpox vaccine causes sterility. This WhatsApp message mixes fear with health misinformation.\n\nDemo source: Afalambe corpus AFA-008 (Africa Check). This is a guided example — sign up for a real verification.',
            factCheckStatus: 'DEBUNKED',
            claimMetadata: {
                sourceName: 'Social media users',
                sourceType: 'SOCIAL_MEDIA',
                platform: 'whatsapp',
                topicCategory: 'HEALTH',
                location: 'Africa',
                claimLanguage: 'en',
                claimDate: '2024-06-01',
                factCheckDate: '2024-06-15T16:45:00.000Z',
                sourceUrl: DEMO_LINK_AFRICA_CHECK,
            },
        },
        {
            id: 'D5',
            exampleLine: 'Can you verify this rumor with no clear source?',
            triggers: ['rumor with no clear source', 'no clear source', 'unverifiable rumor'],
            assistantReply:
                'Verdict: PENDING (human queue).\n\nWe cannot confirm this claim with the sources available. In the real product, the claim would be placed in the human review queue.\n\nThis guided example shows escalation only — also try the AFA examples above for debunked verdicts.',
            factCheckStatus: 'PENDING',
            claimMetadata: {
                platform: 'whatsapp',
                sourceType: 'SOCIAL_MEDIA',
                topicCategory: 'POLITICS',
                claimLanguage: 'en',
            },
        },
        {
            id: 'UNMATCHED',
            exampleLine: '',
            triggers: [],
            assistantReply:
                "Demo only: I don't have a guided reply for that exact wording.\n\nTry one of the suggested examples (Alpha Condé, miners / diamonds, IMF / banks, Mpox vaccine), or create an account for a real AI verification.",
            claimMetadata: {},
        },
    ],
};

const SCENARIO_ORDER: DemoScenarioId[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'UNMATCHED'];

const HUMAN_QUEUE_MARKERS = [
    'human review queue',
    'file de verification humaine',
    'file de vérification humaine',
] as const;

export function normalizeDemoText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

export function getDemoScenarios(locale: UiLocale): DemoScenario[] {
    return DEMO_SCENARIOS[locale];
}

export function getDemoExampleScenarios(locale: UiLocale): DemoScenario[] {
    return getDemoScenarios(locale).filter((scenario) => scenario.id !== 'UNMATCHED' && scenario.exampleLine);
}

function scoreScenario(
    normalizedText: string,
    scenario: DemoScenario,
): { score: number; hits: number; longestHit: number } {
    let score = 0;
    let hits = 0;
    let longestHit = 0;
    for (const trigger of scenario.triggers) {
        const normalizedTrigger = normalizeDemoText(trigger);
        if (!normalizedTrigger) continue;
        if (normalizedText.includes(normalizedTrigger)) {
            hits += 1;
            longestHit = Math.max(longestHit, normalizedTrigger.length);
            // Prefer longer, more specific triggers when scoring.
            score += Math.max(1, Math.ceil(normalizedTrigger.length / 6));
        }
    }
    return { score, hits, longestHit };
}

export function matchDemoScenario(
    locale: UiLocale,
    userText: string,
    options?: { hasPriorAssistant?: boolean },
): DemoScenario {
    const normalized = normalizeDemoText(userText);
    const scenarios = getDemoScenarios(locale);
    const matchable = scenarios.filter((scenario) => scenario.id !== 'UNMATCHED');
    const unmatched = scenarios.find((scenario) => scenario.id === 'UNMATCHED') ?? matchable[matchable.length - 1]!;
    const hasPriorAssistant = options?.hasPriorAssistant ?? false;

    if (!normalized) {
        return intentDemoScenario(locale, 'OFF_TOPIC');
    }

    for (const scenario of matchable) {
        const example = normalizeDemoText(scenario.exampleLine);
        if (!example) continue;
        if (normalized === example || normalized.includes(example) || example.includes(normalized)) {
            return scenario;
        }
    }

    let best: DemoScenario | null = null;
    let bestScore = 0;
    let bestHits = 0;
    let bestLongest = 0;
    for (const scenario of matchable) {
        const { score, hits, longestHit } = scoreScenario(normalized, scenario);
        const isStronger =
            score > bestScore ||
            (score === bestScore && hits > bestHits) ||
            (score === bestScore && hits === bestHits && longestHit > bestLongest);
        if (isStronger) {
            best = scenario;
            bestScore = score;
            bestHits = hits;
            bestLongest = longestHit;
        }
    }

    // Require at least two trigger hits, or one distinctive long trigger (len >= 8).
    const strongEnough = bestHits >= 2 || (bestHits === 1 && bestLongest >= 8);
    if (best && strongEnough) {
        return best;
    }

    const { intent } = classifyMessageIntent({ text: userText, hasPriorAssistant });
    if (intent === 'META' || intent === 'FOLLOW_UP' || intent === 'OFF_TOPIC') {
        return intentDemoScenario(locale, intent);
    }

    return unmatched;
}

function intentDemoScenario(locale: UiLocale, intent: Exclude<ChatMessageIntent, 'FACT_CHECK'>): DemoScenario {
    const replies: Record<
        Exclude<ChatMessageIntent, 'FACT_CHECK'>,
        Record<UiLocale, string>
    > = {
        META: {
            fr: "Afalambe aide a verifier des rumeurs et affirmations (WhatsApp, reseaux sociaux, politique, sante, finance).\n\nCollez une affirmation precise a verifier — ce n'est pas une verification pour le moment, seulement une explication du produit.\n\nEssayez aussi un des exemples proposes dans la demo.",
            en: 'Afalambe helps verify rumors and claims (WhatsApp, social media, politics, health, finance).\n\nPaste a specific claim to verify — this reply explains the product only, it is not a verification.\n\nYou can also try one of the suggested demo examples.',
        },
        FOLLOW_UP: {
            fr: "Reponse de suivi (demo) : je m'appuie sur l'analyse precedente sans emettre un nouveau verdict.\n\nVous pouvez demander les sources, le sens du statut, ou pourquoi le raisonnement.",
            en: 'Follow-up reply (demo): I build on the previous analysis without issuing a new verdict.\n\nYou can ask about sources, what the status means, or why that reasoning.',
        },
        OFF_TOPIC: {
            fr: "Je suis la pour aider a verifier des affirmations et rumeurs.\n\nCollez un claim a verifier, ou choisissez un des exemples de la demo.",
            en: 'I am here to help verify claims and rumors.\n\nPaste a claim to check, or pick one of the demo examples.',
        },
    };

    return {
        id: intent,
        exampleLine: '',
        triggers: [],
        assistantReply: replies[intent][locale],
        claimMetadata: { claimLanguage: locale },
        includeFactCheckDetails: intent === 'FOLLOW_UP',
    };
}

export function listDemoScenarioIds(_locale: UiLocale): DemoScenarioId[] {
    return [...SCENARIO_ORDER];
}

export function assertDemoScenarioParity(): void {
    const frIds = listDemoScenarioIds('fr');
    const enIds = listDemoScenarioIds('en');
    if (frIds.length !== enIds.length || frIds.some((id, index) => id !== enIds[index])) {
        throw new Error('Demo scenario IDs must match between fr and en');
    }
    if (frIds.join(',') !== SCENARIO_ORDER.join(',')) {
        throw new Error(`Demo scenario order must be ${SCENARIO_ORDER.join(', ')}`);
    }
}

export function isHumanQueueFallbackCopy(text: string): boolean {
    const normalized = normalizeDemoText(text);
    return HUMAN_QUEUE_MARKERS.some((marker) => normalized.includes(normalizeDemoText(marker)));
}
