import type { LegalSection } from '@/components/legal-document';
import type { UiLocale } from '@/lib/ui-locale';

export type LegalPageContent = {
    title: string;
    updatedAt: string;
    intro: string;
    sections: LegalSection[];
};

export function getPrivacyContent(locale: UiLocale): LegalPageContent {
    if (locale === 'en') {
        return {
            title: 'Privacy policy',
            updatedAt: '19 May 2026',
            intro: 'Afalambe helps users verify claims and counter misinformation. This policy describes what data we collect and how we use it.',
            sections: [
                {
                    title: 'Data we collect',
                    paragraphs: [
                        'We collect account information (email address, hashed password) required for authentication.',
                        'Verification claims, chat messages, claim metadata, and attachments you submit are stored to provide the service.',
                        'We record limited technical logs (timestamps, errors, email delivery) for security and support.',
                    ],
                },
                {
                    title: 'How we use data',
                    paragraphs: [
                        'Your claims are used to display chat history, run AI analysis, and, when needed, route a claim to human review.',
                        'Transactional emails (verification, password reset, claim notifications) are sent via our provider Resend.',
                        'We do not sell your personal data to third parties.',
                    ],
                },
                {
                    title: 'Retention and deletion',
                    paragraphs: [
                        'Account and claim data are retained while your account is active or as required by applicable law.',
                        'You may request account deletion by contacting the Afalambe team.',
                    ],
                },
                {
                    title: 'Subprocessors',
                    paragraphs: [
                        'We use third-party hosting and services (database, file storage, email delivery, AI models) that process data only on our behalf under contractual agreements.',
                    ],
                },
                {
                    title: 'Contact',
                    paragraphs: [
                        'For privacy questions, contact the Afalambe team using the details published on the site.',
                    ],
                },
            ],
        };
    }

    return {
        title: 'Politique de confidentialite',
        updatedAt: '19 mai 2026',
        intro: 'Afalambe aide les utilisateurs a verifier des affirmations et a lutter contre la desinformation. Cette politique decrit quelles donnees nous collectons et comment nous les utilisons.',
        sections: [
            {
                title: 'Donnees collectees',
                paragraphs: [
                    'Nous collectons les informations de compte (adresse e-mail, mot de passe hache) necessaires a l authentification.',
                    'Les dossiers de verification, messages de chat, metadonnees de claim et pieces jointes que vous soumettez sont stockes pour fournir le service.',
                    'Nous enregistrons des journaux techniques limites (horodatage, erreurs, livraison d e-mails) pour la securite et le support.',
                ],
            },
            {
                title: 'Utilisation des donnees',
                paragraphs: [
                    'Vos dossiers sont utilises pour afficher l historique de chat, executer l analyse IA et, le cas echeant, transmettre un dossier a une verification humaine.',
                    'Les e-mails transactionnels (verification, reinitialisation de mot de passe, notifications de dossier) sont envoyes via notre fournisseur Resend.',
                    'Nous ne vendons pas vos donnees personnelles a des tiers.',
                ],
            },
            {
                title: 'Conservation et suppression',
                paragraphs: [
                    'Les donnees de compte et de dossier sont conservees tant que votre compte est actif ou selon les obligations legales applicables.',
                    'Vous pouvez demander la suppression de votre compte en contactant l equipe Afalambe.',
                ],
            },
            {
                title: 'Sous-traitants',
                paragraphs: [
                    'Nous utilisons des hebergeurs et services tiers (base de donnees, stockage de fichiers, envoi d e-mails, modeles IA) qui traitent les donnees uniquement pour notre compte et selon des accords contractuels.',
                ],
            },
            {
                title: 'Contact',
                paragraphs: [
                    'Pour toute question relative a la confidentialite, contactez l equipe Afalambe via les coordonnees publiees sur le site.',
                ],
            },
        ],
    };
}

export function getTermsContent(locale: UiLocale): LegalPageContent {
    if (locale === 'en') {
        return {
            title: 'Terms of use',
            updatedAt: '19 May 2026',
            intro: 'By using Afalambe, you accept the terms below. The service provides fact-checking assistance and does not replace professional advice.',
            sections: [
                {
                    title: 'Service description',
                    paragraphs: [
                        'Afalambe lets you submit claims, screenshots, or context to obtain AI-assisted analysis and, when needed, human review.',
                        'Responses may be incomplete or incorrect. You must verify important information with official sources.',
                    ],
                },
                {
                    title: 'User account',
                    paragraphs: [
                        'You are responsible for keeping your credentials confidential and for activity on your account.',
                        'You agree to provide a valid email address and keep your information up to date.',
                    ],
                },
                {
                    title: 'Submitted content',
                    paragraphs: [
                        'You retain rights to content you submit. You grant us a limited license to process, store, and analyze that content to provide the service.',
                        'You may not submit illegal, harassing content or content that infringes third-party rights.',
                    ],
                },
                {
                    title: 'Limitation of liability',
                    paragraphs: [
                        'The service is provided as is. Afalambe does not guarantee the accuracy, completeness, or suitability of analyses for legal, medical, or financial use.',
                        'To the extent permitted by law, Afalambe is not liable for indirect damages resulting from use of the service.',
                    ],
                },
                {
                    title: 'Changes',
                    paragraphs: [
                        'We may update these terms. The last updated date will be shown at the top of this page.',
                    ],
                },
            ],
        };
    }

    return {
        title: 'Conditions d utilisation',
        updatedAt: '19 mai 2026',
        intro: 'En utilisant Afalambe, vous acceptez les conditions ci-dessous. Le service fournit une assistance de verification des faits et ne remplace pas un avis professionnel.',
        sections: [
            {
                title: 'Description du service',
                paragraphs: [
                    'Afalambe permet de soumettre des affirmations, des captures ou du contexte afin d obtenir une analyse assistee par IA et, si necessaire, un examen humain.',
                    'Les reponses peuvent etre incompletes ou incorrectes. Vous devez verifier les informations importantes aupres de sources officielles.',
                ],
            },
            {
                title: 'Compte utilisateur',
                paragraphs: [
                    'Vous etes responsable de la confidentialite de vos identifiants et de l activite realisee depuis votre compte.',
                    'Vous vous engagez a fournir une adresse e-mail valide et a maintenir vos informations a jour.',
                ],
            },
            {
                title: 'Contenu soumis',
                paragraphs: [
                    'Vous conservez vos droits sur le contenu que vous soumettez. Vous nous accordez une licence limitee pour traiter, stocker et analyser ce contenu afin de fournir le service.',
                    'Il est interdit de soumettre du contenu illegal, harcelant ou portant atteinte aux droits de tiers.',
                ],
            },
            {
                title: 'Limitation de responsabilite',
                paragraphs: [
                    'Le service est fourni en l etat. Afalambe ne garantit pas l exactitude, l exhaustivite ou l adequation des analyses a un usage juridique, medical ou financier.',
                    'Dans les limites permises par la loi, Afalambe n est pas responsable des dommages indirects resultant de l utilisation du service.',
                ],
            },
            {
                title: 'Modifications',
                paragraphs: [
                    'Nous pouvons mettre a jour ces conditions. La date de derniere mise a jour sera indiquee en haut de la page.',
                ],
            },
        ],
    };
}
