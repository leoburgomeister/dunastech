# Cartão de palco — CONETUR, 30/07, ~09h30

> Leia isto no celular nos minutos antes de subir. O roteiro completo e as decisões estão no spec (`docs/superpowers/specs/2026-07-28-pitch-conetur-96-design.md`). Aqui é só o que importa no palco.

---

## O contexto em 3 linhas

- Você entra **dentro do bloco do Rafael Abreu (Komune)**, ~09h30. Combine a deixa com ele ANTES da reunião começar.
- Quem preside: **Marina Marinho** (secretária SETUR). **Magno Lima** (adjunto novo, apresentado 09h10) é aliado natural.
- O CTA de verdade acontece nos **10 min de Comentários** depois do bloco. O pitch existe para provocá-los.

---

## Roteiro falável (3:00)

### GANCHO · 0:00–0:20 · *tela: home, mapa 3D orbitando*

**"Bom dia. O Rio Grande do Norte tem hoje 11 polos turísticos e 81 municípios no mapa do turismo. O estado decidiu interiorizar — e está estruturando a governança regional para isso.**

**Toda política pública boa esbarra na mesma pergunta: como a gente prova que está funcionando?"**

### PROBLEMA · 0:20–0:50 · *mesma tela*

**"Hoje, essa resposta vem por pesquisa contratada, planilha e relatório que chega meses depois. A gente decide olhando pelo retrovisor.**

**E o dado mais importante — o que o turista viveu no atrativo — não é coletado de forma sistemática. Ninguém sabe, hoje, qual atrativo do Seridó piorou no último mês."**

### SOLUÇÃO · 0:50–1:40 · *demo: busca → depois /gestao*

**"A DunasTech construiu o POTI. Uma camada só, dois lados do mesmo dado.**

**Para o turista: roteiro montado em minutos, recomendando exclusivamente quem está regular no Cadastur."**

→ *digita "Pipa" na busca "Já sabe para onde vai?" + Enter. Mapa voa para Pipa.*

**"Para o gestor: o mesmo dado vira observatório."**

→ *troca para a aba /gestao (já aberta). Pausa 2s nos KPIs.*

### PICO · 1:40–2:20 · *celular na mão*

**"Cada turista que avalia pontua oito dimensões: limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação e lotação. Isso vira o ISA — Índice de Saúde do Atrativo."**

→ *no celular, /avaliar já preenchido: só toca ENVIAR. Olha para o telão.*

**"Acabei de avaliar. O índice mudou agora. É esse o termômetro que falta: ver o atrativo adoecer antes de virar crise."**

### PROVA · 2:20–2:45 · *(CORTE ESTE BLOCO se o tempo apertar)*

**"Isso não é maquete. Está no ar, em dunastech.com.br, com dado real do Cadastur e do IBGE, gerando roteiro para o estado inteiro. O que propomos pilotar é o painel de gestão: três polos, com acesso próprio para cada governança. É a ideia vencedora geral do Hackathon do Sol — e virou produto."**

### CTA · 2:45–3:05

**"Hoje, a gente precisa de duas coisas: acesso às bases oficiais, para o projeto seguir. E o apoio de vocês, que é quem pode abrir essa porta.**

*(pausa — um segundo de silêncio antes da última frase)*

**O Rio Grande do Norte já tem os destinos. Vamos juntos torná-los inteligentes?**

**Obrigado."**

> **Entrega:** pedido concreto primeiro, levante depois. Nessa ordem, porque pedir após inspirar transforma o pedido em anticlímax.
>
> **"O apoio de vocês" é deliberado:** amplia quem pode dizer sim. Na sala há ABAV, entidades e municípios — nenhum controla as bases da SETUR, mas todos podem manifestar apoio. E amarrar o apoio ao acesso ("quem pode abrir essa porta") evita o pedido vago, que colhe sim vago.
>
> A pergunta final é retórica e existe para provocar o aceno de cabeça coletivo — é esse aceno que abre os 10 minutos de Comentários a seu favor. **Não espere resposta:** diga "Obrigado" logo após, com meio segundo de intervalo, senão o silêncio vira constrangimento.

---

## Coreografia da demo (o que fica aberto ANTES de subir)

| Onde | O quê |
|---|---|
| Notebook, aba 1 | `dunastech.com.br` — home carregada, mapa 3D já orbitando |
| Notebook, aba 2 | `dunastech.com.br/gestao` — dashboard carregado, **logado** |
| Celular | `dunastech.com.br/avaliar` — destino escolhido, 4 estrelas, 3 chips marcados. **Falta só o botão Enviar** |

**Regras aprendidas testando a plataforma:**

- **Deixe a aba do app ativa/visível.** Aba em segundo plano congela a animação do mapa (o navegador pausa o render). Ao projetar, a aba 1 fica na frente até a troca para /gestao.
- **NÃO use o questionário de 6 passos** da home na demo — consome quase um minuto. A busca direta ("Já sabe para onde vai?" + Enter) faz o mesmo efeito em 5 segundos.
- **Conte até 3 depois de cada tela carregar** — os números trocam do estático para o dado do Supabase em 1–2s.
- A troca busca→gestão é por **abas já abertas**, nunca digitando URL no palco.
- Avaliação do celular: **positiva** (4–5 estrelas). Na narração você diz o caso negativo. Não crie um "atrativo mal avaliado" ao vivo na frente do município dele.

---

## Q&A — as 5 respostas que têm que sair na hora

**"Como o estado contrataria isso?"** *(o degrau 2 — é a resposta mais importante da manhã)*
→ "Existe instrumento próprio — o **Contrato Público para Solução Inovadora**, do Marco Legal das Startups. Foi feito para o poder público testar solução inovadora sem licitação tradicional, com risco tecnológico protegido. É só a SETUR publicar o desafio."

**"Vocês vendem posição no ranking?"** *(a pergunta hostil do CPC)*
→ "Patrocínio compra visibilidade, não compra nota. O ISA é calculado pela avaliação do turista e ninguém paga para subir nele. Todo destaque pago vem rotulado, e só quem está regular no Cadastur pode patrocinar."

**"Quanto custa?"**
→ "O piloto se encaixa no instrumento do Marco das Startups. Depois, o painel é licenciado **por polo** — e a referência é o que o estado já investe: só a capacitação dos polos custou quase um milhão. O observatório dos 11 polos custa menos de dois terços disso, por ano. Trazemos a proposta detalhada na reunião técnica."
*(Se pressionarem por número: R$ 4.900/mês por polo. NÃO abra o valor do piloto no plenário.)*

**"Isso não é um TripAdvisor?"**
→ "TripAdvisor é opinião solta. O POTI cruza a avaliação do turista com base oficial — Cadastur, IBGE — e devolve inteligência de gestão para quem decide política pública. E só recomenda quem está regular: é um incentivo à formalização."

**"Os dados são reais?"**
→ "Os destinos, o Cadastur, o IBGE e as avaliações são reais, no banco, em tempo real. As projeções preditivas são o próximo release — hoje entregamos o indicador e a base."

**Regra de ouro:** número que você não tem certeza → **"trago o dado"**. Nunca invente na frente do conselho.

### O pedido agendável — use quando alguém morder a isca

A reunião técnica saiu do palco de propósito: anunciada no plenário vira intenção genérica, e ninguém se sente responsável por marcá-la. Perguntada a alguém que **já demonstrou interesse**, ela vira compromisso com nome e rosto.

Assim que um conselheiro elogiar, perguntar detalhe ou se oferecer para ajudar:

> **"Posso levar isso numa conversa técnica com a equipe da SETUR?"**

É o pedido mais agendável que vocês têm — e é ele que transforma um bom pitch em próximo passo real. **Saia da sala com uma data ou um nome.**

### A frase guardada para os Comentários

Quando alguém demonstrar entusiasmo — elogiar, dizer que faz sentido, perguntar como ajudar — é o momento de subir a régua:

> **"É por isso que a gente acredita que dá para fazer do Rio Grande do Norte a referência nacional em turismo inteligente."**

Guardada para os Comentários de propósito: no palco ela soaria pretensiosa vindo de empresa em constituição. Dita em resposta a um entusiasmo já manifestado, ela ecoa o que a sala acabou de sentir — e vira frase de legado para quem preside a mesa. Secretário não compra ferramenta; compra aquilo pelo que a gestão dele será lembrada.

Evite afirmar "primeiro estado do Brasil a fazer X": observatórios de turismo existem em outros estados e alguém na plateia pode contestar. "Referência nacional" é aspiração — não é fato verificável.

---

## Checklist

### Hoje à noite

- [ ] **Ligar para o Rafael Abreu** e combinar a deixa (pendência mais crítica do spec)
- [ ] Ensaiar 3x cronometrado com a demo real (meta: terminar em 2:50)
- [ ] Testar o fluxo completo no 4G do celular (o CCN pode não ter Wi-Fi confiável)
- [ ] Conferir login no notebook DA APRESENTAÇÃO: a sessão admin fica no navegador (localStorage) — **não limpe dados de navegação, use o mesmo perfil do Chrome ensaiado**
- [ ] Carregar notebook e celular; levar carregador e cabo HDMI próprio

### Amanhã, antes de sair

- [ ] Abrir as 3 telas (home, /gestao, /avaliar no celular) e deixar tudo carregado
- [ ] Celular: modo avião DESLIGADO, 4G ativo, hotspot testado como plano B do notebook
- [ ] Notificações: Assistente de Foco no Windows, Não Perturbe no celular

### No auditório (antes das 09h)

- [ ] Testar projeção: a home renderiza no telão? (tema claro é mais legível em projetor)
- [ ] Refazer a avaliação pré-preenchida no celular (se a página recarregou, os campos zeram)
- [ ] Combinar com o Rafael o momento exato da entrada
- [ ] Cronômetro do celular pronto (ou relógio de alguém da equipe na primeira fila)
