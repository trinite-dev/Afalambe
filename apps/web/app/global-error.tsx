'use client';

/**
 * Root-level error UI when the root layout fails. Must define `html` and `body`
 * (App Router). Keep markup self-contained; avoid importing app layout CSS that may be broken.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    fontFamily:
                        'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
                    background: '#fafafa',
                    color: '#0a0a0a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                    Something went wrong
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#525252', maxWidth: '28rem', margin: '0 0 1.25rem' }}>
                    The application could not load this page. Try again or reload the tab.
                </p>
                {error.digest ? (
                    <p style={{ fontSize: '0.75rem', color: '#737373', margin: '0 0 1rem' }}>Reference: {error.digest}</p>
                ) : null}
                <button
                    type="button"
                    onClick={() => reset()}
                    style={{
                        cursor: 'pointer',
                        border: '1px solid #d4d4d4',
                        background: '#0a0a0a',
                        color: '#fafafa',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
