'use client';

import {
    useCallback,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { notifyApiError } from '@/lib/api-toast';
import { trpc } from '@/lib/trpc';

const signInSchema = z.object({
    email: z
        .string()
        .min(1, "L'e-mail est requis")
        .email('Saisissez une adresse e-mail valide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export type SignInFormProps = {
    /** UTM / campaign params to forward when the backend is wired. */
    searchParams?: Record<string, string>;
};

export function SignInForm({ searchParams }: SignInFormProps): ReactElement {
    const router = useRouter();
    const [errors, setErrors] = useState<FieldErrors>({});
    const login = trpc.auth.login.useMutation();

    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
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
                    router.push('/chat');
                },
                onError: (error) => {
                    notifyApiError({
                        title: 'Connexion impossible',
                        description: error.message,
                    });
                },
            },
        );
    }, [login, router]);

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
        >
            {searchParams
                ? Object.entries(searchParams).map(([k, v]) => (
                      <input key={k} type="hidden" name={k} value={v} />
                  ))
                : null}

            <Field invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInputWithToggle
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.password) || undefined}
                />
                {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                ) : null}
                <div className="pt-1 text-right text-xs">
                    <Link href="/forgot-password" className="text-[var(--lp-accent)] hover:underline">
                        Mot de passe oublié ?
                    </Link>
                </div>
            </Field>

            <Button type="submit" loading={login.isPending} className="mt-1 w-full">
                Se connecter
            </Button>
        </form>
    );
}
