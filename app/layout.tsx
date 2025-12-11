// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CLEAR Budget & Corruption Dashboard',
  description:
    'CLEAR makes New Jersey municipal budgets, corruption impacts, and jobs foregone easy to explore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#f5f5f5] text-slate-900 antialiased"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
