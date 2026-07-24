const EXTENSION_TO_MIME: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
};

const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);

export function extensionFromFilename(filename: string): string {
    const match = filename.toLowerCase().match(/\.[^.]+$/);
    return match?.[0] ?? '';
}

export function mimeFromFilename(filename: string): string | null {
    const ext = extensionFromFilename(filename);
    return EXTENSION_TO_MIME[ext] ?? null;
}

export function normalizeUploadMimeType(mimeType: string, filename: string): string {
    const trimmed = mimeType.trim().toLowerCase();
    if (trimmed && trimmed !== 'application/octet-stream') {
        return trimmed;
    }
    return mimeFromFilename(filename) ?? trimmed;
}

export function validateUploadFile(args: {
    mimeType: string;
    filename: string;
    sizeBytes?: number;
    allowedMimeTypes: string[];
    maxBytes: number;
}): { mimeType: string } {
    const ext = extensionFromFilename(args.filename);
    if (HEIC_EXTENSIONS.has(ext)) {
        throw new Error('Format HEIC non pris en charge. Utilisez PNG, JPEG ou WebP.');
    }

    const normalized = normalizeUploadMimeType(args.mimeType, args.filename);
    if (!args.allowedMimeTypes.includes(normalized)) {
        throw new Error('Format non pris en charge. Utilisez PNG, JPEG ou WebP.');
    }

    const expectedFromExt = mimeFromFilename(args.filename);
    if (expectedFromExt && expectedFromExt !== normalized) {
        throw new Error('Extension du fichier incompatible avec le type MIME.');
    }

    if (args.sizeBytes !== undefined && args.sizeBytes > args.maxBytes) {
        const maxMb = Math.round(args.maxBytes / (1024 * 1024));
        throw new Error(`L'image depasse la taille maximale de ${maxMb} Mo.`);
    }

    return { mimeType: normalized };
}
