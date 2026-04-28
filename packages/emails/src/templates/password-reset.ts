type PasswordResetTemplateArgs = {
    resetUrl: string;
};

export function passwordResetSubject(): string {
    return 'Réinitialisez votre mot de passe Afalambe';
}

export function passwordResetHtml(args: PasswordResetTemplateArgs): string {
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2>Demande de réinitialisation du mot de passe</h2>
  <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
  <p><a href="${args.resetUrl}" style="display:inline-block;padding:10px 16px;background:#9B1B30;color:#fff;text-decoration:none;border-radius:6px;">Réinitialiser le mot de passe</a></p>
  <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
  <p>Si le bouton ne fonctionne pas, copiez ce lien :</p>
  <p>${args.resetUrl}</p>
</div>
`.trim();
}

export function passwordResetText(args: PasswordResetTemplateArgs): string {
    return [
        'Réinitialisez votre mot de passe Afalambe',
        '',
        'Nous avons reçu une demande de réinitialisation de votre mot de passe.',
        '',
        `Lien de réinitialisation : ${args.resetUrl}`,
        '',
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    ].join('\n');
}
