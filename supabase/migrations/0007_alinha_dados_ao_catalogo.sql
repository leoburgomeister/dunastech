-- ============================================================
-- Alinha o banco ao catálogo curado (`src/data/mockData.ts`)
-- ============================================================
--
-- O seed da 0003 divergia do catálogo em dois eixos, e os dois só apareciam em
-- produção — em desenvolvimento sem Supabase o app usa o catálogo estático e tudo
-- parece certo.
--
--   COORDENADAS (4 de 20 destinos). A pior era a Lagoa de Pitangui, a 9 km do lugar
--   certo. O cache de rotas do OSRM é gerado offline a partir do catálogo e a chave
--   arredonda a 4 casas decimais (~11 m), então qualquer desvio maior erra a chave:
--   o traço da rota caía no OSRM público com timeout de 4 s e, na falha, em linha
--   reta — exatamente a dependência de rede que o cache existe para remover.
--
--   INVESTIMENTO (18 de 20). Os valores do banco estavam cerca de 10x menores que os
--   do catálogo (Pitangui: 330 contra 3.625). Como o ISA usa `total_mil / 250` como
--   bônus, o indicador desabava: a Lagoa marcava 71 em produção e 84 no catálogo, e
--   vários destinos apareciam com selo de "Atenção" (<80) — o oposto da calibração
--   que a spec do ISA pede para a demonstração (todos na faixa 82–95).
--
-- `fluxo` e `transporte` foram conferidos e já batiam: 0 divergências em 20.
--
-- Os valores abaixo foram gerados por script a partir do catálogo, não digitados, e
-- cada update é condicional — reaplicar não toca em linha que já está correta.

-- Coordenadas: alinha o banco ao catálogo curado (fonte do cache OSRM).
update destinos as d set latitude = v.lat, longitude = v.lon
from (values
  ('Ponta Negra e Morro do Careca', -5.8884::double precision, -35.1596::double precision),
  ('Praia da Pipa', -6.2275::double precision, -35.0475::double precision),
  ('Dunas de Genipabu', -5.7089::double precision, -35.1967::double precision),
  ('Parrachos de Maracajaú', -5.4116::double precision, -35.3098::double precision),
  ('São Miguel do Gostoso', -5.1247::double precision, -35.6392::double precision),
  ('Forte dos Reis Magos', -5.7564::double precision, -35.1947::double precision),
  ('Galinhos', -5.0917::double precision, -36.2742::double precision),
  ('Maior Cajueiro do Mundo', -5.9786::double precision, -35.1234::double precision),
  ('Praia do Madeiro', -6.2137::double precision, -35.0774::double precision),
  ('Lagoa de Pitangui', -5.6466::double precision, -35.2297::double precision),
  ('Barreira do Inferno', -5.8915::double precision, -35.1797::double precision),
  ('Barra de Cunhaú', -6.3103::double precision, -35.0553::double precision),
  ('Parque das Dunas', -5.84::double precision, -35.197::double precision),
  ('Cidade Histórica de Mossoró', -5.1878::double precision, -37.3444::double precision),
  ('Lajedo de Soledade', -5.5833::double precision, -37.8::double precision),
  ('Salinas e Indústria Salineira de Macau', -5.1114::double precision, -36.6344::double precision),
  ('Salinas de Galinhos e Fábrica de Sal', -5.099::double precision, -36.265::double precision),
  ('Canyon dos Apertados', -6.26::double precision, -36.516::double precision),
  ('Estátua de Santa Rita de Cássia', -6.23::double precision, -36.02::double precision),
  ('Castelo de Bivar', -6.55::double precision, -36.58::double precision)
) as v(nome, lat, lon)
where d.nome = v.nome
  and (d.latitude is distinct from v.lat or d.longitude is distinct from v.lon);

-- Investimento: mesma escala do catálogo (o banco estava ~10x menor).
update investimento as i set
  investimento_infraestrutura_mil = v.infra,
  saneamento_mil = v.saneamento,
  turismo_mil = v.turismo,
  total_mil = v.total
from (values
  ('Ponta Negra e Morro do Careca', 2400::numeric, 1800::numeric, 1200::numeric, 5400::numeric),
  ('Praia da Pipa', 1900::numeric, 1300::numeric, 1000::numeric, 4200::numeric),
  ('Dunas de Genipabu', 1800::numeric, 1200::numeric, 1000::numeric, 4000::numeric),
  ('Parrachos de Maracajaú', 1600::numeric, 1100::numeric, 900::numeric, 3600::numeric),
  ('São Miguel do Gostoso', 1500::numeric, 1000::numeric, 900::numeric, 3400::numeric),
  ('Forte dos Reis Magos', 1200::numeric, 800::numeric, 750::numeric, 2750::numeric),
  ('Galinhos', 1100::numeric, 750::numeric, 650::numeric, 2500::numeric),
  ('Maior Cajueiro do Mundo', 1250::numeric, 800::numeric, 700::numeric, 2750::numeric),
  ('Praia do Madeiro', 1250::numeric, 750::numeric, 750::numeric, 2750::numeric),
  ('Lagoa de Pitangui', 1625::numeric, 1100::numeric, 900::numeric, 3625::numeric),
  ('Barreira do Inferno', 1000::numeric, 650::numeric, 600::numeric, 2250::numeric),
  ('Barra de Cunhaú', 1000::numeric, 700::numeric, 550::numeric, 2250::numeric),
  ('Parque das Dunas', 1350::numeric, 900::numeric, 750::numeric, 3000::numeric),
  ('Cidade Histórica de Mossoró', 1800::numeric, 1200::numeric, 900::numeric, 3900::numeric),
  ('Lajedo de Soledade', 900::numeric, 600::numeric, 500::numeric, 2000::numeric),
  ('Salinas e Indústria Salineira de Macau', 1000::numeric, 650::numeric, 600::numeric, 2250::numeric),
  ('Salinas de Galinhos e Fábrica de Sal', 900::numeric, 600::numeric, 500::numeric, 2000::numeric),
  ('Canyon dos Apertados', 900::numeric, 550::numeric, 550::numeric, 2000::numeric),
  ('Estátua de Santa Rita de Cássia', 1250::numeric, 800::numeric, 700::numeric, 2750::numeric),
  ('Castelo de Bivar', 900::numeric, 600::numeric, 500::numeric, 2000::numeric)
) as v(nome, infra, saneamento, turismo, total)
where i.destino_id = (select id from destinos where nome = v.nome)
  and (i.total_mil is distinct from v.total
       or i.investimento_infraestrutura_mil is distinct from v.infra
       or i.saneamento_mil is distinct from v.saneamento
       or i.turismo_mil is distinct from v.turismo);
