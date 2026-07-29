import { describe, it, expect, vi } from 'vitest';
import {
  classifyMapError,
  createFallbackWatcher,
  SOURCE_FAILURE_THRESHOLD,
} from './fallback';

/** Forma real capturada no browser com chave invalida no estilo. */
const ERRO_ESTILO_403 = {
  error: {
    status: 403,
    statusText: '',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=x',
    message: 'AJAXError:  (403): https://api.maptiler.com/maps/hybrid/style.json?key=x',
  },
};

const erroDeSource = (status = 403) => ({ sourceId: 'maptiler-terrain', error: { status } });

describe('classifyMapError', () => {
  it('trata falha de estilo como fatal — e a forma medida no browser', () => {
    expect(classifyMapError(ERRO_ESTILO_403)).toBe('style');
  });

  it('separa falha de source de falha de estilo pelo sourceId', () => {
    expect(classifyMapError(erroDeSource())).toBe('source');
  });

  it('ignora erro sem status HTTP', () => {
    // erros de WebGL, de expressao de estilo, de geometria etc. nao sao motivo
    // para trocar o basemap
    expect(classifyMapError({ error: { message: 'layer inexistente' } })).toBe('ignore');
    expect(classifyMapError({})).toBe('ignore');
  });

  it('ignora status abaixo de 400', () => {
    expect(classifyMapError({ error: { status: 204 } })).toBe('ignore');
    expect(classifyMapError({ error: { status: 304 } })).toBe('ignore');
  });

  it('reconhece 401 e 429 alem de 403', () => {
    expect(classifyMapError({ error: { status: 401 } })).toBe('style');
    expect(classifyMapError({ error: { status: 429 } })).toBe('style');
    expect(classifyMapError({ sourceId: 's', error: { status: 429 } })).toBe('source');
  });
});

describe('createFallbackWatcher', () => {
  it('degrada na primeira falha de estilo', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback);
    w.handle(ERRO_ESTILO_403);
    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledWith('style');
    expect(w.hasFallenBack()).toBe(true);
  });

  it('aguenta falha de source isolada sem degradar', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback);
    for (let i = 0; i < SOURCE_FAILURE_THRESHOLD - 1; i++) w.handle(erroDeSource());
    expect(onFallback).not.toHaveBeenCalled();
    expect(w.sourceFailures()).toBe(SOURCE_FAILURE_THRESHOLD - 1);
  });

  it('degrada ao atingir o limiar de falhas de source', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback);
    for (let i = 0; i < SOURCE_FAILURE_THRESHOLD; i++) w.handle(erroDeSource());
    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledWith('source');
  });

  it('degrada uma vez so — o 2D nao tem para onde cair', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback);
    w.handle(ERRO_ESTILO_403);
    w.handle(ERRO_ESTILO_403);
    for (let i = 0; i < 50; i++) w.handle(erroDeSource());
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('erro ignorado nao conta para o limiar', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback, 3);
    w.handle({ error: { message: 'ruido' } });
    w.handle({ sourceId: 's', error: { message: 'ruido' } });
    expect(w.sourceFailures()).toBe(0);
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('aceita limiar customizado', () => {
    const onFallback = vi.fn();
    const w = createFallbackWatcher(onFallback, 2);
    w.handle(erroDeSource());
    expect(onFallback).not.toHaveBeenCalled();
    w.handle(erroDeSource());
    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledWith('source');
  });
});
