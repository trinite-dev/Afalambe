# feat-0045: Tech Spec — Signup verification email delivery

## Status

**Implement now.** Root cause confirmed: Resend rejects an unverified `EMAIL_FROM` domain (historically `hello@afalambe.org`), while register/resend ignore send failures for UX. Production sender is `hello@afalambe.com` once that domain is verified in Resend.

## Diagnosis summary

```text
auth.register
  → user + EmailVerificationToken created
  → sendVerifyEmail → Resend 403/error (domain)
  → EmailDelivery status=failed
  → still returns { userId }  // client navigates to verify
retry register same email
  → CONFLICT  // client: "Sign up failed"
```

## Changes

### 1. `packages/emails` / delivery logging

When recording `EmailDelivery`, set:

```ts
errorCode: verifySend.ok
  ? null
  : truncate(`${verifySend.errorCode}: ${verifySend.errorMessage}`, 240)
```

(No schema migration required.)

### 2. `auth.register` output + unverified retry

**Output** (extend):

```ts
{ userId: string, verificationEmailSent: boolean }
```

**Existing user:**

| State | Password | Behaviour |
|-------|----------|-----------|
| Verified | any | `CONFLICT` (current) |
| Unverified | wrong | `UNAUTHORIZED` invalid credentials |
| Unverified | correct | New OTP + session cookie; attempt `sendVerifyEmail`; return `{ userId, verificationEmailSent }` |

### 3. `auth.resendVerification`

If send fails → `TRPCError` `INTERNAL_SERVER_ERROR` (or `BAD_REQUEST`) with Resend message (safe to show; no secrets). Do **not** return `{ ok: true }` on failure.

### 4. Web client

| File | Change |
|------|--------|
| `sign-up-form.tsx` | On success: always `push` verify; if `!verificationEmailSent`, warning toast (FR/EN copy) |
| `verify-email-form.tsx` | Resend error already uses `error.message` — ensure server throws |
| `ui-locale.ts` | Add `verificationEmailFailedTitle` / `verificationEmailFailedDescription` |

### 5. Env docs

`apps/api/.env.example` + `docs/env/README.md`:

```env
# Production: address on a domain verified in Resend
EMAIL_FROM=hello@afalambe.com
# Local sandbox (Resend restricts recipients):
# EMAIL_FROM=beth.t@example.com
```

**Operator fix for this incident:** verify `afalambe.com` in [Resend Domains](https://resend.com/domains), **or** temporarily set `EMAIL_FROM=beth.t@example.com` for local tests (only delivers to the Resend account allowlist).

### 6. Port note (local)

Web may bind `:3001` when `:3000` is taken. API already allows `localhost:3001` CORS. Keep `NEXT_PUBLIC_APP_URL` accurate for password-reset links; not the cause of this Resend failure.

## Files

| Path | Role |
|------|------|
| `packages/trpc/src/routers/auth.ts` | register/resend behaviour |
| `apps/web/components/auth/sign-up-form.tsx` | toast on failed send |
| `apps/web/lib/ui-locale.ts` | copy |
| `apps/api/.env.example` | EMAIL_FROM guidance |
| `docs/env/README.md` | same |
| `packages/trpc/src/index.test.ts` (or auth tests) | UC-VE04 / failed send |

## Verification

```bash
# After fixing EMAIL_FROM / domain:
pnpm --filter @afalambe/api exec tsx -e '/* sendVerifyEmail smoke */'
# Manual: sign up → inbox OTP; stop Resend key → warning toast, not silent success
```

## Related

- [feat-0045 PRODUCT](./PRODUCT.md)
- [feat-0003 TECH](../feat-0003/TECH.md)
