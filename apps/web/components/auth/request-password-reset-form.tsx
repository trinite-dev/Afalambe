'use client';

import { useCallback, useMemo, useState, type FormEvent, type ReactElement } from 'react';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { AUTH_MESSAGES, REQUEST_RESET_MESSAGES } from '@/lib/ui-locale';
import { trpc } from '@/lib/trpc';

const schema = (locale: 'fr' | 'en') => {
    const m = AUTH_MESSAGES[locale];
    return z.object({
        email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
    });
};

export function RequestPasswordResetForm(): ReactElement {
    const { locale } = useUiLocale();
    const messages = AUTH_MESSAGES[locale];
    const resetMessages = REQUEST_RESET_MESSAGES[locale];
    const resetSchema = useMemo(() => schema(locale), [locale]);
    const [error, setError] = useState<string | null>(null);
    const mutation = trpc.auth.requestPasswordReset.useMutation();

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);

            const formData = new FormData(event.currentTarget);
            const parsed = resetSchema.safeParse({ email: formData.get('email') });
            if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? messages.emailInvalid);
                return;
            }

            mutation.mutate(
                { email: parsed.data.email },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: resetMessages.successTitle,
                            description: resetMessages.successDescription,
                        });
                    },
                    onError: (err) => {
                        notifyApiError({
                            title: resetMessages.errorTitle,
                            description: err.message,
                        });
                    },
                },
            );
        },
        [locale, messages.emailInvalid, mutation, resetMessages, resetSchema],
    );

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field invalid={Boolean(error)}>
                <FieldLabel htmlFor="email">{messages.emailLabel}</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" required />
                {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button type="submit" loading={mutation.isPending} className="w-full">
                {messages.sendResetLink}
            </Button>
        </form>
    );
}
