import { createClient } from '@supabase/supabase-js';
import {
    formatEvidenceBlock,
    mergeEvidenceHits,
    retrieveFromCorpus,
    scoreDatabaseCandidate,
    significantTokensForDb,
    toDatabaseEvidenceHit,
    type ChatMessageIntent,
    type EvidenceHit,
} from '@afalambe/ai';
import {
    sendClaimQueuedEmail,
    sendClaimResolvedEmail,
    sendPasswordResetEmail,
    sendVerifyEmail,
} from '@afalambe/emails';
import { prisma } from '@afalambe/prisma';
import type { ExtractedMetadata, TrpcContext } from '@afalambe/trpc';
import { generateProviderText, transcribeAudioWithProvider } from './ai-provider';
import {
    hashPassword,
    hashToken,
    parseCookies,
    SESSION_COOKIE,
    verifyPassword,
} from './auth-crypto';
import {
    CHAT_ALLOWED_IMAGE_MIME_TYPES,
    CHAT_BUCKET,
    CHAT_IMAGE_MAX_BYTES,
    chatUploadLimits,
} from './chat-upload-limits';

export type CookieJar = {
    getCookieHeader: () => string | undefined;
    setSessionCookie: (token: string, expiresAt: Date) => void;
    clearSessionCookie: () => void;
};

export type CreateTrpcContextOptions = {
    cookies: CookieJar;
    broadcastToClaimSubscribers?: TrpcContext['broadcastToClaimSubscribers'];
};

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRole) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for uploads.');
    }
    supabaseClient = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return supabaseClient;
}

export async function createTrpcContext(opts: CreateTrpcContextOptions): Promise<TrpcContext> {
    const cookies = parseCookies(opts.cookies.getCookieHeader());
    const rawToken = cookies[SESSION_COOKIE];

    let sessionUser: TrpcContext['sessionUser'] = null;
    let sessionTokenHash: string | null = null;
    if (rawToken) {
        const tokenHash = hashToken(rawToken);
        const session = await prisma.session.findFirst({
            where: { tokenHash, expiresAt: { gt: new Date() } },
            include: { user: true },
        });
        if (session) {
            sessionUser = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
            };
            sessionTokenHash = tokenHash;
        }
    }

    return {
        prisma,
        sessionUser,
        sessionTokenHash,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002',
        setSessionCookie: opts.cookies.setSessionCookie,
        clearSessionCookie: opts.cookies.clearSessionCookie,
        hashPassword,
        verifyPassword,
        hashToken,
        sendVerifyEmail,
        sendPasswordResetEmail,
        sendClaimQueuedEmail,
        sendClaimResolvedEmail,
        chatUploadLimits,
        createSignedUploadUrl: async ({ claimId, filename, mimeType, sizeBytes }) => {
            if (sizeBytes !== undefined && sizeBytes > CHAT_IMAGE_MAX_BYTES) {
                const maxMb = Math.round(CHAT_IMAGE_MAX_BYTES / (1024 * 1024));
                throw new Error(`L'image depasse la taille maximale de ${maxMb} Mo.`);
            }
            if (!CHAT_ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
                throw new Error(`Unsupported mime type ${mimeType}`);
            }
            const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const uploadPath = `claims/${claimId}/${Date.now()}-${safeName}`;
            const storage = getSupabaseClient().storage.from(CHAT_BUCKET);
            const signed = await storage.createSignedUploadUrl(uploadPath);
            if (signed.error || !signed.data) {
                console.error('[upload] createSignedUploadUrl failed', {
                    claimId,
                    uploadPath,
                    message: signed.error?.message,
                });
                throw new Error(signed.error?.message ?? 'Could not create signed upload URL.');
            }
            const readSigned = await storage.createSignedUrl(uploadPath, 3600);
            if (readSigned.error || !readSigned.data?.signedUrl) {
                console.error('[upload] createSignedUrl failed', {
                    claimId,
                    uploadPath,
                    message: readSigned.error?.message,
                });
                throw new Error(readSigned.error?.message ?? 'Could not create signed read URL.');
            }
            return {
                uploadPath,
                uploadUrl: signed.data.signedUrl,
                readUrl: readSigned.data.signedUrl,
            };
        },
        createSignedReadUrl: async ({ uploadPath }) => {
            const readSigned = await getSupabaseClient()
                .storage.from(CHAT_BUCKET)
                .createSignedUrl(uploadPath, 3600);
            if (readSigned.error || !readSigned.data?.signedUrl) {
                throw new Error(readSigned.error?.message ?? 'Could not create signed read URL.');
            }
            return readSigned.data.signedUrl;
        },
        broadcastToClaimSubscribers: opts.broadcastToClaimSubscribers,
        generateAssistantText: async ({ claim, thread, intent = 'FACT_CHECK' }) => {
            const claimContext = [
                claim.sourceName && `Source: ${claim.sourceName} (${claim.sourceType ?? 'unknown'})`,
                claim.platform && `Platform: ${claim.platform}`,
                claim.sourceUrl && `Original URL: ${claim.sourceUrl}`,
                claim.topicCategory && `Topic: ${claim.topicCategory}`,
                claim.location && `Location: ${claim.location}`,
                claim.claimLanguage && `Claim language: ${claim.claimLanguage}`,
                claim.claimDate && `Claim date: ${claim.claimDate.toISOString().split('T')[0]}`,
                claim.mediaType && `Media type: ${claim.mediaType}`,
            ]
                .filter(Boolean)
                .join('\n');

            const lastUserMessage = [...thread].reverse().find((m) => m.role === 'USER')?.content;
            const query = (lastUserMessage || claim.claimText || '').trim();
            const resolvedIntent: ChatMessageIntent = intent;

            if (resolvedIntent === 'META') {
                const systemPrompt = `You are Afalambe's assistant. The user is asking about the product or about fact-checking in general — NOT submitting a claim to verify.

Explain clearly (French or English matching the user):
- Afalambe helps people in Africa verify rumors and claims (WhatsApp, social media, politics, health, finance).
- They should paste a specific claim or rumor to get a verification.
- Do NOT invent a verdict (VERIFIED/DEBUNKED/etc.). Do NOT invent sources or images.

Claim metadata (may be empty):
${claimContext || 'No claim metadata yet.'}`;

                return generateProviderText({
                    system: systemPrompt,
                    messages: thread.map((m) => ({
                        role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
                        content: m.content,
                    })),
                    timeoutMs: 30_000,
                });
            }

            if (resolvedIntent === 'OFF_TOPIC') {
                const systemPrompt = `You are Afalambe's assistant. The user's message is not a claim to fact-check.

Politely redirect them to paste a rumor or claim they want verified (WhatsApp forward, social post, statement). Respond in the user's language (French or English). Do NOT invent a verdict or sources.`;

                return generateProviderText({
                    system: systemPrompt,
                    messages: thread.map((m) => ({
                        role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
                        content: m.content,
                    })),
                    timeoutMs: 20_000,
                });
            }

            if (resolvedIntent === 'FOLLOW_UP') {
                const systemPrompt = `You are Afalambe's fact-checking assistant continuing an existing verification thread.

The user is asking a follow-up or clarification about the prior analysis — not submitting a brand-new claim.
- Answer using the conversation so far and the claim metadata below.
- Do NOT issue a new verdict label (VERIFIED/DEBUNKED/MISLEADING/PARTIALLY_TRUE) unless the prior reply already established one and you are only explaining it.
- Do NOT invent sources, evidence ids, or images.
- Respond in the user's language.

Claim metadata:
${claimContext || 'No metadata provided.'}`;

                return generateProviderText({
                    system: systemPrompt,
                    messages: thread.map((m) => ({
                        role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
                        content: m.content,
                    })),
                    timeoutMs: 30_000,
                });
            }

            let evidenceHits: EvidenceHit[] = [];
            try {
                const corpusHits = retrieveFromCorpus(query, {
                    limit: 5,
                    topicCategory: claim.topicCategory ?? null,
                });

                const tokens = significantTokensForDb(query, 5);
                let dbHits: EvidenceHit[] = [];
                if (tokens.length > 0) {
                    const candidates = await prisma.claim.findMany({
                        where: {
                            status: 'RESOLVED',
                            factCheckText: { not: null },
                            OR: tokens.map((token) => ({
                                OR: [
                                    { claimText: { contains: token, mode: 'insensitive' as const } },
                                    { factCheckText: { contains: token, mode: 'insensitive' as const } },
                                ],
                            })),
                        },
                        select: {
                            id: true,
                            claimText: true,
                            factCheckText: true,
                            factCheckStatus: true,
                            topicCategory: true,
                            location: true,
                            sourceUrl: true,
                        },
                        take: 25,
                        orderBy: { updatedAt: 'desc' },
                    });

                    dbHits = candidates
                        .map((candidate) => {
                            const score = scoreDatabaseCandidate(
                                candidate,
                                tokens,
                                claim.topicCategory ?? null,
                            );
                            return { candidate, score };
                        })
                        .filter((row) => row.score > 0)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map(({ candidate, score }) => toDatabaseEvidenceHit(candidate, score));
                }

                evidenceHits = mergeEvidenceHits([...corpusHits, ...dbHits], 8);
            } catch (error) {
                console.error('[factcheck] evidence retrieval failed', error);
            }

            const evidenceBlock = formatEvidenceBlock(evidenceHits);

            const systemPrompt = `You are a fact-checking assistant for Afalambe, helping users in Africa verify claims and combat misinformation. Your role:

1. Analyze claims against known facts, context, and logical reasoning.
2. Provide a clear verdict: VERIFIED, DEBUNKED, MISLEADING, or PARTIALLY_TRUE. If uncertain, say so explicitly.
3. Cite reasoning and suggest where users can find authoritative sources.
4. Be culturally aware of the African context (local politics, health campaigns, regional events). Prefer Guinean and West African cases when relevant.
5. Respond in the same language as the claim when possible (French, Fula, or English).
6. When approved evidence is provided below and matches the user claim, ground your answer in it and cite the evidence id (AFA-* or database claim id) or URL. Do not invent evidence ids.

Claim metadata:
${claimContext || 'No metadata provided.'}
${evidenceBlock ? `\n${evidenceBlock}` : ''}`;

            return generateProviderText({
                system: systemPrompt,
                messages: thread.map((m) => ({
                    role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
                    content: m.content,
                })),
                timeoutMs: 30_000,
            });
        },
        extractClaimMetadata: async ({ text }): Promise<ExtractedMetadata> => {
            if (!process.env.AI_API_KEY) return {};

            try {
                const raw = await generateProviderText({
                    system: `You are a metadata classifier for fact-checking claims in Africa. Given a user's message, extract structured metadata. Return ONLY a JSON object with these optional fields:
- topicCategory: one of POLITICS, HEALTH, FINANCE, TECH, SECURITY, EDUCATION, ENVIRONMENT (or omit if unclear)
- sourceType: one of POLITICIAN, MEDIA, SOCIAL_MEDIA, BLOG, NGO, CITIZEN (or omit if unclear)
- sourceName: the person/org who made the claim (or omit if not mentioned)
- location: country or region (or omit if not mentioned)
- platform: where the claim was seen, e.g. twitter, whatsapp, facebook, tv, radio, tiktok (or omit if not mentioned)
Return ONLY valid JSON, no explanation.`,
                    messages: [{ role: 'user', content: text }],
                    temperature: 0,
                    timeoutMs: 10_000,
                });

                const jsonStart = raw.indexOf('{');
                const jsonEnd = raw.lastIndexOf('}');
                const jsonText =
                    jsonStart >= 0 && jsonEnd > jsonStart ? raw.slice(jsonStart, jsonEnd + 1) : raw;
                const parsed = JSON.parse(jsonText) as Record<string, unknown>;
                const result: ExtractedMetadata = {};

                const validTopics = new Set([
                    'POLITICS',
                    'HEALTH',
                    'FINANCE',
                    'TECH',
                    'SECURITY',
                    'EDUCATION',
                    'ENVIRONMENT',
                ]);
                const validSources = new Set([
                    'POLITICIAN',
                    'MEDIA',
                    'SOCIAL_MEDIA',
                    'BLOG',
                    'NGO',
                    'CITIZEN',
                ]);

                if (typeof parsed.topicCategory === 'string' && validTopics.has(parsed.topicCategory)) {
                    result.topicCategory = parsed.topicCategory as ExtractedMetadata['topicCategory'];
                }
                if (typeof parsed.sourceType === 'string' && validSources.has(parsed.sourceType)) {
                    result.sourceType = parsed.sourceType as ExtractedMetadata['sourceType'];
                }
                if (typeof parsed.sourceName === 'string' && parsed.sourceName.length > 0) {
                    result.sourceName = parsed.sourceName.slice(0, 200);
                }
                if (typeof parsed.location === 'string' && parsed.location.length > 0) {
                    result.location = parsed.location.slice(0, 200);
                }
                if (typeof parsed.platform === 'string' && parsed.platform.length > 0) {
                    result.platform = parsed.platform.slice(0, 100).toLowerCase();
                }

                return result;
            } catch {
                return {};
            }
        },
        transcribeAudio: async ({ audioBase64, mimeType, language }) => {
            return transcribeAudioWithProvider({ audioBase64, mimeType, language });
        },
    };
}
