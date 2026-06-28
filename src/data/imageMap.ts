// ============================================================
// IMAGE MAP — Mapa centralizado de imagens locais
// ============================================================
// Para trocar uma imagem:
//   1. Coloque o novo arquivo na pasta correta (public/images/destinos|atracoes|parceiros|hero)
//   2. Atualize o caminho neste arquivo (ou mantenha o mesmo nome do arquivo)
//
// Caminhos são relativos a /public — ex: "/images/destinos/pipa.png"
// Se a imagem ainda não existir, o componente LocalImage mostra um placeholder.
// ============================================================

// --- Imagens dos Destinos (principal de cada destino) ---
export const destinoImages: Record<string, string> = {
  "Ponta Negra e Morro do Careca": "/images/destinos/ponta_negra.png",
  "Praia da Pipa":                 "/images/destinos/pipa.png",
  "Dunas de Genipabu":             "/images/destinos/genipabu.png",
  "Parrachos de Maracajaú":        "/images/destinos/maracajau.png",
  "São Miguel do Gostoso":         "/images/destinos/sao_miguel.png",
  "Forte dos Reis Magos":          "/images/destinos/forte_reis_magos.png",
  "Galinhos":                      "/images/destinos/galinhos.png",
  "Maior Cajueiro do Mundo":       "/images/destinos/cajueiro.png",
  "Praia do Madeiro":              "/images/destinos/madeiro.png",
  "Lagoa de Pitangui":             "/images/destinos/pitangui.png",
  "Barreira do Inferno":           "/images/destinos/barreira_inferno.png",
  "Barra de Cunhaú":               "/images/destinos/cunhau.png",
  "Parque das Dunas":              "/images/destinos/parque_dunas.png",
  "Cidade Histórica de Mossoró":   "/images/destinos/mossoro.png",
  "Lajedo de Soledade":            "/images/destinos/lajedo_soledade.png",
};

// --- Imagens das Atrações/Atividades ---
export const atracaoImages: Record<string, string> = {
  "act-pn-1":    "/images/atracoes/jangada_ponta_negra.png",
  "act-pn-2":    "/images/atracoes/sup_ponta_negra.png",
  "act-pipa-1":  "/images/atracoes/golfinhos_pipa.png",
  "act-pipa-2":  "/images/atracoes/trilha_pipa.png",
  "act-gen-1":   "/images/atracoes/buggy_genipabu.png",
  "act-gen-2":   "/images/atracoes/esquibunda_genipabu.png",
  "act-mar-1":   "/images/atracoes/mergulho_maracajau.png",
  "act-gost-1":  "/images/atracoes/kitesurf_gostoso.png",
  "act-forte-1": "/images/atracoes/visita_forte.png",
  "act-gal-1":   "/images/atracoes/barco_galinhos.png",
  "act-caju-1":  "/images/atracoes/trilha_cajueiro.png",
  "act-mad-1":   "/images/atracoes/surf_madeiro.png",
  "act-pit-1":   "/images/atracoes/tirolesa_pitangui.png",
  "act-clbi-1":  "/images/atracoes/museu_barreira.png",
  "act-cun-1":   "/images/atracoes/mangue_cunhau.png",
  "act-dunas-1": "/images/atracoes/trilha_parque_dunas.png",
  "act-mos-1":   "/images/atracoes/memorial_mossoro.png",
  "act-apo-1":   "/images/atracoes/arqueologia_soledade.png",
};

// --- Imagens dos Parceiros Cadastur ---
export const parceiroImages: Record<string, string> = {
  "cad-pn-1":    "/images/parceiros/visual_praia_hotel.png",
  "cad-pn-2":    "/images/parceiros/camaroes_potiguar.png",
  "cad-pn-3":    "/images/parceiros/natal_aventuras.png",
  "cad-pipa-1":  "/images/parceiros/sombra_agua_fresca.png",
  "cad-pipa-2":  "/images/parceiros/pipa_beach_club.png",
  "cad-pipa-3":  "/images/parceiros/pipa_passeios.png",
  "cad-gen-1":   "/images/parceiros/pousada_genipabu.png",
  "cad-gen-3":   "/images/parceiros/bugueiros_genipabu.png",
  "cad-mar-1":   "/images/parceiros/manoa_park.png",
  "cad-mar-3":   "/images/parceiros/maracajau_diver.png",
  "cad-gost-1":  "/images/parceiros/pousada_mi_secreto.png",
  "cad-gost-2":  "/images/parceiros/dr_wind_kitesurf.png",
  "cad-forte-2": "/images/parceiros/natal_historica_guias.png",
  "cad-gal-2":   "/images/parceiros/galinhos_ecotour.png",
  "cad-caju-2":  "/images/parceiros/pirangi_turismo.png",
  "cad-mad-2":   "/images/parceiros/guia_marcos_madeiro.png",
  "cad-pit-2":   "/images/parceiros/pitangui_ecopark.png",
  "cad-clbi-1":  "/images/parceiros/clbi_visitacao.png",
  "cad-cun-2":   "/images/parceiros/cunhau_fluvial.png",
  "cad-dunas-2": "/images/parceiros/parque_dunas_idema.png",
  "cad-mos-2":   "/images/parceiros/mossoro_tour.png",
  "cad-apo-2":   "/images/parceiros/lajedo_guias.png",
};

// --- Imagens Hero / Background ---
export const heroImages = {
  pitchBackground: "/images/destinos/pipa.png",
};

// --- Helpers ---

/** Retorna o caminho da imagem de um destino pelo nome */
export function getDestinoImage(nome: string): string {
  return destinoImages[nome] || "/images/destinos/placeholder.png";
}

/** Retorna o caminho da imagem de uma atração pelo ID */
export function getAtracaoImage(id: string): string {
  return atracaoImages[id] || "/images/atracoes/placeholder.png";
}

/** Retorna o caminho da imagem de um parceiro pelo ID */
export function getParceiroImage(id: string): string {
  return parceiroImages[id] || "/images/parceiros/placeholder.png";
}
