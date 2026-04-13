'use client';

import { toastManager } from '@afalambe/ui/components/toast';

export type ApiToastPayload = {
    title: string;
    description?: string;
};

/**
 * Default success feedback after a mutation or API call completes.
 */
export function notifyApiSuccess(payload: ApiToastPayload): void {
    toastManager.add({
        type: 'success',
        title: payload.title,
        description: payload.description,
    });
}

/**
 * Default error feedback for failed requests or thrown errors.
 */
export function notifyApiError(payload: ApiToastPayload): void {
    toastManager.add({
        type: 'error',
        title: payload.title,
        description: payload.description,
    });
}

export function notifyApiInfo(payload: ApiToastPayload): void {
    toastManager.add({
        type: 'info',
        title: payload.title,
        description: payload.description,
    });
}

export function notifyApiWarning(payload: ApiToastPayload): void {
    toastManager.add({
        type: 'warning',
        title: payload.title,
        description: payload.description,
    });
}

/**
 * Map unknown errors (Error, string, future tRPC errors) to a single message.
 */
export function getApiErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string' && error.trim().length > 0) {
        return error;
    }
    return 'An unexpected error occurred.';
}

/**
 * Preferred entry for catch blocks once fetch/tRPC is wired.
 */
export function notifyApiException(
    error: unknown,
    title = 'Request failed',
): void {
    notifyApiError({
        title,
        description: getApiErrorMessage(error),
    });
}
