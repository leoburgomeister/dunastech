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
});
