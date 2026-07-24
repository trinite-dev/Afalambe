import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter } from '../core';
import { factCheckStatusValues } from '../schemas';

const claimStatusValues = ['OPEN', 'PROCESSING', 'RESOLVED', 'FAILED'] as const;

function claimSnippet(claim: {
    title: string | null;
    claimText: string | null;
    messages: Array<{ content: string; role: string }>;
}): string {
    const fromMessage = claim.messages.find((m) => m.role === 'USER')?.content;
    const text = claim.claimText ?? fromMessage ?? claim.title ?? '';
    return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

export const adminRouter = createTRPCRouter({
    queueCount: adminProcedure
        .output(z.object({ total: z.number() }))
        .query(async ({ ctx }) => {
            const total = await ctx.prisma.claim.count({
                where: { status: { in: ['FAILED', 'OPEN', 'PROCESSING'] } },
            });
            return { total };
        }),

    listQueue: adminProcedure
        .input(
            z.object({
                status: z.enum(claimStatusValues).optional(),
                factCheckStatus: z.enum(factCheckStatusValues).optional(),
                search: z.string().trim().optional(),
                take: z.number().int().min(1).max(100).default(50),
            }),
        )
        .query(async ({ ctx, input }) => {
            const claims = await ctx.prisma.claim.findMany({
                where: {
                    ...(input.status ? { status: input.status } : {}),
                    ...(input.factCheckStatus ? { factCheckStatus: input.factCheckStatus } : {}),
                    ...(input.search
                        ? {
                              OR: [
                                  { title: { contains: input.search, mode: 'insensitive' } },
                                  { claimText: { contains: input.search, mode: 'insensitive' } },
                              ],
                          }
                        : {}),
                },
                orderBy: { updatedAt: 'desc' },
                take: input.take,
                include: {
                    user: { select: { email: true } },
                    messages: {
                        where: { role: 'USER' },
                        orderBy: { createdAt: 'asc' },
                        take: 1,
                    },
                },
            });

            return {
                items: claims.map((claim) => ({
                    id: claim.id,
                    title: claim.title,
                    status: claim.status,
                    factCheckStatus: claim.factCheckStatus,
                    claimLanguage: claim.claimLanguage,
                    topicCategory: claim.topicCategory,
                    snippet: claimSnippet(claim),
                    ownerEmail: claim.user.email,
                    createdAt: claim.createdAt,
                    updatedAt: claim.updatedAt,
                })),
            };
        }),

    claimById: adminProcedure
        .input(z.object({ claimId: z.string().cuid() }))
        .query(async ({ ctx, input }) => {
            const claim = await ctx.prisma.claim.findUnique({
                where: { id: input.claimId },
                include: {
                    user: { select: { id: true, email: true } },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        select: { id: true, role: true, content: true, createdAt: true },
                    },
                },
            });
            if (!claim) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Dossier introuvable.' });
            }
            return claim;
        }),

    updateClaimStatus: adminProcedure
        .input(
            z.object({
                claimId: z.string().cuid(),
                status: z.enum(claimStatusValues),
                factCheckStatus: z.enum(factCheckStatusValues),
                resolutionNote: z.string().trim().min(1).max(4000),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const claim = await ctx.prisma.claim.findUnique({
                where: { id: input.claimId },
                include: { user: { select: { id: true, email: true } } },
            });
            if (!claim) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Dossier introuvable.' });
            }

            const now = new Date();

            await ctx.prisma.$transaction([
                ctx.prisma.claim.update({
                    where: { id: input.claimId },
                    data: {
                        status: input.status,
                        factCheckStatus: input.factCheckStatus,
                        factCheckText: input.resolutionNote,
                        factCheckDate: now,
                    },
                }),
                ctx.prisma.claimMessage.create({
                    data: {
                        claimId: input.claimId,
                        role: 'SYSTEM',
                        content: `[Reviewer] ${input.resolutionNote}`,
                    },
                }),
                ctx.prisma.adminAuditLog.create({
                    data: {
                        actorUserId: ctx.sessionUser.id,
                        action: 'claim.updateStatus',
                        targetType: 'claim',
                        targetId: input.claimId,
                        payload: {
                            status: input.status,
                            factCheckStatus: input.factCheckStatus,
                        },
                    },
                }),
            ]);

            ctx.broadcastToClaimSubscribers?.(input.claimId, {
                type: 'claim.statusChanged',
                payload: {
                    claimId: input.claimId,
                    status: input.status,
                    factCheckStatus: input.factCheckStatus,
                },
            });

            if (input.status === 'RESOLVED') {
                const idempotencyKey = `claim-resolved:admin:${input.claimId}:${now.getTime()}`;
                try {
                    const resolvedSend = await ctx.sendClaimResolvedEmail({
                        to: claim.user.email,
                        claimId: input.claimId,
                        idempotencyKey,
                    });
                    await ctx.prisma.emailDelivery.upsert({
                        where: { idempotencyKey },
                        update: {
                            status: resolvedSend.ok ? 'sent' : 'failed',
                            providerMessageId: resolvedSend.ok ? resolvedSend.providerMessageId : null,
                            errorCode: resolvedSend.ok ? null : resolvedSend.errorCode,
                            attemptCount: { increment: 1 },
                            lastAttemptAt: now,
                        },
                        create: {
                            userId: claim.user.id,
                            claimId: input.claimId,
                            templateKey: 'claim-resolved',
                            idempotencyKey,
                            status: resolvedSend.ok ? 'sent' : 'failed',
                            providerMessageId: resolvedSend.ok ? resolvedSend.providerMessageId : null,
                            errorCode: resolvedSend.ok ? null : resolvedSend.errorCode,
                        },
                    });
                } catch (err) {
                    console.error('[admin.updateClaimStatus] resolved email failed', {
                        claimId: input.claimId,
                        message: err instanceof Error ? err.message : err,
                    });
                }
            }

            return { ok: true as const };
        }),

    listAuditLogs: adminProcedure
        .input(z.object({ take: z.number().int().min(1).max(100).default(20) }))
        .output(
            z.object({
                items: z.array(
                    z.object({
                        id: z.string(),
                        action: z.string(),
                        targetType: z.string(),
                        targetId: z.string(),
                        actorEmail: z.string(),
                        createdAt: z.date(),
                    }),
                ),
            }),
        )
        .query(async ({ ctx, input }) => {
            const logs = await ctx.prisma.adminAuditLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: input.take,
                include: {
                    actor: { select: { email: true } },
                },
            });

            return {
                items: logs.map((log) => ({
                    id: log.id,
                    action: log.action,
                    targetType: log.targetType,
                    targetId: log.targetId,
                    actorEmail: log.actor.email,
                    createdAt: log.createdAt,
                })),
            };
        }),
});
