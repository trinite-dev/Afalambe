'use client';

import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { trpc } from '@/lib/trpc';

const schema = z.object({
    email: z.email('Saisissez une adresse e-mail valide'),
});

export function RequestPasswordResetForm(): ReactElement {
    const [error, setError] = useState<string | null>(null);
    const mutation = trpc.auth.requestPasswordReset.useMutation();

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);

            const formData = new FormData(event.currentTarget);
            const parsed = schema.safeParse({ email: formData.get('email') });
            if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? 'E-mail invalide.');
                return;
            }

            mutation.mutate(
                { email: parsed.data.email },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: 'Verifiez votre e-mail',
                            description: 'Si le compte existe, un lien de reinitialisation a ete envoye.',
                        });
                    },
                    onError: (err) => {
                        notifyApiError({
                            title: 'Demande de reinitialisation impossible',
                            description: err.message,
                        });
                    },
                },
            );
        },
        [mutation],
    );

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field invalid={Boolean(error)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" required />
                {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button type="submit" loading={mutation.isPending} className="w-full">
                Envoyer le lien de reinitialisation
            </Button>
        </form>
    );
}
