'use client';

import {
    useCallback,
    useMemo,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { Button } from '@afalambe/ui/components/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { notifyApiError, notifyApiWarning } from '@/lib/api-toast';
import { AUTH_MESSAGES, createSignUpSchema } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

const PASSWORD_MIN = 8;

type FieldErrors = Partial<Record<'email' | 'password' | 'root', string>>;

export type SignUpFormProps = {
    /** UTM / campaign params to forward when the backend is wired. */
    searchParams?: Record<string, string>;
};

export function SignUpForm({ searchParams }: SignUpFormProps): ReactElement {
    const { push } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const messages = AUTH_MESSAGES[locale];
    const signUpSchema = useMemo(() => createSignUpSchema(locale, PASSWORD_MIN), [locale]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const register = trpc.auth.register.useMutation();

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setErrors({});

            const formData = new FormData(e.currentTarget);
            const result = signUpSchema.safeParse({
                email: formData.get('email'),
                password: formData.get('password'),
            });

            if (!result.success) {
                const fieldErrors: FieldErrors = {};
                for (const issue of result.error.issues) {
                    const key = issue.path[0] as keyof FieldErrors;
                    if (key && !fieldErrors[key]) {
                        fieldErrors[key] = issue.message;
                    }
                }
                setErrors(fieldErrors);
                return;
            }

            register.mutate(
                {
                    email: result.data.email,
                    password: result.data.password,
                },
                {
                    onSuccess: (data) => {
                        if (!data.verificationEmailSent) {
                            const description = [
                                data.verificationEmailError ??
                                    messages.verificationEmailFailedDescription,
                                data.devOtp ? `Dev OTP: ${data.devOtp}` : null,
                            ]
                                .filter(Boolean)
                                .join(' ');
                            notifyApiWarning({
                                title: messages.verificationEmailFailedTitle,
                                description,
                            });
                        }
                        push(`/sign-up/verify?email=${encodeURIComponent(result.data.email)}`);
                    },
                    onError: (error) => {
                        const isConflict = error.data?.code === 'CONFLICT';
                        notifyApiError({
                            title: isConflict ? messages.accountExistsTitle : messages.signUpFailed,
                            description: isConflict
                                ? messages.accountExistsDescription
                                : error.message,
                        });
                    },
                },
            );
        },
        [messages, push, register, signUpSchema],
    );

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {searchParams
                ? Object.entries(searchParams).map(([k, v]) => (
                      <input key={k} type="hidden" name={k} value={v} />
                  ))
                : null}

            {errors.root ? (
                <p
                    role="alert"
                    className="rounded-[var(--lp-radius-sm)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[length:0.8125rem] text-destructive-foreground"
                >
                    {errors.root}
                </p>
            ) : null}

            <Field invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">{messages.emailLabel}</FieldLabel>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(errors.email) || undefined}
                />
                {errors.email ? <FieldError>{errors.email}</FieldError> : null}
            </Field>

            <Field invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">{messages.passwordLabel}</FieldLabel>
                <PasswordInputWithToggle
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    aria-invalid={Boolean(errors.password) || undefined}
                />
                <FieldDescription>{messages.passwordHint(PASSWORD_MIN)}</FieldDescription>
                {errors.password ? <FieldError>{errors.password}</FieldError> : null}
            </Field>

            <Button type="submit" loading={register.isPending} className="mt-1 w-full">
                {messages.createAccount}
            </Button>
        </form>
    );
}
