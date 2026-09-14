import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * O projeto usa o alias "@/" do tsconfig, mas o vitest nao le tsconfig paths
 * sozinho — sem isto, qualquer modulo que importe por "@/" fica impossivel de
 * testar, e os testes acabam presos a imports relativos.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // e2e/ roda sob @playwright/test, não vitest — as duas suítes usam a
    // mesma extensão *.spec.ts e o vitest tentaria importar `test()` do
    // Playwright e quebrar.
    exclude: ['node_modules/**', 'e2e/**'],
  },
});
