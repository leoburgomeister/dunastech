import { supabase } from "./supabase";
import type { Feedback } from "@/data/mockData";

// Avaliações dos turistas — a fonte do ISA.
//
// Este módulo se chamava `firebase.ts` e carregava o Firestore como camada do meio.
// Era herança do MVP do hackathon: os dados de referência migraram para o Supabase
// (commit `639376e`) e o Firestore ficou como segundo fallback de um caminho que o
// Supabase já atendia — um SDK inteiro no bundle para um trabalho que já tinha dono.
//
// A degradação que importa continua aqui, e em duas camadas:
//   1. Supabase (Realtime + REST) — o caminho normal;
//   2. localStorage — a rede de segurança para demonstração sem rede, que é o motivo
//      de ela existir: o palco não pode depender do wi-fi do auditório.

const CHAVE_LOCAL = "poti_feedbacks";

interface FeedbackRow {
  id: string;
  destino: string;
  nota_geral: number;
  limpo: boolean;
  sinalizado: boolean;
  preservado: boolean;
  acessibilidade: boolean;
  seguranca: boolean;
  custo_beneficio: boolean;
  conservacao: boolean;
  superlotado: boolean;
  comentario: string | null;
  created_at: string;
}

function mapSupabaseFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    destino: row.destino,
    nota_geral: row.nota_geral,
    limpo: row.limpo,
    sinalizado: row.sinalizado,
    preservado: row.preservado,
    acessibilidade: row.acessibilidade,
    seguranca: row.seguranca,
    custo_beneficio: row.custo_beneficio,
    conservacao: row.conservacao,
    superlotado: row.superlotado,
    comentario: row.comentario ?? undefined,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

/** Erros em que cair para o localStorage esconderia uma recusa de verdade. */
export function isErroDeAutorizacao(error: {
  code?: string;
  message?: string;
  status?: number;
}): boolean {
  const codigo = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.status === 401 ||
    error.status === 403 ||
    codigo === "42501" ||
    codigo === "PGRST301" ||
    codigo === "P0001" ||
    msg.includes("row-level security") ||
    msg.includes("jwt") ||
    msg.includes("sessão") ||
    msg.includes("autenticado")
  );
}

class ErroDeAvaliacao extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 401, code = "P0001") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function usuarioIdDaSessao(): Promise<string> {
  if (!supabase) throw new ErroDeAvaliacao("Supabase indisponível.", 503);

  const { data: sessao, error: erroSessao } = await supabase.auth.getUser();
  if (erroSessao || !sessao.user) {
    throw new ErroDeAvaliacao("Faça login para avaliar um destino.");
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_uid", sessao.user.id)
    .maybeSingle();
  if (erroPerfil) throw erroPerfil;
  if (perfil?.id) return perfil.id as string;

  const { data: criado, error: erroInsert } = await supabase
    .from("usuarios")
    .insert({ auth_uid: sessao.user.id, provider: "cpf" })
    .select("id")
    .single();
  if (erroInsert || !criado?.id) {
    throw new ErroDeAvaliacao("Não foi possível vincular a avaliação à sua conta.", 403);
  }
  return criado.id as string;
}

/** Grava a avaliação. Cai para o localStorage só se a rede falhar — não se o banco recusar. */
export async function addFeedback(feedback: Omit<Feedback, "id" | "timestamp">): Promise<void> {
  if (supabase) {
    try {
      const usuarioId = await usuarioIdDaSessao();
      const { error } = await supabase.from("feedbacks").insert({
        destino: feedback.destino,
        nota_geral: feedback.nota_geral,
        limpo: feedback.limpo,
        sinalizado: feedback.sinalizado,
        preservado: feedback.preservado,
        acessibilidade: feedback.acessibilidade,
        seguranca: feedback.seguranca,
        custo_beneficio: feedback.custo_beneficio,
        conservacao: feedback.conservacao,
        superlotado: feedback.superlotado,
        comentario: feedback.comentario || null,
        usuario_id: usuarioId,
      });
      if (!error) return;
      if (isErroDeAutorizacao(error)) throw error;
      console.warn("Supabase feedback insert failed, falling back:", error);
    } catch (error) {
      if (isErroDeAutorizacao(error as { code?: string; message?: string; status?: number })) {
        throw error;
      }
      console.warn("Supabase feedback insert threw, falling back:", error);
    }
  }

  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(CHAVE_LOCAL);
  const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
  feedbacks.push({ ...feedback, timestamp: Date.now(), id: `local-${Date.now()}` });
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(feedbacks));
}

/**
 * Acompanha as avaliações em tempo real. Devolve a função de cancelamento.
 *
 * A limpeza é registrada num objeto mutável em vez de numa variável capturada porque
 * o polling só nasce DEPOIS que a consulta inicial falha, e a função de cancelamento
 * já foi devolvida antes disso. Quem desmontasse a tela enquanto a consulta ainda
 * estava no ar cancelava um polling que ainda não existia, e o `setInterval` criado em
 * seguida ficava batendo a cada 2s pelo resto da vida da aba — um a cada navegação.
 */
export function subscribeFeedbacks(callback: (feedbacks: Feedback[]) => void): () => void {
  if (supabase) {
    const client = supabase;
    const local: { cleanup: (() => void) | null; cancelado: boolean } = {
      cleanup: null,
      cancelado: false,
    };
    let linhas: Feedback[] = [];

    const cairParaLocal = (motivo: unknown) => {
      console.warn("Supabase feedbacks indisponível, caindo para o localStorage:", motivo);
      if (local.cleanup || local.cancelado) return;
      local.cleanup = iniciarPollingLocal(callback);
    };

    const channel = client
      .channel("feedbacks-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedbacks" },
        (payload) => {
          linhas = [mapSupabaseFeedback(payload.new as FeedbackRow), ...linhas];
          callback(linhas);
        }
      )
      .subscribe();

    client
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (local.cancelado) return;
        if (error) {
          cairParaLocal(error);
          return;
        }
        linhas = (data || []).map(mapSupabaseFeedback);
        callback(linhas);
      });

    return () => {
      local.cancelado = true;
      client.removeChannel(channel);
      local.cleanup?.();
    };
  }

  return iniciarPollingLocal(callback);
}

/** Semente de demonstração: sem ela a tela de gestão abre vazia numa máquina limpa. */
function semearMockSeVazio() {
  if (typeof window === "undefined" || localStorage.getItem(CHAVE_LOCAL)) return;

  const agora = Date.now();
  const iniciais: Feedback[] = [
    {
      id: "mock-1",
      destino: "Ponta Negra e Morro do Careca",
      nota_geral: 2,
      limpo: false,
      sinalizado: true,
      preservado: false,
      acessibilidade: true,
      seguranca: false,
      custo_beneficio: true,
      conservacao: false,
      superlotado: true,
      comentario:
        "Local com muito acúmulo de resíduos na areia e superlotação no acesso. A segurança precisa ser reforçada no fim da tarde.",
      timestamp: agora - 3600000 * 2,
    },
    {
      id: "mock-2",
      destino: "Praia da Pipa",
      nota_geral: 5,
      limpo: true,
      sinalizado: true,
      preservado: true,
      acessibilidade: true,
      seguranca: true,
      custo_beneficio: true,
      conservacao: true,
      superlotado: false,
      comentario:
        "Excelente passeio! Baía dos Golfinhos é maravilhosa e muito limpa. O acesso às falésias tem boa sinalização.",
      timestamp: agora - 3600000 * 4,
    },
    {
      id: "mock-3",
      destino: "São Miguel do Gostoso",
      nota_geral: 4,
      limpo: true,
      sinalizado: false,
      preservado: true,
      acessibilidade: true,
      seguranca: true,
      custo_beneficio: true,
      conservacao: true,
      superlotado: false,
      comentario:
        "Muito tranquilo, praia preservada e com excelente vento para velejar. Apenas falta um pouco mais de sinalização urbana.",
      timestamp: agora - 3600000 * 12,
    },
  ];
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(iniciais));
}

function iniciarPollingLocal(callback: (feedbacks: Feedback[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  semearMockSeVazio();

  const ler = () => {
    const stored = localStorage.getItem(CHAVE_LOCAL);
    callback(stored ? JSON.parse(stored) : []);
  };

  ler();
  const intervalo = setInterval(ler, 2000);
  return () => clearInterval(intervalo);
}
