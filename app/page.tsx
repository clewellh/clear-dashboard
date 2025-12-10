// app/page.tsx
// Simple home page

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        CLEAR Dashboard Home
      </h1>
      <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
        This is your local Next.js app. It&apos;s working.
      </p>
      <p style={{ fontSize: '0.9rem' }}>
        Try visiting: <code>/municipality/demo-town</code> in the address bar.
      </p>
    </main>
  );
}
