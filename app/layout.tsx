import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/app/context/auth-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'VenkatTech Media Studio',
    template: '%s | VenkatTech',
  },
  description: 'Enterprise AI-powered face swap and image generation platform',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // DPI hint for high-resolution screens
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
