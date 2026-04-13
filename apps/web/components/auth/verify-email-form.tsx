'use client';

import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@afalambe/ui/components/input-otp';

const OTP_LENGTH = 6;

const otpSchema = z
    .string()
    .length(OTP_LENGTH, `Enter all ${OTP_LENGTH} digits`)
    .regex(/^\d+$/, 'Code must be digits only');

export type VerifyEmailFormProps = {
    email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps): ReactElement {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError(null);

            const result = otpSchema.safeParse(otp);
            if (!result.success) {
                setError(result.error.issues[0]?.message ?? 'Invalid code');
                return;
            }

            setLoading(true);

            // Phase 2: call auth.verifyEmail via tRPC with { token: otp, email }.
            // On success redirect to /chat; on failure show error.
            window.setTimeout(() => {
                setLoading(false);
                router.push('/chat');
            }, 800);
        },
        [otp, router],
    );

    const handleComplete = useCallback((value: string) => {
        setOtp(value);
        setError(null);
    }, []);

    const handleResend = useCallback(() => {
        if (resending) return;
        setResending(true);
        setResent(false);

        // Phase 2: call auth.resendVerification via tRPC with { email }.
        window.setTimeout(() => {
            setResending(false);
            setResent(true);
        }, 600);
    }, [resending]);

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6">
            <p className="text-center text-[length:0.875rem] leading-relaxed text-[var(--lp-fg-muted)]">
                We sent a {OTP_LENGTH}-digit code to{' '}
                <span className="font-medium text-[var(--lp-fg)]">{email}</span>. Enter it below to verify your
                account.
            </p>

            <div className="flex flex-col items-center gap-2">
                <InputOTP
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleComplete}
                    autoFocus
                >
                    <InputOTPGroup size="lg">
                        {Array.from({ length: OTP_LENGTH }, (_, i) => (
                            <InputOTPSlot key={i} index={i} />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
                {error ? (
                    <p role="alert" className="text-[length:0.8125rem] text-destructive-foreground">
                        {error}
                    </p>
                ) : null}
            </div>

            <Button type="submit" loading={loading} disabled={otp.length < OTP_LENGTH} className="w-full">
                <ShieldCheck className="size-4 opacity-90" />
                Verify
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[length:0.8125rem] text-[var(--lp-fg-muted)]">
                <span>Didn&apos;t receive the code?</span>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    loading={resending}
                    onClick={handleResend}
                    className="inline-flex h-auto min-h-0 gap-1.5 px-1 py-0 text-[var(--lp-accent)]"
                >
                    <RefreshCw className="size-3.5 shrink-0" />
                    Resend
                </Button>
                {resent ? <span className="text-[var(--lp-fg-subtle)]">Sent.</span> : null}
            </div>
        </form>
    );
}
