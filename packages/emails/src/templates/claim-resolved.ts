type ClaimResolvedTemplateArgs = {
    claimId: string;
};

export function claimResolvedSubject(): string {
    return 'Votre dossier a été résolu';
}

export function claimResolvedHtml(args: ClaimResolvedTemplateArgs): string {
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2>Dossier résolu</h2>
  <p>L’examen de votre dossier est terminé.</p>
  <p>ID du dossier : <strong>${args.claimId}</strong></p>
  <p>Ouvrez le chat pour voir les détails de la résolution.</p>
</div>
`.trim();
}

export function claimResolvedText(args: ClaimResolvedTemplateArgs): string {
    return [
        'Votre dossier a été résolu.',
        '',
        `ID du dossier : ${args.claimId}`,
        '',
        'Ouvrez le chat pour voir les détails de la résolution.',
    ].join('\n');
}
