type VerifyEmailTemplateArgs = {
    otpCode: string;
};

export function verifyEmailSubject(): string {
    return 'Vérifiez votre compte Afalambe';
}

export function verifyEmailHtml(args: VerifyEmailTemplateArgs): string {
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
  <h2>Vérifiez votre e-mail</h2>
  <p>Merci pour votre inscription. Saisissez ce code à usage unique pour vérifier votre e-mail :</p>
  <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em; margin: 12px 0;">${args.otpCode}</p>
  <p>Ce code expire dans 15 minutes.</p>
</div>
`.trim();
}

export function verifyEmailText(args: VerifyEmailTemplateArgs): string {
    return [
        'Vérifiez votre compte Afalambe',
        '',
        'Saisissez ce code à usage unique pour vérifier votre e-mail :',
        '',
        `Code : ${args.otpCode}`,
        '',
        'Ce code expire dans 15 minutes.',
    ].join('\n');
}
