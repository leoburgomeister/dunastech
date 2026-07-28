-- ============================================================
-- DunasTech / POTI — Seed de dados de referência (gerado a partir de src/data/mockData.ts)
-- Destinos e coordenadas são os 20 destinos reais já usados no app.
-- IBGE (população/IDH/área) são os números já usados no dashboard hoje.
-- Fluxo/Investimento/Transporte são as MESMAS estimativas já exibidas no app em produção
-- (não são novos números — só migram de mockData.ts para o banco).
-- ============================================================

-- ---------- Municípios ----------
insert into municipios (nome, uf) values
  ('Natal', 'RN'),
  ('Tibau do Sul', 'RN'),
  ('Extremoz', 'RN'),
  ('Maxaranguape', 'RN'),
  ('São Miguel do Gostoso', 'RN'),
  ('Galinhos', 'RN'),
  ('Parnamirim', 'RN'),
  ('Canguaretama', 'RN'),
  ('Mossoró', 'RN'),
  ('Apodi', 'RN'),
  ('Macau', 'RN'),
  ('Currais Novos', 'RN'),
  ('Santa Cruz', 'RN'),
  ('Carnaúba dos Dantas', 'RN')
on conflict (nome, uf) do nothing;

-- ---------- Destinos ----------
insert into destinos (nome, descricao, municipio_id, latitude, longitude, hashtags, imagem, status) values
  ('Ponta Negra e Morro do Careca', 'O principal cartão-postal de Natal, famoso pela icônica duna de 120 metros cercada por Mata Atlântica e uma enseada de águas calmas. O local possui excelente infraestrutura de lazer, gastronomia e hotelaria à beira-mar, atraindo milhares de banhistas e entusiastas de esportes aquáticos.', (select id from municipios where nome = 'Natal' and uf = 'RN'), -5.8811, -35.1711, ARRAY['pontanegranatal']::text[], '/images/destinations/hero_ponta_negra.png', 'ATIVO'),
  ('Praia da Pipa', 'Destino de renome internacional situado no município de Tibau do Sul. Famoso por suas imponentes falésias coloridas de arenito, mar calmo com águas cristalinas propícias ao surf e a frequente presença de golfinhos na Baía dos Golfinhos. À noite, a vila se transforma com um vibrante polo gastronômico e boêmio.', (select id from municipios where nome = 'Tibau do Sul' and uf = 'RN'), -6.2275, -35.0475, ARRAY['praiadapipa']::text[], '/images/destinations/pipa.png', 'ATIVO'),
  ('Dunas de Genipabu', 'Complexo monumental de dunas móveis e lagoas cristalinas em Extremoz. É o berço dos clássicos passeios de buggy regados a ''emoção'' no Rio Grande do Norte, onde turistas desfrutam de vistas panorâmicas espetaculares da costa potiguar.', (select id from municipios where nome = 'Extremoz' and uf = 'RN'), -5.7089, -35.1967, ARRAY['genipabu']::text[], '/images/destinations/genipabu.png', 'ATIVO'),
  ('Parrachos de Maracajaú', 'Famosas piscinas naturais a sete quilômetros da costa de Maxaranguape. Os corais formam um aquário natural de águas mornas e transparentes, ideal para a prática de snorkel e mergulho livre entre peixes coloridos.', (select id from municipios where nome = 'Maxaranguape' and uf = 'RN'), -5.4124, -35.3764, ARRAY['maracajau']::text[], '/images/destinations/maracajau.png', 'ATIVO'),
  ('São Miguel do Gostoso', 'Uma das vilas de pescadores mais charmosas e preservadas do litoral norte potiguar. Conhecida mundialmente por seus ventos constantes que atraem velejadores de kitesurf e windsurf, além de pousadas aconchegantes e praias desertas propícias para descanso.', (select id from municipios where nome = 'São Miguel do Gostoso' and uf = 'RN'), -5.1247, -35.6392, ARRAY['saomigueldogostoso']::text[], '/images/destinations/sao_miguel.png', 'ATIVO'),
  ('Forte dos Reis Magos', 'Fortaleza histórica de pedra datada de 1598, em formato de estrela, localizada na foz do Rio Potengi. É o marco inicial da fundação de Natal, abrigando canhões e relíquias do período colonial sob preservação histórica.', (select id from municipios where nome = 'Natal' and uf = 'RN'), -5.7564, -35.1947, ARRAY['fortedosreismagos']::text[], '/images/destinations/forte_dos_reis_magos.png', 'ATIVO'),
  ('Galinhos', 'Uma deslumbrante península de pescadores isolada do turismo de massa, cercada de dunas gigantes, salinas naturais e manguezais intocados. O acesso é feito apenas de barco ou veículo tracionado 4x4.', (select id from municipios where nome = 'Galinhos' and uf = 'RN'), -5.0917, -36.2742, ARRAY['galinhos']::text[], '/images/destinations/galinhos.png', 'ATIVO'),
  ('Maior Cajueiro do Mundo', 'Patrimônio natural situado em Pirangi, no município de Parnamirim. Registrado no Guinness Book por cobrir uma área colossal de mais de 8.500 metros quadrados, resultado de uma anomalia genética que faz seus galhos crescerem para os lados e criarem novas raízes.', (select id from municipios where nome = 'Parnamirim' and uf = 'RN'), -5.9739, -35.1289, ARRAY['maiorcajueiro']::text[], '/images/destinations/maior_caju.png', 'ATIVO'),
  ('Praia do Madeiro', 'Um verdadeiro refúgio ecológico em Tibau do Sul, cercado por imensas falésias avermelhadas e Mata Atlântica. É muito procurado para caminhadas, aulas de surf para iniciantes e avistamento frequente de golfinhos bem próximos à orla.', (select id from municipios where nome = 'Tibau do Sul' and uf = 'RN'), -6.2137, -35.0774, ARRAY['praiadomadeiro']::text[], '/images/destinations/pipa.png', 'ATIVO'),
  ('Lagoa de Pitangui', 'Oásis de águas calmas, mornas e doce no coração de dunas em Extremoz. Equipada com estruturas de lazer como redários dentro da água e tirolesas, é um destino familiar imperdível para relaxamento completo.', (select id from municipios where nome = 'Extremoz' and uf = 'RN'), -5.725, -35.21, ARRAY['lagoadepitangui']::text[], '/images/destinations/genipabu.png', 'ATIVO'),
  ('Barreira do Inferno', 'Primeira base de lançamento de foguetes da América do Sul, inaugurada em 1965 em Parnamirim. O local integra pesquisas aeroespaciais com um museu de aviação e exibe belíssimas falésias vermelhas à beira-mar.', (select id from municipios where nome = 'Parnamirim' and uf = 'RN'), -5.8915, -35.1797, ARRAY['barreiradoinferno']::text[], '/images/destinations/hero_ponta_negra.png', 'ATIVO'),
  ('Barra de Cunhaú', 'Onde o Rio Curimataú encontra as águas salgadas do oceano em Canguaretama. Um destino exuberante cercado por manguezais, ideal para saborear pratos típicos à base de caranguejos e curtir praias de águas calmas.', (select id from municipios where nome = 'Canguaretama' and uf = 'RN'), -6.3103, -35.0553, ARRAY['barradecunhau']::text[], '/images/destinations/galinhos.png', 'ATIVO'),
  ('Parque das Dunas', 'Maior reserva de Mata Atlântica urbana do Rio Grande do Norte, localizada no centro de Natal. Oferece trilhas ecológicas monitoradas sob a copa de árvores nativas, além de áreas de lazer infantil e piqueniques.', (select id from municipios where nome = 'Natal' and uf = 'RN'), -5.84, -35.197, ARRAY['parquedasdunas']::text[], '/images/destinations/genipabu.png', 'ATIVO'),
  ('Cidade Histórica de Mossoró', 'O coração cultural e histórico da segunda maior cidade do estado. Famosa por seu protagonismo na abolição precoce da escravidão em 1883 e pela heróica resistência popular que afugentou o bando de cangaço do temido Lampião em 1927.', (select id from municipios where nome = 'Mossoró' and uf = 'RN'), -5.1878, -37.3444, ARRAY['mossoro']::text[], '/images/destinations/mossoro_historico.png', 'ATIVO'),
  ('Lajedo de Soledade', 'Um impressionante sítio arqueológico em Apodi, composto por uma vasta planície de rocha calcária esculpida por rios subterrâneos pré-históricos. Abriga desfiladeiros repletos de fósseis de animais da megafauna e intrigantes pinturas rupestres.', (select id from municipios where nome = 'Apodi' and uf = 'RN'), -5.5833, -37.8, ARRAY['lajedodesoledade']::text[], '/images/destinations/lajedo_soledade.png', 'ATIVO'),
  ('Salinas e Indústria Salineira de Macau', 'Principal polo salineiro do país. Oferece uma paisagem industrial e natural fascinante com imensas pirâmides de sal marinho branco que se assemelham a dunas de neve sob o sol forte do litoral norte potiguar.', (select id from municipios where nome = 'Macau' and uf = 'RN'), -5.1114, -36.6344, ARRAY['salinasmacau']::text[], '/images/destinations/galinhos.png', 'ATIVO'),
  ('Salinas de Galinhos e Fábrica de Sal', 'Uma incrível jornada pela extração artesanal do sal marinho. O atrativo conecta o ecossistema de manguezais potiguares à história da produção de sal tradicional, oferecendo passeios ecológicos de barco.', (select id from municipios where nome = 'Galinhos' and uf = 'RN'), -5.099, -36.265, ARRAY['salinasgalinhos']::text[], '/images/destinations/galinhos.png', 'ATIVO'),
  ('Canyon dos Apertados', 'Uma das joias geológicas mais espetaculares do Geoparque Seridó. O cânion apresenta imponentes desfiladeiros de rocha quartzítica esculpidos pela força das águas no semiárido potiguar, cercados por vegetação intocada de caatinga.', (select id from municipios where nome = 'Currais Novos' and uf = 'RN'), -6.26, -36.516, ARRAY['canyondosapertados']::text[], '/images/destinations/lajedo_soledade.png', 'ATIVO'),
  ('Estátua de Santa Rita de Cássia', 'O maior monumento religioso católico do mundo, com 56 metros de altura, superando o Cristo Redentor. Situada no alto do Monte Carmelo, é o centro do turismo religioso potiguar e atrai milhares de romeiros todos os anos.', (select id from municipios where nome = 'Santa Cruz' and uf = 'RN'), -6.23, -36.02, ARRAY['santaritadecassia']::text[], '/images/destinations/forte_dos_reis_magos.png', 'ATIVO'),
  ('Castelo de Bivar', 'Inspirado nos castelos medievais europeus da Renascença, esta imponente construção de pedra destaca-se na paisagem árida do Seridó. É um importante atrativo histórico que preserva a cultura e arquitetura local.', (select id from municipios where nome = 'Carnaúba dos Dantas' and uf = 'RN'), -6.55, -36.58, ARRAY['castelodebivar']::text[], '/images/destinations/forte_dos_reis_magos.png', 'ATIVO')
on conflict (nome) do nothing;

-- ---------- IBGE (dedupe por município) ----------
insert into ibge (municipio_id, populacao, area_km2, idh, leitos_hospitalares, escolas_publicas) values
  ((select id from municipios where nome = 'Natal' and uf = 'RN'), 784249, 167.26, 0.763, 3200, 450),
  ((select id from municipios where nome = 'Tibau do Sul' and uf = 'RN'), 18080, 102.68, 0.639, 12, 8),
  ((select id from municipios where nome = 'Extremoz' and uf = 'RN'), 68584, 224, 0.665, 15, 24),
  ((select id from municipios where nome = 'Maxaranguape' and uf = 'RN'), 13000, 131.3, 0.612, 4, 6),
  ((select id from municipios where nome = 'São Miguel do Gostoso' and uf = 'RN'), 10636, 342.4, 0.611, 6, 12),
  ((select id from municipios where nome = 'Galinhos' and uf = 'RN'), 2159, 340.5, 0.589, 2, 3),
  ((select id from municipios where nome = 'Parnamirim' and uf = 'RN'), 271713, 123.4, 0.742, 450, 98),
  ((select id from municipios where nome = 'Canguaretama' and uf = 'RN'), 31000, 245.5, 0.621, 14, 18),
  ((select id from municipios where nome = 'Mossoró' and uf = 'RN'), 278000, 2099.3, 0.729, 850, 160),
  ((select id from municipios where nome = 'Apodi' and uf = 'RN'), 36000, 1602.4, 0.642, 24, 32),
  ((select id from municipios where nome = 'Macau' and uf = 'RN'), 32227, 547.4, 0.676, 45, 21),
  ((select id from municipios where nome = 'Currais Novos' and uf = 'RN'), 41325, 617.1, 0.71, 90, 28),
  ((select id from municipios where nome = 'Santa Cruz' and uf = 'RN'), 37313, 624.3, 0.632, 62, 22),
  ((select id from municipios where nome = 'Carnaúba dos Dantas' and uf = 'RN'), 8232, 245.6, 0.652, 8, 5);

-- ---------- Fluxo (mês/ano fixo: junho/2026, mesmo período já mostrado no dashboard) ----------
insert into fluxo (destino_id, mes, ano, fluxo_visitantes_mes, receita_estimada_milhoes, saturacao_turistica, hashtags) values
  ((select id from destinos where nome = 'Ponta Negra e Morro do Careca'), 6, 2026, 145000, 34.5, 88, ARRAY['pontanegranatal']::text[]),
  ((select id from destinos where nome = 'Praia da Pipa'), 6, 2026, 82000, 24, 76, ARRAY['praiadapipa']::text[]),
  ((select id from destinos where nome = 'Dunas de Genipabu'), 6, 2026, 54000, 12.8, 62, ARRAY['genipabu']::text[]),
  ((select id from destinos where nome = 'Parrachos de Maracajaú'), 6, 2026, 28000, 8.5, 54, ARRAY['maracajau']::text[]),
  ((select id from destinos where nome = 'São Miguel do Gostoso'), 6, 2026, 32000, 11.2, 48, ARRAY['saomigueldogostoso']::text[]),
  ((select id from destinos where nome = 'Forte dos Reis Magos'), 6, 2026, 24000, 2.1, 35, ARRAY['fortedosreismagos']::text[]),
  ((select id from destinos where nome = 'Galinhos'), 6, 2026, 9800, 3.4, 28, ARRAY['galinhos']::text[]),
  ((select id from destinos where nome = 'Maior Cajueiro do Mundo'), 6, 2026, 68000, 4.8, 72, ARRAY['maiorcajueiro']::text[]),
  ((select id from destinos where nome = 'Praia do Madeiro'), 6, 2026, 35000, 7.2, 68, ARRAY['praiadomadeiro']::text[]),
  ((select id from destinos where nome = 'Lagoa de Pitangui'), 6, 2026, 42000, 5.4, 79, ARRAY['lagoadepitangui']::text[]),
  ((select id from destinos where nome = 'Barreira do Inferno'), 6, 2026, 18000, 1.2, 20, ARRAY['barreiradoinferno']::text[]),
  ((select id from destinos where nome = 'Barra de Cunhaú'), 6, 2026, 14000, 3.8, 30, ARRAY['barradecunhau']::text[]),
  ((select id from destinos where nome = 'Parque das Dunas'), 6, 2026, 45000, 1.5, 40, ARRAY['parquedasdunas']::text[]),
  ((select id from destinos where nome = 'Cidade Histórica de Mossoró'), 6, 2026, 58000, 18, 50, ARRAY['mossoro']::text[]),
  ((select id from destinos where nome = 'Lajedo de Soledade'), 6, 2026, 6500, 1.8, 15, ARRAY['lajedodesoledade']::text[]),
  ((select id from destinos where nome = 'Salinas e Indústria Salineira de Macau'), 6, 2026, 12000, 3.2, 45, ARRAY['salinasmacau']::text[]),
  ((select id from destinos where nome = 'Salinas de Galinhos e Fábrica de Sal'), 6, 2026, 4500, 1.1, 35, ARRAY['salinasgalinhos']::text[]),
  ((select id from destinos where nome = 'Canyon dos Apertados'), 6, 2026, 7800, 1.9, 28, ARRAY['canyondosapertados']::text[]),
  ((select id from destinos where nome = 'Estátua de Santa Rita de Cássia'), 6, 2026, 35000, 8.5, 62, ARRAY['santaritadecassia']::text[]),
  ((select id from destinos where nome = 'Castelo de Bivar'), 6, 2026, 5400, 1.4, 20, ARRAY['castelodebivar']::text[]);

-- ---------- Investimento ----------
insert into investimento (destino_id, ano, investimento_infraestrutura_mil, saneamento_mil, turismo_mil, total_mil) values
  ((select id from destinos where nome = 'Ponta Negra e Morro do Careca'), 2026, 2400, 1800, 1200, 5400),
  ((select id from destinos where nome = 'Praia da Pipa'), 2026, 1200, 950, 800, 2950),
  ((select id from destinos where nome = 'Dunas de Genipabu'), 2026, 600, 300, 400, 1300),
  ((select id from destinos where nome = 'Parrachos de Maracajaú'), 2026, 350, 200, 150, 700),
  ((select id from destinos where nome = 'São Miguel do Gostoso'), 2026, 800, 500, 600, 1900),
  ((select id from destinos where nome = 'Forte dos Reis Magos'), 2026, 400, 100, 300, 800),
  ((select id from destinos where nome = 'Galinhos'), 2026, 500, 200, 150, 850),
  ((select id from destinos where nome = 'Maior Cajueiro do Mundo'), 2026, 300, 100, 200, 600),
  ((select id from destinos where nome = 'Praia do Madeiro'), 2026, 200, 100, 150, 450),
  ((select id from destinos where nome = 'Lagoa de Pitangui'), 2026, 150, 80, 100, 330),
  ((select id from destinos where nome = 'Barreira do Inferno'), 2026, 100, 50, 100, 250),
  ((select id from destinos where nome = 'Barra de Cunhaú'), 2026, 300, 150, 150, 600),
  ((select id from destinos where nome = 'Parque das Dunas'), 2026, 250, 100, 150, 500),
  ((select id from destinos where nome = 'Cidade Histórica de Mossoró'), 2026, 1800, 1200, 900, 3900),
  ((select id from destinos where nome = 'Lajedo de Soledade'), 2026, 200, 50, 150, 400),
  ((select id from destinos where nome = 'Salinas e Indústria Salineira de Macau'), 2026, 450, 200, 150, 800),
  ((select id from destinos where nome = 'Salinas de Galinhos e Fábrica de Sal'), 2026, 150, 50, 100, 300),
  ((select id from destinos where nome = 'Canyon dos Apertados'), 2026, 300, 100, 200, 600),
  ((select id from destinos where nome = 'Estátua de Santa Rita de Cássia'), 2026, 800, 400, 600, 1800),
  ((select id from destinos where nome = 'Castelo de Bivar'), 2026, 200, 80, 120, 400);

-- ---------- Transporte (modal_principal normalizado para o enum: AEREO/RODOVIARIO/MARITIMO) ----------
insert into transporte (destino_id, mes, ano, voos_mensais, onibus_mensais, veiculos_terrestres_mensais, modal_principal, variacao_percentual) values
  ((select id from destinos where nome = 'Ponta Negra e Morro do Careca'), 6, 2026, 680, 2400, 85000, 'AEREO', 18),
  ((select id from destinos where nome = 'Praia da Pipa'), 6, 2026, 0, 850, 32000, 'RODOVIARIO', 14),
  ((select id from destinos where nome = 'Dunas de Genipabu'), 6, 2026, 0, 600, 22000, 'RODOVIARIO', 8),
  ((select id from destinos where nome = 'Parrachos de Maracajaú'), 6, 2026, 0, 300, 11000, 'RODOVIARIO', 12),
  ((select id from destinos where nome = 'São Miguel do Gostoso'), 6, 2026, 0, 140, 8500, 'RODOVIARIO', 24),
  ((select id from destinos where nome = 'Forte dos Reis Magos'), 6, 2026, 0, 500, 45000, 'RODOVIARIO', 3),
  ((select id from destinos where nome = 'Galinhos'), 6, 2026, 0, 40, 1200, 'MARITIMO', 6),
  ((select id from destinos where nome = 'Maior Cajueiro do Mundo'), 6, 2026, 0, 950, 52000, 'RODOVIARIO', 9),
  ((select id from destinos where nome = 'Praia do Madeiro'), 6, 2026, 0, 400, 14000, 'RODOVIARIO', 11),
  ((select id from destinos where nome = 'Lagoa de Pitangui'), 6, 2026, 0, 420, 18000, 'RODOVIARIO', 7),
  ((select id from destinos where nome = 'Barreira do Inferno'), 6, 2026, 0, 320, 28000, 'RODOVIARIO', 4),
  ((select id from destinos where nome = 'Barra de Cunhaú'), 6, 2026, 0, 80, 4500, 'RODOVIARIO', 5),
  ((select id from destinos where nome = 'Parque das Dunas'), 6, 2026, 0, 1200, 60000, 'RODOVIARIO', 2),
  ((select id from destinos where nome = 'Cidade Histórica de Mossoró'), 6, 2026, 32, 1400, 72000, 'AEREO', 10),
  ((select id from destinos where nome = 'Lajedo de Soledade'), 6, 2026, 0, 50, 2100, 'RODOVIARIO', 13),
  ((select id from destinos where nome = 'Salinas e Indústria Salineira de Macau'), 6, 2026, 0, 240, 9200, 'RODOVIARIO', 8),
  ((select id from destinos where nome = 'Salinas de Galinhos e Fábrica de Sal'), 6, 2026, 0, 30, 1500, 'MARITIMO', 11),
  ((select id from destinos where nome = 'Canyon dos Apertados'), 6, 2026, 0, 80, 4200, 'RODOVIARIO', 15),
  ((select id from destinos where nome = 'Estátua de Santa Rita de Cássia'), 6, 2026, 0, 680, 19500, 'RODOVIARIO', 14),
  ((select id from destinos where nome = 'Castelo de Bivar'), 6, 2026, 0, 110, 2800, 'RODOVIARIO', 6);
