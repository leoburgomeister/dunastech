import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { consomeLimite } from './rate-limit';

export function tokenDoBearer(header: string | null): string | null {
  if (!header) return null;
  const [esquema, token, ...resto] = header.split(/\s+/);
  if (!token || resto.length > 0 || esquema.toLowerCase() !== 'bearer') return null;
  return token;
}

function supabaseDoAmbiente(): { url: string; anon: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !anon) return null;
  return { url, anon };
}

function ipDoPedido(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

/**
 * Barra quem não é admin autenticado quando o Supabase está configurado.
 * Sem Supabase (demo local), só aplica o limite por IP — o painel mock
 * precisa continuar abrindo.
 *
 * Devolve a Response de erro ou `null` para seguir.
 */
export async function exigirAdmin(
  request: NextRequest,
  limite: { nome: string; max: number; janelaMs: number },
): Promise<NextResponse | null> {
  const cfg = supabaseDoAmbiente();
  const ip = ipDoPedido(request);

  if (!cfg) {
    if (!consomeLimite(`ip:${ip}:${limite.nome}`, limite.max, limite.janelaMs)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente em instantes.' },
        { status: 429 },
      );
    }
    return null;
  }

  const token = tokenDoBearer(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ error: 'Sessão obrigatória.' }, { status: 401 });
  }

  const auth = createClient(cfg.url, cfg.anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: sessao, error: erroSessao } = await auth.auth.getUser(token);
  if (erroSessao || !sessao.user) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  const { data: perfil } = await auth
    .from('usuarios')
    .select('role')
    .eq('auth_uid', sessao.user.id)
    .maybeSingle();

  if (perfil?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito à gestão.' }, { status: 403 });
  }

  if (!consomeLimite(`user:${sessao.user.id}:${limite.nome}`, limite.max, limite.janelaMs)) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente em instantes.' },
      { status: 429 },
    );
  }

  return null;
}
