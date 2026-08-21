'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateCPF } from '@/lib/utils';

// Autenticação no Supabase, a mesma origem dos dados do produto.
//
// O login vivia no Firebase por herança do MVP do hackathon; os dados migraram para o
// Supabase e o auth ficou para trás, então o app carregava dois provedores para fazer
// um trabalho só. A tabela `usuarios` já nascera desenhada para cá — `auth_uid` e
// policies em `auth.uid()` —, só não era usada.
//
// Sem Supabase configurado o provider cai em modo mock (localStorage), que é o que
// mantém a demonstração de pé numa máquina sem variáveis de ambiente.

export interface PotiUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  cpf: string | null;
  role: 'tourist' | 'admin';
  provider: 'google' | 'cpf' | 'mock';
  createdAt: string;
}

interface AuthContextType {
  user: PotiUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithCPF: (cpf: string, name: string, email: string, docType?: 'cpf' | 'rne' | 'passport') => Promise<void>;
  signOutUser: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock user for development without Supabase
const MOCK_STORAGE_KEY = 'poti_mock_user';

function getMockUser(): PotiUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) as PotiUser : null;
  } catch {
    return null;
  }
}

function setMockUser(user: PotiUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }
}

/** Linha de `usuarios` como o app a lê. */
interface UsuarioRow {
  auth_uid: string | null;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  cpf: string | null;
  role: string | null;
  provider: string | null;
  created_at: string | null;
}

function toPotiUser(row: UsuarioRow, fallback: SupabaseUser): PotiUser {
  return {
    uid: row.auth_uid ?? fallback.id,
    email: row.email ?? fallback.email ?? null,
    displayName: row.display_name ?? null,
    photoURL: row.photo_url ?? null,
    cpf: row.cpf ?? null,
    // Só 'admin' promove. Qualquer outro valor cai em turista — o papel é definido
    // pelo backoffice via service role, e o trigger `usuarios_papel_imutavel` impede
    // que o próprio cliente se eleve.
    role: row.role === 'admin' ? 'admin' : 'tourist',
    provider: row.provider === 'google' ? 'google' : 'cpf',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/** Perfil vindo do metadata da sessão, para quando a linha ainda não existe. */
function perfilDaSessao(sessionUser: SupabaseUser): PotiUser {
  const meta = sessionUser.user_metadata ?? {};
  return {
    uid: sessionUser.id,
    email: sessionUser.email ?? null,
    displayName: (meta.full_name as string) ?? (meta.name as string) ?? null,
    photoURL: (meta.avatar_url as string) ?? null,
    cpf: null,
    role: 'tourist',
    provider: sessionUser.is_anonymous ? 'cpf' : 'google',
    createdAt: sessionUser.created_at ?? new Date().toISOString(),
  };
}

const SELECT_USUARIO = 'auth_uid, email, display_name, photo_url, cpf, role, provider, created_at';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PotiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!supabase) {
      // Modo mock: sem backend, a sessão é o que está no localStorage.
      const mockUser = getMockUser();
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 0);
      return;
    }

    const client = supabase;
    let ativo = true;

    /**
     * Carrega o perfil da sessão. Falha de leitura NÃO desloga: o usuário está
     * autenticado de fato (a sessão é do Supabase), só o enriquecimento do perfil
     * ficou indisponível — cair para o metadata é melhor que expulsar quem entrou.
     */
    const carregarPerfil = async (session: Session | null) => {
      if (!session?.user) {
        if (ativo) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const sessionUser = session.user;
      try {
        const { data, error: erroPerfil } = await client
          .from('usuarios')
          .select(SELECT_USUARIO)
          .eq('auth_uid', sessionUser.id)
          .maybeSingle();

        if (!ativo) return;

        if (erroPerfil) {
          console.warn('Supabase: perfil indisponível, usando os dados da sessão.', erroPerfil);
          setUser(perfilDaSessao(sessionUser));
        } else if (data) {
          setUser(toPotiUser(data as UsuarioRow, sessionUser));
        } else {
          // Primeiro acesso: cria a linha a partir do que o provedor entregou.
          const novo = perfilDaSessao(sessionUser);
          const { error: erroInsert } = await client.from('usuarios').insert({
            auth_uid: sessionUser.id,
            email: novo.email,
            display_name: novo.displayName,
            photo_url: novo.photoURL,
            provider: novo.provider,
          });
          if (erroInsert) {
            console.warn('Supabase: não foi possível criar o perfil.', erroInsert);
          }
          if (ativo) setUser(novo);
        }
      } catch (err) {
        if (!ativo) return;
        console.warn('Supabase: erro ao carregar o perfil.', err);
        setUser(perfilDaSessao(sessionUser));
      } finally {
        if (ativo) setLoading(false);
      }
    };

    client.auth.getSession().then(({ data }) => carregarPerfil(data.session));

    const { data: listener } = client.auth.onAuthStateChange((_evento, session) => {
      carregarPerfil(session);
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    if (!supabase) {
      const mockUser: PotiUser = {
        uid: 'mock-google-' + Date.now(),
        email: 'turista@poti.com.br',
        displayName: 'Turista Demo',
        photoURL: null,
        cpf: null,
        role: 'tourist',
        provider: 'mock',
        createdAt: new Date().toISOString(),
      };
      setMockUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    try {
      const { error: erro } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      });
      if (erro) throw erro;
      // O redirect leva embora; onAuthStateChange assume na volta.
    } catch (err: unknown) {
      const erro = err as { message?: string };
      setError(erro?.message ?? 'Erro ao fazer login com Google');
      setLoading(false);
    }
  }, []);

  const signInWithCPF = useCallback(async (cpf: string, name: string, email: string, docType: 'cpf' | 'rne' | 'passport' = 'cpf') => {
    setError(null);
    setLoading(true);

    // CPF gets the full check-digit validation; RNE/Passaporte have no equivalent
    // public algorithm, so we just require a plausible non-empty document number.
    let cleanCPF: string;
    if (docType === 'cpf') {
      cleanCPF = cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        setError('CPF inválido. Verifique os dígitos e tente novamente.');
        setLoading(false);
        return;
      }
    } else {
      cleanCPF = cpf.trim().toUpperCase().replace(/\s+/g, '');
      if (cleanCPF.length < 5) {
        setError(docType === 'rne' ? 'RNE inválido. Verifique o número informado.' : 'Passaporte inválido. Verifique o número informado.');
        setLoading(false);
        return;
      }
    }

    if (!name.trim() || name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      const mockUser: PotiUser = {
        uid: 'mock-cpf-' + cleanCPF,
        email,
        displayName: name,
        photoURL: null,
        cpf: cleanCPF,
        // Modo mock apenas (sem backend): endereço fixo de demonstração, não um
        // "contém", para um turista qualquer digitando "administracao@empresa.com"
        // não se autopromover.
        role: email.toLowerCase() === 'admin@poti.com.br' ? 'admin' : 'tourist',
        provider: 'mock',
        createdAt: new Date().toISOString(),
      };
      setMockUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    try {
      // A sessão é uma credencial emitida pelo Supabase — o CPF é atributo do
      // perfil, nunca a chave de acesso.
      //
      // O fluxo antigo procurava `where cpf == <digitado>` e adotava o registro
      // encontrado. Isso fazia do CPF uma senha pública: ele circula largamente, a
      // validação confere só os dígitos verificadores, e o nome e o e-mail digitados
      // eram descartados nesse ramo. Quem soubesse o CPF de outra pessoa recebia a
      // sessão dela — com o papel dela junto.
      const { data, error: erroAuth } = await supabase.auth.signInAnonymously();
      if (erroAuth) throw erroAuth;

      const sessionUser = data.user;
      if (!sessionUser) throw new Error('Sessão não foi criada.');

      // `role` não vai no payload de propósito: quem define é o backoffice, e o
      // trigger no banco força 'tourist' em qualquer insert vindo do cliente.
      const { error: erroPerfil } = await supabase.from('usuarios').upsert(
        {
          auth_uid: sessionUser.id,
          email,
          display_name: name,
          cpf: cleanCPF,
          provider: 'cpf',
        },
        { onConflict: 'auth_uid' }
      );
      if (erroPerfil) throw erroPerfil;

      setUser({
        uid: sessionUser.id,
        email,
        displayName: name,
        photoURL: null,
        cpf: cleanCPF,
        role: 'tourist',
        provider: 'cpf',
        createdAt: sessionUser.created_at ?? new Date().toISOString(),
      });
    } catch (err: unknown) {
      const erro = err as { message?: string; code?: string };
      // Sessão anônima precisa estar habilitada no painel do Supabase
      // (Authentication > Sign In / Providers > Anonymous). Sem isso a API devolve
      // "Anonymous sign-ins are disabled", que sozinho não diz nada a quem está na tela.
      const anonimoDesligado = /anonymous/i.test(erro?.message ?? '');
      if (anonimoDesligado) {
        console.error('Supabase: habilite "Anonymous sign-ins" para o cadastro por documento funcionar.', err);
      }
      setError(
        anonimoDesligado
          ? 'Cadastro por documento indisponível no momento. Tente entrar com o Google.'
          : erro?.message ?? 'Erro ao cadastrar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!supabase) {
      setMockUser(null);
      setUser(null);
      return;
    }

    try {
      const { error: erro } = await supabase.auth.signOut();
      if (erro) throw erro;
      setUser(null);
    } catch (err: unknown) {
      const erro = err as { message?: string };
      setError(erro?.message ?? 'Erro ao sair');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithCPF,
        signOutUser,
        isAuthenticated: !!user,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Mantido para quem importava daqui; a fonte é o cliente único em `@/lib/supabase`. */
export { isSupabaseConfigured };
