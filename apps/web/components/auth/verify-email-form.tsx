'use client';

import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@afalambe/ui/components/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@afalambe/ui/components/input-otp';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { VERIFY_MESSAGES } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

export type VerifyEmailFormProps = {
    email: string | null;
};

const OTP_LENGTH = 6;

export function VerifyEmailForm({ email }: VerifyEmailFormProps): ReactElement {
    const { push } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const messages = VERIFY_MESSAGES[locale];
    const verifyMutation = trpc.auth.verifyEmail.useMutation();
    const resendMutation = trpc.auth.resendVerification.useMutation();
    const [otp, setOtp] = useState('');

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!email) {
                notifyApiError({
                    title: messages.missingEmailTitle,
                    description: messages.missingEmailDescription,
                });
                return;
            }
            verifyMutation.mutate(
                { email, otpCode: otp },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: messages.verifiedTitle,
                            description: messages.verifiedDescription,
                        });
                        push('/chat');
                    },
                    onError: (error) => {
                        notifyApiError({
                            title: messages.verifyFailedTitle,
                            description: error.message,
                        });
                    },
                },
            );
        },
        [email, messages, otp, push, verifyMutation],
    );

    const handleResend = useCallback(() => {
        if (resendMutation.isPending) return;
        resendMutation.mutate(undefined, {
            onSuccess: () => {
                notifyApiInfo({
                    title: messages.resendSuccessTitle,
                    description: messages.resendSuccessDescription,
                });
            },
            onError: (error) => {
                notifyApiError({
                    title: messages.resendFailedTitle,
                    description: error.message,
                });
            },
        });
    }, [messages, resendMutation]);

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6">
            <p className="text-center text-[length:0.875rem] leading-relaxed text-[var(--lp-fg-muted)]">
                {email ? messages.promptWithEmail(email) : messages.promptWithoutEmail}
            </p>

            <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp}>
                <InputOTPGroup size="lg">
                    {Array.from({ length: OTP_LENGTH }, (_, i) => (
                        <InputOTPSlot key={i} index={i} />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            <Button
                type="submit"
                loading={verifyMutation.isPending}
                disabled={otp.length !== OTP_LENGTH}
                className="w-full"
            >
                <ShieldCheck className="size-4 opacity-90" />
                {messages.verifyButton}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[length:0.8125rem] text-[var(--lp-fg-muted)]">
                <span>{messages.resendPrompt}</span>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    loading={resendMutation.isPending}
                    onClick={handleResend}
                    className="inline-flex h-auto min-h-0 gap-1.5 px-1 py-0 text-[var(--lp-accent)]"
                >
                    <RefreshCw className="size-3.5 shrink-0" />
                    {messages.resendButton}
                </Button>
            </div>
        </form>
    );
}
