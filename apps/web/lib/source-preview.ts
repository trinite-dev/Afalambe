export type SourceMediaKind = 'image' | 'video' | 'audio' | 'link';

export type SourcePreviewItem = {
    url: string;
    kind: SourceMediaKind;
    mimeType?: string;
    hostname: string;
    pathnameLabel: string;
};

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp', 'svg']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']);
const AUDIO_EXT = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);

const PATH_LABEL_MAX = 48;

function extensionFromPath(pathname: string): string {
    const base = pathname.split('/').pop() ?? '';
    const clean = base.split('?')[0]?.split('#')[0] ?? '';
    const dot = clean.lastIndexOf('.');
    if (dot < 0 || dot === clean.length - 1) return '';
    return clean.slice(dot + 1).toLowerCase();
}

function kindFromExtension(ext: string): SourceMediaKind | null {
    if (IMAGE_EXT.has(ext)) return 'image';
    if (VIDEO_EXT.has(ext)) return 'video';
    if (AUDIO_EXT.has(ext)) return 'audio';
    return null;
}

function kindFromMime(mimeType: string | null | undefined): SourceMediaKind | null {
    if (!mimeType) return null;
    const mime = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return null;
}

export function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function isAllowedSourceUrl(value: string): boolean {
    if (value.startsWith('/') && !value.startsWith('//')) return true;
    if (value.startsWith('blob:') || /^data:image\//i.test(value)) return true;
    return isHttpUrl(value);
}

export function classifySourceUrl(url: string, mimeType?: string | null): SourceMediaKind {
    const fromMime = kindFromMime(mimeType);
    if (fromMime) return fromMime;

    if (url.startsWith('blob:') || /^data:image\//i.test(url)) {
        return 'image';
    }

    try {
        const parsed = new URL(url, 'https://afalambe.local');
        const fromExt = kindFromExtension(extensionFromPath(parsed.pathname));
        if (fromExt) return fromExt;
    } catch {
        const fromExt = kindFromExtension(extensionFromPath(url));
        if (fromExt) return fromExt;
    }

    return 'link';
}

function truncateLabel(value: string, max = PATH_LABEL_MAX): string {
    if (value.length <= max) return value;
    return `${value.slice(0, max - 1)}…`;
}

export function buildSourcePreviewItem(url: string, mimeType?: string | null): SourcePreviewItem {
    const kind = classifySourceUrl(url, mimeType);
    let hostname = '';
    let pathnameLabel = url;

    try {
        const parsed = url.startsWith('/') ? new URL(url, 'https://afalambe.local') : new URL(url);
        hostname = url.startsWith('/') ? 'Afalambe' : parsed.hostname.replace(/^www\./, '');
        const path = `${parsed.pathname}${parsed.search}` || '/';
        const fileName = parsed.pathname.split('/').filter(Boolean).pop();
        pathnameLabel = truncateLabel(fileName && kind !== 'link' ? fileName : path === '/' ? hostname : path);
        if (kind === 'link' && path === '/') {
            pathnameLabel = hostname;
        }
    } catch {
        hostname = truncateLabel(url, 32);
        pathnameLabel = truncateLabel(url);
    }

    return {
        url,
        kind,
        mimeType: mimeType ?? undefined,
        hostname: hostname || truncateLabel(url, 32),
        pathnameLabel,
    };
}

export function buildSourcePreviewItems(
    urls: string[],
    mimeByUrl: Record<string, string> = {},
): SourcePreviewItem[] {
    const seen = new Set<string>();
    const items: SourcePreviewItem[] = [];

    for (const raw of urls) {
        const url = raw.trim();
        if (!url || seen.has(url)) continue;
        if (!isAllowedSourceUrl(url)) continue;
        seen.add(url);
        items.push(buildSourcePreviewItem(url, mimeByUrl[url]));
    }

    return items;
}

export function mimeMapFromAttachments(
    attachments: Array<{ url?: string | null; mimeType?: string | null }> | null | undefined,
): Record<string, string> {
    const map: Record<string, string> = {};
    if (!attachments) return map;
    for (const attachment of attachments) {
        const url = attachment.url?.trim();
        const mime = attachment.mimeType?.trim();
        if (url && mime) map[url] = mime;
    }
    return map;
}
