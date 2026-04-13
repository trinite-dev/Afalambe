'use client';

import {
    useCallback,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@afalambe/ui/components/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@afalambe/ui/components/field';
import { Input } from '@afalambe/ui/components/input';
import { PasswordInputWithToggle } from '@/components/auth/password-input-with-toggle';

const PASSWORD_MIN = 8;

const signUpSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z
        .string()
        .min(
            PASSWORD_MIN,
            `Password must be at least ${PASSWORD_MIN} characters`,
        )
        .regex(/[A-Z]/, 'Include at least one uppercase letter')
        .regex(/[0-9]/, 'Include at least one number'),
});

type FieldErrors = Partial<Record<'email' | 'password' | 'root', string>>;

export type SignUpFormProps = {
    /** UTM / campaign params to forward when the backend is wired. */
    searchParams?: Record<string, string>;
};

export function SignUpForm({ searchParams }: SignUpFormProps): ReactElement {
    const router = useRouter();
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

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

            setLoading(true);

            // Phase 2: call auth.register via tRPC here.
            // On success redirect to OTP verification; on failure map errors.
            window.setTimeout(() => {
                setLoading(false);
                const params = new URLSearchParams({
                    email: result.data.email,
                });
                router.push(`/sign-up/verify?${params.toString()}`);
            }, 600);
        },
        [router],
    );

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

            {errors.root ? (
                <p
                    role="alert"
                    className="rounded-[var(--lp-radius-sm)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[length:0.8125rem] text-destructive-foreground"
                >
                    {errors.root}
                </p>
            ) : null}

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
                    autoComplete="new-password"
                    required
                    aria-invalid={Boolean(errors.password) || undefined}
                />
                <FieldDescription>
                    At least {PASSWORD_MIN} characters, one uppercase letter,
                    and one number.
                </FieldDescription>
                {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                ) : null}
            </Field>

            <Button type="submit" loading={loading} className="mt-1 w-full">
                Create account
            </Button>
        </form>
    );
}
