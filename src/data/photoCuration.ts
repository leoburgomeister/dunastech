// ============================================================
// CURADORIA DE FOTOS — fonte única de verdade
// ============================================================
// Regra: só vai ao ar imagem que comprovadamente retrata o local.
// Qualquer outro caso cai no <PlaceMap>, que mostra o ponto
// georreferenciado no mapa do RN.
//
// Motivo: o POTI se vende como observatório de dados de turismo.
// Uma foto que não é o lugar destrói exatamente a credibilidade que
// o produto promete. Mapa correto > foto bonita e errada.
//
// A aprovação é por TRINCA (arquivo + local + tamanho). É de propósito:
//   - reaproveitar a foto de um destino em outro cai no mapa sozinho,
//     sem ninguém precisar lembrar da regra;
//   - foto de resolução baixa não é esticada num hero, porque imagem
//     borrada no telão é gafe do mesmo jeito.
//
// PROCEDÊNCIA: as fotos aprovadas vêm do acervo do Ministério do
// Turismo (fotógrafos creditados no campo `credito`). Cada arquivo
// original tinha ~18 MP; foram reduzidos para 2400px de largura.
// Regerar: ver scripts/ e o histórico desta branch.
//
// ATENÇÃO — LICENÇA: confirme os termos de uso do acervo antes de
// publicar. O crédito ao fotógrafo está preenchido e é exibido na UI,
// que é o mínimo exigido pelas licenças usuais desse acervo.
//
// PARA APROVAR UMA FOTO NOVA:
//   1. Confirme que é fotografia real do local (não render, não IA,
//      não banco de imagem de outro lugar, não município vizinho).
//   2. Coloque o arquivo em public/images/destinations/.
//   3. Adicione a entrada abaixo com o nome do local exatamente como
//      aparece em mockData.ts.
// ============================================================

import type { PlaceMapVariant } from '@/components/ui/PlaceMap';

const TODOS_TAMANHOS: PlaceMapVariant[] = ['thumb', 'card', 'hero'];

interface FotoAprovada {
  /** Nome do local exatamente como em mockData.ts (destino, atração ou parceiro). */
  local: string;
  /** Dimensões reais do arquivo, em px. */
  resolucao: { largura: number; altura: number };
  /** Tamanhos em que a foto pode ser usada sem esticar. */
  tamanhos: PlaceMapVariant[];
  /** Autoria — exibida na UI e exigida pela licença do acervo. */
  credito: string;
  /** O que se vê na foto e por que ela confere com o local. */
  motivo: string;
}

/**
 * Fotos liberadas para exibição, indexadas pelo caminho público.
 *
 * Cada entrada aqui é uma afirmação de que a imagem retrata mesmo
 * aquele lugar — verificada olhando a foto, não pelo nome do arquivo.
 */
export const fotosAprovadas: Record<string, FotoAprovada> = {
  '/images/destinations/ponta_negra_morro_careca.jpg': {
    local: 'Ponta Negra e Morro do Careca',
    resolucao: { largura: 2400, altura: 1594 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Ney Douglas / Acervo MTur',
    motivo:
      'Aérea da enseada de Ponta Negra ao crepúsculo: o Morro do Careca com a duna iluminada ao centro, o promontório à esquerda e a orla acesa à direita. É o cartão-postal, reconhecível de imediato por quem é de Natal.',
  },
  '/images/destinations/praia_da_pipa.jpg': {
    local: 'Praia da Pipa',
    resolucao: { largura: 2400, altura: 1600 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Humberto Sales / Acervo MTur',
    motivo:
      'Praia da Pipa com as falésias coloridas de arenito ao fundo — exatamente o elemento que a descrição do destino destaca.',
  },
  '/images/destinations/dunas_de_genipabu.jpg': {
    local: 'Dunas de Genipabu',
    resolucao: { largura: 2400, altura: 1350 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Ney Douglas / Acervo MTur',
    motivo:
      'O paredão de dunas de Genipabu encontrando o mar, com os coqueiros inclinados, a cabana de palha e os arrecifes. O skyline de Natal aparece no horizonte à esquerda, o que situa o lugar.',
  },
  '/images/destinations/forte_dos_reis_magos.jpg': {
    local: 'Forte dos Reis Magos',
    resolucao: { largura: 2400, altura: 1611 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Ney Douglas / Acervo MTur',
    motivo:
      'Aérea do forte estrelado sobre o arrecife na barra do Potengi, com o quebra-mar de acesso e a ponte Newton Navarro ao fundo. Os três detalhes juntos não deixam dúvida.',
  },
  '/images/destinations/maior_cajueiro_do_mundo.jpg': {
    local: 'Maior Cajueiro do Mundo',
    resolucao: { largura: 2400, altura: 1594 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Alex Regis / Acervo MTur',
    motivo:
      'A copa contínua do cajueiro de Pirangi vista da torre de observação, que aparece à esquerda. Não é a foto mais vistosa do acervo, mas é o cajueiro de verdade.',
  },
  '/images/destinations/praia_do_madeiro.jpg': {
    local: 'Praia do Madeiro',
    resolucao: { largura: 2400, altura: 1590 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Júnior Santos / Acervo MTur',
    motivo:
      'Praia do Madeiro em dia cheio, com as bandeiras e pranchas das escolas de surf — que é justamente a experiência cadastrada neste destino.',
  },
  '/images/destinations/mossoro_museu_historico.jpg': {
    local: 'Cidade Histórica de Mossoró',
    resolucao: { largura: 2400, altura: 1600 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Pacífico Medeiros / Acervo MTur',
    motivo:
      'Museu Histórico Lauro da Escóssia, com o nome legível na fachada e o mosaico português da praça. A identificação está na própria imagem.',
  },
  '/images/destinations/lajedo_de_soledade.jpg': {
    local: 'Lajedo de Soledade',
    resolucao: { largura: 2400, altura: 1600 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Alex Regis / Acervo MTur',
    motivo:
      'Painel de pictografias em ocre vermelho do Lajedo de Soledade, em Apodi: figuras antropomorfas, mãos e os grafismos em espinha característicos, sobre o calcário.',
  },
  '/images/destinations/barreira_do_inferno.jpg': {
    local: 'Barreira do Inferno',
    resolucao: { largura: 2400, altura: 1600 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Alex Regis / Acervo MTur',
    motivo:
      'A formação costeira da Barreira do Inferno, em Parnamirim — as falésias que dão nome ao lugar. Registra o acidente geográfico, não o centro de lançamento; quem espera foguete pode estranhar, mas o local está correto.',
  },
  '/images/destinations/memorial_da_resistencia.jpg': {
    local: 'Memorial da Resistência ao Cangaço',
    resolucao: { largura: 2400, altura: 1446 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Pacífico Medeiros / Acervo MTur',
    motivo:
      'O Memorial da Resistência em Mossoró, com a marquise de concreto e os painéis fotográficos dos cangaceiros. Casa exatamente com a atração cadastrada.',
  },

  // --- Wikimedia Commons (licenças livres, atribuição obrigatória) ---
  '/images/destinations/sao_miguel_do_gostoso.jpg': {
    local: 'São Miguel do Gostoso',
    resolucao: { largura: 2047, altura: 1336 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Otávio Nogueira / Wikimedia Commons · CC BY 2.0',
    motivo:
      'Praia ao pôr do sol com várias pipas de kite no ar. É a identidade do lugar (capital potiguar do kite e windsurf) e casa com a experiência cadastrada. Substitui a imagem de IA que mostrava um forte colonial.',
  },
  '/images/destinations/galinhos_farol.jpg': {
    local: 'Galinhos',
    resolucao: { largura: 2400, altura: 1800 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Flaviohmg / Wikimedia Commons · CC BY-SA 4.0',
    motivo:
      'O Farol de Galinhos na arrebentação, vermelho e branco. Marco identificável do município, ao contrário de uma vila de pescadores genérica.',
  },
  '/images/destinations/parque_das_dunas.jpg': {
    local: 'Parque das Dunas',
    resolucao: { largura: 2400, altura: 1600 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'thimhz / Wikimedia Commons · CC BY-SA 2.0',
    motivo:
      'Trilha na Mata Atlântica do parque, com o tronco arqueado sobre o caminho — casa com a Trilha Ecológica da Peroba. Traz marca d\'água tênue do próprio autor no canto inferior; é permitido usar com atribuição e remover a marca violaria a licença, então ela fica.',
  },
  '/images/destinations/estatua_santa_rita.jpg': {
    local: 'Estátua de Santa Rita de Cássia',
    resolucao: { largura: 2400, altura: 1800 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Macílio Gomes / Wikimedia Commons · CC BY 3.0',
    motivo:
      'Contra-plongée do monumento com o halo metálico contra o céu. Nítida e inequívoca — preferida a um registro ao crepúsculo que estava enevoado e cortado por fios de poste.',
  },
  '/images/destinations/barra_de_cunhau.jpg': {
    local: 'Barra de Cunhaú',
    resolucao: { largura: 2400, altura: 1800 },
    tamanhos: TODOS_TAMANHOS,
    credito: 'Priscilla Silveira / Wikimedia Commons · CC BY 2.0',
    motivo:
      'Praia na maré baixa com kitesurfistas e a linha de arrecife. Cunhaú é ponto conhecido de kite, então a cena representa o lugar.',
  },
  '/images/destinations/canyon_dos_apertados.jpg': {
    local: 'Canyon dos Apertados',
    resolucao: { largura: 2400, altura: 1800 },
    // Sem hero de propósito: a foto é de nível do chão e tem mato
    // desfocado tomando o primeiro plano. Em faixa de 1242px isso
    // domina o quadro; em card funciona.
    tamanhos: ['thumb', 'card'],
    credito: 'Vaguinho86 / Wikimedia Commons · CC BY-SA 3.0',
    motivo:
      'O cânion no Seridó, com as paredes rochosas, o leito seco e os mandacarus na crista. Autêntica, mas de composição amadora — por isso limitada a thumb e card.',
  },
};

/**
 * Registro das imagens reprovadas e o motivo de cada uma.
 *
 * Os arquivos das dez primeiras JÁ FORAM APAGADOS — eram geradas por IA
 * e nenhuma retratava o lugar que nomeava. As últimas vêm do acervo
 * MTur e foram reprovadas na conferência visual.
 *
 * Esta lista fica como histórico da decisão: serve para auditar a
 * curadoria e para ninguém repetir o mesmo erro.
 */
export const fotosReprovadas: Record<string, string> = {
  // --- Geradas por IA (arquivos removidos) ---
  '/images/destinations/hero_ponta_negra.png':
    'Gerada por IA. A geografia do Morro do Careca está errada: aparecem duas formações de duna e um promontório que não existe na enseada.',
  '/images/destinations/pipa.png':
    'Gerada por IA. Falésias vermelhas genéricas — não corresponde ao Chapadão nem à Baía dos Golfinhos.',
  '/images/destinations/genipabu.png':
    'Gerada por IA. Duna e mar genéricos, sem nenhum marco de Genipabu (a lagoa, o paredão de dunas, os bugues).',
  '/images/destinations/maracajau.png':
    'Gerada por IA. O arranjo de recifes rente à praia lembra Porto de Galinhas/PE; os parrachos de Maracajaú ficam a cerca de 7 km da costa.',
  '/images/destinations/sao_miguel.png':
    'Gerada por IA e com o assunto trocado: mostra um forte colonial ao pôr do sol. São Miguel do Gostoso é vila de kite e windsurf e não tem forte nenhum.',
  '/images/destinations/forte_dos_reis_magos.png':
    'Gerada por IA. O formato estrelado aproxima, mas o entorno e o skyline da cidade são inventados.',
  '/images/destinations/galinhos.png':
    'Gerada por IA. Vila de pescadores genérica; os nomes pintados nos barcos saem ilegíveis, artefato típico de geração.',
  '/images/destinations/maior_caju.png':
    'Gerada por IA. Cajueiro com passarela é plausível, mas não é o cajueiro de Pirangi.',
  '/images/destinations/mossoro_historico.png':
    'Gerada por IA e com erro visível: o relógio da fachada marca 16:88, horário impossível. A bandeira estadual também está errada.',
  '/images/destinations/lajedo_soledade.png':
    'Gerada por IA e com o relevo errado: o Lajedo de Soledade é um piso calcário plano, não falésias altas. O painel de inscrições traz letras inventadas.',

  // --- Acervo MTur, reprovadas na conferência visual ---
  'mtur:rodrigo-sena_salinas_porto-ilha_areia-branca':
    'Fotografia real, mas do Porto-Ilha de AREIA BRANCA. O destino cadastrado é Macau: município diferente, mesma indústria. Trocar um pelo outro é a gafe que esta curadoria existe para evitar.',
  'mtur:frankie-marcone_lagoa-extremoz':
    'Fotografia real da Lagoa de Extremoz, que não é a Lagoa de Pitangui. São lagoas distintas no mesmo município.',
  'mtur:junior-santos_baia-dos-golfinhos':
    'Rotulada como Baía dos Golfinhos, mas a cena não tem a geografia da enseada (frota de barcos fundeados, sem as falésias que fecham a baía). Não deu para confirmar o local.',

  // --- Wikimedia Commons, reprovadas na conferência visual ---
  'commons:Castelo Di Bivar RN em 2009.jpg':
    'Fotografia real do castelo, mas feita de muito longe: a 1024x768 o castelo ocupa cerca de 5% do quadro e não se distingue do morro. O ponto no mapa informa mais que uma foto onde não se vê o assunto. A outra opção do Commons tem 416x290, pior ainda.',
  'commons:Macau, Brazil, on a CBERS4 MUX image.jpg':
    'É imagem de satélite do INPE, não fotografia turística. Para vista de cima o próprio <PlaceMap> já resolve melhor.',
  'commons:Entardecer no santuário de santa rita de cássia.jpg':
    'Substituída por uma melhor do mesmo monumento: esta tinha névoa na lente, fios de poste cruzando o quadro e compressão pesada (95 KB para 2560x1536).',

  // --- Arquivos soltos deixados em public/images (procedência desconhecida) ---
  'local:jpgs-soltos-sem-procedencia':
    'Os ~19 JPGs com nome em base64 na raiz de public/images não entraram: procedência e licença desconhecidas, e pelo menos um traz marca d\'água "© Anderson Lourenço". Duas eram úteis (recifes que parecem os Parrachos de Maracajaú, e o interior do Cajueiro) mas têm 0,6 e 0,2 MP.',
};

/**
 * Locais que seguem sem foto aprovada, e por quê. Serve de lista de
 * compras para quem for buscar imagem nova.
 *
 * Verificado em julho de 2026 no acervo MTur e no Wikimedia Commons.
 */
export const semFotoAinda: Record<string, string> = {
  'Parrachos de Maracajaú':
    'Nada no acervo MTur (só parrachos de Pirangi, que é outro lugar) nem no Commons.',
  'Lagoa de Pitangui':
    'Nada no Commons. No acervo MTur só há a Lagoa de Extremoz, que é outra lagoa no mesmo município.',
  'Salinas e Indústria Salineira de Macau':
    'No acervo MTur só há o Porto-Ilha de Areia Branca (outro município); no Commons, só imagem de satélite.',
  'Salinas de Galinhos e Fábrica de Sal':
    'A busca por Galinhos no Commons retorna farol, praia e kitesurf — nenhuma foto das salinas ou da fábrica de sal.',
  'Castelo de Bivar':
    'As duas fotos disponíveis no Commons são distantes e de baixa resolução; o castelo não fica legível.',
};

/**
 * Decide se uma imagem pode ser exibida para um local, naquele tamanho.
 *
 * Só retorna `true` quando o arquivo está aprovado, está sendo usado no
 * local ao qual foi aprovado E o tamanho pedido está na lista. Qualquer
 * outra combinação cai no mapa.
 */
export function fotoAprovadaPara(
  src: string | undefined | null,
  local: string,
  tamanho: PlaceMapVariant
): boolean {
  if (!src) return false;
  const entrada = fotosAprovadas[src];
  if (entrada === undefined) return false;
  return entrada.local === local && entrada.tamanhos.includes(tamanho);
}

/** Crédito da foto aprovada, para exibir sobre a imagem. */
export function creditoDaFoto(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  return fotosAprovadas[src]?.credito;
}

/** Motivo da reprovação, quando houver — útil para telas de gestão. */
export function motivoReprovacao(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  return fotosReprovadas[src];
}
