'use client';

import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@afalambe/ui/components/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@afalambe/ui/components/input-otp';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { trpc } from '@/lib/trpc';

export type VerifyEmailFormProps = {
    email: string | null;
};

const OTP_LENGTH = 6;

export function VerifyEmailForm({ email }: VerifyEmailFormProps): ReactElement {
    const router = useRouter();
    const verifyMutation = trpc.auth.verifyEmail.useMutation();
    const resendMutation = trpc.auth.resendVerification.useMutation();
    const [otp, setOtp] = useState('');

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!email) {
                notifyApiError({
                    title: 'E-mail manquant',
                    description: "Ouvrez cette page depuis l'inscription pour verifier votre compte.",
                });
                return;
            }
            verifyMutation.mutate(
                { email, otpCode: otp },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: 'E-mail verifie',
                            description: 'Votre compte est maintenant verifie.',
                        });
                        router.push('/chat');
                    },
                    onError: (error) => {
                        notifyApiError({
                            title: 'Verification impossible',
                            description: error.message,
                        });
                    },
                },
            );
        },
        [email, otp, router, verifyMutation],
    );

    const handleResend = useCallback(() => {
        if (resendMutation.isPending) return;
        resendMutation.mutate(undefined, {
            onSuccess: () => {
                notifyApiInfo({
                    title: 'E-mail de verification envoye',
                    description: 'Consultez votre boite de reception pour un nouveau code a 6 chiffres.',
                });
            },
            onError: (error) => {
                notifyApiError({
                    title: 'Renvoi de verification impossible',
                    description: error.message,
                });
            },
        });
    }, [resendMutation]);

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6">
            <p className="text-center text-[length:0.875rem] leading-relaxed text-[var(--lp-fg-muted)]">
                {email
                    ? `Saisissez le code a 6 chiffres envoye a ${email}.`
                    : "Aucun e-mail n'a ete fourni. Vous pouvez demander un nouveau code ci-dessous."}
            </p>

            <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp}>
                <InputOTPGroup size="lg">
                    {Array.from({ length: OTP_LENGTH }, (_, i) => (
                        <InputOTPSlot key={i} index={i} />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            <Button type="submit" loading={verifyMutation.isPending} disabled={otp.length !== OTP_LENGTH} className="w-full">
                <ShieldCheck className="size-4 opacity-90" />
                Verifier
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[length:0.8125rem] text-[var(--lp-fg-muted)]">
                <span>Besoin d&apos;un nouvel e-mail de verification ?</span>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    loading={resendMutation.isPending}
                    onClick={handleResend}
                    className="inline-flex h-auto min-h-0 gap-1.5 px-1 py-0 text-[var(--lp-accent)]"
                >
                    <RefreshCw className="size-3.5 shrink-0" />
                    Renvoyer
                </Button>
            </div>
        </form>
    );
}
