/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { destinosInfo, fluxoData, investimentosData, transporteData, calcularISA, Feedback } from "@/data/mockData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. CHAT MODE: Conversational side chat
    if (body.chatMode) {
      const { message, history, feedbacks } = body;

      if (!apiKey) {
        // Fallback simulated chat response
        const simulatedText = getSimulatedChatResponse(message, feedbacks);
        return NextResponse.json({ source: "mock", insight: simulatedText });
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemInstruction = buildChatSystemInstruction(feedbacks);

      const chat = model.startChat({
        history: history.map((m: { role: string; text: string }) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
        systemInstruction,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ source: "gemini", insight: text });
    }

    // 2. DIAGNOSTIC MODE: Traditional dashboard report
    const { destino, feedbacks, transporteInfo, investimentoInfo, instagramData, isaScore } = body;

    if (!destino) {
      return NextResponse.json({ error: "Destino é obrigatório" }, { status: 400 });
    }

    if (!apiKey) {
      const mockInsight = generateMockInsight(destino, feedbacks, transporteInfo, isaScore);
      return NextResponse.json({ source: "mock", insight: mockInsight });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = buildDiagnosticPrompt(destino, feedbacks, transporteInfo, investimentoInfo, instagramData, isaScore);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ source: "gemini", insight: text });

  } catch (error) {
    console.error("Gemini route error:", error);
    return NextResponse.json({ error: "Erro na integração com o Gemini" }, { status: 500 });
  }
}

// System Instruction for Chat mode giving full access to state
function buildChatSystemInstruction(feedbacks: Feedback[]): string {
  // Compute ISA for all active destinations to pass to model
  const isaList = destinosInfo.map((d) => {
    const score = calcularISA(d.nome, feedbacks || []);
    const f = fluxoData.find((fl) => fl.destino === d.nome);
    const inv = investimentosData.find((i) => i.destino === d.nome);
    const trans = transporteData.find((t) => t.destino === d.nome);
    return `
- Destino: ${d.nome} (${d.municipio})
  * ISA: ${score}/100
  * Saturação Turística: ${f?.saturacao_turistica || 0}%
  * Fluxo Mensal: ${f?.fluxo_visitantes_mes || 0} visitantes
  * Investimento Total: R$ ${inv?.total_mil || 0} mil
  * Principais Modais: ${trans?.modal_principal || "N/A"}
  * Crescimento de modais: ${trans?.variacao_percentual || 0}%
    `;
  }).join("\n");

  const totalFeedbacks = feedbacks?.length || 0;
  const maintenanceAlerts = feedbacks?.filter((f) => !f.conservacao).length || 0;
  const overcrowdedAlerts = feedbacks?.filter((f) => f.superlotado).length || 0;

  return `
Você é a inteligência artificial residente da plataforma DunasTech ("DunasIA"), especializada no turismo sustentável do Rio Grande do Norte (RN).
Você tem acesso em tempo real aos indicadores consolidados de todos os atrativos cadastrados no sistema.

## Indicadores do Sistema em Tempo Real:
${isaList}

## Totalizadores Rápidos do Sensor Social (Feedbacks):
- Total de avaliações: ${totalFeedbacks}
- Alertas de manutenção pendente: ${maintenanceAlerts}
- Alertas de superlotação relatada: ${overcrowdedAlerts}

## Diretrizes de Resposta:
1. Responda em português brasileiro.
2. Seja objetivo, analítico e traga dados numéricos sempre que solicitados (ex: mencionar o ISA correto ou o fluxo mensal de visitantes).
3. Se perguntarem qual atrativo tem o pior/melhor ISA, ordene os dados acima e responda.
4. Mantenha tom profissional de consultor de planejamento turístico.
`;
}

// Fallback logic for Chat when API Key is missing
function getSimulatedChatResponse(message: string, feedbacks: Feedback[]): string {
  const query = message.toLowerCase();
  const destsWithISA = destinosInfo.map(d => ({
    nome: d.nome,
    isa: calcularISA(d.nome, feedbacks || []),
    visitantes: fluxoData.find(f => f.destino === d.nome)?.fluxo_visitantes_mes || 0
  }));

  if (query.includes("pior") || query.includes("baixo")) {
    const sorted = [...destsWithISA].sort((a, b) => a.isa - b.isa);
    return `🤖 **Análise DunasIA (Simulação):**\n\nO atrativo com o menor Índice de Saúde do Atrativo (ISA) é atualmente o **${sorted[0].nome}** com um score de **${sorted[0].isa}/100**.\n\nA causa provável é a alta saturação turística combinada a reportes frequentes de necessidade de manutenção no local. Recomenda-se direcionamento de fluxos turísticos alternativos.`;
  }

  if (query.includes("melhor") || query.includes("alto")) {
    const sorted = [...destsWithISA].sort((a, b) => b.isa - a.isa);
    return `🤖 **Análise DunasIA (Simulação):**\n\nO destino com melhor desempenho em sustentabilidade é **${sorted[0].nome}** com score **${sorted[0].isa}/100**. Ele apresenta baixo índice de superlotação e bons investimentos recentes de conservação.`;
  }

  if (query.includes("pipa")) {
    const pipa = destsWithISA.find(d => d.nome.includes("Pipa"));
    return `🤖 **Análise DunasIA (Simulação):**\n\nA **Praia da Pipa** (Tibau do Sul) registra cerca de 82.000 visitantes/mês. Seu ISA atual é **${pipa?.isa}/100**. O principal gargalo monitorado é o risco de superlotação nos fins de semana (saturação de 76%).`;
  }

  if (query.includes("ponta negra") || query.includes("morro")) {
    const pn = destsWithISA.find(d => d.nome.includes("Ponta Negra"));
    return `🤖 **Análise DunasIA (Simulação):**\n\n**Ponta Negra** (Natal) possui fluxo mensal de 145.000 visitantes (o mais alto do estado). Seu ISA está em **${pn?.isa}/100**, sofrendo grande pressão devido à saturação de 88% e alto fluxo de veículos terrestres.`;
  }

  return `🤖 **Análise DunasIA (Simulação):**\n\nRecebi sua pergunta: "${message}".\n\nNo sistema completo, cruzo os dados de mais de 15 destinos do RN. Por exemplo, a média geral do ISA no estado é de **${Math.round(destsWithISA.reduce((s, d) => s + d.isa, 0) / destsWithISA.length)}/100**.\n\n*Nota: Configure a variável de ambiente GEMINI_API_KEY no arquivo .env.local para habilitar respostas cognitivas reais baseadas em LLM.*`;
}

// Traditional Diagnostic prompt
function buildDiagnosticPrompt(
  destino: string,
  feedbacks: Feedback[],
  transporteInfo: any,
  investimentoInfo: any,
  instagramData: any,
  isaScore: number
): string {
  const total = feedbacks?.length || 0;
  const limpo = feedbacks?.filter(f => f.limpo).length || 0;
  const sinalizado = feedbacks?.filter(f => f.sinalizado).length || 0;
  const preservado = feedbacks?.filter(f => f.preservado).length || 0;
  const seguranca = feedbacks?.filter(f => f.seguranca).length || 0;
  const manutencao = feedbacks?.filter(f => !f.conservacao).length || 0;
  const superlotado = feedbacks?.filter(f => f.superlotado).length || 0;

  return `
Você é um especialista em planejamento turístico sustentável. Analise estes dados do destino "${destino}" para o gestor público municipal:

- ISA (Saúde Geral): ${isaScore}/100
- Total feedbacks recebidos: ${total}
  * Avaliados como limpo: ${limpo}
  * Bem sinalizados: ${sinalizado}
  * Natureza preservada: ${preservado}
  * Segurança ativa: ${seguranca}
  * Alertas de manutenção necessária: ${manutencao}
  * Alertas de superlotação: ${superlotado}

- Transporte:
  * Modal principal: ${transporteInfo?.modal_principal || "Terrestre"}
  * Variação de tráfego: ${transporteInfo?.variacao_percentual || 0}%

- Investimentos Públicos Realizados:
  * Total: R$ ${investimentoInfo?.total_mil || 0} mil

${instagramData ? `- Dados Instagram: ${instagramData.totalLikes} curtidas, predominância de posts ${instagramData.posts?.map((p: any) => p.sentiment).join(", ")}` : ""}

Escreva um parecer executivo rápido de 3 parágrafos, apontando riscos imediatos de degradação se houver, e 3 ações prioritárias urgentes.
`;
}

function generateMockInsight(
  destino: string,
  feedbacks: Feedback[] | null,
  transporteInfo: any,
  isaScore: number
): string {
  const variacao = transporteInfo?.variacao_percentual || 0;
  const manutencao = feedbacks?.filter((f) => !f.conservacao).length || 0;
  const superlotado = feedbacks?.filter((f) => f.superlotado).length || 0;

  let alertLevel = "Moderado";
  if (isaScore < 60) alertLevel = "Crítico";
  else if (isaScore > 80) alertLevel = "Excelente";

  return `## 🤖 Diagnóstico IA — ${destino}

**Nível de Alerta: ${alertLevel.toUpperCase()}** | ISA: ${isaScore}/100

O destino "${destino}" apresenta uma variação de fluxo de ${variacao}% em modais terrestres/aéreos. No sensor social, temos ${manutencao} alerta(s) de manutenção pendente e ${superlotado} sinalização(ões) de superlotação no atrativo.

O Índice de Saúde do Atrativo (ISA) de **${isaScore}** reflete a pressão atual. Um score de alerta "${alertLevel}" requer medidas mitigadoras.

### Ações Recomendadas:
1. **Manutenção Preventiva:** Acionar equipes municipais para reparar e sinalizar as áreas sob maior desgaste apontadas pelos turistas.
2. **Controle de Carga:** Desenvolver planejamento de restrição de veículos pesados ou ônibus turísticos em períodos de pico.
3. **Redirecionamento:** Utilizar canais de mídia para promover atrativos secundários e diminuir o fluxo nos eixos saturados.

*Diagnóstico simulado pela DunasTech V2.*`;
}
