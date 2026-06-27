// ============================================================
// MOCK DATA V2 — Observatório Inteligente do Turismo (DunasTech)
// ============================================================

export interface AttractionActivity {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  parceiroId: string; // Conexão com empresa Cadastur
}

export interface DestinoInfo {
  nome: string;
  municipio: string;
  descricao: string;
  imagem: string;
  latitude: number;
  longitude: number;
  atracoes: AttractionActivity[];
  hashtag: string;
}

export interface IBGEData {
  destino: string;
  municipio: string;
  populacao: number;
  area_km2: number;
  idh: number;
  leitos_hospitalares: number;
  escolas_publicas: number;
}

export interface CadasturBusiness {
  id: string;
  cnpj: string;
  nome: string;
  tipo: "Hotel" | "Restaurante" | "Guia" | "Pousada" | "Agência";
  destino: string;
  regularizado: boolean;
  nota: number;
  telefone: string;
  latitude: number;
  longitude: number;
  descricao: string;
  imagem: string;
  experiencias?: { titulo: string; descricao: string }[];
}

export interface TransporteData {
  destino: string;
  voos_mensais: number;
  onibus_mensais: number;
  veiculos_terrestres_mensais: number;
  modal_principal: string;
  variacao_percentual: number;
}

export interface InvestimentoData {
  destino: string;
  investimento_infraestrutura_mil: number;
  investimento_saneamento_mil: number;
  investimento_turismo_mil: number;
  total_mil: number;
  ano: number;
}

export interface FluxoData {
  destino: string;
  fluxo_visitantes_mes: number;
  receita_estimada_milhoes: number;
  saturacao_turistica: number; // 0-100
  hashtag_instagram: string;
}

export interface Feedback {
  id?: string;
  destino: string;
  limpo: boolean;
  sinalizado: boolean;
  preservado: boolean;
  acessibilidade: boolean;
  seguranca: boolean;
  custo_beneficio: boolean;
  conservacao: boolean;
  superlotado: boolean;
  nota_geral: number; // 1 to 5 stars
  comentario?: string;
  timestamp: number;
}

// --- 15 DESTINOS REAIS DO RN ---
export const destinosInfo: DestinoInfo[] = [
  {
    nome: "Ponta Negra e Morro do Careca",
    municipio: "Natal",
    descricao: "Principal cartão-postal de Natal, famoso pela duna de 120 metros e excelente infraestrutura de lazer, gastronomia e hotelaria.",
    imagem: "https://images.unsplash.com/photo-1598301257942-e6bde1d2149b?w=800&h=500&fit=crop",
    latitude: -5.8811,
    longitude: -35.1711,
    hashtag: "pontanegranatal",
    atracoes: [
      {
        id: "act-pn-1",
        nome: "Passeio de Jangada no Morro",
        descricao: "Navegação tradicional contornando a enseada de Ponta Negra com vista do Morro do Careca.",
        imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop",
        parceiroId: "cad-pn-3"
      },
      {
        id: "act-pn-2",
        nome: "Stand Up Paddle na Enseada",
        descricao: "Prática esportiva em águas calmas perto do morro.",
        imagem: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=500&h=350&fit=crop",
        parceiroId: "cad-pn-3"
      }
    ]
  },
  {
    nome: "Praia da Pipa",
    municipio: "Tibau do Sul",
    descricao: "Destino cosmopolita mundialmente famoso por suas falésias imponentes, golfinhos na Baía dos Golfinhos e noite eletrizante.",
    imagem: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&h=500&fit=crop",
    latitude: -6.2275,
    longitude: -35.0475,
    hashtag: "praiadapipa",
    atracoes: [
      {
        id: "act-pipa-1",
        nome: "Observação de Golfinhos",
        descricao: "Passeio de barco para avistar golfinhos em seu habitat natural.",
        imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop",
        parceiroId: "cad-pipa-3"
      },
      {
        id: "act-pipa-2",
        nome: "Trilha no Santuário Ecológico",
        descricao: "Caminhadas sob a Mata Atlântica preservada com mirantes para as praias.",
        imagem: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&h=350&fit=crop",
        parceiroId: "cad-pipa-3"
      }
    ]
  },
  {
    nome: "Dunas de Genipabu",
    municipio: "Extremoz",
    descricao: "Famoso complexo de dunas móveis e lagoas. O passeio de buggy clássico do estado com muita adrenalina.",
    imagem: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=500&fit=crop",
    latitude: -5.7089,
    longitude: -35.1967,
    hashtag: "genipabu",
    atracoes: [
      {
        id: "act-gen-1",
        nome: "Passeio de Buggy com Emoção",
        descricao: "Aventura pelas dunas móveis com paradas para fotos e lagoa.",
        imagem: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&h=350&fit=crop",
        parceiroId: "cad-gen-3"
      },
      {
        id: "act-gen-2",
        nome: "Esquibunda nas Dunas",
        descricao: "Descida em prancha de madeira direto na lagoa de Genipabu.",
        imagem: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=500&h=350&fit=crop",
        parceiroId: "cad-gen-3"
      }
    ]
  },
  {
    nome: "Parrachos de Maracajaú",
    municipio: "Maxaranguape",
    descricao: "Piscinas naturais a 7km da costa, ideais para snorkeling entre corais e peixes coloridos.",
    imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop",
    latitude: -5.4092,
    longitude: -35.3131,
    hashtag: "maracajau",
    atracoes: [
      {
        id: "act-mar-1",
        nome: "Mergulho nos Parrachos",
        descricao: "Exploração dos corais em águas mornas e translúcidas guiada.",
        imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop",
        parceiroId: "cad-mar-3"
      }
    ]
  },
  {
    nome: "São Miguel do Gostoso",
    municipio: "São Miguel do Gostoso",
    descricao: "Charmosa vila de pescadores conhecida mundialmente pela prática de esportes à vela e ventos constantes.",
    imagem: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
    latitude: -5.1247,
    longitude: -35.6392,
    hashtag: "saomigueldogostoso",
    atracoes: [
      {
        id: "act-gost-1",
        nome: "Kitesurf e Windsurf",
        descricao: "Aprenda a velejar com campeões locais nos ventos mais constantes do país.",
        imagem: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=350&fit=crop",
        parceiroId: "cad-gost-2"
      }
    ]
  },
  {
    nome: "Forte dos Reis Magos",
    municipio: "Natal",
    descricao: "Fortaleza histórica de 1598 localizada no encontro do Rio Potengi com o mar.",
    imagem: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=800&h=500&fit=crop",
    latitude: -5.7564,
    longitude: -35.1947,
    hashtag: "fortedosreismagos",
    atracoes: [
      {
        id: "act-forte-1",
        nome: "Visita Histórica",
        descricao: "Descubra marcos coloniais e canhões históricos da fundação de Natal.",
        imagem: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=500&h=350&fit=crop",
        parceiroId: "cad-forte-2"
      }
    ]
  },
  {
    nome: "Galinhos",
    municipio: "Galinhos",
    descricao: "Península isolada de sal com dunas gigantes, salinas naturais e passeios ecológicos de barco.",
    imagem: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=500&fit=crop",
    latitude: -5.0917,
    longitude: -36.2742,
    hashtag: "galinhos",
    atracoes: [
      {
        id: "act-gal-1",
        nome: "Passeio de Barco pelo Rio",
        descricao: "Navegação por manguezais e salinas desfrutando do silêncio da península.",
        imagem: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=350&fit=crop",
        parceiroId: "cad-gal-2"
      }
    ]
  },
  {
    nome: "Maior Cajueiro do Mundo",
    municipio: "Parnamirim",
    descricao: "Cajueiro gigante que cobre mais de 8.500 metros quadrados, registrado no Guinness Book.",
    imagem: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=500&fit=crop",
    latitude: -5.9739,
    longitude: -35.1289,
    hashtag: "maiorcajueiro",
    atracoes: [
      {
        id: "act-caju-1",
        nome: "Trilha Suspensa do Cajueiro",
        descricao: "Caminhada sob a copa gigante do maior cajueiro do mundo.",
        imagem: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&h=350&fit=crop",
        parceiroId: "cad-caju-2"
      }
    ]
  },
  {
    nome: "Praia do Madeiro",
    municipio: "Tibau do Sul",
    descricao: "Considerada uma das enseadas mais bonitas das Américas, com golfinhos frequentes.",
    imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
    latitude: -6.2000,
    longitude: -35.0500,
    hashtag: "praiadomadeiro",
    atracoes: [
      {
        id: "act-mad-1",
        nome: "Escola de Surf do Madeiro",
        descricao: "Aulas práticas com instrutores nas ondas perfeitas do Madeiro.",
        imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop",
        parceiroId: "cad-mad-2"
      }
    ]
  },
  {
    nome: "Lagoa de Pitangui",
    municipio: "Extremoz",
    descricao: "Lagoa de água doce calma e morna, ponto turístico da rota norte potiguar.",
    imagem: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&h=500&fit=crop",
    latitude: -5.7250,
    longitude: -35.2100,
    hashtag: "lagoadepitangui",
    atracoes: [
      {
        id: "act-pit-1",
        nome: "Redário e Tirolesa na Lagoa",
        descricao: "Redes na água e diversão em tirolesas na lagoa cristalina.",
        imagem: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=500&h=350&fit=crop",
        parceiroId: "cad-pit-2"
      }
    ]
  },
  {
    nome: "Barreira do Inferno",
    municipio: "Parnamirim",
    descricao: "Centro de lançamento espacial histórico brasileiro rodeado por falésias avermelhadas.",
    imagem: "https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=800&h=500&fit=crop",
    latitude: -5.8915,
    longitude: -35.1797,
    hashtag: "barreiradoinferno",
    atracoes: [
      {
        id: "act-clbi-1",
        nome: "Museu Aeroespacial Potiguar",
        descricao: "Exposição de foguetes reais, radares e aviões de combate.",
        imagem: "https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=500&h=350&fit=crop",
        parceiroId: "cad-clbi-1"
      }
    ]
  },
  {
    nome: "Barra de Cunhaú",
    municipio: "Canguaretama",
    descricao: "Encontro do Rio Curimataú com o mar, famoso pelos manguezais e pratos de caranguejo.",
    imagem: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop",
    latitude: -6.3103,
    longitude: -35.0553,
    hashtag: "barradecunhau",
    atracoes: [
      {
        id: "act-cun-1",
        nome: "Passeio do Manguezal",
        descricao: "Pesquisa ecológica pelos rios, mangues e captura ecológica de caranguejos.",
        imagem: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=350&fit=crop",
        parceiroId: "cad-cun-2"
      }
    ]
  },
  {
    nome: "Parque das Dunas",
    municipio: "Natal",
    descricao: "Importante reserva de Mata Atlântica no coração da capital, com trilhas guiadas.",
    imagem: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=500&fit=crop",
    latitude: -5.8400,
    longitude: -35.1970,
    hashtag: "parquedasdunas",
    atracoes: [
      {
        id: "act-dunas-1",
        nome: "Trilha Ecológica da Peroba",
        descricao: "Caminhada na mata densa das dunas com guias ambientais.",
        imagem: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&h=350&fit=crop",
        parceiroId: "cad-dunas-2"
      }
    ]
  },
  {
    nome: "Cidade Histórica de Mossoró",
    municipio: "Mossoró",
    descricao: "Terra da abolição precoce e da resistência ao bando do temido Lampião.",
    imagem: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&h=500&fit=crop",
    latitude: -5.1878,
    longitude: -37.3444,
    hashtag: "mossoro",
    atracoes: [
      {
        id: "act-mos-1",
        nome: "Memorial da Resistência ao Cangaço",
        descricao: "Roteiro histórico pelos murais e trincheiras da batalha contra Lampião.",
        imagem: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=500&h=350&fit=crop",
        parceiroId: "cad-mos-2"
      }
    ]
  },
  {
    nome: "Lajedo de Soledade",
    municipio: "Apodi",
    descricao: "Grandiosa formação calcária no sertão com impressionantes pinturas rupestres pré-históricas.",
    imagem: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=500&fit=crop",
    latitude: -5.5833,
    longitude: -37.8000,
    hashtag: "lajedodesoledade",
    atracoes: [
      {
        id: "act-apo-1",
        nome: "Passeio Arqueológico Soledade",
        descricao: "Pesquisa arqueológica guiada por desfiladeiros de fósseis.",
        imagem: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=350&fit=crop",
        parceiroId: "cad-apo-2"
      }
    ]
  }
];

// --- REAL CADASTUR BUSINESSES & VITRINE DATA ---
const staticCadasturData: CadasturBusiness[] = [
  // Ponta Negra
  {
    id: "cad-pn-1",
    cnpj: "08.123.456/0001-99",
    nome: "Visual Praia Hotel",
    tipo: "Hotel",
    destino: "Ponta Negra e Morro do Careca",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 3219-2020",
    latitude: -5.8795,
    longitude: -35.1725,
    descricao: "Hotel de frente para o mar na orla de Ponta Negra com piscina panorâmica e serviços de alto padrão.",
    imagem: "https://images.unsplash.com/photo-1598301257942-e6bde1d2149b?w=500&h=350&fit=crop"
  },
  {
    id: "cad-pn-2",
    cnpj: "05.987.654/0001-88",
    nome: "Camarões Potiguar",
    tipo: "Restaurante",
    destino: "Ponta Negra e Morro do Careca",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 3209-2424",
    latitude: -5.8778,
    longitude: -35.1742,
    descricao: "Uma referência gastronômica internacional em Natal. Especialidade em pratos de camarão sofisticados.",
    imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop"
  },
  {
    id: "cad-pn-3",
    cnpj: "12.345.678/0001-01",
    nome: "Natal Aventuras & Náutica",
    tipo: "Agência",
    destino: "Ponta Negra e Morro do Careca",
    regularizado: true,
    nota: 4.7,
    telefone: "(84) 99888-7766",
    latitude: -5.8820,
    longitude: -35.1715,
    descricao: "Agência credenciada para passeios de barco, stand-up paddle e caiaques na enseada.",
    imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop"
  },
  // Pipa
  {
    id: "cad-pipa-1",
    cnpj: "11.222.333/0001-44",
    nome: "Sombra e Água Fresca Hotel",
    tipo: "Hotel",
    destino: "Praia da Pipa",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 3246-2384",
    latitude: -6.2325,
    longitude: -35.0450,
    descricao: "Hotel de luxo no alto das falésias da Praia do Amor com vistas espetaculares da Mata Atlântica.",
    imagem: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=500&h=350&fit=crop"
  },
  {
    id: "cad-pipa-2",
    cnpj: "33.444.555/0001-66",
    nome: "Pipa Beach Club",
    tipo: "Restaurante",
    destino: "Praia da Pipa",
    regularizado: true,
    nota: 4.6,
    telefone: "(84) 98877-6655",
    latitude: -6.2268,
    longitude: -35.0482,
    descricao: "Restaurante e bar à beira da praia com petiscos, drinques refinados e música ao vivo frente ao mar.",
    imagem: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=350&fit=crop"
  },
  {
    id: "cad-pipa-3",
    cnpj: "55.666.777/0001-99",
    nome: "Pipa Passeios Ecológicos",
    tipo: "Agência",
    destino: "Praia da Pipa",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 99911-2233",
    latitude: -6.2272,
    longitude: -35.0490,
    descricao: "Agência certificada organizadora de barcos de golfinhos e passeios florestais no Santuário.",
    imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop"
  },
  // Genipabu
  {
    id: "cad-gen-1",
    cnpj: "22.333.444/0001-22",
    nome: "Pousada Genipabu Beach",
    tipo: "Pousada",
    destino: "Dunas de Genipabu",
    regularizado: true,
    nota: 4.5,
    telefone: "(84) 3225-1100",
    latitude: -5.7065,
    longitude: -35.1985,
    descricao: "Pousada acolhedora colada no Parque das Dunas e no mar de Genipabu.",
    imagem: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&h=350&fit=crop"
  },
  {
    id: "cad-gen-3",
    cnpj: "99.888.777/0001-11",
    nome: "Associação dos Bugueiros de Genipabu",
    tipo: "Agência",
    destino: "Dunas de Genipabu",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 3225-2233",
    latitude: -5.7090,
    longitude: -35.1955,
    descricao: "Associação oficial credenciada pelo governo com pilotos profissionais autorizados nas dunas móveis.",
    imagem: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&h=350&fit=crop"
  },
  // Maracajaú
  {
    id: "cad-mar-1",
    cnpj: "44.555.666/0001-99",
    nome: "Ma-Noa Park & Resort",
    tipo: "Hotel",
    destino: "Parrachos de Maracajaú",
    regularizado: true,
    nota: 4.4,
    telefone: "(84) 3261-2626",
    latitude: -5.4020,
    longitude: -35.3190,
    descricao: "Parque aquático e hotelaria integrados com saída direta para lanchas e catamarãs em direção aos corais.",
    imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop"
  },
  {
    id: "cad-mar-3",
    cnpj: "88.777.666/0001-55",
    nome: "Maracajaú Diver Ecoturismo",
    tipo: "Agência",
    destino: "Parrachos de Maracajaú",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 99122-3344",
    latitude: -5.4095,
    longitude: -35.3120,
    descricao: "Operadora profissional de mergulho nos Parrachos, fornecendo snorkel, coletes e lanchas credenciadas.",
    imagem: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=350&fit=crop"
  },
  // Gostoso
  {
    id: "cad-gost-1",
    cnpj: "55.444.333/0001-11",
    nome: "Pousada Mi Secreto",
    tipo: "Pousada",
    destino: "São Miguel do Gostoso",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 3263-4141",
    latitude: -5.1235,
    longitude: -35.6375,
    descricao: "Pousada boutique pé na areia na ponta de Gostoso, favorita de praticantes de Kitesurf.",
    imagem: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=350&fit=crop"
  },
  {
    id: "cad-gost-2",
    cnpj: "33.222.111/0001-88",
    nome: "Dr. Wind Kitesurf Center",
    tipo: "Guia",
    destino: "São Miguel do Gostoso",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 98822-4455",
    latitude: -5.1245,
    longitude: -35.6385,
    descricao: "Escola internacional de vela fundada por campeões, certificada e credenciada pelo Cadastur.",
    imagem: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=350&fit=crop"
  },
  // Forte
  {
    id: "cad-forte-2",
    cnpj: "01.002.003/0001-04",
    nome: "Natal Histórica Guia Associados",
    tipo: "Guia",
    destino: "Forte dos Reis Magos",
    regularizado: true,
    nota: 4.7,
    telefone: "(84) 98111-2222",
    latitude: -5.7560,
    longitude: -35.1950,
    descricao: "Guias turísticos profissionais especializados em história colonial potiguar.",
    imagem: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=500&h=350&fit=crop"
  },
  // Galinhos
  {
    id: "cad-gal-2",
    cnpj: "09.009.009/0001-09",
    nome: "Galinhos EcoTour & Barcos",
    tipo: "Agência",
    destino: "Galinhos",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 99655-4433",
    latitude: -5.0910,
    longitude: -36.2735,
    descricao: "Navegações seguras pelo rio e dunas do capim em Galinhos com guias nativos.",
    imagem: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=350&fit=crop"
  },
  // Cajueiro
  {
    id: "cad-caju-2",
    cnpj: "10.100.100/0001-10",
    nome: "Pirangi Turismo & Caju",
    tipo: "Agência",
    destino: "Maior Cajueiro do Mundo",
    regularizado: true,
    nota: 4.5,
    telefone: "(84) 3238-1010",
    latitude: -5.9735,
    longitude: -35.1285,
    descricao: "Agência oficial que organiza visitas ao cajueiro gigante e passeios de barco nas marinas de Pirangi.",
    imagem: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&h=350&fit=crop"
  },
  // Madeiro
  {
    id: "cad-mad-2",
    cnpj: "12.345.678/0001-03",
    nome: "Guia Marcos Madeiro Aventuras",
    tipo: "Guia",
    destino: "Praia do Madeiro",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 99901-0003",
    latitude: -6.2005,
    longitude: -35.0505,
    descricao: "Instrutor credenciado de surf e guia florestal para caminhadas em falésias.",
    imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop"
  },
  // Pitangui
  {
    id: "cad-pit-2",
    cnpj: "11.111.111/0001-11",
    nome: "Pitangui Ecopark Lagoa",
    tipo: "Restaurante",
    destino: "Lagoa de Pitangui",
    regularizado: true,
    nota: 4.6,
    telefone: "(84) 3225-8899",
    latitude: -5.7245,
    longitude: -35.2095,
    descricao: "Complexo de lazer na lagoa, oferecendo pratos de peixes e tirolesa aquática segura.",
    imagem: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=500&h=350&fit=crop"
  },
  // CLBI Barreira do Inferno
  {
    id: "cad-clbi-1",
    cnpj: "22.222.222/0001-22",
    nome: "Centro de Visitação Espacial CLBI",
    tipo: "Agência",
    destino: "Barreira do Inferno",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 3220-3000",
    latitude: -5.8910,
    longitude: -35.1790,
    descricao: "Divisão de educação pública e turismo histórico da Aeronáutica brasileira.",
    imagem: "https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=500&h=350&fit=crop"
  },
  // Cunhaú
  {
    id: "cad-cun-2",
    cnpj: "33.333.333/0001-33",
    nome: "Cunhaú Fluvial Ecoturismo",
    tipo: "Agência",
    destino: "Barra de Cunhaú",
    regularizado: true,
    nota: 4.7,
    telefone: "(84) 99899-1122",
    latitude: -6.3100,
    longitude: -35.0550,
    descricao: "Navegação turística pelos mangues com parada nas praias fluviais e caranguejadas.",
    imagem: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=350&fit=crop"
  },
  // Bosque Namorados
  {
    id: "cad-dunas-2",
    cnpj: "44.444.444/0001-44",
    nome: "Parque das Dunas - IDEMA",
    tipo: "Guia",
    destino: "Parque das Dunas",
    regularizado: true,
    nota: 4.8,
    telefone: "(84) 3201-3960",
    latitude: -5.8405,
    longitude: -35.1975,
    descricao: "Guias ambientais oficiais do IDEMA-RN para educação ecológica em trilhas.",
    imagem: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&h=350&fit=crop"
  },
  // Mossoró
  {
    id: "cad-mos-2",
    cnpj: "55.555.555/0001-55",
    nome: "Mossoró Tour Histórico",
    tipo: "Agência",
    destino: "Cidade Histórica de Mossoró",
    regularizado: true,
    nota: 4.6,
    telefone: "(84) 3315-1212",
    latitude: -5.1870,
    longitude: -37.3440,
    descricao: "Agência que realiza city tours detalhados pelos memoriais de resistência ao cangaço.",
    imagem: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=500&h=350&fit=crop"
  },
  // Apodi
  {
    id: "cad-apo-2",
    cnpj: "66.666.666/0001-66",
    nome: "Lajedo Soledade Guias Nativos",
    tipo: "Guia",
    destino: "Lajedo de Soledade",
    regularizado: true,
    nota: 4.9,
    telefone: "(84) 99877-0099",
    latitude: -5.5830,
    longitude: -37.8010,
    descricao: "Associação local de guias protetores do Lajedo de Soledade treinados em geologia e pintura rupestre.",
    imagem: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=350&fit=crop"
  }
];

// Pools of descriptive, realistic experiences per category
const experiencesPool: Record<CadasturBusiness['tipo'], { titulo: string; descricao: string }[]> = {
  Hotel: [
    { titulo: "Café da Manhã Regional", descricao: "Banquete completo com tapiocas feitas na hora, cuscuz quente, frutas tropicais e bolos artesanais." },
    { titulo: "Piscina Panorâmica", descricao: "Acesso livre à área de lazer com piscina de borda infinita e vista para as belezas naturais." },
    { titulo: "Serviço de Concierge", descricao: "Agendamento personalizado de passeios, transfers e reservas de restaurantes locais." },
    { titulo: "Spa & Massagem", descricao: "Terapias relaxantes corporais e faciais utilizando óleos de coco e essências locais." },
    { titulo: "Rooftop Sunset Lounge", descricao: "Drinks exclusivos e música ambiente de frente para o pôr do sol." },
    { titulo: "Jantar Temático", descricao: "Noites dedicadas à culinária internacional e pratos típicos potiguares." }
  ],
  Pousada: [
    { titulo: "Chá da Tarde Cortesia", descricao: "Deliciosa pausa no final da tarde com café fresco, chás e bolos caseiros locais." },
    { titulo: "Espaço Zen & Redário", descricao: "Área sombreada sob coqueiros e árvores nativas para leitura, descanso e relaxamento." },
    { titulo: "Aluguel de Bicicletas", descricao: "Explore a vila, o centrinho e as praias próximas de forma ecológica e no seu próprio ritmo." },
    { titulo: "Aulas de Yoga Matinais", descricao: "Sessões guiadas de meditação e alongamento sob o deck com vista para o mar." },
    { titulo: "Lounge de Areia Privativo", descricao: "Espreguiçadeiras confortáveis, guarda-sóis e serviço de bar diretamente na praia." },
    { titulo: "Transfer sob Demanda", descricao: "Serviço de transporte exclusivo para os principais pontos de embarque e atrativos." }
  ],
  Restaurante: [
    { titulo: "Menu Degustação Potiguar", descricao: "Experiência gastronômica completa guiada pelo chef, destacando ingredientes típicos da terra." },
    { titulo: "Degustação de Cachaças", descricao: "Seleção harmonizada de cachaças artesanais produzidas no Rio Grande do Norte." },
    { titulo: "Música Potiguar ao Vivo", descricao: "Apresentações acústicas de MPB, forró pé-de-serra clássico e bossa nova nas noites." },
    { titulo: "Jantar Romântico à Luz de Velas", descricao: "Decoração especial com pétalas, iluminação suave e menu exclusivo de 3 tempos para casais." },
    { titulo: "Oficina Ginga com Tapioca", descricao: "Aprenda com cozinheiras tradicionais a preparar e rechear a famosa receita potiguar." },
    { titulo: "Espaço Kids Recreativo", descricao: "Área de recreação climatizada e segura para as crianças se divertirem com monitor." }
  ],
  Guia: [
    { titulo: "Tour Fotográfico Potiguar", descricao: "Acompanhamento profissional registrando os melhores ângulos e luzes da sua jornada pelas dunas." },
    { titulo: "Trilha Ecológica Interpretativa", descricao: "Explicação sobre a rica fauna, flora endêmica e formações geológicas das dunas e falésias." },
    { titulo: "Kit Hidratação & Frutas", descricao: "Fornecimento de água fresca mineral, isotônicos e frutas da estação selecionadas." },
    { titulo: "Itinerário Personalizado", descricao: "Roteiro montado sob medida, adaptando horários e paradas conforme o ritmo do turista." },
    { titulo: "Suporte de Aventura Seguro", descricao: "Condutor qualificado nas normas ABNT de turismo de aventura com kit completo de salvamento." },
    { titulo: "Guiamento Astronômico", descricao: "Observação noturna guiada do céu estrelado em regiões com baixa poluição luminosa." }
  ],
  Agência: [
    { titulo: "Buggy Tour Credenciado", descricao: "Aventura pelas dunas móveis conduzida por pilotos certificados da associação local." },
    { titulo: "Flutuação nos Parrachos", descricao: "Navegação rápida de catamarã ou lancha até os corais com snorkel e óculos inclusos." },
    { titulo: "Transfer Conforto", descricao: "Veículos modernos de turismo com ar-condicionado buscando e deixando você no hotel." },
    { titulo: "Roteiro Quadriciclo Falésias", descricao: "Expedição emocionante em caravana guiada por caminhos de falésias e lagoas de água doce." },
    { titulo: "Passeio de Jangada Tradicional", descricao: "Navegação silenciosa pelo ecossistema de manguezais com jangadeiro nativo da região." },
    { titulo: "Seguro Aventura Integrado", descricao: "Seguro viagem e aventura completo ativo para todos os passageiros durante as atividades." }
  ]
};

const namePrefixes = [
  "Mar", "Sol", "Vento", "Duna", "Costa", "Ouro", "Terra", "Brisa", "Porto", "Recanto",
  "Mirante", "Estrela", "Sertão", "Caminho", "Horizonte", "Farol", "Falésia", "Coqueiro",
  "Veleiro", "Maresia", "Amanhecer", "Ondas", "Pontal", "Enseada", "Atalaia"
];

const nameSuffixes = [
  "do RN", "Potiguar", "do Sol", "do Nordeste", "da Praia", "das Falésias", "do Careca",
  "de Pipa", "de Gostoso", "dos Reis Magos", "do Sertão", "da Duna", "da Lagoa",
  "Tropical", "Imperial", "do Mar", "dos Ventos", "Atlântico", "Eco", "Paradisíaco",
  "do Jacaré", "da Guarita", "das Marés", "do Cabo", "das Areias"
];

const hotelClassifiers = ["Hotel", "Resort", "Palace", "Plaza", "Marina"];
const pousadaClassifiers = ["Pousada", "Hostel", "Chalés", "Eco-Lodge", "Estalagem"];
const restauranteClassifiers = ["Restaurante", "Bistrô", "Grill", "Cantina", "Taberna", "Gourmet"];
const guiaClassifiers = ["Guia", "Condutor", "Roteiro", "Aventura", "Explora"];
const agenciaClassifiers = ["Agência", "Turismo", "Viagens", "Expedições", "Ecotur"];

const businessTypes: CadasturBusiness['tipo'][] = ["Hotel", "Restaurante", "Guia", "Pousada", "Agência"];

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&h=350&fit=crop"
];
const restauranteImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=350&fit=crop"
];
const pousadaImages = [
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&h=350&fit=crop"
];
const guiaImages = [
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=500&h=350&fit=crop"
];
const agenciaImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=500&h=350&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=350&fit=crop"
];

function generateMockBusinesses(): CadasturBusiness[] {
  const list: CadasturBusiness[] = [];
  const targetCount = 800;

  // 1. Process static businesses first, adding experiences to them
  staticCadasturData.forEach((b, idx) => {
    const seed = idx + 1;
    const pool = experiencesPool[b.tipo];
    const experiences = [
      pool[seed % pool.length],
      pool[(seed + 1) % pool.length],
      pool[(seed + 2) % pool.length]
    ];
    list.push({
      ...b,
      experiencias: experiences
    });
  });

  const currentCount = list.length;

  // 2. Generate remaining businesses deterministically
  for (let i = 0; i < targetCount - currentCount; i++) {
    const seed = i + 1;

    // Pick destination deterministically
    const destinoInfo = destinosInfo[seed % destinosInfo.length];
    const destino = destinoInfo.nome;

    // Pick type deterministically
    const tipo = businessTypes[seed % businessTypes.length];

    // Generate name deterministically
    const prefix = namePrefixes[seed % namePrefixes.length];
    const suffix = nameSuffixes[(seed * 7) % nameSuffixes.length];
    let nome = "";
    if (tipo === "Hotel") {
      nome = `${hotelClassifiers[seed % hotelClassifiers.length]} ${prefix} ${suffix}`;
    } else if (tipo === "Pousada") {
      nome = `${pousadaClassifiers[seed % pousadaClassifiers.length]} ${prefix} ${suffix}`;
    } else if (tipo === "Restaurante") {
      nome = `${restauranteClassifiers[seed % restauranteClassifiers.length]} ${prefix} ${suffix}`;
    } else if (tipo === "Guia") {
      nome = `${guiaClassifiers[seed % guiaClassifiers.length]} ${prefix} ${suffix}`;
    } else if (tipo === "Agência") {
      nome = `${agenciaClassifiers[seed % agenciaClassifiers.length]} ${prefix} ${suffix}`;
    }

    // Generate CNPJ deterministically
    const cnpjPart1 = (10 + (seed % 89)).toString().padStart(2, "0");
    const cnpjPart2 = ((seed * 17) % 900 + 100).toString().padStart(3, "0");
    const cnpjPart3 = ((seed * 31) % 900 + 100).toString().padStart(3, "0");
    const cnpjPart4 = ((seed * 43) % 90 + 10).toString().padStart(2, "0");
    const cnpj = `${cnpjPart1}.${cnpjPart2}.${cnpjPart3}/0001-${cnpjPart4}`;

    // Regularized: 90% regularized, 10% not
    const regularizado = (seed % 10) !== 0;

    // Rating: 3.5 to 5.0
    const nota = parseFloat((3.5 + ((seed * 13) % 16) * 0.1).toFixed(1));

    // Phone: (84) 9XXXX-XXXX
    const phonePart1 = ((seed * 19) % 9000 + 1000).toString();
    const phonePart2 = ((seed * 23) % 9000 + 1000).toString();
    const telefone = `(84) 9${phonePart1}-${phonePart2}`;

    // Coordinates: offset from destination center in a spiral distribution
    const latOffset = Math.sin(seed) * 0.015;
    const lngOffset = Math.cos(seed) * 0.015;
    const latitude = parseFloat((destinoInfo.latitude + latOffset).toFixed(6));
    const longitude = parseFloat((destinoInfo.longitude + lngOffset).toFixed(6));

    // Description
    const descTemplates = [
      `Destaque regional pela excelência e comprometimento com o turista. Este ${tipo.toLowerCase()} localizado em ${destino} oferece excelente atendimento e qualidade em todos os detalhes.`,
      `Ideal para quem busca curtir o melhor de ${destino} com total segurança. Com selo de homologação do Cadastur, nosso ${tipo.toLowerCase()} garante uma estadia tranquila e prazerosa.`,
      `Localizado no coração de ${destino}, este ${tipo.toLowerCase()} destaca-se pela receptividade e atendimento qualificado, sendo muito recomendado por viajantes do Brasil e do exterior.`
    ];
    const descricao = descTemplates[seed % descTemplates.length];

    // Image
    let imageList = hotelImages;
    if (tipo === "Restaurante") imageList = restauranteImages;
    else if (tipo === "Pousada") imageList = pousadaImages;
    else if (tipo === "Guia") imageList = guiaImages;
    else if (tipo === "Agência") imageList = agenciaImages;
    const imagem = imageList[seed % imageList.length];

    // Pick 3 experiences deterministically
    const pool = experiencesPool[tipo];
    const experiences = [
      pool[seed % pool.length],
      pool[(seed + 1) % pool.length],
      pool[(seed + 2) % pool.length]
    ];

    list.push({
      id: `cad-auto-${seed}`,
      cnpj,
      nome,
      tipo,
      destino,
      regularizado,
      nota,
      telefone,
      latitude,
      longitude,
      descricao,
      imagem,
      experiencias: experiences
    });
  }

  return list;
}

export const cadasturData: CadasturBusiness[] = generateMockBusinesses();

// --- REAL STATISTICAL DATA LAYERS FOR B2G DASHBOARD ---
export const ibgeData: IBGEData[] = [
  { destino: "Ponta Negra e Morro do Careca", municipio: "Natal", populacao: 784249, area_km2: 167.26, idh: 0.763, leitos_hospitalares: 3200, escolas_publicas: 450 },
  { destino: "Praia da Pipa", municipio: "Tibau do Sul", populacao: 18080, area_km2: 102.68, idh: 0.639, leitos_hospitalares: 12, escolas_publicas: 8 },
  { destino: "Dunas de Genipabu", municipio: "Extremoz", populacao: 68584, area_km2: 224.0, idh: 0.665, leitos_hospitalares: 15, escolas_publicas: 24 },
  { destino: "Parrachos de Maracajaú", municipio: "Maxaranguape", populacao: 13000, area_km2: 131.3, idh: 0.612, leitos_hospitalares: 4, escolas_publicas: 6 },
  { destino: "São Miguel do Gostoso", municipio: "São Miguel do Gostoso", populacao: 10636, area_km2: 342.4, idh: 0.611, leitos_hospitalares: 6, escolas_publicas: 12 },
  { destino: "Forte dos Reis Magos", municipio: "Natal", populacao: 784249, area_km2: 167.26, idh: 0.763, leitos_hospitalares: 3200, escolas_publicas: 450 },
  { destino: "Galinhos", municipio: "Galinhos", populacao: 2159, area_km2: 340.5, idh: 0.589, leitos_hospitalares: 2, escolas_publicas: 3 },
  { destino: "Maior Cajueiro do Mundo", municipio: "Parnamirim", populacao: 271713, area_km2: 123.4, idh: 0.742, leitos_hospitalares: 450, escolas_publicas: 98 },
  { destino: "Praia do Madeiro", municipio: "Tibau do Sul", populacao: 18080, area_km2: 102.68, idh: 0.639, leitos_hospitalares: 12, escolas_publicas: 8 },
  { destino: "Lagoa de Pitangui", municipio: "Extremoz", populacao: 68584, area_km2: 224.0, idh: 0.665, leitos_hospitalares: 15, escolas_publicas: 24 },
  { destino: "Barreira do Inferno", municipio: "Parnamirim", populacao: 271713, area_km2: 123.4, idh: 0.742, leitos_hospitalares: 450, escolas_publicas: 98 },
  { destino: "Barra de Cunhaú", municipio: "Canguaretama", populacao: 31000, area_km2: 245.5, idh: 0.621, leitos_hospitalares: 14, escolas_publicas: 18 },
  { destino: "Parque das Dunas", municipio: "Natal", populacao: 784249, area_km2: 167.26, idh: 0.763, leitos_hospitalares: 3200, escolas_publicas: 450 },
  { destino: "Cidade Histórica de Mossoró", municipio: "Mossoró", populacao: 278000, area_km2: 2099.3, idh: 0.729, leitos_hospitalares: 850, escolas_publicas: 160 },
  { destino: "Lajedo de Soledade", municipio: "Apodi", populacao: 36000, area_km2: 1602.4, idh: 0.642, leitos_hospitalares: 24, escolas_publicas: 32 }
];

export const transporteData: TransporteData[] = [
  { destino: "Ponta Negra e Morro do Careca", voos_mensais: 680, onibus_mensais: 2400, veiculos_terrestres_mensais: 85000, modal_principal: "Aéreo + Terrestre", variacao_percentual: 18 },
  { destino: "Praia da Pipa", voos_mensais: 0, onibus_mensais: 850, veiculos_terrestres_mensais: 32000, modal_principal: "Veículo Particular", variacao_percentual: 14 },
  { destino: "Dunas de Genipabu", voos_mensais: 0, onibus_mensais: 600, veiculos_terrestres_mensais: 22000, modal_principal: "Buggy / Vans", variacao_percentual: 8 },
  { destino: "Parrachos de Maracajaú", voos_mensais: 0, onibus_mensais: 300, veiculos_terrestres_mensais: 11000, modal_principal: "Vans Receptivas", variacao_percentual: 12 },
  { destino: "São Miguel do Gostoso", voos_mensais: 0, onibus_mensais: 140, veiculos_terrestres_mensais: 8500, modal_principal: "Veículo Particular", variacao_percentual: 24 },
  { destino: "Forte dos Reis Magos", voos_mensais: 0, onibus_mensais: 500, veiculos_terrestres_mensais: 45000, modal_principal: "Urbano / Ônibus", variacao_percentual: 3 },
  { destino: "Galinhos", voos_mensais: 0, onibus_mensais: 40, veiculos_terrestres_mensais: 1200, modal_principal: "Barco + 4x4", variacao_percentual: 6 },
  { destino: "Maior Cajueiro do Mundo", voos_mensais: 0, onibus_mensais: 950, veiculos_terrestres_mensais: 52000, modal_principal: "Terrestre Coletivo", variacao_percentual: 9 },
  { destino: "Praia do Madeiro", voos_mensais: 0, onibus_mensais: 400, veiculos_terrestres_mensais: 14000, modal_principal: "Vans / Micro-ônibus", variacao_percentual: 11 },
  { destino: "Lagoa de Pitangui", voos_mensais: 0, onibus_mensais: 420, veiculos_terrestres_mensais: 18000, modal_principal: "Buggy", variacao_percentual: 7 },
  { destino: "Barreira do Inferno", voos_mensais: 0, onibus_mensais: 320, veiculos_terrestres_mensais: 28000, modal_principal: "Urbano / Particular", variacao_percentual: 4 },
  { destino: "Barra de Cunhaú", voos_mensais: 0, onibus_mensais: 80, veiculos_terrestres_mensais: 4500, modal_principal: "Terrestre", variacao_percentual: 5 },
  { destino: "Parque das Dunas", voos_mensais: 0, onibus_mensais: 1200, veiculos_terrestres_mensais: 60000, modal_principal: "Urbano", variacao_percentual: 2 },
  { destino: "Cidade Histórica de Mossoró", voos_mensais: 32, onibus_mensais: 1400, veiculos_terrestres_mensais: 72000, modal_principal: "Terrestre / Rodoviário", variacao_percentual: 10 },
  { destino: "Lajedo de Soledade", voos_mensais: 0, onibus_mensais: 50, veiculos_terrestres_mensais: 2100, modal_principal: "Rodoviário", variacao_percentual: 13 }
];

export const investimentosData: InvestimentoData[] = [
  { destino: "Ponta Negra e Morro do Careca", investimento_infraestrutura_mil: 2400, investimento_saneamento_mil: 1800, investimento_turismo_mil: 1200, total_mil: 5400, ano: 2026 },
  { destino: "Praia da Pipa", investimento_infraestrutura_mil: 1200, investimento_saneamento_mil: 950, investimento_turismo_mil: 800, total_mil: 2950, ano: 2026 },
  { destino: "Dunas de Genipabu", investimento_infraestrutura_mil: 600, investimento_saneamento_mil: 300, investimento_turismo_mil: 400, total_mil: 1300, ano: 2026 },
  { destino: "Parrachos de Maracajaú", investimento_infraestrutura_mil: 350, investimento_saneamento_mil: 200, investimento_turismo_mil: 150, total_mil: 700, ano: 2026 },
  { destino: "São Miguel do Gostoso", investimento_infraestrutura_mil: 800, investimento_saneamento_mil: 500, investimento_turismo_mil: 600, total_mil: 1900, ano: 2026 },
  { destino: "Forte dos Reis Magos", investimento_infraestrutura_mil: 400, investimento_saneamento_mil: 100, investimento_turismo_mil: 300, total_mil: 800, ano: 2026 },
  { destino: "Galinhos", investimento_infraestrutura_mil: 500, investimento_saneamento_mil: 200, investimento_turismo_mil: 150, total_mil: 850, ano: 2026 },
  { destino: "Maior Cajueiro do Mundo", investimento_infraestrutura_mil: 300, investimento_saneamento_mil: 100, investimento_turismo_mil: 200, total_mil: 600, ano: 2026 },
  { destino: "Praia do Madeiro", investimento_infraestrutura_mil: 200, investimento_saneamento_mil: 100, investimento_turismo_mil: 150, total_mil: 450, ano: 2026 },
  { destino: "Lagoa de Pitangui", investimento_infraestrutura_mil: 150, investimento_saneamento_mil: 80, investimento_turismo_mil: 100, total_mil: 330, ano: 2026 },
  { destino: "Barreira do Inferno", investimento_infraestrutura_mil: 100, investimento_saneamento_mil: 50, investimento_turismo_mil: 100, total_mil: 250, ano: 2026 },
  { destino: "Barra de Cunhaú", investimento_infraestrutura_mil: 300, investimento_saneamento_mil: 150, investimento_turismo_mil: 150, total_mil: 600, ano: 2026 },
  { destino: "Parque das Dunas", investimento_infraestrutura_mil: 250, investimento_saneamento_mil: 100, investimento_turismo_mil: 150, total_mil: 500, ano: 2026 },
  { destino: "Cidade Histórica de Mossoró", investimento_infraestrutura_mil: 1800, investimento_saneamento_mil: 1200, investimento_turismo_mil: 900, total_mil: 3900, ano: 2026 },
  { destino: "Lajedo de Soledade", investimento_infraestrutura_mil: 200, investimento_saneamento_mil: 50, investimento_turismo_mil: 150, total_mil: 400, ano: 2026 }
];

export const fluxoData: FluxoData[] = [
  { destino: "Ponta Negra e Morro do Careca", fluxo_visitantes_mes: 145000, receita_estimada_milhoes: 34.5, saturacao_turistica: 88, hashtag_instagram: "pontanegranatal" },
  { destino: "Praia da Pipa", fluxo_visitantes_mes: 82000, receita_estimada_milhoes: 24.0, saturacao_turistica: 76, hashtag_instagram: "praiadapipa" },
  { destino: "Dunas de Genipabu", fluxo_visitantes_mes: 54000, receita_estimada_milhoes: 12.8, saturacao_turistica: 62, hashtag_instagram: "genipabu" },
  { destino: "Parrachos de Maracajaú", fluxo_visitantes_mes: 28000, receita_estimada_milhoes: 8.5, saturacao_turistica: 54, hashtag_instagram: "maracajau" },
  { destino: "São Miguel do Gostoso", fluxo_visitantes_mes: 32000, receita_estimada_milhoes: 11.2, saturacao_turistica: 48, hashtag_instagram: "saomigueldogostoso" },
  { destino: "Forte dos Reis Magos", fluxo_visitantes_mes: 24000, receita_estimada_milhoes: 2.1, saturacao_turistica: 35, hashtag_instagram: "fortedosreismagos" },
  { destino: "Galinhos", fluxo_visitantes_mes: 9800, receita_estimada_milhoes: 3.4, saturacao_turistica: 28, hashtag_instagram: "galinhos" },
  { destino: "Maior Cajueiro do Mundo", fluxo_visitantes_mes: 68000, receita_estimada_milhoes: 4.8, saturacao_turistica: 72, hashtag_instagram: "maiorcajueiro" },
  { destino: "Praia do Madeiro", fluxo_visitantes_mes: 35000, receita_estimada_milhoes: 7.2, saturacao_turistica: 68, hashtag_instagram: "praiadomadeiro" },
  { destino: "Lagoa de Pitangui", fluxo_visitantes_mes: 42000, receita_estimada_milhoes: 5.4, saturacao_turistica: 79, hashtag_instagram: "lagoadepitangui" },
  { destino: "Barreira do Inferno", fluxo_visitantes_mes: 18000, receita_estimada_milhoes: 1.2, saturacao_turistica: 20, hashtag_instagram: "barreiradoinferno" },
  { destino: "Barra de Cunhaú", fluxo_visitantes_mes: 14000, receita_estimada_milhoes: 3.8, saturacao_turistica: 30, hashtag_instagram: "barradecunhau" },
  { destino: "Parque das Dunas", fluxo_visitantes_mes: 45000, receita_estimada_milhoes: 1.5, saturacao_turistica: 40, hashtag_instagram: "parquedasdunas" },
  { destino: "Cidade Histórica de Mossoró", fluxo_visitantes_mes: 58000, receita_estimada_milhoes: 18.0, saturacao_turistica: 50, hashtag_instagram: "mossoro" },
  { destino: "Lajedo de Soledade", fluxo_visitantes_mes: 6500, receita_estimada_milhoes: 1.8, saturacao_turistica: 15, hashtag_instagram: "lajedodesoledade" }
];

export const avaliacaoOptions = [
  { id: "limpo", label: "Local Limpo", emoji: "🧹", weight: 15 },
  { id: "sinalizado", label: "Bem Sinalizado", emoji: "🪧", weight: 10 },
  { id: "preservado", label: "Natureza Preservada", emoji: "🌿", weight: 15 },
  { id: "acessibilidade", label: "Acessível (Rampas/Pisos)", emoji: "♿", weight: 10 },
  { id: "seguranca", label: "Segurança Ativa", emoji: "👮", weight: 15 },
  { id: "custo_beneficio", label: "Preço Justo (Alimentação/Lazer)", emoji: "🪙", weight: 10 },
  { id: "conservacao", label: "Equipamentos Conservados", emoji: "🏗️", weight: 15 },
  { id: "superlotado", label: "Superlotado (Alerta)", emoji: "⚠️", weight: -10, negative: true }
];

// --- ISA (Índice de Saúde do Atrativo) Calculator V2 ---
export function calcularISA(destino: string, feedbacks: Feedback[]): number {
  const fluxo = fluxoData.find((f) => f.destino === destino);
  const investimento = investimentosData.find((i) => i.destino === destino);
  if (!fluxo || !investimento) return 70;

  let baseScore = 65; // Base starting point

  // Filter feedbacks for this destination
  const destFeedbacks = feedbacks.filter((f) => f.destino === destino);

  if (destFeedbacks.length > 0) {
    let feedbackBonus = 0;
    let feedbackCount = 0;

    destFeedbacks.forEach((f) => {
      let score = 0;
      let count = 0;

      // Positive aspects (Weights summing up to 90)
      if (f.limpo) { score += 15; count += 15; } else { count += 15; }
      if (f.sinalizado) { score += 10; count += 10; } else { count += 10; }
      if (f.preservado) { score += 15; count += 15; } else { count += 15; }
      if (f.acessibilidade) { score += 10; count += 10; } else { count += 10; }
      if (f.seguranca) { score += 15; count += 15; } else { count += 15; }
      if (f.custo_beneficio) { score += 10; count += 10; } else { count += 10; }
      if (f.conservacao) { score += 15; count += 15; } else { count += 15; }

      // Overall stars factor (1-5 stars mapped to -10 to +10)
      const starFactor = (f.nota_geral - 3) * 5; // 1 => -10, 3 => 0, 5 => +10

      // Negative aspects
      const overcrowdingPenalty = f.superlotado ? -15 : 0;

      feedbackBonus += (score / count) * 80 + starFactor + overcrowdingPenalty;
      feedbackCount++;
    });

    baseScore = feedbackBonus / feedbackCount;
  } else {
    // Default score based on static metrics
    // Investment bonus
    if (investimento.total_mil > 3000) baseScore += 15;
    else if (investimento.total_mil > 1000) baseScore += 8;

    // Saturation penalty
    if (fluxo.saturacao_turistica > 85) baseScore -= 18;
    else if (fluxo.saturacao_turistica > 65) baseScore -= 8;
  }

  return Math.max(0, Math.min(100, Math.round(baseScore)));
}

export const allDestinos = destinosInfo.map((d) => d.nome);
export const getDestinoByAttraction = (attractionId: string) => {
  return destinosInfo.find(d => d.atracoes.some(a => a.id === attractionId));
};
