# Roteiro de gravação — vídeo de backup da demo

> **Para quê:** backup do pitch de 3 min no CONETUR (30/07). Se a internet do Centro de Convenções falhar, você roda este vídeo e narra por cima — exatamente as mesmas falas do pitch ao vivo.
> **Formato alvo:** MP4, 1920×1080, ~2min10s de tela (a narração completa é 3min).
> **Sem áudio no vídeo.** Você narra ao vivo. Isso é proposital: permite ajustar o tempo à sala.

---

## 1. Antes de apertar REC

### Faça login primeiro — isto é o mais importante

Entre em `dunastech.com.br/gestao` e faça o login **antes** de começar a gravar.

O login atual é o modo demo (CPF + `admin@poti.com.br`). Se ele aparecer no vídeo, você mostra para o conselho inteiro que a autenticação ainda é mock. Grave já autenticado — a sessão fica salva no navegador.

### Preparação da tela

| Item | Ajuste |
|---|---|
| Navegador | Chrome em **tela cheia (F11)** — esconde barra de endereço, abas e favoritos |
| Zoom | 100% (Ctrl+0) |
| Abas | Feche todas as outras |
| Extensões | Oculte a barra de extensões |
| Notificações | Ative o **Assistente de Foco** do Windows (nada de pop-up no meio) |
| Resolução | 1920×1080 |
| Modo | Claro (o mapa e os gráficos ficam mais legíveis no projetor) |

### Como gravar no Windows

**Opção mais simples:** `Win + Alt + R` (Xbox Game Bar). Grava a janela ativa. Pare com o mesmo atalho.

Se o Game Bar não abrir, ative em Configurações → Jogos → Xbox Game Bar.

**Alternativa melhor:** OBS Studio, se você já tiver. Permite escolher a região e dá mais controle de qualidade.

### Aquecimento

Antes de gravar valendo, **rode o roteiro inteiro uma vez** sem gravar. Duas razões: você descobre onde a página demora a carregar, e o navegador já deixa tudo em cache — a gravação fica mais fluida.

---

## 2. Roteiro tomada a tomada

> **Regra geral:** movimentos lentos e deliberados. Mouse rápido demais fica ilegível no projetor. Pause ~2s em cada tela antes de agir, para o olho da plateia acompanhar.

### Tomada 1 — Home · 15s

**Tela:** `dunastech.com.br`

1. Deixe a home carregar completa (mapa do RN com os pins).
2. **Pare 4 segundos parado.** Só o mapa respirando. É o plano de abertura.
3. Passe o mouse devagar sobre 2 ou 3 pins do mapa.

**Narração correspondente:** o gancho dos 11 polos e a pergunta "como a gente prova que está funcionando?"

---

### Tomada 2 — Ranking / ISA · 25s

**Tela:** clique em **"Ver ranking completo"** (ou vá para `/ranking`)

1. Deixe carregar. Aparecem os 4 indicadores no topo: ISA Médio, Saudáveis, Atenção, Críticos.
2. **Pause 3s nos indicadores.**
3. Role devagar pela lista de destinos, mostrando as notas e as tarjas coloridas (Saudável / Atenção / Crítico).
4. Pare com uns 4 destinos visíveis.

**Por que essa tela:** é a mais impactante visualmente e comunica o ISA sem você precisar explicar. Números grandes, cores óbvias.

---

### Tomada 3 — Avaliação (o pico) · 40s

**Tela:** `/avaliar`

Esta é a sequência mais importante do vídeo. É o que ninguém na sala viu antes.

1. Abra a tela de avaliação.
2. No seletor **"Escolha um destino..."**, selecione **Ponta Negra e Morro do Careca** — devagar, deixando a plateia ler as opções.
3. Clique em **4 estrelas**.
4. Marque os chips, um a um, com pausa entre eles: `🧹 Limpo e conservado`, `🪧 Boa sinalização`, `🔒 Seguro`.
5. Role até o fim e **envie**.
6. Espere a confirmação aparecer.

> **Escolha deliberada: avaliação positiva.** O impulso natural é demonstrar uma avaliação ruim para mostrar o índice caindo — é mais dramático. Não faça isso num vídeo. Ele pode ser reassistido e compartilhado, e "atrativo X está mal avaliado" numa sala com representantes daquele município gera atrito desnecessário. A mecânica fica igualmente clara com nota positiva, e você narra: *"e quando a avaliação é negativa, o gestor vê o índice cair antes de virar crise."*

---

### Tomada 4 — O dashboard reagindo · 30s

**Tela:** `/gestao`

1. Navegue para o painel de gestão.
2. Deixe carregar. Aparecem os KPIs: Visitantes, **ISA Médio**, Receita Estimada, Variação de Fluxo.
3. **Pause 4s no card do ISA Médio** — é o número que acabou de mudar por causa da sua avaliação.
4. Role devagar até o gráfico **"ISA por Destino"**, que tem o selo "Ao vivo".
5. Pare ali. Fim.

**Narração:** *"Acabei de avaliar. O índice mudou agora."*

---

### Tomada 5 (opcional, se sobrar tempo) — Cadastur · 15s

**Tela:** `/gestao/cadastur`

Mostra a base de prestadores regularizados. Só use se você quiser reforçar o argumento da formalização. **Corte primeiro se o vídeo estiver longo** — é a tomada mais dispensável.

---

## 3. Armadilhas que eu encontrei testando

Descobri estas navegando pela plataforma. Evite:

**Não use o questionário de roteiro da home.** São 6 passos (estilo de viagem → dias → transporte → avançar → ...). Consome quase um minuto e a plateia perde o fio. Se quiser mostrar geração de rota, faça numa gravação separada e insira só o resultado final.

**O scroll da home é instável.** A página tem seções que "pulam" quando você rola rápido. Role devagar, poucos cliques de cada vez.

**Não use a busca do cabeçalho durante a gravação.** Ela abre resultados de forma inconsistente dependendo de onde a página está rolada.

**Espere o Supabase responder.** As telas carregam primeiro com dado estático e depois atualizam com o dado real do banco — leva 1 a 2 segundos. Se você agir rápido demais, o vídeo mostra o número mudando sozinho, o que parece bug. Conte até 3 depois de cada carregamento.

---

## 4. Depois de gravar

1. **Assista inteiro** antes de dar por pronto. Procure por: pop-up de notificação, aba visível, número piscando, mouse tremendo.
2. **Cronometre.** Se passar de 2min20s de tela, corte a Tomada 5 e depois encurte a Tomada 2.
3. **Salve em dois lugares:** notebook da apresentação **e** celular. Se o notebook falhar, o celular ainda serve.
4. **Teste no equipamento do dia.** Um MP4 que não abre no computador do Centro de Convenções não é backup nenhum. Leve também num pendrive.
5. **Formato seguro:** MP4 (H.264). É o que qualquer máquina abre sem codec extra.

---

## 5. Checklist de 1 minuto antes do palco

- [ ] Vídeo no notebook, no celular e no pendrive
- [ ] Testado no projetor / na tela do local
- [ ] Sessão logada no navegador (caso vá ao vivo)
- [ ] `dunastech.com.br` aberto numa aba, já carregado
- [ ] Assistente de Foco ligado
- [ ] Celular no modo avião, exceto o que vai usar para avaliar ao vivo
