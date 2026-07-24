'use client';

import { useCallback, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { useLocalizedNavigation } from '@/hooks/use-localized-navigation';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { RESET_PASSWORD_MESSAGES } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

export function ResetPasswordForm({ token }: { token: string | null }): ReactElement {
    const { push } = useLocalizedNavigation();
    const { locale } = useUiLocale();
    const messages = RESET_PASSWORD_MESSAGES[locale];
    const schema = useMemo(
        () => z.object({ password: z.string().min(8, messages.passwordMin) }),
        [messages.passwordMin],
    );
    const [error, setError] = useState<string | null>(null);
    const mutation = trpc.auth.resetPassword.useMutation();

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);
            if (!token) {
                setError(messages.missingToken);
                return;
            }

            const formData = new FormData(event.currentTarget);
            const parsed = schema.safeParse({ password: formData.get('password') });
            if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? messages.invalidPassword);
                return;
            }

            mutation.mutate(
                { token, newPassword: parsed.data.password },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: messages.successTitle,
                            description: messages.successDescription,
                        });
                        push('/sign-in');
                    },
                    onError: (err) => {
                        notifyApiError({
                            title: messages.errorTitle,
                            description: err.message,
                        });
                    },
                },
            );
        },
        [messages, mutation, push, schema, token],
    );

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field invalid={Boolean(error)}>
                <FieldLabel htmlFor="password">{messages.passwordLabel}</FieldLabel>
                <PasswordInputWithToggle id="password" name="password" autoComplete="new-password" required />
                {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button type="submit" loading={mutation.isPending} disabled={!token} className="w-full">
                {messages.submit}
            </Button>
        </form>
    );
}
