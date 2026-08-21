/**
 * Limite de requisições em memória, por chave (usuário ou IP).
 *
 * Em serverless cada instância tem o próprio Map — não é um teto global.
 * Ainda assim corta o abuso trivial (script batendo na mesma instância) e é
 * o que cabe sem Redis. A autenticação de admin é a barreira principal;
 * isto é o segundo freio.
 */

type Balde = { vezes: number[] };

const baldes = new Map<string, Balde>();

export function consomeLimite(
  chave: string,
  max: number,
  janelaMs: number,
  agora = Date.now(),
): boolean {
  const balde = baldes.get(chave) ?? { vezes: [] };
  const corte = agora - janelaMs;
  balde.vezes = balde.vezes.filter((t) => t > corte);
  if (balde.vezes.length >= max) {
    baldes.set(chave, balde);
    return false;
  }
  balde.vezes.push(agora);
  baldes.set(chave, balde);
  return true;
}

/** Só para os testes não vazarem estado de um caso para o outro. */
export function zeraLimitesParaTeste() {
  baldes.clear();
}
