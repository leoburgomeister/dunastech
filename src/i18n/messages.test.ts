import { describe, it, expect } from 'vitest';
import { createTranslator } from 'next-intl';
import ptBR from './messages/pt-BR.json';
import en from './messages/en.json';
import es from './messages/es.json';

/**
 * A interface é servida em três idiomas e o build não olha para o conteúdo das
 * mensagens: chave faltando num idioma vira o próprio nome da chave na tela, e erro
 * de sintaxe ICU só estoura quando aquele trecho é renderizado — no caso do aviso de
 * substituição por ISA, dentro do painel do roteiro já montado.
 */

const IDIOMAS = { 'pt-BR': ptBR, en, es } as const;

/** Todos os caminhos "namespace.chave" de um arquivo de mensagens. */
function chaves(objeto: Record<string, unknown>, prefixo = ''): string[] {
  return Object.entries(objeto).flatMap(([chave, valor]) => {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave;
    return valor !== null && typeof valor === 'object'
      ? chaves(valor as Record<string, unknown>, caminho)
      : [caminho];
  });
}

describe('paridade entre idiomas', () => {
  const referencia = chaves(ptBR).sort();

  for (const [locale, mensagens] of Object.entries(IDIOMAS)) {
    if (locale === 'pt-BR') continue;

    it(`${locale} tem exatamente as mesmas chaves de pt-BR`, () => {
      const atuais = chaves(mensagens as Record<string, unknown>).sort();
      expect(atuais.filter((k) => !referencia.includes(k)), `sobrando em ${locale}`).toEqual([]);
      expect(referencia.filter((k) => !atuais.includes(k)), `faltando em ${locale}`).toEqual([]);
    });
  }
});

/**
 * `createTranslator` deriva as chaves válidas do tipo das mensagens. Aqui o arquivo
 * entra como JSON genérico, então o cast troca essa inferência por esta interface
 * mínima — o que o teste checa é o comportamento em runtime, não os tipos.
 */
interface TradutorRico {
  rich: (chave: string, valores: Record<string, unknown>) => unknown;
}

describe('aviso de substituição por ISA', () => {
  for (const [locale, mensagens] of Object.entries(IDIOMAS)) {
    it(`interpola e formata em ${locale}`, () => {
      const t = createTranslator({
        locale,
        messages: mensagens,
        namespace: 'planner',
      } as never) as unknown as TradutorRico;

      const saida = t.rich('isaReplacement', {
        removed: 'Forte dos Reis Magos',
        isa: 38,
        replacedBy: 'Barreira do Inferno',
        strong: (chunks: unknown) => chunks as never,
      });

      const texto = Array.isArray(saida) ? saida.flat(9).join('') : String(saida);
      expect(texto).toContain('Forte dos Reis Magos');
      expect(texto).toContain('Barreira do Inferno');
      expect(texto).toContain('38');
    });
  }
});
