import { test, expect } from '@playwright/test';

const ROUTES: Array<{ path: string; heading: string }> = [
  { path: '/', heading: 'Roteiros com Alma Potiguar' },
  // Sem sessão, /avaliar mostra o gate de login antes do formulário — comportamento esperado.
  { path: '/avaliar', heading: 'Bem-vindo ao POTI' },
  { path: '/ranking', heading: 'Ranking dos Destinos' },
];

for (const { path, heading } of ROUTES) {
  test(`${path} carrega e renderiza o conteúdo esperado`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const response = await page.goto(path);
    expect(response?.ok(), `resposta HTTP de ${path}`).toBeTruthy();
    await expect(page.getByText(heading, { exact: false }).first()).toBeVisible();

    expect(pageErrors, `erros não tratados em ${path}: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
  });
}

test('login exibe as opções de entrada', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
});

test.describe('navegação mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('barra inferior leva da home até o ranking', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Ranking', exact: true }).click();
    await expect(page).toHaveURL(/\/ranking/);
    await expect(page.getByText('Ranking dos Destinos', { exact: false }).first()).toBeVisible();
  });
});
