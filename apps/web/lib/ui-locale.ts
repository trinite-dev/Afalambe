/**
 * UI locale (product chrome) — FR/EN per feat-0029.
 * Separate from claim language detection (feat-0014).
 */

import { z } from 'zod';
import { getUILabel, type SupportedLanguage } from './languages';

export type UiLocale = 'fr' | 'en';

export const UI_LOCALE_STORAGE_KEY = 'afalambe_locale';

export const UI_LOCALE_CHANGE_EVENT = 'afalambe:locale-change';

const UI_LOCALE_SET = new Set<string>(['fr', 'en']);

export function isUiLocale(value: string): value is UiLocale {
    return UI_LOCALE_SET.has(value);
}

export function resolveInitialUiLocale(): UiLocale {
    if (typeof window === 'undefined') return 'fr';

    const stored = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (stored && isUiLocale(stored)) return stored;

    const browser = navigator.language?.split('-')[0]?.toLowerCase();
    return browser === 'en' ? 'en' : 'fr';
}

export function getAlternateUiLocale(locale: UiLocale): UiLocale {
    return locale === 'fr' ? 'en' : 'fr';
}

export function getLocaleToggleAriaLabel(locale: UiLocale): string {
    return locale === 'fr' ? 'Switch to English' : 'Passer en francais';
}

export function persistUiLocale(locale: UiLocale): void {
    if (typeof window === 'undefined') return;

    const previous = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
    document.cookie = `${UI_LOCALE_STORAGE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`;
    if (previous !== locale) {
        window.dispatchEvent(
            new CustomEvent<UiLocale>(UI_LOCALE_CHANGE_EVENT, { detail: locale }),
        );
    }
}

/** Map UI locale to languages.ts keys (ff not used for chrome). */
export function uiLocaleToSupportedLanguage(locale: UiLocale): SupportedLanguage {
    return locale;
}

export function getChatUILabel(locale: UiLocale, key: string): string {
    return getUILabel(uiLocaleToSupportedLanguage(locale), key);
}

type AuthMessageSet = {
    emailLabel: string;
    passwordLabel: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    signIn: string;
    signUp: string;
    forgotPassword: string;
    createAccount: string;
    sendResetLink: string;
    loginFailed: string;
    signUpFailed: string;
    accountExistsTitle: string;
    accountExistsDescription: string;
    verificationEmailFailedTitle: string;
    verificationEmailFailedDescription: string;
    showPasswordAria: string;
    hidePasswordAria: string;
    passwordMin: (min: number) => string;
    passwordUppercase: string;
    passwordDigit: string;
    passwordHint: (min: number) => string;
};

export const AUTH_MESSAGES: Record<UiLocale, AuthMessageSet> = {
    fr: {
        emailLabel: 'Email',
        passwordLabel: 'Password',
        emailRequired: "L'e-mail est requis",
        emailInvalid: 'Saisissez une adresse e-mail valide',
        passwordRequired: 'Le mot de passe est requis',
        signIn: 'Se connecter',
        signUp: 'Se connecter',
        forgotPassword: 'Mot de passe oublie ?',
        createAccount: 'Creer un compte',
        sendResetLink: 'Envoyer le lien de reinitialisation',
        loginFailed: 'Connexion impossible',
        signUpFailed: 'Inscription impossible',
        accountExistsTitle: 'Compte deja existant',
        accountExistsDescription: 'Un compte existe deja pour cet e-mail. Connectez-vous plutot.',
        verificationEmailFailedTitle: 'E-mail de verification non envoye',
        verificationEmailFailedDescription:
            "Le compte est cree, mais l'envoi Resend a echoue. Verifiez EMAIL_FROM / le domaine Resend, puis renvoyez le code.",
        showPasswordAria: 'Afficher le mot de passe',
        hidePasswordAria: 'Masquer le mot de passe',
        passwordMin: (min) => `Le mot de passe doit contenir au moins ${min} caracteres`,
        passwordUppercase: 'Incluez au moins une lettre majuscule',
        passwordDigit: 'Incluez au moins un chiffre',
        passwordHint: (min) =>
            `Au moins ${min} caracteres, une lettre majuscule et un chiffre.`,
    },
    en: {
        emailLabel: 'Email',
        passwordLabel: 'Password',
        emailRequired: 'Email is required',
        emailInvalid: 'Enter a valid email address',
        passwordRequired: 'Password is required',
        signIn: 'Sign in',
        signUp: 'Sign in',
        forgotPassword: 'Forgot password?',
        createAccount: 'Create account',
        sendResetLink: 'Send reset link',
        loginFailed: 'Sign in failed',
        signUpFailed: 'Sign up failed',
        accountExistsTitle: 'Account already exists',
        accountExistsDescription: 'An account already exists for this email. Sign in instead.',
        verificationEmailFailedTitle: 'Verification email not sent',
        verificationEmailFailedDescription:
            'Your account was created, but Resend could not send the email. Check EMAIL_FROM / Resend domain, then resend the code.',
        showPasswordAria: 'Show password',
        hidePasswordAria: 'Hide password',
        passwordMin: (min) => `Password must be at least ${min} characters`,
        passwordUppercase: 'Include at least one uppercase letter',
        passwordDigit: 'Include at least one number',
        passwordHint: (min) =>
            `At least ${min} characters, one uppercase letter and one number.`,
    },
};

export function createSignInSchema(locale: UiLocale) {
    const m = AUTH_MESSAGES[locale];
    return z.object({
        email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
        password: z.string().min(1, m.passwordRequired),
    });
}

export function createSignUpSchema(locale: UiLocale, passwordMin = 8) {
    const m = AUTH_MESSAGES[locale];
    return z.object({
        email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
        password: z
            .string()
            .min(passwordMin, m.passwordMin(passwordMin))
            .regex(/[A-Z]/, m.passwordUppercase)
            .regex(/[0-9]/, m.passwordDigit),
    });
}

export const VERIFY_MESSAGES: Record<
    UiLocale,
    {
        missingEmailTitle: string;
        missingEmailDescription: string;
        verifiedTitle: string;
        verifiedDescription: string;
        verifyFailedTitle: string;
        resendSuccessTitle: string;
        resendSuccessDescription: string;
        resendFailedTitle: string;
        promptWithEmail: (email: string) => string;
        promptWithoutEmail: string;
        verifyButton: string;
        resendPrompt: string;
        resendButton: string;
    }
> = {
    fr: {
        missingEmailTitle: 'E-mail manquant',
        missingEmailDescription:
            "Ouvrez cette page depuis l'inscription pour verifier votre compte.",
        verifiedTitle: 'E-mail verifie',
        verifiedDescription: 'Votre compte est maintenant verifie.',
        verifyFailedTitle: 'Verification impossible',
        resendSuccessTitle: 'E-mail de verification envoye',
        resendSuccessDescription:
            'Consultez votre boite de reception pour un nouveau code a 6 chiffres.',
        resendFailedTitle: 'Renvoi de verification impossible',
        promptWithEmail: (email) => `Saisissez le code a 6 chiffres envoye a ${email}.`,
        promptWithoutEmail:
            "Aucun e-mail n'a ete fourni. Vous pouvez demander un nouveau code ci-dessous.",
        verifyButton: 'Verifier',
        resendPrompt: "Besoin d'un nouvel e-mail de verification ?",
        resendButton: 'Renvoyer',
    },
    en: {
        missingEmailTitle: 'Email missing',
        missingEmailDescription: 'Open this page from sign-up to verify your account.',
        verifiedTitle: 'Email verified',
        verifiedDescription: 'Your account is now verified.',
        verifyFailedTitle: 'Verification failed',
        resendSuccessTitle: 'Verification email sent',
        resendSuccessDescription: 'Check your inbox for a new 6-digit code.',
        resendFailedTitle: 'Could not resend verification',
        promptWithEmail: (email) => `Enter the 6-digit code sent to ${email}.`,
        promptWithoutEmail: 'No email was provided. You can request a new code below.',
        verifyButton: 'Verify',
        resendPrompt: 'Need a new verification email?',
        resendButton: 'Resend',
    },
};

export const RESET_PASSWORD_MESSAGES: Record<
    UiLocale,
    {
        passwordLabel: string;
        passwordMin: string;
        missingToken: string;
        invalidPassword: string;
        submit: string;
        successTitle: string;
        successDescription: string;
        errorTitle: string;
    }
> = {
    fr: {
        passwordLabel: 'Nouveau mot de passe',
        passwordMin: 'Le mot de passe doit contenir au moins 8 caracteres',
        missingToken: 'Jeton de reinitialisation manquant.',
        invalidPassword: 'Mot de passe invalide.',
        submit: 'Reinitialiser le mot de passe',
        successTitle: 'Mot de passe reinitialise',
        successDescription: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        errorTitle: 'Reinitialisation impossible',
    },
    en: {
        passwordLabel: 'New password',
        passwordMin: 'Password must be at least 8 characters',
        missingToken: 'Reset token is missing.',
        invalidPassword: 'Invalid password.',
        submit: 'Reset password',
        successTitle: 'Password reset',
        successDescription: 'You can now sign in with your new password.',
        errorTitle: 'Reset failed',
    },
};

export const CHAT_UI: Record<
    UiLocale,
    {
        subtitle: string;
        placeholder: string;
        clearConversations: string;
        theme: string;
        myAccount: string;
        signOut: string;
        today: string;
        localeLabel: string;
        sidebarFooter: string;
        offlineBanner: string;
        aiDisclaimer: string;
        retryFailed: string;
        copySuccess: string;
        copyFailed: string;
        adminQueue: string;
        feedbackThanks: string;
        assistantTyping: string;
        expandSidebarAria: string;
        collapseSidebarAria: string;
        newChat: string;
        searchChatsPlaceholder: string;
        chatHistoryAria: string;
        attachImageAria: string;
        startRecordingAria: string;
        stopRecordingAria: string;
        recordingPlaceholder: string;
        composeAria: string;
        sendAria: string;
        removeAttachmentAria: string;
        copyAria: string;
        regenerateAria: string;
        thumbsUpAria: string;
        thumbsDownAria: string;
        moreOptionsAria: string;
        uploadedEvidenceAlt: string;
        outboxFailedSummary: (count: number) => string;
    }
> = {
    fr: {
        subtitle: 'Assistant de verification',
        placeholder: 'Saisir un message',
        clearConversations: 'Effacer les conversations',
        theme: 'Theme',
        myAccount: 'Mon compte',
        signOut: 'Se deconnecter',
        today: "Aujourd'hui",
        localeLabel: 'Langue',
        sidebarFooter: 'Votre chat est prive et lie a votre compte connecte.',
        offlineBanner:
            'Vous etes hors ligne. Les messages seront envoyes automatiquement a la reconnexion.',
        aiDisclaimer: "L'IA peut faire des erreurs. Verifiez les informations importantes.",
        retryFailed: 'Reessayer',
        copySuccess: 'Copie dans le presse-papiers',
        copyFailed: 'Impossible de copier dans le presse-papiers.',
        adminQueue: 'File de verification',
        feedbackThanks: 'Merci pour votre retour.',
        assistantTyping: "L'assistant ecrit...",
        expandSidebarAria: 'Developper la barre laterale',
        collapseSidebarAria: 'Reduire la barre laterale',
        newChat: 'Nouveau chat',
        searchChatsPlaceholder: 'Rechercher des chats',
        chatHistoryAria: 'Historique des chats',
        attachImageAria: 'Joindre une image',
        startRecordingAria: 'Enregistrer',
        stopRecordingAria: 'Arreter',
        recordingPlaceholder: 'Enregistrement en cours...',
        composeAria: 'Saisir un message',
        sendAria: 'Envoyer',
        removeAttachmentAria: 'Retirer',
        copyAria: 'Copier',
        regenerateAria: 'Regenerer',
        thumbsUpAria: 'Bonne reponse',
        thumbsDownAria: 'Mauvaise reponse',
        moreOptionsAria: "Plus d'options",
        uploadedEvidenceAlt: 'Preuve televersee',
        outboxFailedSummary: (count) =>
            `${count} message${count > 1 ? 's' : ''} non envoy${count > 1 ? 'es' : 'e'}`,
    },
    en: {
        subtitle: 'Fact-checking assistant',
        placeholder: 'Type a message',
        clearConversations: 'Clear conversations',
        theme: 'Theme',
        myAccount: 'My account',
        signOut: 'Sign out',
        today: 'Today',
        localeLabel: 'Language',
        sidebarFooter: 'Your chat is private and tied to your signed-in account.',
        offlineBanner: 'You are offline. Messages will send automatically when you reconnect.',
        aiDisclaimer: 'AI can make mistakes. Verify important information.',
        retryFailed: 'Retry',
        copySuccess: 'Copied to clipboard',
        copyFailed: 'Could not copy to clipboard.',
        adminQueue: 'Review queue',
        feedbackThanks: 'Thanks for your feedback.',
        assistantTyping: 'Assistant is typing',
        expandSidebarAria: 'Expand sidebar',
        collapseSidebarAria: 'Collapse sidebar',
        newChat: 'New chat',
        searchChatsPlaceholder: 'Search chats',
        chatHistoryAria: 'Chat history',
        attachImageAria: 'Attach image',
        startRecordingAria: 'Record',
        stopRecordingAria: 'Stop',
        recordingPlaceholder: 'Recording...',
        composeAria: 'Type a message',
        sendAria: 'Send',
        removeAttachmentAria: 'Remove',
        copyAria: 'Copy',
        regenerateAria: 'Regenerate',
        thumbsUpAria: 'Good response',
        thumbsDownAria: 'Bad response',
        moreOptionsAria: 'More options',
        uploadedEvidenceAlt: 'Uploaded evidence',
        outboxFailedSummary: (count) =>
            `${count} message${count === 1 ? '' : 's'} not sent`,
    },
};

export type AuthPageKey =
    | 'signIn'
    | 'signUp'
    | 'verifyEmail'
    | 'forgotPassword'
    | 'resetPassword';

type AuthPageCopy = {
    title: string;
    description: string;
    metadataTitle: string;
    metadataDescription: string;
};

export const AUTH_PAGES: Record<UiLocale, Record<AuthPageKey, AuthPageCopy>> = {
    fr: {
        signIn: {
            title: 'Connexion',
            description: 'Saisissez vos identifiants pour continuer.',
            metadataTitle: 'Connexion',
            metadataDescription: 'Connectez-vous a Afalambe.',
        },
        signUp: {
            title: 'Creez votre compte',
            description: 'Commencez a verifier des dossiers dans votre langue.',
            metadataTitle: 'Inscription',
            metadataDescription: 'Creez un compte Afalambe.',
        },
        verifyEmail: {
            title: 'Verification de votre e-mail',
            description: 'Une derniere etape avant de commencer.',
            metadataTitle: 'Verification de votre e-mail',
            metadataDescription: 'Verifiez votre e-mail pour continuer.',
        },
        forgotPassword: {
            title: 'Mot de passe oublie',
            description: 'Saisissez votre e-mail et nous enverrons un lien de reinitialisation.',
            metadataTitle: 'Mot de passe oublie',
            metadataDescription: 'Demander un lien de reinitialisation du mot de passe.',
        },
        resetPassword: {
            title: 'Reinitialiser le mot de passe',
            description: 'Choisissez un nouveau mot de passe pour votre compte.',
            metadataTitle: 'Reinitialiser le mot de passe',
            metadataDescription: 'Definir un nouveau mot de passe de compte.',
        },
    },
    en: {
        signIn: {
            title: 'Sign in',
            description: 'Enter your credentials to continue.',
            metadataTitle: 'Sign in',
            metadataDescription: 'Sign in to Afalambe.',
        },
        signUp: {
            title: 'Create your account',
            description: 'Start verifying claims in your language.',
            metadataTitle: 'Sign up',
            metadataDescription: 'Create an Afalambe account.',
        },
        verifyEmail: {
            title: 'Verify your email',
            description: 'One last step before you get started.',
            metadataTitle: 'Verify your email',
            metadataDescription: 'Verify your email to continue.',
        },
        forgotPassword: {
            title: 'Forgot password',
            description: 'Enter your email and we will send a reset link.',
            metadataTitle: 'Forgot password',
            metadataDescription: 'Request a password reset link.',
        },
        resetPassword: {
            title: 'Reset password',
            description: 'Choose a new password for your account.',
            metadataTitle: 'Reset password',
            metadataDescription: 'Set a new account password.',
        },
    },
};

export const AUTH_FOOTER: Record<
    UiLocale,
    {
        signInPrompt: string;
        signInLink: string;
        signUpPrompt: string;
        signUpLink: string;
        backToSignIn: string;
        backToSignUp: string;
    }
> = {
    fr: {
        signInPrompt: "Vous n'avez pas de compte ?",
        signInLink: 'Inscription',
        signUpPrompt: 'Vous avez deja un compte ?',
        signUpLink: 'Connexion',
        backToSignIn: 'Retour a la connexion',
        backToSignUp: "Retour a l'inscription",
    },
    en: {
        signInPrompt: "Don't have an account?",
        signInLink: 'Sign up',
        signUpPrompt: 'Already have an account?',
        signUpLink: 'Sign in',
        backToSignIn: 'Back to sign in',
        backToSignUp: 'Back to sign up',
    },
};

export const REQUEST_RESET_MESSAGES: Record<
    UiLocale,
    {
        successTitle: string;
        successDescription: string;
        errorTitle: string;
    }
> = {
    fr: {
        successTitle: 'Verifiez votre e-mail',
        successDescription: 'Si le compte existe, un lien de reinitialisation a ete envoye.',
        errorTitle: 'Demande de reinitialisation impossible',
    },
    en: {
        successTitle: 'Check your email',
        successDescription: 'If the account exists, a reset link has been sent.',
        errorTitle: 'Reset request failed',
    },
};

export const CHAT_TOASTS: Record<
    UiLocale,
    {
        imageRejected: string;
        nothingToSend: string;
        nothingToSendDescription: string;
        sendFailed: string;
        feedbackFailed: string;
        regenerateFailed: string;
        selectionCleared: string;
        selectionClearedDescription: string;
        uploadFailed: string;
        untitledThread: string;
        imageAttachment: string;
        imageOnlyClaim: string;
        audioReadFailed: string;
        audioEncodeFailed: string;
        recordingTooLarge: (maxMb: number) => string;
    }
> = {
    fr: {
        imageRejected: 'Image refusee',
        nothingToSend: 'Rien a envoyer',
        nothingToSendDescription: 'Saisissez votre dossier ou votre question avant envoi.',
        sendFailed: 'Envoi du message impossible',
        feedbackFailed: "Impossible d'enregistrer le retour",
        regenerateFailed: 'Regeneration de la reponse impossible',
        selectionCleared: 'Selection effacee',
        selectionClearedDescription: 'Choisissez un fil existant ou demarrez-en un nouveau.',
        uploadFailed: "Echec de l'envoi d'un fichier.",
        untitledThread: 'Conversation sans titre',
        imageAttachment: '(image jointe)',
        imageOnlyClaim: 'Image',
        audioReadFailed: 'Lecture audio impossible.',
        audioEncodeFailed: 'Encodage audio invalide.',
        recordingTooLarge: (maxMb) =>
            `L'enregistrement depasse la taille maximale de ${maxMb} Mo.`,
    },
    en: {
        imageRejected: 'Image rejected',
        nothingToSend: 'Nothing to send',
        nothingToSendDescription: 'Enter your claim or question before sending.',
        sendFailed: 'Could not send message',
        feedbackFailed: 'Could not save feedback',
        regenerateFailed: 'Could not regenerate response',
        selectionCleared: 'Selection cleared',
        selectionClearedDescription: 'Choose an existing thread or start a new one.',
        uploadFailed: 'File upload failed.',
        untitledThread: 'Untitled conversation',
        imageAttachment: '(image attached)',
        imageOnlyClaim: 'Image',
        audioReadFailed: 'Could not read audio.',
        audioEncodeFailed: 'Invalid audio encoding.',
        recordingTooLarge: (maxMb) =>
            `Recording exceeds the maximum file size of ${maxMb} MB.`,
    },
};

export const CHAT_HOME_UI: Record<
    UiLocale,
    {
        examples: string;
        capabilities: string;
        limitations: string;
        capabilityLines: string[];
        limitationLines: string[];
    }
> = {
    fr: {
        examples: 'Exemples',
        capabilities: 'Capacites',
        limitations: 'Limites',
        capabilityLines: [
            'Conserve les echanges precedents de cette session pour le contexte',
            'Envoie les dossiers incertains en verification humaine si necessaire',
            'Accepte du texte en plusieurs langues, y compris le fula et le peul',
            'Appuie les reponses sur des sources selectionnees quand la confiance est elevee',
        ],
        limitationLines: [
            'Peut manquer des nuances si le dossier manque de details',
            "Ne remplace pas un avis juridique, medical ou administratif officiel",
            "Ne parcourt pas le web ouvert comme un moteur de recherche generaliste",
            "Les reponses peuvent etre retardees lors d'un trafic eleve",
        ],
    },
    en: {
        examples: 'Examples',
        capabilities: 'Capabilities',
        limitations: 'Limitations',
        capabilityLines: [
            'Keeps prior messages in this session for context',
            'Escalates uncertain claims to human review when needed',
            'Accepts text in multiple languages, including Fula and Peul',
            'Grounds answers in selected sources when confidence is high',
        ],
        limitationLines: [
            'May miss nuance if the claim lacks detail',
            'Does not replace official legal, medical, or administrative advice',
            'Does not browse the open web like a general search engine',
            'Responses may be delayed during high traffic',
        ],
    },
};

export const CHAT_CLAIM_LABELS: Record<
    UiLocale,
    {
        source: string;
        platform: string;
        topic: string;
        location: string;
        language: string;
    }
> = {
    fr: {
        source: 'Source',
        platform: 'Plateforme',
        topic: 'Sujet',
        location: 'Lieu',
        language: 'Langue',
    },
    en: {
        source: 'Source',
        platform: 'Platform',
        topic: 'Topic',
        location: 'Location',
        language: 'Language',
    },
};

export const SOURCE_PREVIEW_UI: Record<
    UiLocale,
    {
        image: string;
        video: string;
        audio: string;
        link: string;
        openSource: string;
    }
> = {
    fr: {
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        link: 'Lien',
        openSource: 'Ouvrir la source',
    },
    en: {
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        link: 'Link',
        openSource: 'Open source',
    },
};

export const IMAGE_VALIDATION_MESSAGES: Record<
    UiLocale,
    {
        heicUnsupported: string;
        formatUnsupported: string;
        fileTooLarge: string;
        maxPerMessage: string;
        dimensionsTooLarge: string;
        unreadable: string;
    }
> = {
    fr: {
        heicUnsupported: 'Format HEIC non pris en charge. Utilisez PNG, JPEG ou WebP.',
        formatUnsupported: 'Format non pris en charge. Utilisez PNG, JPEG ou WebP.',
        fileTooLarge: "L'image depasse la taille maximale de 5 Mo.",
        maxPerMessage: 'Maximum 4 images par message.',
        dimensionsTooLarge: "L'image est trop grande. Maximum 4096x4096 pixels.",
        unreadable: "Impossible de lire l'image.",
    },
    en: {
        heicUnsupported: 'HEIC format is not supported. Use PNG, JPEG, or WebP.',
        formatUnsupported: 'Unsupported format. Use PNG, JPEG, or WebP.',
        fileTooLarge: 'Image exceeds the maximum size of 5 MB.',
        maxPerMessage: 'Maximum 4 images per message.',
        dimensionsTooLarge: 'Image is too large. Maximum 4096x4096 pixels.',
        unreadable: 'Could not read the image.',
    },
};

export const COMMON_UI: Record<
    UiLocale,
    {
        loading: string;
        back: string;
        themeLightAria: string;
        themeDarkAria: string;
    }
> = {
    fr: {
        loading: 'Chargement...',
        back: 'Retour',
        themeLightAria: 'Passer en mode clair',
        themeDarkAria: 'Passer en mode sombre',
    },
    en: {
        loading: 'Loading...',
        back: 'Back',
        themeLightAria: 'Switch to light mode',
        themeDarkAria: 'Switch to dark mode',
    },
};

export const ADMIN_UI: Record<
    UiLocale,
    {
        queueTitle: string;
        queueSubtitle: (count: number) => string;
        backToChat: string;
        statusLabel: string;
        allStatuses: string;
        searchLabel: string;
        searchPlaceholder: string;
        filterButton: string;
        claimColumn: string;
        statusColumn: string;
        verdictColumn: string;
        languageColumn: string;
        userColumn: string;
        updatedColumn: string;
        openButton: string;
        noResults: string;
        untitled: string;
        auditTitle: string;
        auditDate: string;
        auditActor: string;
        auditAction: string;
        auditTarget: string;
        noAuditEntries: string;
        detailTitle: string;
        backToQueue: string;
        userLabel: string;
        statusField: string;
        verdictField: string;
        languageField: string;
        topicField: string;
        platformField: string;
        messageThread: string;
        resolveTitle: string;
        newStatus: string;
        verdictSelect: string;
        resolutionNote: string;
        resolutionPlaceholder: string;
        saveResolution: string;
        claimUpdated: string;
        claimUpdatedDescription: string;
        updateFailed: string;
    }
> = {
    fr: {
        queueTitle: 'File de verification',
        queueSubtitle: (count) => `${count} dossier(s) en attente ou en cours`,
        backToChat: 'Retour au chat',
        statusLabel: 'Statut',
        allStatuses: 'Tous',
        searchLabel: 'Recherche',
        searchPlaceholder: 'Titre ou texte du dossier',
        filterButton: 'Filtrer',
        claimColumn: 'Dossier',
        statusColumn: 'Statut',
        verdictColumn: 'Verdict',
        languageColumn: 'Langue',
        userColumn: 'Utilisateur',
        updatedColumn: 'Mis a jour',
        openButton: 'Ouvrir',
        noResults: 'Aucun dossier ne correspond aux filtres.',
        untitled: 'Sans titre',
        auditTitle: "Journal d'audit recent",
        auditDate: 'Date',
        auditActor: 'Acteur',
        auditAction: 'Action',
        auditTarget: 'Cible',
        noAuditEntries: "Aucune entree d'audit.",
        detailTitle: 'Detail du dossier',
        backToQueue: 'Retour a la file',
        userLabel: 'Utilisateur',
        statusField: 'Statut',
        verdictField: 'Verdict',
        languageField: 'Langue',
        topicField: 'Sujet',
        platformField: 'Plateforme',
        messageThread: 'Fil de messages',
        resolveTitle: 'Resoudre le dossier',
        newStatus: 'Nouveau statut',
        verdictSelect: 'Verdict',
        resolutionNote: 'Note de resolution',
        resolutionPlaceholder: 'Expliquez la decision du relecteur...',
        saveResolution: 'Enregistrer la resolution',
        claimUpdated: 'Dossier mis a jour',
        claimUpdatedDescription: 'La resolution a ete enregistree.',
        updateFailed: 'Mise a jour impossible',
    },
    en: {
        queueTitle: 'Review queue',
        queueSubtitle: (count) => `${count} claim(s) pending or in progress`,
        backToChat: 'Back to chat',
        statusLabel: 'Status',
        allStatuses: 'All',
        searchLabel: 'Search',
        searchPlaceholder: 'Claim title or text',
        filterButton: 'Filter',
        claimColumn: 'Claim',
        statusColumn: 'Status',
        verdictColumn: 'Verdict',
        languageColumn: 'Language',
        userColumn: 'User',
        updatedColumn: 'Updated',
        openButton: 'Open',
        noResults: 'No claims match the filters.',
        untitled: 'Untitled',
        auditTitle: 'Recent audit log',
        auditDate: 'Date',
        auditActor: 'Actor',
        auditAction: 'Action',
        auditTarget: 'Target',
        noAuditEntries: 'No audit entries.',
        detailTitle: 'Claim detail',
        backToQueue: 'Back to queue',
        userLabel: 'User',
        statusField: 'Status',
        verdictField: 'Verdict',
        languageField: 'Language',
        topicField: 'Topic',
        platformField: 'Platform',
        messageThread: 'Message thread',
        resolveTitle: 'Resolve claim',
        newStatus: 'New status',
        verdictSelect: 'Verdict',
        resolutionNote: 'Resolution note',
        resolutionPlaceholder: 'Explain the reviewer decision...',
        saveResolution: 'Save resolution',
        claimUpdated: 'Claim updated',
        claimUpdatedDescription: 'The resolution has been saved.',
        updateFailed: 'Update failed',
    },
};

export const ADMIN_PAGE_META: Record<UiLocale, { queue: string; claimDetail: string }> = {
    fr: {
        queue: 'File de verification',
        claimDetail: 'Detail du dossier',
    },
    en: {
        queue: 'Review queue',
        claimDetail: 'Claim detail',
    },
};

export const LEGAL_DOCUMENT_UI: Record<
    UiLocale,
    {
        lastUpdated: string;
        draftNotice: string;
        backHome: string;
    }
> = {
    fr: {
        lastUpdated: 'Derniere mise a jour :',
        draftNotice:
            'Ce document est un brouillon produit destine a etre remplace par un texte juridique valide avant la mise en production.',
        backHome: "Retour a l'accueil",
    },
    en: {
        lastUpdated: 'Last updated:',
        draftNotice:
            'This document is a product draft intended to be replaced by validated legal text before production launch.',
        backHome: 'Back to home',
    },
};

export const LEGAL_PAGE_META: Record<
    UiLocale,
    {
        privacy: { title: string; description: string };
        terms: { title: string; description: string };
    }
> = {
    fr: {
        privacy: {
            title: 'Confidentialite',
            description: 'Politique de confidentialite Afalambe.',
        },
        terms: {
            title: "Conditions d'utilisation",
            description: "Conditions d'utilisation Afalambe.",
        },
    },
    en: {
        privacy: {
            title: 'Privacy',
            description: 'Afalambe privacy policy.',
        },
        terms: {
            title: 'Terms of use',
            description: 'Afalambe terms of use.',
        },
    },
};

export const CHAT_PAGE_META: Record<UiLocale, { title: string; description: string }> = {
    fr: {
        title: 'Chat',
        description: 'Assistant de verification des dossiers Afalambe.',
    },
    en: {
        title: 'Chat',
        description: 'Afalambe fact-checking assistant for your claims.',
    },
};

export const SYSTEM_UI: Record<
    UiLocale,
    {
        notFoundCode: string;
        notFoundTitle: string;
        notFoundDescription: (siteName: string) => string;
        backHome: string;
        errorTitle: string;
        errorDescription: (siteName: string) => string;
        tryAgain: string;
        referenceLabel: string;
    }
> = {
    fr: {
        notFoundCode: '404',
        notFoundTitle: 'Page introuvable',
        notFoundDescription: (siteName) =>
            `La page demandee n'existe pas sur ${siteName}.`,
        backHome: "Retour a l'accueil",
        errorTitle: 'Une erreur est survenue',
        errorDescription: (siteName) =>
            `${siteName} a rencontre une erreur inattendue. Vous pouvez reessayer ou revenir a l'accueil.`,
        tryAgain: 'Reessayer',
        referenceLabel: 'Reference',
    },
    en: {
        notFoundCode: '404',
        notFoundTitle: 'Page not found',
        notFoundDescription: (siteName) =>
            `The page you requested does not exist on ${siteName}.`,
        backHome: 'Back to home',
        errorTitle: 'Something went wrong',
        errorDescription: (siteName) =>
            `${siteName} hit an unexpected error. You can try again or return home.`,
        tryAgain: 'Try again',
        referenceLabel: 'Reference',
    },
};

export const API_ERRORS: Record<
    UiLocale,
    {
        generic: string;
        unexpected: string;
        requestFailedTitle: string;
    }
> = {
    fr: {
        generic: 'Une erreur est survenue.',
        unexpected: 'Une erreur inattendue est survenue.',
        requestFailedTitle: 'Requete echouee',
    },
    en: {
        generic: 'An error occurred.',
        unexpected: 'An unexpected error occurred.',
        requestFailedTitle: 'Request failed',
    },
};
