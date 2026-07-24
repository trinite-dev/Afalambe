'use client';

import {
    useCallback,
    useMemo,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import Link from 'next/link';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { notifyApiError } from '@/lib/api-toast';
import { AUTH_MESSAGES, createSignInSchema } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export type SignInFormProps = {
    /** UTM / campaign params to forward when the backend is wired. */
    searchParams?: Record<string, string>;
};

export function SignInForm({ searchParams }: SignInFormProps): ReactElement {
    const { locale } = useUiLocale();
    const { push, href } = useLocalizedNavigation();
    const messages = AUTH_MESSAGES[locale];
    const signInSchema = useMemo(() => createSignInSchema(locale), [locale]);
    const [errors, setErrors] = useState<FieldErrors>({});
    const login = trpc.auth.login.useMutation();

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setErrors({});

            const formData = new FormData(e.currentTarget);
            const result = signInSchema.safeParse({
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

            login.mutate(
                {
                    email: result.data.email,
                    password: result.data.password,
                },
                {
                    onSuccess: () => {
                        push('/chat');
                    },
                    onError: (error) => {
                        notifyApiError({
                            title: messages.loginFailed,
                            description: error.message,
                        });
                    },
                },
            );
        },
        [login, messages.loginFailed, push, signInSchema],
    );

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {searchParams
                ? Object.entries(searchParams).map(([k, v]) => (
                      <input key={k} type="hidden" name={k} value={v} />
                  ))
                : null}

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
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.password) || undefined}
                />
                {errors.password ? <FieldError>{errors.password}</FieldError> : null}
                <div className="pt-1 text-right text-xs">
                    <Link href={href('/forgot-password')} className="text-[var(--lp-accent)] hover:underline">
                        {messages.forgotPassword}
                    </Link>
                </div>
            </Field>

            <Button type="submit" loading={login.isPending} className="mt-1 w-full">
                {messages.signIn}
            </Button>
        </form>
    );
}
