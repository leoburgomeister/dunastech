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
  monitorado?: boolean;
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

// --- 20 DESTINOS REAIS DO RN (15 Originais + 5 Adicionados) ---
export const destinosInfo: DestinoInfo[] = [
  {
    nome: "Ponta Negra e Morro do Careca",
    municipio: "Natal",
    descricao: "O principal cartão-postal de Natal, famoso pela icônica duna de 120 metros cercada por Mata Atlântica e uma enseada de águas calmas. O local possui excelente infraestrutura de lazer, gastronomia e hotelaria à beira-mar, atraindo milhares de banhistas e entusiastas de esportes aquáticos.",
    imagem: "/images/destinations/hero_ponta_negra.png",
    latitude: -5.8811,
    longitude: -35.1711,
    hashtag: "pontanegranatal",
    monitorado: true,
    atracoes: [
      {
        id: "act-pn-1",
        nome: "Passeio de Jangada no Morro",
        descricao: "Navegação tradicional contornando a enseada de Ponta Negra com vista do Morro do Careca.",
        imagem: "/images/destinations/hero_ponta_negra.png",
        parceiroId: "cad-pn-3"
      },
      {
        id: "act-pn-2",
        nome: "Stand Up Paddle na Enseada",
        descricao: "Prática esportiva em águas calmas perto do morro.",
        imagem: "/images/destinations/hero_ponta_negra.png",
        parceiroId: "cad-pn-3"
      }
    ]
  },
  {
    nome: "Praia da Pipa",
    municipio: "Tibau do Sul",
    descricao: "Destino de renome internacional situado no município de Tibau do Sul. Famoso por suas imponentes falésias coloridas de arenito, mar calmo com águas cristalinas propícias ao surf e a frequente presença de golfinhos na Baía dos Golfinhos. À noite, a vila se transforma com um vibrante polo gastronômico e boêmio.",
    imagem: "/images/destinations/pipa.png",
    latitude: -6.2275,
    longitude: -35.0475,
    hashtag: "praiadapipa",
    monitorado: true,
    atracoes: [
      {
        id: "act-pipa-1",
        nome: "Observação de Golfinhos",
        descricao: "Passeio de barco para avistar golfinhos em seu habitat natural.",
        imagem: "/images/destinations/pipa.png",
        parceiroId: "cad-pipa-3"
      },
      {
        id: "act-pipa-2",
        nome: "Trilha no Santuário Ecológico",
        descricao: "Caminhadas sob a Mata Atlântica preservada com mirantes para as praias.",
        imagem: "/images/destinations/pipa.png",
        parceiroId: "cad-pipa-3"
      }
    ]
  },
  {
    nome: "Dunas de Genipabu",
    municipio: "Extremoz",
    descricao: "Complexo monumental de dunas móveis e lagoas cristalinas em Extremoz. É o berço dos clássicos passeios de buggy regados a 'emoção' no Rio Grande do Norte, onde turistas desfrutam de vistas panorâmicas espetaculares da costa potiguar.",
    imagem: "/images/destinations/genipabu.png",
    latitude: -5.7089,
    longitude: -35.1967,
    hashtag: "genipabu",
    monitorado: true,
    atracoes: [
      {
        id: "act-gen-1",
        nome: "Passeio de Buggy com Emoção",
        descricao: "Aventura pelas dunas móveis com paradas para fotos e lagoa.",
        imagem: "/images/destinations/genipabu.png",
        parceiroId: "cad-gen-3"
      },
      {
        id: "act-gen-2",
        nome: "Esquibunda nas Dunas",
        descricao: "Descida em prancha de madeira direto na lagoa de Genipabu.",
        imagem: "/images/destinations/genipabu.png",
        parceiroId: "cad-gen-3"
      }
    ]
  },
  {
    nome: "Parrachos de Maracajaú",
    municipio: "Maxaranguape",
    descricao: "Famosas piscinas naturais a sete quilômetros da costa de Maxaranguape. Os corais formam um aquário natural de águas mornas e transparentes, ideal para a prática de snorkel e mergulho livre entre peixes coloridos.",
    imagem: "/images/destinations/maracajau.png",
    latitude: -5.4124,
    longitude: -35.3764,
    hashtag: "maracajau",
    monitorado: true,
    atracoes: [
      {
        id: "act-mar-1",
        nome: "Mergulho nos Parrachos",
        descricao: "Exploração dos corais em águas mornas e translúcidas guiada.",
        imagem: "/images/destinations/maracajau.png",
        parceiroId: "cad-mar-3"
      }
    ]
  },
  {
    nome: "São Miguel do Gostoso",
    municipio: "São Miguel do Gostoso",
    descricao: "Uma das vilas de pescadores mais charmosas e preservadas do litoral norte potiguar. Conhecida mundialmente por seus ventos constantes que atraem velejadores de kitesurf e windsurf, além de pousadas aconchegantes e praias desertas propícias para descanso.",
    imagem: "/images/destinations/sao_miguel.png",
    latitude: -5.1247,
    longitude: -35.6392,
    hashtag: "saomigueldogostoso",
    monitorado: true,
    atracoes: [
      {
        id: "act-gost-1",
        nome: "Kitesurf e Windsurf",
        descricao: "Aprenda a velejar com campeões locais nos ventos mais constantes do país.",
        imagem: "/images/destinations/sao_miguel.png",
        parceiroId: "cad-gost-2"
      }
    ]
  },
  {
    nome: "Forte dos Reis Magos",
    municipio: "Natal",
    descricao: "Fortaleza histórica de pedra datada de 1598, em formato de estrela, localizada na foz do Rio Potengi. É o marco inicial da fundação de Natal, abrigando canhões e relíquias do período colonial sob preservação histórica.",
    imagem: "/images/destinations/forte_dos_reis_magos.png",
    latitude: -5.7564,
    longitude: -35.1947,
    hashtag: "fortedosreismagos",
    monitorado: true,
    atracoes: [
      {
        id: "act-forte-1",
        nome: "Visita Histórica",
        descricao: "Descubra marcos coloniais e canhões históricos da fundação de Natal.",
        imagem: "/images/destinations/forte_dos_reis_magos.png",
        parceiroId: "cad-forte-2"
      }
    ]
  },
  {
    nome: "Galinhos",
    municipio: "Galinhos",
    descricao: "Uma deslumbrante península de pescadores isolada do turismo de massa, cercada de dunas gigantes, salinas naturais e manguezais intocados. O acesso é feito apenas de barco ou veículo tracionado 4x4.",
    imagem: "/images/destinations/galinhos.png",
    latitude: -5.0917,
    longitude: -36.2742,
    hashtag: "galinhos",
    monitorado: true,
    atracoes: [
      {
        id: "act-gal-1",
        nome: "Passeio de Barco pelo Rio",
        descricao: "Navegação por manguezais e salinas desfrutando do silêncio da península.",
        imagem: "/images/destinations/galinhos.png",
        parceiroId: "cad-gal-2"
      }
    ]
  },
  {
    nome: "Maior Cajueiro do Mundo",
    municipio: "Parnamirim",
    descricao: "Patrimônio natural situado em Pirangi, no município de Parnamirim. Registrado no Guinness Book por cobrir uma área colossal de mais de 8.500 metros quadrados, resultado de uma anomalia genética que faz seus galhos crescerem para os lados e criarem novas raízes.",
    imagem: "/images/destinations/maior_caju.png",
    latitude: -5.9739,
    longitude: -35.1289,
    hashtag: "maiorcajueiro",
    monitorado: true,
    atracoes: [
      {
        id: "act-caju-1",
        nome: "Trilha Suspensa do Cajueiro",
        descricao: "Caminhada sob a copa gigante do maior cajueiro do mundo.",
        imagem: "/images/destinations/maior_caju.png",
        parceiroId: "cad-caju-2"
      }
    ]
  },
  {
    nome: "Praia do Madeiro",
    municipio: "Tibau do Sul",
    descricao: "Um verdadeiro refúgio ecológico em Tibau do Sul, cercado por imensas falésias avermelhadas e Mata Atlântica. É muito procurado para caminhadas, aulas de surf para iniciantes e avistamento frequente de golfinhos bem próximos à orla.",
    imagem: "/images/destinations/pipa.png",
    latitude: -6.2137,
    longitude: -35.0774,
    hashtag: "praiadomadeiro",
    monitorado: true,
    atracoes: [
      {
        id: "act-mad-1",
        nome: "Escola de Surf do Madeiro",
        descricao: "Aulas práticas com instrutores nas ondas perfeitas do Madeiro.",
        imagem: "/images/destinations/pipa.png",
        parceiroId: "cad-mad-2"
      }
    ]
  },
  {
    nome: "Lagoa de Pitangui",
    municipio: "Extremoz",
    descricao: "Oásis de águas calmas, mornas e doce no coração de dunas em Extremoz. Equipada com estruturas de lazer como redários dentro da água e tirolesas, é um destino familiar imperdível para relaxamento completo.",
    imagem: "/images/destinations/genipabu.png",
    latitude: -5.7250,
    longitude: -35.2100,
    hashtag: "lagoadepitangui",
    monitorado: true,
    atracoes: [
      {
        id: "act-pit-1",
        nome: "Redário e Tirolesa na Lagoa",
        descricao: "Redes na água e diversão em tirolesas na lagoa cristalina.",
        imagem: "/images/destinations/genipabu.png",
        parceiroId: "cad-pit-2"
      }
    ]
  },
  {
    nome: "Barreira do Inferno",
    municipio: "Parnamirim",
    descricao: "Primeira base de lançamento de foguetes da América do Sul, inaugurada em 1965 em Parnamirim. O local integra pesquisas aeroespaciais com um museu de aviação e exibe belíssimas falésias vermelhas à beira-mar.",
    imagem: "/images/destinations/hero_ponta_negra.png",
    latitude: -5.8915,
    longitude: -35.1797,
    hashtag: "barreiradoinferno",
    monitorado: true,
    atracoes: [
      {
        id: "act-clbi-1",
        nome: "Museu Aeroespacial Potiguar",
        descricao: "Exposição de foguetes reais, radares e aviões de combate.",
        imagem: "/images/destinations/hero_ponta_negra.png",
        parceiroId: "cad-clbi-1"
      }
    ]
  },
  {
    nome: "Barra de Cunhaú",
    municipio: "Canguaretama",
    descricao: "Onde o Rio Curimataú encontra as águas salgadas do oceano em Canguaretama. Um destino exuberante cercado por manguezais, ideal para saborear pratos típicos à base de caranguejos e curtir praias de águas calmas.",
    imagem: "/images/destinations/galinhos.png",
    latitude: -6.3103,
    longitude: -35.0553,
    hashtag: "barradecunhau",
    monitorado: true,
    atracoes: [
      {
        id: "act-cun-1",
        nome: "Passeio do Manguezal",
        descricao: "Pesquisa ecológica pelos rios, mangues e captura ecológica de caranguejos.",
        imagem: "/images/destinations/galinhos.png",
        parceiroId: "cad-cun-2"
      }
    ]
  },
  {
    nome: "Parque das Dunas",
    municipio: "Natal",
    descricao: "Maior reserva de Mata Atlântica urbana do Rio Grande do Norte, localizada no centro de Natal. Oferece trilhas ecológicas monitoradas sob a copa de árvores nativas, além de áreas de lazer infantil e piqueniques.",
    imagem: "/images/destinations/genipabu.png",
    latitude: -5.8400,
    longitude: -35.1970,
    hashtag: "parquedasdunas",
    monitorado: true,
    atracoes: [
      {
        id: "act-dunas-1",
        nome: "Trilha Ecológica da Peroba",
        descricao: "Caminhada na mata densa das dunas com guias ambientais.",
        imagem: "/images/destinations/genipabu.png",
        parceiroId: "cad-dunas-2"
      }
    ]
  },
  {
    nome: "Cidade Histórica de Mossoró",
    municipio: "Mossoró",
    descricao: "O coração cultural e histórico da segunda maior cidade do estado. Famosa por seu protagonismo na abolição precoce da escravidão em 1883 e pela heróica resistência popular que afugentou o bando de cangaço do temido Lampião em 1927.",
    imagem: "/images/destinations/mossoro_historico.png",
    latitude: -5.1878,
    longitude: -37.3444,
    hashtag: "mossoro",
    monitorado: true,
    atracoes: [
      {
        id: "act-mos-1",
        nome: "Memorial da Resistência ao Cangaço",
        descricao: "Roteiro histórico pelos murais e trincheiras da batalha contra Lampião.",
        imagem: "/images/destinations/mossoro_historico.png",
        parceiroId: "cad-mos-2"
      }
    ]
  },
  {
    nome: "Lajedo de Soledade",
    municipio: "Apodi",
    descricao: "Um impressionante sítio arqueológico em Apodi, composto por uma vasta planície de rocha calcária esculpida por rios subterrâneos pré-históricos. Abriga desfiladeiros repletos de fósseis de animais da megafauna e intrigantes pinturas rupestres.",
    imagem: "/images/destinations/lajedo_soledade.png",
    latitude: -5.5833,
    longitude: -37.8000,
    hashtag: "lajedodesoledade",
    monitorado: true,
    atracoes: [
      {
        id: "act-apo-1",
        nome: "Passeio Arqueológico Soledade",
        descricao: "Pesquisa arqueológica guiada por desfiladeiros de fósseis.",
        imagem: "/images/destinations/lajedo_soledade.png",
        parceiroId: "cad-apo-2"
      }
    ]
  },
  {
    nome: "Salinas e Indústria Salineira de Macau",
    municipio: "Macau",
    descricao: "Principal polo salineiro do país. Oferece uma paisagem industrial e natural fascinante com imensas pirâmides de sal marinho branco que se assemelham a dunas de neve sob o sol forte do litoral norte potiguar.",
    imagem: "/images/destinations/galinhos.png",
    latitude: -5.1114,
    longitude: -36.6344,
    hashtag: "salinasmacau",
    monitorado: true,
    atracoes: [
      {
        id: "act-macau-1",
        nome: "Visita às Salinas de Macau",
        descricao: "Passeio guiado pelas montanhas de sal marinho e canais de maré.",
        imagem: "/images/destinations/galinhos.png",
        parceiroId: "cad-apo-2"
      }
    ]
  },
  {
    nome: "Salinas de Galinhos e Fábrica de Sal",
    municipio: "Galinhos",
    descricao: "Uma incrível jornada pela extração artesanal do sal marinho. O atrativo conecta o ecossistema de manguezais potiguares à história da produção de sal tradicional, oferecendo passeios ecológicos de barco.",
    imagem: "/images/destinations/galinhos.png",
    latitude: -5.0990,
    longitude: -36.2650,
    hashtag: "salinasgalinhos",
    monitorado: true,
    atracoes: [
      {
        id: "act-sg-1",
        nome: "Trilha Ecológica do Sal",
        descricao: "Observação do processo de colheita manual do sal e vida selvagem local.",
        imagem: "/images/destinations/galinhos.png",
        parceiroId: "cad-gal-2"
      }
    ]
  },
  {
    nome: "Canyon dos Apertados",
    municipio: "Currais Novos",
    descricao: "Uma das joias geológicas mais espetaculares do Geoparque Seridó. O cânion apresenta imponentes desfiladeiros de rocha quartzítica esculpidos pela força das águas no semiárido potiguar, cercados por vegetação intocada de caatinga.",
    imagem: "/images/destinations/lajedo_soledade.png",
    latitude: -6.2600,
    longitude: -36.5160,
    hashtag: "canyondosapertados",
    monitorado: false,
    atracoes: [
      {
        id: "act-apertados-1",
        nome: "Trekking no Cânion",
        descricao: "Caminhada guiada por dentro do desfiladeiro de rocha quartzítica.",
        imagem: "/images/destinations/lajedo_soledade.png",
        parceiroId: "cad-apo-2"
      }
    ]
  },
  {
    nome: "Estátua de Santa Rita de Cássia",
    municipio: "Santa Cruz",
    descricao: "O maior monumento religioso católico do mundo, com 56 metros de altura, superando o Cristo Redentor. Situada no alto do Monte Carmelo, é o centro do turismo religioso potiguar e atrai milhares de romeiros todos os anos.",
    imagem: "/images/destinations/forte_dos_reis_magos.png",
    latitude: -6.2300,
    longitude: -36.0200,
    hashtag: "santaritadecassia",
    monitorado: false,
    atracoes: [
      {
        id: "act-srita-1",
        nome: "Mirante do Monte Carmelo",
        descricao: "Subida até a base da estátua com vista panorâmica do vale do Trairi.",
        imagem: "/images/destinations/forte_dos_reis_magos.png",
        parceiroId: "cad-forte-2"
      }
    ]
  },
  {
    nome: "Castelo de Bivar",
    municipio: "Carnaúba dos Dantas",
    descricao: "Inspirado nos castelos medievais europeus da Renascença, esta imponente construção de pedra destaca-se na paisagem árida do Seridó. É um importante atrativo histórico que preserva a cultura e arquitetura local.",
    imagem: "/images/destinations/forte_dos_reis_magos.png",
    latitude: -6.5500,
    longitude: -36.5800,
    hashtag: "castelodebivar",
    monitorado: false,
    atracoes: [
      {
        id: "act-bivar-1",
        nome: "Tour Histórico do Castelo",
        descricao: "Visitação interna guiada pela arquitetura inspirada nos castelos europeus.",
        imagem: "/images/destinations/forte_dos_reis_magos.png",
        parceiroId: "cad-mos-2"
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
    latitude: -5.4150,
    longitude: -35.3780,
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
    latitude: -5.4100,
    longitude: -35.3740,
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
    latitude: -6.2140,
    longitude: -35.0770,
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

// Pools of descriptive, realistic experiences per category (Enriched)
const experiencesPool: Record<CadasturBusiness['tipo'], { titulo: string; descricao: string }[]> = {
  Hotel: [
    { titulo: "Café da Manhã Regional Prime", descricao: "Banquete potiguar com tapiocas salgadas e doces feitas na hora, cuscuz de milho com queijo coalho, sucos naturais de cajá e seriguela, frutas tropicais frescas e bolos artesanais." },
    { titulo: "Piscina Panorâmica com Borda Infinita", descricao: "Acesso livre à área de lazer suspensa com bar molhado, espreguiçadeiras e vista espetacular das praias potiguares." },
    { titulo: "Concierge & Roteiros Exclusivos", descricao: "Agendamento personalizado de passeios de buggy, transfers privados e reservas nos melhores restaurantes com descontos exclusivos." },
    { titulo: "Spa e Terapias Naturais", descricao: "Massagens relaxantes corporais e rituais de bem-estar com óleos de coco e essências de plantas nativas da Mata Atlântica potiguar." },
    { titulo: "Sunset Drinks no Rooftop", descricao: "Happy hour diário com drinks tropicais artesanais e música ao vivo instrumental no fim de tarde de frente para o mar." },
    { titulo: "Jantar Gourmet Potiguar", descricao: "Noites dedicadas à culinária contemporânea com pratos exclusivos assinados por chefs de renome local." },
    { titulo: "Workshop de Drinks Regionais", descricao: "Aprenda a preparar caipirinhas exóticas utilizando cachaças locais e frutas típicas da época." },
    { titulo: "Yoga e Meditação no Deck", descricao: "Aulas matinais guiadas ao ar livre para começar o dia energizado e relaxado em sintonia com a natureza." },
    { titulo: "Cinema sob as Estrelas", descricao: "Exibição de filmes clássicos e curtas de diretores locais na área de jardim com pipoca artesanal cortesia." },
    { titulo: "Noite de Degustação de Vinhos", descricao: "Harmonização de queijos artesanais regionais com rótulos nacionais selecionados sob a luz de velas." }
  ],
  Pousada: [
    { titulo: "Chá da Tarde com Bolo Caseiro", descricao: "Deliciosa pausa no final da tarde com café quentinho passado na hora, chás aromáticos e bolos caseiros preparados na pousada." },
    { titulo: "Redário sob os Coqueiros", descricao: "Espaço de relaxamento total com redes de algodão artesanais à sombra de coqueirais e ventilação natural." },
    { titulo: "Cicloturismo Autônomo", descricao: "Aluguel gratuito de bicicletas de praia para explorar a vila, o centrinho histórico e as enseadas locais." },
    { titulo: "Aulas de Yoga ao Nascer do Sol", descricao: "Sessões guiadas de meditação e alongamento sob o deck de madeira de frente para a praia." },
    { titulo: "Lounge Pé na Areia Privativo", descricao: "Espaço reservado na praia com espreguiçadeiras confortáveis, ombrelones e serviço de atendimento rápido." },
    { titulo: "Transfer Exclusivo sob Demanda", descricao: "Serviço de traslado confortável conectando a pousada aos pontos de embarque e principais atrativos." },
    { titulo: "Sarau Cultural no Jardim", descricao: "Encontros de música acústica e leitura de poesias com artistas locais ao redor da fogueira." },
    { titulo: "Observação de Aves Nativas", descricao: "Caminhadas ecológicas matinais guiadas para fotografar e observar a diversificada avifauna local." },
    { titulo: "Oficina de Jardinagem Orgânica", descricao: "Aprenda sobre o cultivo de ervas finas e plantas ornamentais tropicais com o jardineiro chefe." },
    { titulo: "Luau Tropical com Fogueira", descricao: "Eventos noturnos na praia com música ao vivo, frutas da estação e petiscos regionais." }
  ],
  Restaurante: [
    { titulo: "Menu Degustação Frutos do Mar", descricao: "Experiência gastronômica completa em vários tempos, destacando camarões premium, lagostas grelhadas e peixes do dia." },
    { titulo: "Degustação de Cachaças do RN", descricao: "Seleção guiada de cachaças orgânicas e artesanais premiadas produzidas nos alambiques do estado." },
    { titulo: "Música Potiguar Instrumental", descricao: "Apresentações ao vivo de chorinho, bossa nova e MPB acústica todas as noites para enriquecer o ambiente." },
    { titulo: "Jantar Romântico com Menu de 3 Tempos", descricao: "Decoração especial na mesa, iluminação intimista e menu sofisticado para casais celebrarem momentos especiais." },
    { titulo: "Oficina Prática de Tapioca", descricao: "Aprenda com cozinheiras tradicionais os segredos da tapioca perfeita com recheios gourmet e doces." },
    { titulo: "Espaço Kids com Recreadores", descricao: "Área de recreação infantil equipada e climatizada com monitores dedicados nos finais de semana." },
    { titulo: "Workshop de Gastronomia Potiguar", descricao: "Participe de uma aula prática com o chef e aprenda a preparar uma autêntica moqueca de peixe potiguar." },
    { titulo: "Noite de Massas & Jazz", descricao: "Menu especial de massas frescas artesanais acompanhado por apresentações ao vivo de jazz clássico." },
    { titulo: "Happy Hour de Chopp Artesanal", descricao: "Descontos exclusivos em chopps de cervejarias locais e petiscos selecionados no fim de tarde." },
    { titulo: "Harmonização de Sobremesas", descricao: "Combinações surpreendentes de doces típicos com cafés gourmet e licores artesanais da casa." }
  ],
  Guia: [
    { titulo: "Tour Fotográfico nas Dunas", descricao: "Acompanhamento fotográfico profissional registrando seus melhores momentos com as luzes douradas do entardecer." },
    { titulo: "Trilha Ecológica e Histórica", descricao: "Caminhada guiada interpretando a rica fauna, flora nativa e as impressionantes histórias coloniais da região." },
    { titulo: "Kit Aventura Conforto", descricao: "Fornecimento de mochilas com água termal mineral, frutas selecionadas, repelente natural e protetor solar." },
    { titulo: "Itinerário Personalizado Flexível", descricao: "Roteiro adaptado inteiramente aos seus interesses, ritmo de caminhada e paradas ideais para fotos." },
    { titulo: "Segurança de Aventura Normas ABNT", descricao: "Condutor experiente certificado em resgate e primeiros socorros em áreas remotas com kit avançado." },
    { titulo: "Guiamento Astronômico Noturno", descricao: "Palestra ao ar livre e observação de constelações com telescópio portátil em praias com pouca iluminação." },
    { titulo: "Passeio Histórico no Centro da Cidade", descricao: "Visita cultural guiada aos monumentos, igrejas antigas e museus que contam a história da fundação da região." },
    { titulo: "Trilha Fluvial Ecológica", descricao: "Caminhada guiada pelas margens dos rios e manguezais com explicações sobre a conservação costeira." },
    { titulo: "Aventura Fotográfica Noturna", descricao: "Aprenda técnicas básicas de astrofotografia e registre o céu estrelado sob as dunas e falésias." },
    { titulo: "Condutor de Trilhas de Longo Curso", descricao: "Expedições desafiadoras por trilhas costeiras e matas com suporte completo de navegação e acampamento." }
  ],
  Agência: [
    { titulo: "Buggy Tour Emocionante Credenciado", descricao: "Passeio clássico pelas dunas móveis e fixas com pilotos credenciados da associação estadual e seguro viagem ativo." },
    { titulo: "Mergulho e Flutuação nos Corais", descricao: "Navegação rápida até as piscinas naturais com fornecimento de máscaras de mergulho, snorkel e coletes." },
    { titulo: "Transfer Aeroporto/Hotel Vip", descricao: "Translados executivos climatizados com veículos modernos e motoristas profissionais de turismo." },
    { titulo: "Expedição de Quadriciclo por Falésias", descricao: "Aventura guiada pilotando quadriciclos modernos por caminhos de falésias avermelhadas e lagoas." },
    { titulo: "Passeio de Catamarã pelos Mangues", descricao: "Navegação ecológica tranquila com guia de bordo contando os segredos do ecossistema e paradas para banho." },
    { titulo: "Seguro Aventura Individual Ecoturismo", descricao: "Seguro individual de acidentes e emergências ativo para todas as atividades reservadas com a operadora." },
    { titulo: "Passeio de Jangada ao Pôr do Sol", descricao: "Navegação tradicional de jangada para assistir ao pôr do sol de uma perspectiva única e privilegiada." },
    { titulo: "Tour Cultural de Dia Inteiro", descricao: "Roteiro completo de ônibus ou van visitando os principais pontos históricos, praias e centros de artesanato." },
    { titulo: "Trilha de Buggy com Piquenique", descricao: "Passeio exclusivo de buggy finalizando com um sofisticado piquenique de frutas e frios montado na duna." },
    { titulo: "Expedição de Caiaque nos Canais", descricao: "Passeio de caiaque pelos canais de maré e manguezais com instrutor qualificado e fotos inclusas." }
  ]
};

const namePrefixes = [
  "Dunas", "Mar", "Sol", "Vento", "Litoral", "Costa", "Ouro", "Terra", "Brisa", "Porto", "Recanto",
  "Mirante", "Estrela", "Sertão", "Caminho", "Horizonte", "Farol", "Falésia", "Coqueiro",
  "Veleiro", "Maresia", "Amanhecer", "Ondas", "Pontal", "Enseada", "Atalaia", "Cabo", "Areias",
  "Jangada", "Coral", "Maré", "Conchas", "Golfinho", "Seriguela", "Potengi", "Parrachos"
];

const nameSuffixes = [
  "do RN", "Potiguar", "do Sol", "do Nordeste", "da Praia", "das Falésias", "do Careca",
  "de Pipa", "de Gostoso", "dos Reis Magos", "do Sertão", "da Duna", "da Lagoa",
  "Tropical", "Imperial", "do Mar", "dos Ventos", "Atlântico", "Eco", "Paradisíaco",
  "do Jacaré", "da Guarita", "das Marés", "do Cabo", "das Areias", "Estrela", "Nordestino"
];

const hotelClassifiers = ["Hotel", "Resort", "Palace", "Plaza", "Marina", "Suítes", "Hotel Boutique"];
const pousadaClassifiers = ["Pousada", "Hostel", "Chalés", "Eco-Lodge", "Estalagem", "Villas", "Recanto"];
const restauranteClassifiers = ["Restaurante", "Bistrô", "Grill", "Cantina", "Taberna", "Gourmet", "Churrascaria", "Creperia"];
const guiaClassifiers = ["Guia", "Condutor", "Roteiro", "Aventura", "Explora", "Ranger", "Trekking"];
const agenciaClassifiers = ["Agência", "Turismo", "Viagens", "Expedições", "Ecotur", "Operadora", "Venture"];

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

  // Simple pseudo-random hash generator based on a seed number
  const pseudoRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 1. Process static businesses first, adding experiences to them
  staticCadasturData.forEach((b, idx) => {
    const seed = idx + 1;
    const pool = experiencesPool[b.tipo];
    const experiences = [
      pool[seed % pool.length],
      pool[(seed + 1) % pool.length],
      pool[(seed + 2) % pool.length],
      pool[(seed + 3) % pool.length],
      pool[(seed + 4) % pool.length]
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

    // Use pseudo-random selection to break modulo lock synchronization
    const randDest = pseudoRandom(seed * 1.5);
    const randType = pseudoRandom(seed * 2.3);
    const randPrefix = pseudoRandom(seed * 3.7);
    const randSuffix = pseudoRandom(seed * 4.9);
    const randClassifier = pseudoRandom(seed * 5.1);

    // Pick destination deterministically but shuffled
    const destIdx = Math.floor(randDest * destinosInfo.length);
    const destinoInfo = destinosInfo[destIdx];
    const destino = destinoInfo.nome;

    // Pick type deterministically but shuffled
    const typeIdx = Math.floor(randType * businessTypes.length);
    const tipo = businessTypes[typeIdx];

    // Generate name deterministically using decoupled indices
    const prefix = namePrefixes[Math.floor(randPrefix * namePrefixes.length)];
    const suffix = nameSuffixes[Math.floor(randSuffix * nameSuffixes.length)];
    let nome = "";
    if (tipo === "Hotel") {
      const cls = hotelClassifiers[Math.floor(randClassifier * hotelClassifiers.length)];
      nome = `${cls} ${prefix} ${suffix}`;
    } else if (tipo === "Pousada") {
      const cls = pousadaClassifiers[Math.floor(randClassifier * pousadaClassifiers.length)];
      nome = `${cls} ${prefix} ${suffix}`;
    } else if (tipo === "Restaurante") {
      const cls = restauranteClassifiers[Math.floor(randClassifier * restauranteClassifiers.length)];
      nome = `${cls} ${prefix} ${suffix}`;
    } else if (tipo === "Guia") {
      const cls = guiaClassifiers[Math.floor(randClassifier * guiaClassifiers.length)];
      nome = `${cls} ${prefix} ${suffix}`;
    } else if (tipo === "Agência") {
      const cls = agenciaClassifiers[Math.floor(randClassifier * agenciaClassifiers.length)];
      nome = `${cls} ${prefix} ${suffix}`;
    }

    // Generate CNPJ deterministically
    const cnpjPart1 = (10 + (Math.floor(pseudoRandom(seed * 6.2) * 89))).toString().padStart(2, "0");
    const cnpjPart2 = (100 + Math.floor(pseudoRandom(seed * 7.4) * 900)).toString().padStart(3, "0");
    const cnpjPart3 = (100 + Math.floor(pseudoRandom(seed * 8.1) * 900)).toString().padStart(3, "0");
    const cnpjPart4 = (10 + Math.floor(pseudoRandom(seed * 9.6) * 90)).toString().padStart(2, "0");
    const cnpj = `${cnpjPart1}.${cnpjPart2}.${cnpjPart3}/0001-${cnpjPart4}`;

    // Regularized: 92% regularized, 8% not
    const regularizado = (Math.floor(pseudoRandom(seed * 10.3) * 100) % 12) !== 0;

    // Rating: 3.8 to 5.0 (highly qualified businesses)
    const nota = parseFloat((3.8 + Math.floor(pseudoRandom(seed * 11.7) * 13) * 0.1).toFixed(1));

    // Phone: (84) 9XXXX-XXXX
    const phonePart1 = (1000 + Math.floor(pseudoRandom(seed * 12.4) * 9000)).toString();
    const phonePart2 = (1000 + Math.floor(pseudoRandom(seed * 13.9) * 9000)).toString();
    const telefone = `(84) 9${phonePart1}-${phonePart2}`;

    // Coordinates: random scatter with varying radii and angles around center coordinates (no perfect circle)
    const angle = pseudoRandom(seed * 14.2) * 2 * Math.PI;
    const radius = 0.003 + (pseudoRandom(seed * 15.6) * 0.022); // radius spread between 0.003 and 0.025 degrees
    
    let latOffset = Math.sin(angle) * radius;
    let lngOffset = Math.cos(angle) * radius;

    // Bias offsets to keep markers on land rather than in the ocean (which is to the east/north-east)
    const coastalDestinations = [
      "Ponta Negra e Morro do Careca",
      "Praia da Pipa",
      "Dunas de Genipabu",
      "Parrachos de Maracajaú",
      "São Miguel do Gostoso",
      "Forte dos Reis Magos",
      "Galinhos",
      "Maior Cajueiro do Mundo",
      "Praia do Madeiro",
      "Barreira do Inferno",
      "Barra de Cunhaú",
      "Salinas e Indústria Salineira de Macau",
      "Salinas de Galinhos e Fábrica de Sal"
    ];

    if (coastalDestinations.includes(destino)) {
      // Force longitude offset to be negative (to the west / inland)
      lngOffset = -Math.abs(lngOffset);
      
      // For São Miguel do Gostoso, the coast is to the north, so force latitude offset to be negative (south)
      if (destino === "São Miguel do Gostoso") {
        latOffset = -Math.abs(latOffset);
      }
      
      // For Galinhos / Salinas, it's a narrow spit of land, use a much tighter radius
      if (destino === "Galinhos" || destino === "Salinas de Galinhos e Fábrica de Sal") {
        latOffset = latOffset * 0.25;
        lngOffset = lngOffset * 0.25;
      }
    }

    const latitude = parseFloat((destinoInfo.latitude + latOffset).toFixed(6));
    const longitude = parseFloat((destinoInfo.longitude + lngOffset).toFixed(6));

    // Enriched dynamic description
    const descTemplates = [
      `Excelente opção de ${tipo.toLowerCase()} em ${destino}. Oferece uma estrutura aconchegante com serviços de excelência homologados pelo Cadastur para você aproveitar ao máximo os atrativos da região de ${destinoInfo.municipio}.`,
      `O estabelecimento ${nome} é sinônimo de hospitalidade e segurança em ${destino}. Totalmente regularizado junto ao Ministério do Turismo, conta com equipe local qualificada para proporcionar momentos inesquecíveis.`,
      `Localização estratégica na área turística de ${destino}. Este ${tipo.toLowerCase()} destaca-se no mercado potiguar pelas ótimas recomendações, focando sempre em sustentabilidade e na valorização das belezas locais.`
    ];
    const descIdx = Math.floor(pseudoRandom(seed * 16.1) * descTemplates.length);
    const descricao = descTemplates[descIdx];

    // Image
    let imageList = hotelImages;
    if (tipo === "Restaurante") imageList = restauranteImages;
    else if (tipo === "Pousada") imageList = pousadaImages;
    else if (tipo === "Guia") imageList = guiaImages;
    else if (tipo === "Agência") imageList = agenciaImages;
    const imgIdx = Math.floor(pseudoRandom(seed * 17.5) * imageList.length);
    const imagem = imageList[imgIdx];

    // Pick 5 unique experiences deterministically using pseudoRandom
    const pool = experiencesPool[tipo];
    const experiences: { titulo: string; descricao: string }[] = [];
    const usedIndices = new Set<number>();
    
    let attempt = 0;
    while (experiences.length < 5 && usedIndices.size < pool.length && attempt < 100) {
      const offsetSeed = seed * (18.1 + attempt * 3.4);
      const expIdx = Math.floor(pseudoRandom(offsetSeed) * pool.length);
      if (!usedIndices.has(expIdx)) {
        usedIndices.add(expIdx);
        experiences.push(pool[expIdx]);
      }
      attempt++;
    }

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
  { destino: "Lajedo de Soledade", municipio: "Apodi", populacao: 36000, area_km2: 1602.4, idh: 0.642, leitos_hospitalares: 24, escolas_publicas: 32 },
  { destino: "Salinas e Indústria Salineira de Macau", municipio: "Macau", populacao: 32227, area_km2: 547.4, idh: 0.676, leitos_hospitalares: 45, escolas_publicas: 21 },
  { destino: "Salinas de Galinhos e Fábrica de Sal", municipio: "Galinhos", populacao: 2004, area_km2: 342.4, idh: 0.589, leitos_hospitalares: 2, escolas_publicas: 3 },
  { destino: "Canyon dos Apertados", municipio: "Currais Novos", populacao: 41325, area_km2: 617.1, idh: 0.710, leitos_hospitalares: 90, escolas_publicas: 28 },
  { destino: "Estátua de Santa Rita de Cássia", municipio: "Santa Cruz", populacao: 37313, area_km2: 624.3, idh: 0.632, leitos_hospitalares: 62, escolas_publicas: 22 },
  { destino: "Castelo de Bivar", municipio: "Carnaúba dos Dantas", populacao: 8232, area_km2: 245.6, idh: 0.652, leitos_hospitalares: 8, escolas_publicas: 5 }
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
  { destino: "Lajedo de Soledade", voos_mensais: 0, onibus_mensais: 50, veiculos_terrestres_mensais: 2100, modal_principal: "Rodoviário", variacao_percentual: 13 },
  { destino: "Salinas e Indústria Salineira de Macau", voos_mensais: 0, onibus_mensais: 240, veiculos_terrestres_mensais: 9200, modal_principal: "Rodoviário / Vans", variacao_percentual: 8 },
  { destino: "Salinas de Galinhos e Fábrica de Sal", voos_mensais: 0, onibus_mensais: 30, veiculos_terrestres_mensais: 1500, modal_principal: "Barco + 4x4", variacao_percentual: 11 },
  { destino: "Canyon dos Apertados", voos_mensais: 0, onibus_mensais: 80, veiculos_terrestres_mensais: 4200, modal_principal: "Rodoviário / Receptivo", variacao_percentual: 15 },
  { destino: "Estátua de Santa Rita de Cássia", voos_mensais: 0, onibus_mensais: 680, veiculos_terrestres_mensais: 19500, modal_principal: "Ônibus de Excursão / Vans", variacao_percentual: 14 },
  { destino: "Castelo de Bivar", voos_mensais: 0, onibus_mensais: 110, veiculos_terrestres_mensais: 2800, modal_principal: "Rodoviário / Carro Particular", variacao_percentual: 6 }
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
  { destino: "Lajedo de Soledade", investimento_infraestrutura_mil: 200, investimento_saneamento_mil: 50, investimento_turismo_mil: 150, total_mil: 400, ano: 2026 },
  { destino: "Salinas e Indústria Salineira de Macau", investimento_infraestrutura_mil: 450, investimento_saneamento_mil: 200, investimento_turismo_mil: 150, total_mil: 800, ano: 2026 },
  { destino: "Salinas de Galinhos e Fábrica de Sal", investimento_infraestrutura_mil: 150, investimento_saneamento_mil: 50, investimento_turismo_mil: 100, total_mil: 300, ano: 2026 },
  { destino: "Canyon dos Apertados", investimento_infraestrutura_mil: 300, investimento_saneamento_mil: 100, investimento_turismo_mil: 200, total_mil: 600, ano: 2026 },
  { destino: "Estátua de Santa Rita de Cássia", investimento_infraestrutura_mil: 800, investimento_saneamento_mil: 400, investimento_turismo_mil: 600, total_mil: 1800, ano: 2026 },
  { destino: "Castelo de Bivar", investimento_infraestrutura_mil: 200, investimento_saneamento_mil: 80, investimento_turismo_mil: 120, total_mil: 400, ano: 2026 }
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
  { destino: "Lajedo de Soledade", fluxo_visitantes_mes: 6500, receita_estimada_milhoes: 1.8, saturacao_turistica: 15, hashtag_instagram: "lajedodesoledade" },
  { destino: "Salinas e Indústria Salineira de Macau", fluxo_visitantes_mes: 12000, receita_estimada_milhoes: 3.2, saturacao_turistica: 45, hashtag_instagram: "salinasmacau" },
  { destino: "Salinas de Galinhos e Fábrica de Sal", fluxo_visitantes_mes: 4500, receita_estimada_milhoes: 1.1, saturacao_turistica: 35, hashtag_instagram: "salinasgalinhos" },
  { destino: "Canyon dos Apertados", fluxo_visitantes_mes: 7800, receita_estimada_milhoes: 1.9, saturacao_turistica: 28, hashtag_instagram: "canyondosapertados" },
  { destino: "Estátua de Santa Rita de Cássia", fluxo_visitantes_mes: 35000, receita_estimada_milhoes: 8.5, saturacao_turistica: 62, hashtag_instagram: "santaritadecassia" },
  { destino: "Castelo de Bivar", fluxo_visitantes_mes: 5400, receita_estimada_milhoes: 1.4, saturacao_turistica: 20, hashtag_instagram: "castelodebivar" }
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
