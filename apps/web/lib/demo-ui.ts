import type { UiLocale } from '@/lib/ui-locale';

export type DemoUiCopy = {
    badge: string;
    disclaimer: string;
    signUpCta: string;
    signInCta: string;
    placeholder: string;
    reset: string;
    examplesTitle: string;
    assistantTyping: string;
    unavailableTitle: string;
    unavailableBody: string;
    backHome: string;
    composeAria: string;
    sendAria: string;
    demoDisclaimer: string;
    moreOptionsAria: string;
    voiceTranscript: string;
};

export const DEMO_UI: Record<UiLocale, DemoUiCopy> = {
    fr: {
        badge: 'Demonstration',
        disclaimer:
            'Exemple guide uniquement. Ceci n\'est pas un avis juridique ni une verification reelle.',
        signUpCta: 'Commencer',
        signInCta: 'Connexion',
        placeholder: 'Saisir un message',
        reset: 'Recommencer',
        examplesTitle: 'Exemples',
        assistantTyping: "L'assistant ecrit...",
        unavailableTitle: 'Demonstration indisponible',
        unavailableBody: 'Revenez plus tard ou creez un compte pour utiliser le chat.',
        backHome: 'Accueil',
        composeAria: 'Saisir un message',
        sendAria: 'Envoyer',
        demoDisclaimer: "L'IA peut faire des erreurs. Verifiez les informations importantes.",
        moreOptionsAria: "Plus d'options",
        voiceTranscript: 'Message vocal transcrit (demonstration).',
    },
    en: {
        badge: 'Demo',
        disclaimer: 'Guided example only. This is not legal advice or a real verification.',
        signUpCta: 'Get started',
        signInCta: 'Sign in',
        placeholder: 'Type a message',
        reset: 'Start over',
        examplesTitle: 'Examples',
        assistantTyping: 'Assistant is typing',
        unavailableTitle: 'Demo unavailable',
        unavailableBody: 'Come back later or create an account to use chat.',
        backHome: 'Home',
        composeAria: 'Type a message',
        sendAria: 'Send',
        demoDisclaimer: 'AI can make mistakes. Verify important information.',
        moreOptionsAria: 'More options',
        voiceTranscript: 'Voice message transcribed (demo).',
    },
};

export const DEMO_PAGE_META: Record<UiLocale, { title: string; description: string }> = {
    fr: {
        title: 'Demonstration',
        description: 'Essayez l\'interface de verification Afalambe avec des exemples guides.',
    },
    en: {
        title: 'Demo',
        description: 'Try the Afalambe verification interface with guided examples.',
    },
};

export function isDemoEnabled(): boolean {
    return process.env.NEXT_PUBLIC_DEMO_ENABLED !== 'false';
}
