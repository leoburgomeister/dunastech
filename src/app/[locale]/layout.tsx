import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { IntlProvider } from '@/providers/IntlProvider';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DunasTech | Observatório Inteligente do Turismo',
    template: '%s | DunasTech',
  },
  description:
    'Plataforma inteligente de monitoramento sustentável do turismo no Rio Grande do Norte.',
  keywords: ['turismo', 'Rio Grande do Norte', 'Natal', 'sustentabilidade', 'observatório', 'IA', 'Cadastur'],
  authors: [{ name: 'DunasTech' }],
  openGraph: {
    title: 'DunasTech | Observatório Inteligente do Turismo',
    description: 'Explore, avalie e monitore os destinos turísticos do RN.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'DunasTech',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFD' },
    { media: '(prefers-color-scheme: dark)', color: '#060913' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body>
        <ThemeProvider>
          <IntlProvider locale={locale} messages={messages as Record<string, unknown>}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </IntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
