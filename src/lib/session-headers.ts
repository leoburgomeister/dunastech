import { supabase } from './supabase';

/** Headers de fetch autenticado: a API de gestão recusa pedido sem Bearer. */
export async function headersComSessao(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!supabase) return headers;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
