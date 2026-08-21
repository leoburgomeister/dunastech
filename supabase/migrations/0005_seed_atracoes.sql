-- ============================================================
-- Seed de `atracoes` — a tabela existia desde a 0001, mas vazia
-- ============================================================
--
-- O seed original (0003) populou destinos, fluxo, investimento e transporte e
-- nunca inseriu uma atração. Com a tabela vazia, o sync do app monta todo
-- destino com `atracoes: []` e a home perde o passo de escolher experiências —
-- o mesmo sintoma do defeito antigo do mapper, agora causado pelo dado.
--
-- As 23 linhas abaixo vêm do catálogo curado em `src/data/mockData.ts`
-- (geradas por script a partir dele, não digitadas). `on conflict` não existe
-- aqui porque `atracoes` não tem unique; o guard de idempotência é o
-- `where not exists` linha a linha, logo abaixo.

insert into atracoes (destino_id, nome, descricao, tipo)
select v.destino_id, v.nome, v.descricao, v.tipo
from (values
  ((select id from destinos where nome = 'Ponta Negra e Morro do Careca'), 'Passeio de Jangada no Morro', 'Navegação tradicional contornando a enseada de Ponta Negra com vista do Morro do Careca.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Ponta Negra e Morro do Careca'), 'Stand Up Paddle na Enseada', 'Prática esportiva em águas calmas perto do morro.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Praia da Pipa'), 'Observação de Golfinhos', 'Passeio de barco para avistar golfinhos em seu habitat natural.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Praia da Pipa'), 'Trilha no Santuário Ecológico', 'Caminhadas sob a Mata Atlântica preservada com mirantes para as praias.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Dunas de Genipabu'), 'Passeio de Buggy com Emoção', 'Aventura pelas dunas móveis com paradas para fotos e lagoa.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Dunas de Genipabu'), 'Esquibunda nas Dunas', 'Descida em prancha de madeira direto na lagoa de Genipabu.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Parrachos de Maracajaú'), 'Mergulho nos Parrachos', 'Exploração dos corais em águas mornas e translúcidas guiada.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'São Miguel do Gostoso'), 'Kitesurf e Windsurf', 'Aprenda a velejar com campeões locais nos ventos mais constantes do país.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Forte dos Reis Magos'), 'Visita Histórica', 'Descubra marcos coloniais e canhões históricos da fundação de Natal.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Galinhos'), 'Passeio de Barco pelo Rio', 'Navegação por manguezais e salinas desfrutando do silêncio da península.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Maior Cajueiro do Mundo'), 'Trilha Suspensa do Cajueiro', 'Caminhada sob a copa gigante do maior cajueiro do mundo.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Praia do Madeiro'), 'Escola de Surf do Madeiro', 'Aulas práticas com instrutores nas ondas perfeitas do Madeiro.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Lagoa de Pitangui'), 'Redário e Tirolesa na Lagoa', 'Redes na água e diversão em tirolesas na lagoa cristalina.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Barreira do Inferno'), 'Museu Aeroespacial Potiguar', 'Exposição de foguetes reais, radares e aviões de combate.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Barra de Cunhaú'), 'Passeio do Manguezal', 'Pesquisa ecológica pelos rios, mangues e captura ecológica de caranguejos.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Parque das Dunas'), 'Trilha Ecológica da Peroba', 'Caminhada na mata densa das dunas com guias ambientais.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Cidade Histórica de Mossoró'), 'Memorial da Resistência ao Cangaço', 'Roteiro histórico pelos murais e trincheiras da batalha contra Lampião.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Lajedo de Soledade'), 'Passeio Arqueológico Soledade', 'Pesquisa arqueológica guiada por desfiladeiros de fósseis.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Salinas e Indústria Salineira de Macau'), 'Visita às Salinas de Macau', 'Passeio guiado pelas montanhas de sal marinho e canais de maré.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Salinas de Galinhos e Fábrica de Sal'), 'Trilha Ecológica do Sal', 'Observação do processo de colheita manual do sal e vida selvagem local.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Canyon dos Apertados'), 'Trekking no Cânion', 'Caminhada guiada por dentro do desfiladeiro de rocha quartzítica.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Estátua de Santa Rita de Cássia'), 'Mirante do Monte Carmelo', 'Subida até a base da estátua com vista panorâmica do vale do Trairi.', 'ATIVIDADE'),
  ((select id from destinos where nome = 'Castelo de Bivar'), 'Tour Histórico do Castelo', 'Visitação interna guiada pela arquitetura inspirada nos castelos europeus.', 'ATIVIDADE')) as v(destino_id, nome, descricao, tipo)
where v.destino_id is not null
  and not exists (
    select 1 from atracoes a
    where a.destino_id = v.destino_id and a.nome = v.nome
  );
