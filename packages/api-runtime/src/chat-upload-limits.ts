export const CHAT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_CHAT_UPLOADS ?? 'chat-uploads';

export const CHAT_IMAGE_MAX_BYTES = Number(process.env.CHAT_IMAGE_MAX_BYTES ?? 5 * 1024 * 1024);

export const CHAT_ALLOWED_IMAGE_MIME_TYPES = (
    process.env.CHAT_ALLOWED_IMAGE_MIME_TYPES ?? 'image/png,image/jpeg,image/webp'
)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export const chatUploadLimits = {
    maxBytes: CHAT_IMAGE_MAX_BYTES,
    allowedMimeTypes: CHAT_ALLOWED_IMAGE_MIME_TYPES,
};
