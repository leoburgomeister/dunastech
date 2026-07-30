# ISA na geração de rotas (POTI)

**Data:** 2026-07-29
**Contexto:** pitch do CONETUR em 30/07/2026
**Componentes alvo:** `src/lib/route-planner.ts`, `src/components/tourist/TouristHomePage.tsx`, `src/data/mockData.ts`

## Problema

O ISA (Índice de Saúde do Atrativo) é o diferencial declarado do produto — "o desempate do ranking de rotas". Hoje ele não participa da geração de rotas em momento nenhum.

Os critérios que o planner usa são, na ordem: destinos-assinatura fixos por estilo × transporte, lista de afinidade fixa por estilo, proximidade geográfica e um bônus de `monitorado`. Nenhum dado vivo entra na seleção.

`calcularISA` é usado só depois da rota pronta, em três lugares decorativos: ordenar os cards de "Destinos Recomendados", exibir o selo `ISA nn` dentro do roteiro e alimentar o prompt do Gemini. Na prática, um atrativo com ISA 30 tem exatamente a mesma chance de entrar num roteiro que um com ISA 95 — a plataforma empurra turista para o destino degradado, o oposto do que promete.

Há ainda uma divergência entre as duas pontas do produto:

| Onde | Chamada | Fonte real |
|---|---|---|
| Painel do gestor (`gestao/destinos`) | `calcularISA(nome, feedbacks)` | Supabase Realtime → Firestore → localStorage |
| App do turista (`TouristHomePage:150`) | `calcularISA(nome, [] as Feedback[])` | **nada** — array vazio literal |

O gestor e o turista veem números diferentes para o mesmo atrativo assim que alguém avalia.

> Nota de nomenclatura: `src/lib/firebase.ts` é nome legado. `subscribeFeedbacks` e `addFeedback` checam `if (supabase)` primeiro e usam **Supabase**; Firestore é o segundo fallback e polling em localStorage o terceiro.

## Escopo

**Dentro:** ligar o ISA na geração de rotas, com feedbacks reais, e corrigir a escala do indicador.

**Fora, por decisão explícita:** o controle de suspensão de atrativo pela IGR no painel. Adiado para depois de 30/07 — ver "Próximos passos".

## Decisões

| # | Decisão | Motivo |
|---|---|---|
| 1 | ISA entra **injetado** no planner, não importado | O planner deve continuar puro; `calcularISA` depende de `fluxoData`/`investimentosData`, que o `supabase-data` muta em runtime |
| 2 | ISA como **peso**, sem corte automático | A IA não fecha atrativo sozinha; quem suspende é a IGR |
| 3 | Destino-assinatura com ISA crítico é **substituído, com aviso do porquê** | É o único caminho que a pontuação não alcança (seeds entram forçados). O aviso torna o critério legível |
| 4 | Feedbacks **reais** na home | Sem isso o ciclo turista avalia → ISA cai → rota desvia nunca fecha |
| 5 | Limiar de crítico = **< 60** | Reusa `getISABadge`, já em uso no produto (≥80 saudável, ≥60 atenção, <60 crítico). Nenhum número novo inventado |
| 6 | Suavização do ISA por tamanho de amostra (**K = 3**) | Hoje uma única avaliação apaga o baseline inteiro |
| 7 | Teto do baseline sobe de 80 para **95**, com termos contínuos | Permite espalhamento real e destaque dos principais atrativos |

## Desenho

### 1. Fronteiras

| Camada | Responsabilidade |
|---|---|
| `route-planner.ts` | Recebe ISA pronto; pontua, substitui, ordena, particiona. Puro. |
| `TouristHomePage` | Assina feedbacks, calcula ISA, injeta no planner, renderiza a substituição. |
| `mockData.ts` | `calcularISA` — nova escala e suavização. |
| `firebase.ts` | Já entrega feedbacks com degradação em cascata. **Sem alteração.** |

### 2. API do planner

```ts
export interface PlanRouteOptions {
  catalogue: DestinoInfo[];
  style: TravelStyle;
  transport: TransportMode;
  days: number;
  anchorName?: string | null;
  isaByDestination?: Record<string, number>;   // novo — ISA 0–100 por nome
}

export interface SeedReplacement {
  removed: string;      // destino-assinatura que saiu
  isa: number;          // ISA que motivou a saída
  replacedBy: string;   // quem entrou no lugar
}

export interface PlannedRoute {
  destinations: DestinoInfo[];
  days: PlannedDay[];
  totalKm: number;
  replacements: SeedReplacement[];   // novo — vazio quando nada foi trocado
}
```

`isaByDestination` é opcional de propósito: sem ele o planner se comporta exatamente como hoje, o que mantém os 20 testes existentes válidos como rede de regressão, sem precisar de fixture de feedback.

### 3. Pontuação

```
score = afinidade + bônusMonitorado + pontuaçãoISA − penalidadeDistância
pontuaçãoISA = (isa − 60) × 0,8
```

Pivô em 60 — o limiar de "atenção". ISA ausente vira 60 (sem leitura = sem opinião, efeito zero).

O fator 0,8 é calibrado contra a escala existente: cada degrau de afinidade vale 10 pontos, então o ISA move um destino cerca de 3 posições na fila.

| ISA | Efeito | Na prática |
|---|---|---|
| 95 | +28 | sobe ~3 posições |
| 60 | 0 | neutro |
| 38 | −17,6 | desce ~2 posições |
| 20 | −32 | desce ~3 posições |

Desempate forte, não ditador: um rank-1 do estilo com ISA 20 (100−32=68) perde para um rank-5 com ISA 85 (60+20=80), mas o estilo escolhido pelo turista continua decidindo a maior parte dos casos.

### 4. Substituição de destino-assinatura

Dispara quando `isa < 60`. O substituto é o melhor candidato saudável (`isa ≥ 60`) ainda não selecionado, com a **distância medida até o destino removido** — não até o resto do grupo — para que caia na mesma região e a rota preserve o formato e a promessa geográfica do título.

Por que os assinatura têm regra dura enquanto o resto tem só peso: eles são forçados na rota **antes** de qualquer pontuação, então o peso não tem como alcançá-los. A regra existe apenas para dar ao ISA acesso ao único caminho que a pontuação não cobre.

Casos-limite:

1. **Nenhum candidato saudável** → mantém o assinatura original, sem registrar substituição. Roteiro degradado é melhor que roteiro vazio.
2. **Âncora de busca com ISA crítico** → nunca substituída. O turista pediu Pipa explicitamente; entregar Madeiro sem ele pedir seria pior. O selo de ISA já mostra o estado.
3. **Preenchimento comum** → só peso, sem corte.

### 5. Nova escala do ISA

Baseline com termos contínuos no lugar dos degraus fixos:

```ts
base = 74
bônusInvestimento   = min(21, total_mil / 250)          // 0 … +21
penalidadeSaturação = max(0, (saturacao − 70) × 0,5)    // só pune acima de 70
baseline = clamp(0, 100, base + bônusInvestimento − penalidadeSaturação)
```

Teto passa de 80 para 95. Continua dirigido por dado real — mais investimento e menos saturação pontuam melhor — com resolução fina em vez de três degraus.

Suavização por tamanho de amostra, aplicada por cima:

```
ISA = (baseline × K + Σ notas dos feedbacks) / (K + n),  com K = 3
```

Cada `nota do feedback` continua sendo o score por avaliação que a fórmula atual já calcula (`(score/count) × 80 + starFactor + overcrowdingPenalty`), clampado em 0–100.

Isso corrige um defeito real de produção, não só de demo: hoje `baseScore = feedbackBonus / feedbackCount` **substitui** o baseline inteiro, sem amostra mínima. Uma única avaliação péssima leva um destino de 80 para 0; uma mediana, para 22. O primeiro turista que avaliar qualquer atrativo derruba o indicador dele para a faixa de 0–30.

Curva depois da correção:

| Avaliações ruins | Principal (base 90) | Secundário (base 82) |
|---|---|---|
| 0 | 90 Saudável | 82 Saudável |
| 1 | 68 Atenção | 62 Atenção |
| 2 | **54 Crítico** | **49 Crítico** |
| 3 | 45 Crítico | 41 Crítico |

Duas avaliações ruins levam a crítico em qualquer ponto da faixa.

### 6. Fluxo de dados

```
subscribeFeedbacks  →  feedbacks (state)
                          ↓
        isaByDestination = useMemo(...calcularISA(nome, feedbacks))
                          ↓                        ↓
                memo `destinations`        planRoute({ ..., isaByDestination })
                (cards + selo ISA)                 ↓
                                        plan.replacements → aviso no passo 3
```

O memo `destinations` tem deps `[]` hoje e passa `[]` como feedback; passa a consumir `isaByDestination`, o que elimina o cálculo duplicado e alinha o número com o do painel do gestor.

**Comportamento deliberado:** a rota é um retrato tirado no clique — `suggestedRoute` não se regenera quando chega feedback novo. Os selos de ISA dentro dela, porém, vêm do memo e são ao vivo. Se uma avaliação derrubar um destino para 55 depois da rota pronta, o destino permanece e o selo fica vermelho. Isso mostra a verdade atual, evita a rota mudar sob os olhos do usuário no meio de uma demo, e o botão "Refazer" já existe para regenerar com dado fresco.

### 7. Degradação

Nenhum caminho novo de erro. O planner nunca lança, e ISA ausente é sempre valor válido.

| Falha | Comportamento |
|---|---|
| Supabase Realtime cai | Firestore → polling localStorage (já implementado) |
| Todas as fontes falham | `feedbacks = []` → baseline estático → planner idêntico a hoje |
| Destino sem ISA no mapa | vira 60, efeito zero |
| Nenhum substituto saudável | mantém o assinatura, sem registrar troca |
| Feedback ainda não chegou no clique | gera com o que tem; sem await, sem spinner |

### 8. UI

No passo 3, acima da lista de dias, reusando o padrão de aviso âmbar que já existe no roteiro (`ShieldAlert`, o mesmo do alerta de caminhada longa) — sem componente novo:

> ⚠️ **Ponta Negra e Morro do Careca** ficou fora do roteiro — ISA 38 (crítico). Sugerimos **Forte dos Reis Magos** no lugar.

Três chaves i18n novas em `pt-BR`, `en` e `es`.

## Testes

Somam-se aos 20 que já existem em `route-planner.test.ts`:

1. Sem ISA → rota idêntica à de hoje (retrocompatibilidade)
2. ISA alto sobe / ISA baixo desce, mesma configuração
3. Assinatura com ISA < 60 sai, substituto entra, `replacements` registra os três campos
4. Substituto é o saudável mais próximo do removido
5. Nenhum saudável → assinatura mantido, `replacements` vazio
6. Âncora de busca com ISA crítico **não** é substituída
7. Varredura de todos os estilos × transportes × 1–15 dias **com ISA ligado**: dias exatos, nenhum dia vazio, sem repetição

Em `mockData.test.ts`:

8. Baseline na escala nova (teto 95)
9. Suavização: 0, 1, 2 e 3 avaliações ruins produzem a curva da tabela acima
10. Suavização com avaliação ótima não estoura 100

**Quebra esperada:** as **três** asserções atuais de `mockData.test.ts` mudam de valor e são atualizadas junto — consequência direta das decisões 6 e 7, não regressão:

| Teste | Hoje | Por que muda |
|---|---|---|
| sem feedbacks | `62` | escala nova do baseline (decisão 7) |
| feedback positivo | `90` | agora mistura com o baseline (decisão 6) |
| superlotação e notas ruins | `0` | a suavização impede que uma avaliação zere o destino |

O valor `0` sumindo é justamente o defeito que a decisão 6 corrige: o teste documentava o comportamento de uma única avaliação apagar o indicador inteiro.

Além disso, verificação no app rodando: gerar rota, derrubar o ISA de um destino-assinatura com avaliações reais e conferir substituição e aviso na tela.

## Calibração do pitch

Objetivo: nenhum destino real aparece degradado na frente do conselho que governa esses lugares, e o diferencial ainda assim é demonstrado ao vivo.

- **Dados:** saturação ≤ 70 em todos os destinos (penalidade zero) e investimento distribuído entre ~2.000 e ~5.250 mil. Resultado: todos entre **82 e 95**, principais atrativos no topo por terem mais investimento registrado. Nenhum valor é chumbado — a fórmula calcula, os dados é que foram calibrados.
- **Coreografia:** duas avaliações ruins submetidas ao vivo derrubam um atrativo para crítico; a rota se ajusta e o aviso de substituição aparece. O número cai por ação da plateia, não por afirmação de que o lugar é ruim.

### Pré-voo obrigatório (só o usuário consegue executar)

1. **Limpar a tabela `feedbacks`** no SQL Editor do Supabase antes de 30/07. Qualquer linha residual de teste já desloca o ISA e desmonta a faixa 82–95. O MCP do Claude não tem permissão nesse projeto.
2. Confirmar que a home em produção está recebendo os eventos Realtime de `feedbacks` (a policy de `select` é pública; o insert também).

## Próximos passos (fora deste spec)

1. **Suspensão de atrativo pela IGR.** A coluna já existe: `destinos.status` com check `('ATIVO','EM_ANALISE','INATIVO','SUSPENSO')`. Faltam quatro elos: `supabase-data.ts` não faz select de `status`; o único toggle existente grava em localStorage (`gestao/cidades`) em vez do banco; `gestao/destinos` só lê; e nada disso alcança o planner. **Bloqueador de arquitetura:** não há sessão Supabase no browser (auth é Firebase em modo mock, admin = e-mail exato `admin@poti.com.br`), então `auth.uid()` é `NULL` e RLS não consegue autorizar a escrita. Persistir exige rota de API no Next com service role key, ou a migração de auth para Supabase — que já está adiada para depois de 30/07.
2. **Camada de IGR no modelo.** O schema tem `municipios` e `destinos`, sem região turística. Se a gestão é por IGR, falta `regioes_turisticas` com FK — é essa chave que define quem pode suspender o quê, então precisa ser decidida junto com o item 1.
3. **Fallback do ISA sem fluxo/investimento.** `calcularISA` retorna 70 fixo quando faltam esses dados. Hoje a cobertura é 20/20, mas ao crescer o catálogo via Cadastur (nome/município/geo são fáceis; fluxo e investimento por atrativo, não) a maioria dos destinos empataria em 70 e o desempate morreria por empate em massa. Derivar o fallback (média da IGR, ou só feedback quando houver) desacopla o crescimento do catálogo da coleta do dado escasso.
4. **Atrações somem no sync.** `supabase-data.ts` mapeia `atracoes: []`, então as 23 existentes desaparecem quando o Supabase responde. Média atual é 1,15 atração por destino; triplicar o catálogo sem atrações deixaria os dias do roteiro com "Nenhuma atividade selecionada".

## Limitação conhecida

Em roteiros de 13–15 dias o alvo de destinos (dias × 1,5) encosta no catálogo inteiro de 20. Com o pool esgotado, o ISA deixa de influenciar **quem entra** — só a ordem, que é geográfica. Numa viagem de 15 dias o turista visita tudo, inclusive os críticos.

Isso é consequência do tamanho do catálogo, não do algoritmo, e se dissolve conforme ele cresce: com ~60 destinos o pool nunca esgota em nenhuma duração da faixa 1–15 dias. Ver "Próximos passos", itens 3 e 4.
