/**
 * Degradacao do basemap quando o MapTiler falha.
 *
 * resolveMapMode() so testa se a CHAVE EXISTE. Com chave invalida, revogada ou
 * cota estourada o modo continuava 3D, o MapTiler respondia 403 e o mapa nao
 * subia — a home ficava vazia em vez de simplesmente mais simples. Aconteceu
 * de verdade em 29/07/2026, na vespera do CONETUR.
 *
 * A classificacao abaixo veio de medicao, nao de suposicao: instanciamos um
 * mapa com chave invalida e capturamos o evento real. Com falha de estilo o
 * MapLibre emite UM evento com sourceId ausente, error.status 403 e os campos
 * status/statusText/url/body, e o evento 'load' nunca dispara.
 */

export type MapErrorKind = 'style' | 'source' | 'ignore';

export interface MapErrorLike {
  sourceId?: string;
  error?: { status?: number; message?: string };
}

/**
 * O MapLibre usa status 0 para falha do proprio fetch — CORS, DNS, offline,
 * firewall bloqueando o dominio. O fonte diz textualmente "we provide the
 * arbitrary HTTP error code of 0". Tratar so 4xx/5xx deixaria passar
 * justamente o caso de rede de auditorio bloqueando api.maptiler.com.
 */
function falhouNaRede(status: number | undefined): boolean {
  return typeof status === 'number' && (status === 0 || status >= 400);
}

/**
 * Falha de estilo e fatal: sem estilo nao ha mapa nenhum. Falha de source e
 * transitoria — um tile que nao veio nao justifica trocar o basemap inteiro,
 * ou qualquer rede ruim derrubaria a cena 3D.
 *
 * `styleLoaded` importa porque ausencia de sourceId NAO basta para concluir
 * "fatal": o Evented so injeta sourceId no bubbling a partir do source, entao
 * erro de outra natureza depois do estilo pronto chega sem sourceId e
 * dispararia degradacao a toa. Style que falhou de verdade nunca marca
 * isStyleLoaded().
 */
export function classifyMapError(
  e: MapErrorLike,
  styleLoaded = false
): MapErrorKind {
  if (!falhouNaRede(e.error?.status)) return 'ignore';
  if (e.sourceId) return 'source';
  return styleLoaded ? 'ignore' : 'style';
}

/**
 * Quantas falhas de source aceitamos antes de desistir do 3D. Alto o bastante
 * para uma rede intermitente nao derrubar a cena, baixo o bastante para cota
 * estourada (que falha em TODO tile) degradar em segundos.
 */
export const SOURCE_FAILURE_THRESHOLD = 12;

export interface FallbackWatcher {
  /** Alimente com cada evento 'error' do mapa, mais map.isStyleLoaded(). */
  handle(e: MapErrorLike, styleLoaded?: boolean): void;
  sourceFailures(): number;
  hasFallenBack(): boolean;
}

export function createFallbackWatcher(
  onFallback: (motivo: MapErrorKind) => void,
  threshold: number = SOURCE_FAILURE_THRESHOLD
): FallbackWatcher {
  let falhas = 0;
  let caiu = false;

  const disparar = (motivo: MapErrorKind) => {
    if (caiu) return; // degrada uma vez so: o 2D nao tem para onde cair
    caiu = true;
    onFallback(motivo);
  };

  return {
    handle(e, styleLoaded = false) {
      const tipo = classifyMapError(e, styleLoaded);
      if (tipo === 'style') {
        disparar('style');
        return;
      }
      if (tipo === 'source') {
        falhas += 1;
        if (falhas >= threshold) disparar('source');
      }
    },
    sourceFailures: () => falhas,
    hasFallenBack: () => caiu,
  };
}
