'use client';

/**
 * Root error fallback. It replaces the root layout, so it must render its own
 * html/body and cannot rely on globals.css. Inline styles keep it readable.
 * The error message is intentionally not shown: server messages are generic in
 * production and client ones may contain user input.
 */
export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Bhutan Tech Connect</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#FFFFFF',
          color: '#1D1D1F',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* This fallback replaces the root layout, so globals.css (and its
            focus styles) are unavailable. Scope a visible focus ring here. */}
        <style>{`
          .retry-button {
            transition: background-color 150ms ease;
          }
          .retry-button:hover {
            background: #0B5C5C;
          }
          .retry-button:focus-visible {
            outline: 2px solid #0B5C5C;
            outline-offset: 2px;
          }
          @media (prefers-reduced-motion: reduce) {
            .retry-button {
              transition: none;
            }
          }
        `}</style>
        <main style={{ maxWidth: '52ch' }}>
          <h1
            style={{
              fontSize: '2rem',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#1D1D1F',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ lineHeight: 1.6, color: '#6E6E73', marginTop: 16 }}>
            The page could not load. Try again to reload it.
          </p>
          <button
            type="button"
            onClick={retry}
            className="retry-button"
            style={{
              minHeight: 48,
              marginTop: 24,
              padding: '12px 28px',
              border: 0,
              borderRadius: 8,
              background: '#0B5C5C',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
