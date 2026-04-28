'use client';

import { useCallback, useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { notifyApiError, notifyApiInfo } from '@/lib/api-toast';
import { trpc } from '@/lib/trpc';

const schema = z.object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
});

export function ResetPasswordForm({ token }: { token: string | null }): ReactElement {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const mutation = trpc.auth.resetPassword.useMutation();

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);
            if (!token) {
                setError('Jeton de reinitialisation manquant.');
                return;
            }

            const formData = new FormData(event.currentTarget);
            const parsed = schema.safeParse({ password: formData.get('password') });
            if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? 'Mot de passe invalide.');
                return;
            }

            mutation.mutate(
                { token, newPassword: parsed.data.password },
                {
                    onSuccess: () => {
                        notifyApiInfo({
                            title: 'Mot de passe reinitialise',
                            description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
                        });
                        router.push('/sign-in');
                    },
                    onError: (err) => {
                        notifyApiError({
                            title: 'Reinitialisation impossible',
                            description: err.message,
                        });
                    },
                },
            );
        },
        [mutation, router, token],
    );

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field invalid={Boolean(error)}>
                <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                <PasswordInputWithToggle id="password" name="password" autoComplete="new-password" required />
                {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button type="submit" loading={mutation.isPending} disabled={!token} className="w-full">
                Reinitialiser le mot de passe
            </Button>
        </form>
    );
}
