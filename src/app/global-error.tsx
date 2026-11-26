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
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#eaf6f6',
          color: '#0b2e2e',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* This fallback replaces the root layout, so globals.css (and its
            focus styles) are unavailable. Scope a visible focus ring here. */}
        <style>{`
          .retry-button:focus-visible {
            outline: 3px solid #c2004b;
            outline-offset: 3px;
          }
        `}</style>
        <main style={{ maxWidth: '52ch' }}>
          <h1 style={{ fontSize: '2rem', lineHeight: 1.1, color: '#0b5c5c' }}>
            Something went wrong
          </h1>
          <p style={{ lineHeight: 1.6 }}>
            The page could not load. Try again to reload it.
          </p>
          <button
            type="button"
            onClick={retry}
            className="retry-button"
            style={{
              minHeight: 48,
              padding: '12px 28px',
              border: 0,
              borderRadius: 8,
              background: '#ff0063',
              color: '#000000',
              fontSize: 14,
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
