type ClaimQueuedTemplateArgs = {
    claimId: string;
};

export function claimQueuedSubject(): string {
    return 'Votre dossier est en file d’attente pour examen';
}

export function claimQueuedHtml(args: ClaimQueuedTemplateArgs): string {
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2>Dossier en attente</h2>
  <p>Votre dossier est dans la file d’attente de vérification humaine.</p>
  <p>ID du dossier : <strong>${args.claimId}</strong></p>
  <p>Nous vous informerons dès qu’une résolution sera disponible.</p>
</div>
`.trim();
}

export function claimQueuedText(args: ClaimQueuedTemplateArgs): string {
    return [
        'Votre dossier est en file d’attente pour examen.',
        '',
        `ID du dossier : ${args.claimId}`,
        '',
        'Nous vous informerons dès qu’une résolution sera disponible.',
    ].join('\n');
}
