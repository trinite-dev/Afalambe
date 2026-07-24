import type { UiLocale } from '@/lib/ui-locale';
import { IMAGE_VALIDATION_MESSAGES } from '@/lib/ui-locale';

const IMAGE_LIMITS = {
  maxBytes: Number(process.env.NEXT_PUBLIC_CHAT_IMAGE_MAX_BYTES ?? 5_242_880),
  allowedTypes: ['image/png', 'image/jpeg', 'image/webp'] as string[],
  maxDimension: 4096,
  maxPerMessage: 4,
} as const;

const EXTENSION_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);

export { IMAGE_LIMITS };

export type ValidationResult = { valid: true } | { valid: false; error: string };

export function inferMimeType(file: File): string {
  const trimmed = file.type.trim().toLowerCase();
  if (trimmed && trimmed !== 'application/octet-stream') {
    return trimmed;
  }
  const match = file.name.toLowerCase().match(/\.[^.]+$/);
  const ext = match?.[0] ?? '';
  return EXTENSION_TO_MIME[ext] ?? trimmed;
}

export function validateImageFile(file: File, locale: UiLocale = 'fr'): ValidationResult {
  const messages = IMAGE_VALIDATION_MESSAGES[locale];
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  if (HEIC_EXTENSIONS.has(ext)) {
    return { valid: false, error: messages.heicUnsupported };
  }

  const mimeType = inferMimeType(file);
  if (!IMAGE_LIMITS.allowedTypes.includes(mimeType)) {
    return { valid: false, error: messages.formatUnsupported };
  }
  if (file.size > IMAGE_LIMITS.maxBytes) {
    return { valid: false, error: messages.fileTooLarge };
  }
  return { valid: true };
}

export function validateImageCount(currentCount: number, locale: UiLocale = 'fr'): ValidationResult {
  if (currentCount >= IMAGE_LIMITS.maxPerMessage) {
    return { valid: false, error: IMAGE_VALIDATION_MESSAGES[locale].maxPerMessage };
  }
  return { valid: true };
}

export function validateImageDimensions(file: File, locale: UiLocale = 'fr'): Promise<ValidationResult> {
  const messages = IMAGE_VALIDATION_MESSAGES[locale];
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width > IMAGE_LIMITS.maxDimension || img.height > IMAGE_LIMITS.maxDimension) {
        resolve({ valid: false, error: messages.dimensionsTooLarge });
        return;
      }
      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: messages.unreadable });
    };

    img.src = url;
  });
}

export async function validateImage(
  file: File,
  currentCount: number,
  locale: UiLocale = 'fr',
): Promise<ValidationResult> {
  const countCheck = validateImageCount(currentCount, locale);
  if (!countCheck.valid) return countCheck;

  const fileCheck = validateImageFile(file, locale);
  if (!fileCheck.valid) return fileCheck;

  const dimCheck = await validateImageDimensions(file, locale);
  if (!dimCheck.valid) return dimCheck;

  return { valid: true };
}
