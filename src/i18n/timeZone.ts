/**
 * Fuso do produto, compartilhado entre servidor e cliente.
 *
 * Mora num módulo próprio porque `i18n/config.ts` importa `next/headers` e não pode
 * ser puxado por componente de cliente. Sem essa separação o `IntlProvider` ficaria
 * sem o fuso — que era o defeito: o `getRequestConfig` do servidor declarava
 * `America/Fortaleza`, o `NextIntlClientProvider` não recebia nada, e o `use-intl`
 * registrava `ENVIRONMENT_FALLBACK` ("The `timeZone` parameter wasn't provided") a
 * cada render. Em produção eram 315 ocorrências atingindo 166 usuários, e o efeito
 * visível é data/hora formatada no fuso do servidor da Vercel (UTC) em vez do fuso
 * do Rio Grande do Norte.
 */
export const TIME_ZONE = 'America/Fortaleza';
