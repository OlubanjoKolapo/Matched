'use client';

/**
 * Last resort when the root layout itself fails. Renders its own document,
 * so styles are inline and follow the system theme.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: 'light-dark(#f4efe6, #14110d)',
          color: 'light-dark(#16130f, #f1e9da)',
          colorScheme: 'light dark',
        }}
      >
        <title>Matched hit a snag</title>
        <main style={{ maxWidth: '28rem', display: 'grid', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0 }}>Matched hit a snag.</h1>
          <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.5 }}>
            Your wardrobe is stored on this device and is safe. Reloading usually fixes this.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              justifySelf: 'start',
              height: '3rem',
              padding: '0 1.5rem',
              border: 0,
              borderRadius: '999px',
              font: 'inherit',
              fontWeight: 600,
              background: 'light-dark(#16130f, #f1e9da)',
              color: 'light-dark(#f4efe6, #14110d)',
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
