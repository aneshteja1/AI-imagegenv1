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

        {/* Prevent dark/light theme flash before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('vt_theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');if(d)document.documentElement.classList.add('dark');}catch(e){}})();` }} />

        {/* Font preloads — eliminates flash of unstyled text */}
        <link rel="preload" href="/fonts/Satoshi-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Satoshi-Medium.otf"  as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Satoshi-Bold.otf"    as="font" type="font/otf" crossOrigin="anonymous" />
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
