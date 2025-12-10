// app/layout.tsx

import './globals.css';

export const metadata = {
  title: 'CLEAR Dashboard',
  description: 'Budget & Corruption Transparency for NJ Municipalities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f5f5f5',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
