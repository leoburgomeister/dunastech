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
 * Falha de estilo e fatal: sem estilo nao ha mapa nenhum. Falha de source e
 * transitoria — um tile que nao veio nao justifica trocar o basemap inteiro,
 * ou qualquer rede ruim derrubaria a cena 3D.
 */
export function classifyMapError(e: MapErrorLike): MapErrorKind {
  const status = e.error?.status;
  const httpRuim = typeof status === 'number' && status >= 400;
  if (!httpRuim) return 'ignore';
  return e.sourceId ? 'source' : 'style';
}

/**
 * Quantas falhas de source aceitamos antes de desistir do 3D. Alto o bastante
 * para uma rede intermitente nao derrubar a cena, baixo o bastante para cota
 * estourada (que falha em TODO tile) degradar em segundos.
 */
export const SOURCE_FAILURE_THRESHOLD = 12;

export interface FallbackWatcher {
  /** Alimente com cada evento 'error' do mapa. */
  handle(e: MapErrorLike): void;
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
    handle(e) {
      const tipo = classifyMapError(e);
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
