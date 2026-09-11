import { test, expect } from '@playwright/test';

/**
 * Orçamentos alinhados aos limites "good" do Core Web Vitals do Google
 * (https://web.dev/articles/cls, /lcp, /inp), com folga para variância de CI.
 */
const BUDGETS = {
  lcpMs: 3000,
  clsScore: 0.15,
  ttfbMs: 1000,
};

async function collectWebVitals(page: import('@playwright/test').Page) {
  return page.evaluate(
    () =>
      new Promise<{ lcp: number | null; cls: number; ttfb: number | null }>((resolve) => {
        let lcp: number | null = null;
        let cls = 0;

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          })[]) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0] as
            | PerformanceNavigationTiming
            | undefined;
          resolve({ lcp, cls, ttfb: nav ? nav.responseStart : null });
        }, 500);
      }),
  );
}

test.describe('Core Web Vitals — build de produção', () => {
  for (const path of ['/', '/ranking']) {
    test(`${path} fica dentro do orçamento de LCP/CLS/TTFB`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const { lcp, cls, ttfb } = await collectWebVitals(page);

      expect(lcp, `LCP não foi registrado para ${path}`).not.toBeNull();
      expect(lcp as number, `LCP de ${path} acima do orçamento`).toBeLessThan(BUDGETS.lcpMs);

      expect(ttfb, `TTFB não foi registrado para ${path}`).not.toBeNull();
      expect(ttfb as number, `TTFB de ${path} acima do orçamento`).toBeLessThan(BUDGETS.ttfbMs);

      expect(cls, `CLS de ${path} acima do orçamento`).toBeLessThan(BUDGETS.clsScore);
    });
  }
});
