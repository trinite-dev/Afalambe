'use client';

import {
    useCallback,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import { Field, FieldError, FieldLabel } from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';
import { notifyApiError } from '@/lib/api-toast';

const signInSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export type SignInFormProps = {
    /** UTM / campaign params to forward when the backend is wired. */
    searchParams?: Record<string, string>;
};

export function SignInForm({ searchParams }: SignInFormProps): ReactElement {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

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

        setLoading(true);

        // Phase 2: call auth.login via tRPC here.
        // On success redirect to /chat; on failure map tRPC error codes to FieldErrors.
        // For now simulate a short delay then reset.
        window.setTimeout(() => {
            setLoading(false);
            notifyApiError({
                title: 'Sign-in unavailable',
                description:
                    'The API is not connected yet. Backend wiring ships in Phase 2; use toasts for all API errors.',
            });
        }, 600);
    }, []);

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
            </Field>

            <Button type="submit" loading={loading} className="mt-1 w-full">
                Sign in
            </Button>
        </form>
    );
}
