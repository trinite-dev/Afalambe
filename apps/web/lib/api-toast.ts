'use client';

import type { AppRouter } from '@afalambe/trpc';
import { TRPCClientError } from '@trpc/client';
import { toastManager } from '@afalambe/ui/components/toast';

import {
    API_ERRORS,
    resolveInitialUiLocale,
    type UiLocale,
} from '@/lib/ui-locale';

export type ApiToastPayload = {
    title: string;
    description?: string;
};

function getActiveLocale(): UiLocale {
    if (typeof window === 'undefined') return 'fr';
    return resolveInitialUiLocale();
}

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

function getTrpcClientErrorMessage(
    error: TRPCClientError<AppRouter>,
    locale: UiLocale,
): string {
    const data = error.data as
        | { zodError?: { fieldErrors?: Record<string, string[] | undefined> } }
        | undefined;
    const fieldErrors = data?.zodError?.fieldErrors;
    if (fieldErrors) {
        const parts = Object.entries(fieldErrors).flatMap(([field, messages]) =>
            (messages ?? []).map((message) => `${field}: ${message}`),
        );
        if (parts.length > 0) {
            return parts.join('; ');
        }
    }

    const shape = error.shape as { message?: string } | undefined;
    if (typeof shape?.message === 'string' && shape.message.trim().length > 0) {
        return shape.message;
    }

    return error.message || API_ERRORS[locale].generic;
}

/**
 * Map unknown errors (Error, string, tRPC errors) to a single message.
 */
export function getApiErrorMessage(error: unknown, locale?: UiLocale): string {
    const activeLocale = locale ?? getActiveLocale();

    if (error instanceof TRPCClientError) {
        return getTrpcClientErrorMessage(error, activeLocale);
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string' && error.trim().length > 0) {
        return error;
    }
    return API_ERRORS[activeLocale].unexpected;
}

/**
 * Preferred entry for catch blocks once fetch/tRPC is wired.
 */
export function notifyApiException(
    error: unknown,
    title?: string,
    locale?: UiLocale,
): void {
    const activeLocale = locale ?? getActiveLocale();
    notifyApiError({
        title: title ?? API_ERRORS[activeLocale].requestFailedTitle,
        description: getApiErrorMessage(error, activeLocale),
    });
}
