import { TRPCError } from '@trpc/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../core';
import { checkRateLimit } from '../rate-limit';
import {
    createOtpCode,
    createRawToken,
    requestPasswordResetSchema,
    resetPasswordSchema,
    signInSchema,
    signUpSchema,
    verifyEmailSchema,
} from '../schemas';

function truncateError(code: string, message: string, max = 240): string {
    const combined = `${code}: ${message}`;
    return combined.length <= max ? combined : `${combined.slice(0, max - 1)}…`;
}

function isNonProduction(): boolean {
    return (process.env.NODE_ENV ?? 'development').toLowerCase() !== 'production';
}

function maybeLogDevOtp(email: string, otpCode: string): void {
    if (!isNonProduction()) return;
    if (process.env.EMAIL_DEV_LOG_OTP !== 'true') return;
    console.info(`[dev] verify OTP for ${email}: ${otpCode}`);
}

function maybeExposeDevOtp(otpCode: string): string | undefined {
    if (!isNonProduction()) return undefined;
    if (process.env.EMAIL_DEV_EXPOSE_OTP !== 'true') return undefined;
    return otpCode;
}

export const authRouter = createTRPCRouter({
    register: publicProcedure
        .input(signUpSchema)
        .output(
            z.object({
                userId: z.string().cuid(),
                verificationEmailSent: z.boolean(),
                verificationEmailError: z.string().nullable(),
                devOtp: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const rateLimitKey = `register:${input.email}`;
            if (!checkRateLimit(rateLimitKey, 3, 3_600_000)) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Trop de requetes. Reessayez dans une heure.',
                });
            }

            const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });

            if (existing?.emailVerifiedAt) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'An account already exists for this email. Sign in instead.',
                });
            }

            let userId: string;

            if (existing) {
                // Unverified: allow continuing signup with the password just submitted.
                const passwordHash = await ctx.hashPassword(input.password);
                await ctx.prisma.user.update({
                    where: { id: existing.id },
                    data: { passwordHash },
                });
                userId = existing.id;
            } else {
                const passwordHash = await ctx.hashPassword(input.password);
                const user = await ctx.prisma.user.create({
                    data: { email: input.email, passwordHash, role: 'USER' },
                });
                userId = user.id;
            }

            const rawVerificationOtp = createOtpCode();
            const tokenHash = ctx.hashToken(rawVerificationOtp);
            const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
            await ctx.prisma.emailVerificationToken.create({
                data: {
                    userId,
                    tokenHash,
                    expiresAt: tokenExpiresAt,
                },
            });
            const verificationIdempotencyKey = `verify:${userId}:${tokenHash}`;
            const verifySend = await ctx.sendVerifyEmail({
                to: input.email,
                otpCode: rawVerificationOtp,
                idempotencyKey: verificationIdempotencyKey,
            });
            await ctx.prisma.emailDelivery.create({
                data: {
                    userId,
                    templateKey: 'verify-email',
                    idempotencyKey: verificationIdempotencyKey,
                    status: verifySend.ok ? 'sent' : 'failed',
                    providerMessageId: verifySend.ok ? verifySend.providerMessageId : null,
                    errorCode: verifySend.ok
                        ? null
                        : truncateError(verifySend.errorCode, verifySend.errorMessage),
                },
            });

            if (!verifySend.ok) {
                maybeLogDevOtp(input.email, rawVerificationOtp);
            }

            const token = randomUUID();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
            await ctx.prisma.session.create({
                data: {
                    userId,
                    tokenHash: ctx.hashToken(token),
                    expiresAt,
                },
            });
            ctx.setSessionCookie(token, expiresAt);

            const devOtp = !verifySend.ok ? maybeExposeDevOtp(rawVerificationOtp) : undefined;

            return {
                userId,
                verificationEmailSent: verifySend.ok,
                verificationEmailError: verifySend.ok ? null : verifySend.errorMessage,
                ...(devOtp ? { devOtp } : {}),
            };
        }),
    login: publicProcedure
        .input(signInSchema)
        .output(z.object({ userId: z.string().cuid(), email: z.email() }))
        .mutation(async ({ ctx, input }) => {
            const rateLimitKey = `login:${input.email}`;
            if (!checkRateLimit(rateLimitKey, 10, 60_000)) {
                throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Trop de requetes. Reessayez dans une minute.' });
            }

            const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });
            if (!user) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Identifiants invalides.' });
            }
            const ok = await ctx.verifyPassword(input.password, user.passwordHash);
            if (!ok) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Identifiants invalides.' });
            }
            const token = randomUUID();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
            await ctx.prisma.session.create({
                data: {
                    userId: user.id,
                    tokenHash: ctx.hashToken(token),
                    expiresAt,
                },
            });
            ctx.setSessionCookie(token, expiresAt);
            return { userId: user.id, email: user.email };
        }),
    verifyEmail: publicProcedure
        .input(verifyEmailSchema)
        .output(z.object({ ok: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { email: input.email },
                select: { id: true },
            });
            if (!user) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Le code de verification est invalide ou expire.' });
            }
            const tokenHash = ctx.hashToken(input.otpCode);
            const record = await ctx.prisma.emailVerificationToken.findFirst({
                where: { tokenHash, userId: user.id },
            });
            if (!record || record.usedAt || record.expiresAt <= new Date()) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Le code de verification est invalide ou expire.' });
            }
            await ctx.prisma.$transaction([
                ctx.prisma.user.update({
                    where: { id: record.userId },
                    data: { emailVerifiedAt: new Date() },
                }),
                ctx.prisma.emailVerificationToken.update({
                    where: { tokenHash },
                    data: { usedAt: new Date() },
                }),
            ]);
            return { ok: true };
        }),
    resendVerification: protectedProcedure
        .output(z.object({ ok: z.literal(true) }))
        .mutation(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.sessionUser.id },
                select: { id: true, email: true, emailVerifiedAt: true },
            });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur introuvable.' });
            }
            if (user.emailVerifiedAt) return { ok: true };

            const rawOtp = createOtpCode();
            const tokenHash = ctx.hashToken(rawOtp);
            const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
            await ctx.prisma.emailVerificationToken.create({
                data: { userId: user.id, tokenHash, expiresAt },
            });

            const idempotencyKey = `verify-resend:${user.id}:${tokenHash}`;
            const sent = await ctx.sendVerifyEmail({
                to: user.email,
                otpCode: rawOtp,
                idempotencyKey,
            });
            await ctx.prisma.emailDelivery.create({
                data: {
                    userId: user.id,
                    templateKey: 'verify-email',
                    idempotencyKey,
                    status: sent.ok ? 'sent' : 'failed',
                    providerMessageId: sent.ok ? sent.providerMessageId : null,
                    errorCode: sent.ok ? null : truncateError(sent.errorCode, sent.errorMessage),
                },
            });
            if (!sent.ok) {
                maybeLogDevOtp(user.email, rawOtp);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: sent.errorMessage || "Echec de l'envoi de l'e-mail de verification.",
                });
            }
            return { ok: true };
        }),
    requestPasswordReset: publicProcedure
        .input(requestPasswordResetSchema)
        .output(z.object({ ok: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { email: input.email },
                select: { id: true, email: true },
            });
            if (!user) return { ok: true };

            const rawToken = createRawToken();
            const tokenHash = ctx.hashToken(rawToken);
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
            await ctx.prisma.passwordResetToken.create({
                data: { userId: user.id, tokenHash, expiresAt },
            });

            const resetUrl = `${ctx.appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(rawToken)}`;
            const idempotencyKey = `password-reset:${user.id}:${tokenHash}`;
            const sent = await ctx.sendPasswordResetEmail({
                to: user.email,
                resetUrl,
                idempotencyKey,
            });
            await ctx.prisma.emailDelivery.create({
                data: {
                    userId: user.id,
                    templateKey: 'password-reset',
                    idempotencyKey,
                    status: sent.ok ? 'sent' : 'failed',
                    providerMessageId: sent.ok ? sent.providerMessageId : null,
                    errorCode: sent.ok ? null : sent.errorCode,
                },
            });
            return { ok: true };
        }),
    resetPassword: publicProcedure
        .input(resetPasswordSchema)
        .output(z.object({ ok: z.literal(true) }))
        .mutation(async ({ ctx, input }) => {
            const tokenHash = ctx.hashToken(input.token);
            const tokenRecord = await ctx.prisma.passwordResetToken.findUnique({
                where: { tokenHash },
            });
            if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= new Date()) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Le jeton de reinitialisation est invalide ou expire.' });
            }
            const newHash = await ctx.hashPassword(input.newPassword);
            await ctx.prisma.$transaction([
                ctx.prisma.user.update({
                    where: { id: tokenRecord.userId },
                    data: { passwordHash: newHash },
                }),
                ctx.prisma.passwordResetToken.update({
                    where: { tokenHash },
                    data: { usedAt: new Date() },
                }),
            ]);
            return { ok: true };
        }),
    logout: protectedProcedure
        .output(z.object({ ok: z.literal(true) }))
        .mutation(async ({ ctx }) => {
            if (ctx.sessionTokenHash) {
                await ctx.prisma.session.deleteMany({
                    where: { tokenHash: ctx.sessionTokenHash },
                });
            }
            ctx.clearSessionCookie();
            return { ok: true };
        }),
});
