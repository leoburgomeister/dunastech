import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { IntlProvider } from '@/providers/IntlProvider';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'POTI | Plataforma de Observatório do Turismo Inteligente',
    template: '%s | POTI',
  },
  description:
    'Plataforma de Observatório do Turismo Inteligente no Rio Grande do Norte.',
  keywords: ['turismo', 'Rio Grande do Norte', 'Natal', 'sustentabilidade', 'observatório', 'IA', 'Cadastur', 'POTI'],
  authors: [{ name: 'POTI' }],
  openGraph: {
    title: 'POTI | Plataforma de Observatório do Turismo Inteligente',
    description: 'Explore, avalie e monitore os destinos turísticos do RN.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'POTI',
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
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${jetbrains.variable}`}>
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
