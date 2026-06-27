import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['pt-BR', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: Locale = locales.includes(cookieLocale as Locale) 
    ? (cookieLocale as Locale) 
    : defaultLocale;
    
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'America/Fortaleza',
  };
});
