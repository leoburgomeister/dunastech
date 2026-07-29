/**
 * Marcador dos mapas MapLibre.
 *
 * A cena e satelite com pitch de 60 graus, entao o pin nao pode ser so um
 * simbolo desenhado por cima: precisa parecer plantado no terreno. Por isso o
 * marcador tem tres partes empilhadas — a sombra elipse no chao, o anel que
 * expande no plano do chao e a cabeca suspensa por uma haste. E o mesmo
 * vocabulario dos placemarks do Google Earth, que resolvem esse problema ha
 * anos: a cabeca fica legivel de qualquer angulo e a sombra ancora o ponto.
 *
 * As cores entram por custom property para que anel, haste e cabeca derivem
 * de um unico valor em vez de tres atribuicoes soltas de style.
 */
export interface MarkerSpec {
  /** Cor da cabeca, da haste e do anel. */
  color: string;
  /** Emoji ou caractere exibido dentro da cabeca. */
  glyph: string;
}

export function createMarkerElement({ color, glyph }: MarkerSpec): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'marker-wrapper';
  wrapper.style.setProperty('--marker-color', color);

  const ground = document.createElement('div');
  ground.className = 'marker-ground';
  wrapper.appendChild(ground);

  const ping = document.createElement('div');
  ping.className = 'marker-ping';
  wrapper.appendChild(ping);

  const stem = document.createElement('div');
  stem.className = 'marker-stem';
  wrapper.appendChild(stem);

  const head = document.createElement('div');
  head.className = 'marker-head';
  wrapper.appendChild(head);

  const glyphEl = document.createElement('span');
  glyphEl.className = 'marker-glyph';
  glyphEl.textContent = glyph;
  head.appendChild(glyphEl);

  return wrapper;
}
