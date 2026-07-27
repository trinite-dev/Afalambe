import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { appendFactCheckDetailsFooter, classifyMessageIntent, resolveFactCheckLocale } from '@afalambe/ai';
import { createTRPCRouter, protectedProcedure } from '../core';
import { requireVerifiedEmail } from '../guards';
import { checkRateLimit } from '../rate-limit';
import {
    chatMessageInput,
    claimMetadataInput,
    factCheckStatusValues,
    topicCategoryValues,
} from '../schemas';
import type { TrpcContext } from '../types';
import { validateUploadFile } from '../upload-validation';

type StoredAttachment = {
    url: string;
    mimeType: string;
    sizeBytes: number;
    uploadPath?: string;
};

async function refreshMessageAttachments(
    attachments: unknown,
    ctx: TrpcContext,
): Promise<unknown> {
    if (!Array.isArray(attachments) || !ctx.createSignedReadUrl) {
        return attachments;
    }

    return Promise.all(
        attachments.map(async (raw) => {
            if (!raw || typeof raw !== 'object') return raw;
            const att = raw as StoredAttachment;
            if (!att.uploadPath) return att;
            try {
                const url = await ctx.createSignedReadUrl!({ uploadPath: att.uploadPath });
                return { ...att, url };
            } catch {
                return att;
            }
        }),
    );
}

function assistantFailureMessage(claimLanguage?: string | null): string {
    return claimLanguage === 'en'
        ? 'I cannot process your request right now. Please try again.'
        : 'Je ne peux pas traiter votre demande pour le moment. Veuillez reessayer.';
}

const VERDICT_PATTERN =
    /\b(verified|debunked|misleading|partially[_ ]true)\b/i;

function parseVerdict(
    text: string,
): (typeof factCheckStatusValues)[number] | null {
    const match = text.match(VERDICT_PATTERN);
    if (!match?.[1]) return null;
    const raw = match[1].toUpperCase().replace(/\s+/g, '_');
    if (
        (factCheckStatusValues as readonly string[]).includes(raw)
    ) {
        return raw as (typeof factCheckStatusValues)[number];
    }
    return null;
}

export const claimRouter = createTRPCRouter({
    listMine: protectedProcedure
        .input(
            z
                .object({
                    search: z.string().trim().max(200).optional(),
                    factCheckStatus: z.enum(factCheckStatusValues).optional(),
                    topicCategory: z.enum(topicCategoryValues).optional(),
                })
                .optional(),
        )
        .output(
            z.array(
                z.object({
                    id: z.string().cuid(),
                    title: z.string().nullable(),
                    status: z.enum(['OPEN', 'PROCESSING', 'RESOLVED', 'FAILED']),
                    factCheckStatus: z.enum(factCheckStatusValues),
                    topicCategory: z
                        .enum([
                            'POLITICS',
                            'HEALTH',
                            'FINANCE',
                            'TECH',
                            'SECURITY',
                            'EDUCATION',
                            'ENVIRONMENT',
                        ])
                        .nullable(),
                    claimLanguage: z.string().nullable(),
                    updatedAt: z.date(),
                }),
            ),
        )
        .query(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);

            const where: Record<string, unknown> = {
                createdByUserId: ctx.sessionUser.id,
            };

            if (input?.search) {
                where.OR = [
                    { title: { contains: input.search, mode: 'insensitive' } },
                    { claimText: { contains: input.search, mode: 'insensitive' } },
                ];
            }

            if (input?.factCheckStatus) {
                where.factCheckStatus = input.factCheckStatus;
            }

            if (input?.topicCategory) {
                where.topicCategory = input.topicCategory;
            }

            const claims = await ctx.prisma.claim.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: 50,
            });
            return claims;
        }),

    byId: protectedProcedure
        .input(z.object({ claimId: z.string().cuid() }))
        .output(
            z.object({
                id: z.string().cuid(),
                status: z.enum(['OPEN', 'PROCESSING', 'RESOLVED', 'FAILED']),
                factCheckStatus: z.enum(factCheckStatusValues),
                claimText: z.string().nullable(),
                claimLanguage: z.string().nullable(),
                claimDate: z.date().nullable(),
                sourceName: z.string().nullable(),
                sourceType: z
                    .enum([
                        'POLITICIAN',
                        'MEDIA',
                        'SOCIAL_MEDIA',
                        'BLOG',
                        'NGO',
                        'CITIZEN',
                    ])
                    .nullable(),
                sourceUrl: z.string().nullable(),
                mediaType: z.enum([
                    'TEXT',
                    'IMAGE',
                    'VIDEO',
                    'AUDIO',
                    'TEXT_IMAGE',
                    'TEXT_VIDEO',
                    'TEXT_AUDIO',
                ]),
                factCheckText: z.string().nullable(),
                factCheckDate: z.date().nullable(),
                topicCategory: z
                    .enum([
                        'POLITICS',
                        'HEALTH',
                        'FINANCE',
                        'TECH',
                        'SECURITY',
                        'EDUCATION',
                        'ENVIRONMENT',
                    ])
                    .nullable(),
                location: z.string().nullable(),
                platform: z.string().nullable(),
                messages: z.array(
                    z.object({
                        id: z.string().cuid(),
                        role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
                        content: z.string(),
                        attachments: z.any().nullable(),
                        createdAt: z.date(),
                    }),
                ),
            }),
        )
        .query(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);
            const claim = await ctx.prisma.claim.findFirst({
                where: { id: input.claimId, createdByUserId: ctx.sessionUser.id },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
            });
            if (!claim) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Fil introuvable.' });
            }

            const messages = await Promise.all(
                claim.messages.map(async (msg) => ({
                    ...msg,
                    attachments: await refreshMessageAttachments(msg.attachments, ctx),
                })),
            );

            return { ...claim, messages };
        }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string().trim().min(1).max(120).optional(),
                content: z.string().trim().min(1).max(4000),
                clientRequestId: z.string().uuid().optional(),
                attachments: chatMessageInput.shape.attachments,
                metadata: claimMetadataInput.optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);

            const rateLimitKey = `claim-create:${ctx.sessionUser.id}`;
            if (!checkRateLimit(rateLimitKey, 5, 60_000)) {
                throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Trop de requetes. Reessayez dans une minute.' });
            }

            const meta = input.metadata;
            const claim = await ctx.prisma.claim.create({
                data: {
                    createdByUserId: ctx.sessionUser.id,
                    title: input.title ?? input.content.slice(0, 80),
                    status: 'OPEN',
                    claimText: meta?.claimText ?? input.content,
                    claimLanguage: meta?.claimLanguage ?? 'fr',
                    claimDate: meta?.claimDate ?? null,
                    sourceName: meta?.sourceName ?? null,
                    sourceType: meta?.sourceType ?? null,
                    sourceUrl: meta?.sourceUrl ?? null,
                    mediaType: meta?.mediaType ?? 'TEXT',
                    topicCategory: meta?.topicCategory ?? null,
                    location: meta?.location ?? null,
                    platform: meta?.platform ?? null,
                },
            });

            await ctx.prisma.claimMessage.create({
                data: {
                    claimId: claim.id,
                    role: 'USER',
                    content: input.content,
                    clientReqId: input.clientRequestId,
                    attachments: input.attachments ? input.attachments : undefined,
                },
            });

            return { claimId: claim.id };
        }),

    updateMetadata: protectedProcedure
        .input(
            z.object({
                claimId: z.string().cuid(),
                metadata: claimMetadataInput,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);
            const claim = await ctx.prisma.claim.findFirst({
                where: { id: input.claimId, createdByUserId: ctx.sessionUser.id },
                select: { id: true },
            });
            if (!claim) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Fil introuvable.' });
            }

            const data: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(input.metadata)) {
                if (value !== undefined) {
                    data[key] = value;
                }
            }

            if (Object.keys(data).length > 0) {
                await ctx.prisma.claim.update({
                    where: { id: claim.id },
                    data,
                });
            }

            return { ok: true };
        }),

    appendUserMessage: protectedProcedure.input(chatMessageInput).mutation(async ({ ctx, input }) => {
        await requireVerifiedEmail(ctx);
        const claim = await ctx.prisma.claim.findFirst({
            where: { id: input.claimId, createdByUserId: ctx.sessionUser.id },
            select: { id: true },
        });
        if (!claim) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Fil introuvable.' });
        }
        const message = await ctx.prisma.claimMessage.create({
            data: {
                claimId: input.claimId,
                role: 'USER',
                content: input.content,
                clientReqId: input.clientRequestId,
                attachments: input.attachments ? input.attachments : undefined,
            },
        });
        ctx.broadcastToClaimSubscribers?.(input.claimId, {
            type: 'message.created',
            payload: { claimId: input.claimId, messageId: message.id },
        });
        return { messageId: message.id };
    }),

    requestUpload: protectedProcedure
        .input(
            z.object({
                claimId: z.string().cuid().optional(),
                filename: z.string().min(1),
                mimeType: z.string().min(1),
                sizeBytes: z.number().int().positive().optional(),
            }),
        )
        .output(
            z.object({
                uploadPath: z.string(),
                uploadUrl: z.string().url(),
                readUrl: z.string().url(),
                publicUrl: z.string().url(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);

            const rateLimitKey = `upload:${ctx.sessionUser.id}:${input.claimId ?? 'general'}`;
            if (!checkRateLimit(rateLimitKey, 10, 60_000)) {
                throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Trop de requetes. Reessayez dans une minute.' });
            }

            if (input.claimId) {
                const claim = await ctx.prisma.claim.findFirst({
                    where: { id: input.claimId, createdByUserId: ctx.sessionUser.id },
                    select: { id: true },
                });
                if (!claim) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Fil introuvable.' });
                }
            }

            let normalizedMime: string;
            try {
                ({ mimeType: normalizedMime } = validateUploadFile({
                    mimeType: input.mimeType,
                    filename: input.filename,
                    sizeBytes: input.sizeBytes,
                    allowedMimeTypes: ctx.chatUploadLimits.allowedMimeTypes,
                    maxBytes: ctx.chatUploadLimits.maxBytes,
                }));
            } catch (err) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: err instanceof Error ? err.message : 'Fichier non valide.',
                });
            }

            try {
                const signed = await ctx.createSignedUploadUrl({
                    claimId: input.claimId ?? ctx.sessionUser.id,
                    filename: input.filename,
                    mimeType: normalizedMime,
                    sizeBytes: input.sizeBytes,
                });
                return {
                    ...signed,
                    publicUrl: signed.readUrl,
                };
            } catch (err) {
                console.error('[claim.requestUpload]', {
                    userId: ctx.sessionUser.id,
                    claimId: input.claimId,
                    filename: input.filename,
                    message: err instanceof Error ? err.message : err,
                });
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message:
                        err instanceof Error
                            ? err.message
                            : "Impossible de preparer l'envoi du fichier.",
                });
            }
        }),

    transcribeAudio: protectedProcedure
        .input(
            z.object({
                audioBase64: z.string().min(1).max(8_000_000),
                mimeType: z
                    .enum(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'])
                    .default('audio/webm'),
                language: z.string().min(2).max(10).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);
            const preferEn = input.language === 'en';
            if (!ctx.transcribeAudio) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: preferEn
                        ? 'Voice transcription is unavailable.'
                        : 'La transcription vocale est indisponible.',
                });
            }

            try {
                const text = await ctx.transcribeAudio({
                    audioBase64: input.audioBase64,
                    mimeType: input.mimeType,
                    language: input.language,
                });
                return { text };
            } catch (err) {
                console.error('[claim.transcribeAudio]', {
                    userId: ctx.sessionUser.id,
                    message: err instanceof Error ? err.message : err,
                });
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: preferEn
                        ? 'Could not transcribe the audio.'
                        : 'Impossible de transcrire l audio.',
                });
            }
        }),

    generateAssistantReply: protectedProcedure
        .input(
            z.object({
                claimId: z.string().cuid(),
                replaceLastAssistant: z.boolean().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);
            const claim = await ctx.prisma.claim.findFirst({
                where: { id: input.claimId, createdByUserId: ctx.sessionUser.id },
                include: {
                    messages: { orderBy: { createdAt: 'asc' }, take: 20 },
                },
            });
            if (!claim) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Fil introuvable.' });
            }

            let threadMessages = claim.messages;
            if (input.replaceLastAssistant) {
                const lastAssistant = [...claim.messages].reverse().find((m) => m.role === 'ASSISTANT');
                if (lastAssistant) {
                    await ctx.prisma.claimMessage.delete({ where: { id: lastAssistant.id } });
                    threadMessages = claim.messages.filter((m) => m.id !== lastAssistant.id);
                }
            }

            const previousStatus = claim.status;
            const previousFactCheckStatus = claim.factCheckStatus;
            const previousFactCheckDate = claim.factCheckDate;
            const previousFactCheckText = claim.factCheckText;

            const lock = await ctx.prisma.claim.updateMany({
                where: {
                    id: claim.id,
                    createdByUserId: ctx.sessionUser.id,
                    status: { not: 'PROCESSING' },
                },
                data: { status: 'PROCESSING' },
            });
            if (lock.count === 0) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Une analyse est deja en cours.',
                });
            }

            ctx.broadcastToClaimSubscribers?.(claim.id, {
                type: 'typing.start',
                payload: { claimId: claim.id },
            });

            try {
            const firstUserMessage = threadMessages.find((m) => m.role === 'USER')?.content ?? '';
            const lastUserMessage =
                [...threadMessages].reverse().find((m) => m.role === 'USER')?.content ?? '';
            const hasPriorAssistant = threadMessages.some((m) => m.role === 'ASSISTANT');
            const { intent } = classifyMessageIntent({
                text: lastUserMessage,
                hasPriorAssistant,
            });
            const isFactCheck = intent === 'FACT_CHECK';
            const needsMetadata =
                isFactCheck &&
                (!claim.topicCategory ||
                    !claim.sourceName ||
                    !claim.location ||
                    !claim.platform ||
                    !claim.sourceType ||
                    !claim.claimDate);

            const claimCtx = {
                claimText: claim.claimText,
                claimLanguage: claim.claimLanguage,
                claimDate: claim.claimDate,
                sourceName: claim.sourceName,
                sourceType: claim.sourceType,
                sourceUrl: claim.sourceUrl,
                mediaType: claim.mediaType,
                topicCategory: claim.topicCategory,
                location: claim.location,
                platform: claim.platform,
            };

            let assistantText = '';
            let aiFailed = false;
            let mergedMeta = {
                topicCategory: claim.topicCategory,
                sourceType: claim.sourceType,
                sourceName: claim.sourceName,
                location: claim.location,
                platform: claim.platform,
                claimDate: claim.claimDate,
                sourceUrl: claim.sourceUrl,
            };

            try {
                const [text, extracted] = await Promise.all([
                    ctx.generateAssistantText({
                        claim: claimCtx,
                        thread: threadMessages.map((msg) => ({
                            role: msg.role,
                            content: msg.content,
                        })),
                        intent,
                    }),
                    needsMetadata && ctx.extractClaimMetadata
                        ? ctx.extractClaimMetadata({ text: firstUserMessage })
                        : Promise.resolve(undefined),
                ]);
                assistantText = text;

                if (extracted && Object.keys(extracted).length > 0) {
                    const metaUpdate: Record<string, unknown> = {};
                    if (!claim.topicCategory && extracted.topicCategory) {
                        metaUpdate.topicCategory = extracted.topicCategory;
                        mergedMeta.topicCategory = extracted.topicCategory;
                    }
                    if (!claim.sourceType && extracted.sourceType) {
                        metaUpdate.sourceType = extracted.sourceType;
                        mergedMeta.sourceType = extracted.sourceType;
                    }
                    if (!claim.sourceName && extracted.sourceName) {
                        metaUpdate.sourceName = extracted.sourceName;
                        mergedMeta.sourceName = extracted.sourceName;
                    }
                    if (!claim.location && extracted.location) {
                        metaUpdate.location = extracted.location;
                        mergedMeta.location = extracted.location;
                    }
                    if (!claim.platform && extracted.platform) {
                        metaUpdate.platform = extracted.platform;
                        mergedMeta.platform = extracted.platform;
                    }
                    if (Object.keys(metaUpdate).length > 0) {
                        try {
                            await ctx.prisma.claim.update({
                                where: { id: claim.id },
                                data: metaUpdate,
                            });
                        } catch (err) {
                            console.error('[generateAssistantReply] metadata update failed', {
                                claimId: claim.id,
                                message: err instanceof Error ? err.message : err,
                            });
                        }
                    }
                }
            } catch {
                aiFailed = true;
                assistantText = assistantFailureMessage(claim.claimLanguage);
            }

            const verdict = aiFailed || !isFactCheck ? null : parseVerdict(assistantText);
            const now = new Date();
            const factCheckStatus = isFactCheck
                ? (verdict ?? previousFactCheckStatus)
                : previousFactCheckStatus;
            const factCheckDate = isFactCheck && verdict ? now : previousFactCheckDate;
            const restoredStatus = (() => {
                if (aiFailed && isFactCheck) return 'FAILED' as const;
                if (!isFactCheck) {
                    if (previousStatus === 'PROCESSING') return 'OPEN' as const;
                    return previousStatus === 'FAILED' ? ('OPEN' as const) : previousStatus;
                }
                return 'RESOLVED' as const;
            })();

            const attachmentUrls = threadMessages.flatMap((msg) => {
                if (msg.role !== 'USER' || !Array.isArray(msg.attachments)) return [];
                return msg.attachments
                    .map((raw) => {
                        if (!raw || typeof raw !== 'object') return null;
                        const url = (raw as { url?: unknown }).url;
                        return typeof url === 'string' ? url : null;
                    })
                    .filter((url): url is string => Boolean(url));
            });

            const contentWithDetails =
                isFactCheck || intent === 'FOLLOW_UP'
                    ? appendFactCheckDetailsFooter(assistantText, {
                          locale: resolveFactCheckLocale(claim.claimLanguage),
                          factCheckStatus,
                          factCheckDate,
                          topicCategory: mergedMeta.topicCategory,
                          location: mergedMeta.location,
                          claimDate: mergedMeta.claimDate,
                          sourceName: mergedMeta.sourceName,
                          sourceType: mergedMeta.sourceType,
                          platform: mergedMeta.platform,
                          sourceUrl: mergedMeta.sourceUrl,
                          sourceUrls: attachmentUrls,
                      })
                    : assistantText;

            const message = await ctx.prisma.claimMessage.create({
                data: {
                    claimId: claim.id,
                    role: 'ASSISTANT',
                    content: contentWithDetails,
                },
            });

            await ctx.prisma.claim.update({
                where: { id: claim.id },
                data: {
                    status: restoredStatus,
                    factCheckText: isFactCheck ? contentWithDetails : previousFactCheckText,
                    factCheckStatus,
                    factCheckDate,
                },
            });

            ctx.broadcastToClaimSubscribers?.(claim.id, {
                type: 'message.created',
                payload: { claimId: claim.id, messageId: message.id },
            });
            ctx.broadcastToClaimSubscribers?.(claim.id, {
                type: 'claim.statusChanged',
                payload: {
                    claimId: claim.id,
                    factCheckStatus,
                    status: restoredStatus,
                },
            });

            if (aiFailed && isFactCheck) {
                const queuedIdempotencyKey = `claim-queued:human:${claim.id}:${message.id}`;
                try {
                    const queuedSend = await ctx.sendClaimQueuedEmail({
                        to: ctx.sessionUser.email,
                        claimId: claim.id,
                        idempotencyKey: queuedIdempotencyKey,
                    });
                    await ctx.prisma.emailDelivery.upsert({
                        where: { idempotencyKey: queuedIdempotencyKey },
                        update: {
                            status: queuedSend.ok ? 'sent' : 'failed',
                            providerMessageId: queuedSend.ok ? queuedSend.providerMessageId : null,
                            errorCode: queuedSend.ok ? null : queuedSend.errorCode,
                            attemptCount: { increment: 1 },
                            lastAttemptAt: new Date(),
                        },
                        create: {
                            userId: ctx.sessionUser.id,
                            claimId: claim.id,
                            templateKey: 'claim-queued',
                            idempotencyKey: queuedIdempotencyKey,
                            status: queuedSend.ok ? 'sent' : 'failed',
                            providerMessageId: queuedSend.ok ? queuedSend.providerMessageId : null,
                            errorCode: queuedSend.ok ? null : queuedSend.errorCode,
                        },
                    });
                } catch (err) {
                    console.error('[generateAssistantReply] human queue email failed', {
                        claimId: claim.id,
                        message: err instanceof Error ? err.message : err,
                    });
                }
            }

            if (!aiFailed && isFactCheck) {
                const resolvedIdempotencyKey = `claim-resolved:${ctx.sessionUser.id}:${claim.id}:${message.id}`;
                try {
                    const resolvedSend = await ctx.sendClaimResolvedEmail({
                        to: ctx.sessionUser.email,
                        claimId: claim.id,
                        idempotencyKey: resolvedIdempotencyKey,
                    });
                    await ctx.prisma.emailDelivery.upsert({
                        where: { idempotencyKey: resolvedIdempotencyKey },
                        update: {
                            status: resolvedSend.ok ? 'sent' : 'failed',
                            providerMessageId: resolvedSend.ok ? resolvedSend.providerMessageId : null,
                            errorCode: resolvedSend.ok ? null : resolvedSend.errorCode,
                            attemptCount: { increment: 1 },
                            lastAttemptAt: new Date(),
                        },
                        create: {
                            userId: ctx.sessionUser.id,
                            claimId: claim.id,
                            templateKey: 'claim-resolved',
                            idempotencyKey: resolvedIdempotencyKey,
                            status: resolvedSend.ok ? 'sent' : 'failed',
                            providerMessageId: resolvedSend.ok ? resolvedSend.providerMessageId : null,
                            errorCode: resolvedSend.ok ? null : resolvedSend.errorCode,
                        },
                    });
                } catch (err) {
                    console.error('[generateAssistantReply] resolved email failed', {
                        claimId: claim.id,
                        message: err instanceof Error ? err.message : err,
                    });
                }
            }

            return {
                messageId: message.id,
                content: contentWithDetails,
                factCheckStatus,
                status: aiFailed ? 'FAILED' : 'RESOLVED',
            };
            } finally {
                ctx.broadcastToClaimSubscribers?.(claim.id, {
                    type: 'typing.stop',
                    payload: { claimId: claim.id },
                });
            }
        }),

    submitMessageFeedback: protectedProcedure
        .input(
            z.object({
                claimId: z.string().cuid(),
                messageId: z.string().cuid(),
                rating: z.enum(['GOOD', 'BAD']),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await requireVerifiedEmail(ctx);

            const message = await ctx.prisma.claimMessage.findFirst({
                where: {
                    id: input.messageId,
                    claimId: input.claimId,
                    role: 'ASSISTANT',
                    claim: { createdByUserId: ctx.sessionUser.id },
                },
                select: { id: true },
            });
            if (!message) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Message introuvable.' });
            }

            const feedback = await ctx.prisma.messageFeedback.upsert({
                where: {
                    messageId_userId: {
                        messageId: input.messageId,
                        userId: ctx.sessionUser.id,
                    },
                },
                update: { rating: input.rating },
                create: {
                    messageId: input.messageId,
                    userId: ctx.sessionUser.id,
                    rating: input.rating,
                },
            });

            return { rating: feedback.rating };
        }),
});
