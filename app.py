import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from apify_client import ApifyClient
import os

# ==========================================
# CONFIGURAÇÃO DE TELA E TEMA GLOBAL
# ==========================================
st.set_page_config(
    page_title="DunasTech | Pitch & Landing Page",
    page_icon="☀️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium UI/UX styles based on Tailwind/Glassmorphism theme
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    :root {
        --bg-main: #060913;
        --bg-card: rgba(15, 23, 42, 0.6);
        --bg-sidebar: #04060c;
        --border-color: rgba(255, 255, 255, 0.08);
        --accent-orange: #FF8C00;
        --accent-teal: #00E5FF;
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
    }

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
    }

    .stApp {
        background-color: var(--bg-main);
        color: var(--text-primary);
    }
    
    section[data-testid="stSidebar"] {
        background-color: var(--bg-sidebar) !important;
        border-right: 1px solid var(--border-color);
    }
    
    section[data-testid="stSidebar"] div[data-testid="stSidebarUserContent"] {
        padding-top: 2rem;
    }

    header { visibility: hidden; }
    footer { visibility: hidden; }
    #MainMenu { visibility: hidden; }
    
    /* Section dividers and headings */
    .section-title {
        font-size: 2.1rem;
        font-weight: 800;
        margin-top: 50px;
        margin-bottom: 25px;
        border-bottom: 2px solid rgba(255,255,255,0.05);
        padding-bottom: 12px;
        letter-spacing: -0.5px;
    }
    
    .section-subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin-top: -15px;
        margin-bottom: 30px;
    }
    
    /* Modern Glassmorphism Cards */
    .glass-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 26px;
        margin-bottom: 24px;
        box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card:hover {
        transform: translateY(-4px);
        border-color: rgba(255, 140, 0, 0.25);
        box-shadow: 0 16px 40px 0 rgba(255, 140, 0, 0.08);
    }
    
    /* Custom Grid Display */
    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    .feature-item {
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 14px;
        padding: 20px;
        transition: all 0.3s ease;
    }
    .feature-item:hover {
        border-color: rgba(0, 229, 255, 0.2);
        background: rgba(15, 23, 42, 0.6);
    }
    
    /* Metric Cards Grid */
    .kpi-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }
    .kpi-card {
        background: rgba(17, 28, 52, 0.6);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    .kpi-card:hover {
        transform: translateY(-3px);
        border-color: rgba(0, 229, 255, 0.3);
    }
    .kpi-title {
        font-size: 0.78rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 600;
        display: block;
        margin-bottom: 8px;
    }
    .kpi-value {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-primary);
        display: block;
        margin-bottom: 4px;
        background: linear-gradient(135deg, #FFFFFF 60%, #94A3B8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .kpi-sub {
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    /* Text Gradients */
    .gradient-text-orange {
        background: linear-gradient(90deg, #FF8C00 0%, #FFB347 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }
    .gradient-text-blue {
        background: linear-gradient(90deg, #00E5FF 0%, #0088FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }
    
    /* Styled Inputs */
    div[data-baseweb="input"], div[data-baseweb="select"], select, input {
        background-color: rgba(15, 23, 42, 0.8) !important;
        border: 1px solid var(--border-color) !important;
        color: var(--text-primary) !important;
        border-radius: 8px !important;
    }
    
    /* Customized Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #FF8C00 0%, #FFB347 100%) !important;
        color: #030712 !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 12px 28px !important;
        font-size: 0.95rem !important;
        box-shadow: 0 6px 20px rgba(255, 140, 0, 0.25) !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        width: 100%;
    }
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(255, 140, 0, 0.4) !important;
        background: linear-gradient(135deg, #FFA500 0%, #FFC04D 100%) !important;
    }
    
    /* Match Cards */
    .match-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
    }
    .match-card:hover {
        border-color: rgba(0, 229, 255, 0.2);
    }
    .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 12px;
        margin-bottom: 16px;
    }
    .match-percentage-badge {
        background: rgba(0, 229, 255, 0.1);
        color: var(--accent-teal);
        border: 1px solid rgba(0, 229, 255, 0.25);
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.95rem;
    }
    .match-price-badge {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-left: 8px;
    }
    
    /* Instagram Cards */
    .instagram-card {
        background: rgba(10, 15, 28, 0.8);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 25px;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
    }
    .instagram-header {
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.02);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .instagram-user {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .instagram-body {
        padding: 20px;
    }
    .instagram-caption {
        font-size: 0.9rem;
        color: #E2E8F0;
        line-height: 1.5;
        margin-bottom: 16px;
        font-style: italic;
    }
    .instagram-footer {
        padding: 14px 20px;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        gap: 20px;
        font-size: 0.85rem;
        color: var(--text-secondary);
        border-top: 1px solid rgba(255,255,255,0.04);
    }
    
    .badge {
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .badge-positive { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-neutral { background: rgba(100, 116, 139, 0.15); color: #94A3B8; border: 1px solid rgba(100, 116, 139, 0.3); }
    .badge-negative { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    
    /* Hero Header Banner Overlay */
    .hero-container {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 30px;
        border: 1px solid var(--border-color);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }
    .hero-image {
        width: 100%;
        height: 320px;
        object-fit: cover;
        opacity: 0.55;
        filter: brightness(0.65);
    }
    .hero-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(0deg, rgba(6, 9, 19, 0.98) 0%, rgba(6, 9, 19, 0.4) 60%, rgba(6, 9, 19, 0) 100%);
        padding: 40px 45px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }
    
    /* Navigation radio overrides */
    div[data-testid="stRadio"] label {
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        border-radius: 10px !important;
        padding: 12px 16px !important;
        margin-bottom: 8px !important;
        transition: all 0.2s ease !important;
        color: var(--text-secondary) !important;
    }
    div[data-testid="stRadio"] label:hover {
        background: rgba(255, 255, 255, 0.06) !important;
        color: var(--text-primary) !important;
    }
    div[data-testid="stRadio"] label[data-checked="true"] {
        background: linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 179, 71, 0.15) 100%) !important;
        border-color: rgba(255, 140, 0, 0.4) !important;
        color: var(--accent-orange) !important;
        font-weight: 600 !important;
    }
</style>
""", unsafe_allow_html=True)


# ==========================================
# REPOSITÓRIO DE DADOS E CONFIGURAÇÕES MOCK
# ==========================================
@st.cache_data
def carregar_dados_mock():
    dados = {
        "Destino": ["Praia do Madeiro", "Pipa", "Ponta Negra", "São Miguel do Gostoso"],
        "Município": ["Tibau do Sul", "Tibau do Sul", "Natal", "São Miguel do Gostoso"],
        "Fluxo_Visitantes (Mês)": [12500, 45000, 80000, 15000],
        "Receita_Estimada (R$ Milhões)": [2.5, 12.0, 25.0, 4.1],
        "Investimento_Publico (R$ Mil)": [50.0, 300.0, 800.0, 120.0],
        "ISA_Score": [85, 62, 55, 90],
        "Saturacao_Turistica": [30, 82, 90, 45]
    }
    return pd.DataFrame(dados)

DESTINOS_B2C = [
    {
        "nome": "Praia do Madeiro",
        "municipio": "Tibau do Sul",
        "vibes": ["Natureza & Relax", "Aventura & Passeios", "Praia Paradisíaca"],
        "categoria_preco": "Moderado",
        "valor_preco": 2,
        "acompanhantes": ["Casal", "Família", "Solo"],
        "descricao": "Famosa pelas falésias deslumbrantes, águas mornas excelentes para banho e pela visita frequente de golfinhos. Perfeita para quem busca relaxar em meio à natureza preservada.",
        "imagem": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        "atracoes": ["Ver golfinhos na baía", "Aulas de Surf", "Caminhadas pelas falésias"]
    },
    {
        "nome": "Praia da Pipa",
        "municipio": "Tibau do Sul",
        "vibes": ["Agito & Vida Noturna", "Aventura & Passeios", "Tendência & Surf"],
        "categoria_preco": "Luxo",
        "valor_preco": 3,
        "acompanhantes": ["Casal", "Amigos", "Solo"],
        "descricao": "O vilarejo mais cosmopolita do estado, combinando uma gastronomia internacional sofisticada, baladas vibrantes, praias icônicas (como Amor e Golfinhos) e lojas encantadoras.",
        "imagem": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&q=80",
        "atracoes": ["Pôr do sol na Lagoa de Guaraíras", "Noite na Av. Baía dos Golfinhos", "Santuário Ecológico"]
    },
    {
        "nome": "Ponta Negra",
        "municipio": "Natal",
        "vibes": ["Urbano & Cultura", "Aventura & Passeios", "Fácil Acesso & Serviços"],
        "categoria_preco": "Econômico",
        "valor_preco": 1,
        "acompanhantes": ["Família", "Amigos", "Solo", "Casal"],
        "descricao": "A praia urbana mais famosa de Natal, com vista clássica para o Morro do Careca. Excelente infraestrutura de hotéis, restaurantes, passeios de barco e serviços ao turista.",
        "imagem": "https://images.unsplash.com/photo-1582972236019-ea4af5faf580?auto=format&fit=crop&w=600&q=80",
        "atracoes": ["Foto clássica no Morro do Careca", "Passeio de Jangada", "Feirinha de Artesanato de Ponta Negra"]
    },
    {
        "nome": "São Miguel do Gostoso",
        "municipio": "São Miguel do Gostoso",
        "vibes": ["Natureza & Relax", "Esportes de Vento & Vela", "Tranquilidade & Sossego"],
        "categoria_preco": "Moderado",
        "valor_preco": 2,
        "acompanhantes": ["Casal", "Solo", "Amigos"],
        "descricao": "Refúgio de charme mundialmente conhecido para prática de Windsurf e Kitesurife. Atmosfera de vila de pescadores com pousadas charmosas, ruas de terra e pôr do sol inesquecível.",
        "imagem": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        "atracoes": ["Pôr do sol no Pontal da Tourinha", "Kitesurf na Praia do Cardeiro", "Jantar romântico no centro histórico"]
    }
]

# ==========================================
# INTEGRAÇÃO REAL APIFY E SENTIMENTOS
# ==========================================
def analisar_sentimento_simples(caption):
    if not caption or not isinstance(caption, str):
        return "Neutro", "badge-neutral"
    
    caption_lower = caption.lower()
    palavras_positivas = [
        "maravilhoso", "lindo", "perfeito", "linda", "top", "amei", "perfeita", 
        "paraiso", "incrível", "incrivel", "show", "excelente", "apaixonada", 
        "apaixonado", "melhor", "sensacional", "topzera", "☀️", "❤️", "😍", "✨"
    ]
    palavras_negativas = [
        "sujo", "caro", "ruim", "péssimo", "pessimo", "odiei", "lixo", 
        "cheio", "lotado", "desorganizado", "perigoso", "atraso", "decepcionado", 
        "decepcionada", "triste", "horrível", "horrivel"
    ]
    
    score_positivo = sum(1 for p in palavras_positivas if p in caption_lower)
    score_negativo = sum(1 for p in palavras_negativas if p in caption_lower)
    
    if score_positivo > score_negativo:
        return "Positivo", "badge-positive"
    elif score_negativo > score_positivo:
        return "Crítica / Alerta", "badge-negative"
    else:
        return "Neutro", "badge-neutral"

def buscar_dados_instagram(api_token, hashtag):
    client = ApifyClient(api_token)
    run_input = {
        "searchType": "hashtag",
        "search": hashtag,
        "resultsLimit": 3
    }
    try:
        run = client.actor("apify/instagram-scraper").call(run_input=run_input)
        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        return items
    except Exception as e:
        return f"Erro na API: {e}"


# ==========================================
# SIDEBAR REFINADO
# ==========================================
st.sidebar.markdown("""
<div style="padding-bottom: 20px; text-align: left;">
    <h2 style="margin: 0; color: #FFF; font-weight: 800; font-size: 1.6rem; letter-spacing: -0.5px;">
        DUNAS<span style="color: #FF8C00;">TECH</span>
    </h2>
    <span style="font-size: 0.78rem; color: #94A3B8; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
        Plataforma Inteligente de Turismo
    </span>
</div>
""", unsafe_allow_html=True)

st.sidebar.divider()

view_mode = st.sidebar.radio(
    "Modo de Visualização:",
    ["🌐 Apresentação Completa (Pitch)", "⚡ Hero & Conceito", "🤖 O que Automatizamos", "📊 Estudo de Caso (B2G)", "🔌 Integrações (Apify)", "🧭 Assistente B2C", "📈 Indicadores Consolidados"],
    index=0
)

st.sidebar.divider()
st.sidebar.info(
    "💡 **Instruções de Apresentação:** Use o modo 'Apresentação Completa' para rolar a tela como uma Landing Page contínua durante o pitch, ou selecione seções individuais no menu lateral para ir direto aos tópicos."
)


# ==========================================
# DEFINIÇÃO DOS COMPONENTES INDIVIDUAIS (ESTILO REACT)
# ==========================================

# 1. Componente Hero
def render_hero():
    st.markdown("""
    <div id="hero" class="hero-container">
        <img class="hero-image" src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80">
        <div class="hero-overlay">
            <span style="background: rgba(255, 140, 0, 0.2); color: #FF8C00; border: 1px solid rgba(255, 140, 0, 0.4); padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; width: fit-content; margin-bottom: 12px;">
                Eixo 3: Observatório Inteligente Potiguar
            </span>
            <h1 style="margin: 0 0 8px 0; font-size: 2.5rem; font-weight: 800; color: #FFF; line-height:1.15;">
                DUNAS<span style="color: #FF8C00;">TECH</span>: O Futuro da Gestão Turística no RN
            </h1>
            <p style="margin: 0 0 20px 0; font-size: 1.1rem; color: #E2E8F0; font-weight: 500; line-height: 1.5; max-width: 800px;">
                Inteligência Artificial e análise de dados integrados de ponta a ponta. Conectando as experiências dos turistas às decisões estratégicas de municípios e comércios locais.
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

# 2. Componente WhatWeAutomate
def render_what_we_automate():
    st.markdown("""
    <div id="what-we-automate" class="section-title">
        🤖 O que nós <span class="gradient-text-orange">Automatizamos</span>
    </div>
    <p class="section-subtitle">Substituindo planilhas manuais e dados obsoletos por pipelines integrados de inteligência em tempo real.</p>
    
    <div class="features-grid">
        <div class="feature-item">
            <h4 style="margin: 0 0 8px 0; color: #FF8C00; font-weight: 700; font-size: 1.05rem;">📊 Agregação de Dados B2G</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                Automatização do cruzamento de bases históricas (Cadastur, IBGE e fluxos municipais) em um painel consolidado para secretarias de turismo e prefeituras.
            </p>
        </div>
        <div class="feature-item">
            <h4 style="margin: 0 0 8px 0; color: #FF8C00; font-weight: 700; font-size: 1.05rem;">📸 O Turista como Sensor Ativo</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                Monitoramento social contínuo via web scraping do Instagram para medir o sentimento orgânico dos visitantes de maneira automatizada.
            </p>
        </div>
        <div class="feature-item">
            <h4 style="margin: 0 0 8px 0; color: #00E5FF; font-weight: 700; font-size: 1.05rem;">🚨 Alertas de Saturação Ecológica</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                Algoritmos preditivos que identificam picos de lotação nos atrativos, prevenindo degradação ambiental e sobrecarga de serviços públicos.
            </p>
        </div>
        <div class="feature-item">
            <h4 style="margin: 0 0 8px 0; color: #00E5FF; font-weight: 700; font-size: 1.05rem;">🧭 Roteamento Inteligente B2C</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                Distribuição automática dos turistas por meio de um sistema de recomendação dinâmico que promove destinos vizinhos quando a área principal está sob alerta.
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

# 3. Componente CaseStudy (B2G Dashboard integrado)
def render_case_study():
    st.markdown("""
    <div id="case-study" class="section-title">
        📊 Estudo de Caso: <span class="gradient-text-blue">Mitigação de Impacto em Ponta Negra</span>
    </div>
    <p class="section-subtitle">Como nosso sistema de alertas B2G reequilibrou o fluxo turístico no estado durante feriados prolongados.</p>
    """, unsafe_allow_html=True)
    
    col_desc, col_dashboard = st.columns([1, 2])
    
    with col_desc:
        st.markdown("""
        **Cenário Real vs Automação:**
        Historicamente, a praia de Ponta Negra, em Natal, sofre com picos severos de lotação urbana e hoteleira, levando a problemas no recolhimento de resíduos, segurança e insatisfação ecológica.
        
        **A Intervenção DunasTech:**
        1. O sistema B2G detectou saturação de **90%** em Ponta Negra.
        2. O algoritmo B2C acionou automaticamente um gatilho de rebalanceamento.
        3. Novas buscas de turistas por praias de perfil parecido foram direcionadas a **São Miguel do Gostoso** ou **Praia do Madeiro** com incentivos locais.
        4. O fluxo foi suavizado, distribuindo a receita regional e protegendo a integridade ambiental dos atrativos.
        """)
        
        # Interactive warning trigger
        st.markdown("""
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 18px; margin-top: 15px;">
            <span style="color: #F87171; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block; margin-bottom: 5px;">🤖 STATUS DO GATILHO DA IA:</span>
            <p style="margin: 0; font-size: 0.82rem; color: #E2E8F0; line-height: 1.4;">
                <b>Ativo (Crítico).</b> O tráfego para Ponta Negra foi reduzido em 15% nas últimas 24h via roteamento B2C.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
    with col_dashboard:
        st.markdown("<h4 style='color:#FFF; font-weight:700; margin-top:0;'>Painel de Monitoramento B2G Integrado:</h4>", unsafe_allow_html=True)
        
        df_mock = carregar_dados_mock()
        
        # Plotly chart implementation
        fig_isa = go.Figure()
        fig_isa.add_trace(go.Bar(
            x=df_mock['Destino'],
            y=df_mock['ISA_Score'],
            name='Saúde do Atrativo (ISA)',
            marker=dict(color='rgba(255, 140, 0, 0.75)', line=dict(color='#FF8C00', width=1.5)),
            width=0.35
        ))
        fig_isa.add_trace(go.Scatter(
            x=df_mock['Destino'],
            y=df_mock['Saturacao_Turistica'],
            name='Saturação Turística (%)',
            mode='lines+markers',
            line=dict(color='#00E5FF', width=3),
            marker=dict(size=8, color='#FFFFFF', line=dict(color='#00E5FF', width=2))
        ))
        fig_isa.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#94A3B8',
            height=280,
            margin=dict(l=20, r=20, t=10, b=20),
            legend=dict(orientation="h", yanchor="bottom", y=1.05, xanchor="right", x=1),
            xaxis=dict(gridcolor='rgba(255, 255, 255, 0.05)', linecolor='rgba(255, 255, 255, 0.1)'),
            yaxis=dict(gridcolor='rgba(255, 255, 255, 0.05)', linecolor='rgba(255, 255, 255, 0.1)')
        )
        st.plotly_chart(fig_isa, use_container_width=True)
        st.caption("Gráfico interativo: Note que Ponta Negra apresenta o menor ISA (55) com a maior taxa de saturação (90%).")

# 4. Componente Integrations (Apify Instagram Scraper integrado)
def render_integrations():
    st.markdown("""
    <div id="integrations" class="section-title">
        🔌 Integrações & <span class="gradient-text-orange">Dados em Tempo Real</span>
    </div>
    <p class="section-subtitle">Processamento unificado das APIs do Cadastur, IBGE, e raspagem em tempo real do Instagram via Apify SDK.</p>
    """, unsafe_allow_html=True)
    
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        st.markdown("""
        **A Mágica da Integração Real (Instagram Scraper):**
        Para impressionar a banca e provar que o sistema funciona além do mock, integramos o **Apify Python SDK**. Ele realiza uma busca ao vivo de postagens associadas às hashtags turísticas locais e analisa o sentimento orgânico do turista imediatamente.
        
        *Insira sua credencial para testar e validar ao vivo durante a apresentação.*
        """)
        
        # Token and Hashtag settings
        apify_token = st.text_input(
            "Token do Apify (Configurações > Integrações):",
            type="password",
            key="apify_token_pitch"
        )
        
        hashtag_alvo = st.text_input(
            "Hashtag turística (sem #):",
            value="praiadomadeiro",
            key="hashtag_pitch"
        )
        
        iniciar_coleta = st.button("🚀 Rodar Automação & Scraper Real-Time", key="btn_scraper_pitch")
        
    with col_right:
        if iniciar_coleta:
            if not apify_token:
                st.warning("⚠️ Insira o token do Apify para testar a busca em tempo real.")
            else:
                with st.spinner("Apify Actor rodando... Extraindo publicações reais da API do Instagram..."):
                    resultados = buscar_dados_instagram(apify_token, hashtag_alvo)
                    
                    if isinstance(resultados, list) and len(resultados) > 0:
                        st.success("✅ Varredura realizada com sucesso!")
                        
                        likes_totais = sum(post.get('likesCount', 0) if post.get('likesCount') is not None else 0 for post in resultados)
                        comments_totais = sum(post.get('commentsCount', 0) if post.get('commentsCount') is not None else 0 for post in resultados)
                        
                        st.markdown(f"""
                        <div class="kpi-container">
                            <div class="kpi-card" style="padding:15px;">
                                <span class="kpi-title" style="font-size:0.7rem;">💖 Likes Encontrados</span>
                                <span class="kpi-value" style="font-size:1.6rem;">{likes_totais:,}</span>
                            </div>
                            <div class="kpi-card" style="padding:15px;">
                                <span class="kpi-title" style="font-size:0.7rem;">💬 Comentários</span>
                                <span class="kpi-value" style="font-size:1.6rem;">{comments_totais:,}</span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        for post in resultados[:2]: # Show top 2 for visual cleanliness
                            caption = post.get('caption', 'Sem legenda')
                            sentimento, badge_class = analisar_sentimento_simples(caption)
                            likes = post.get('likesCount', 'N/A')
                            comments = post.get('commentsCount', 'N/A')
                            owner_username = post.get('ownerUsername', 'usuario')
                            
                            st.markdown(f"""
                            <div class="instagram-card" style="margin-bottom:15px;">
                                <div class="instagram-header" style="padding:10px 15px;">
                                    <span class="instagram-user" style="font-size:0.85rem;">👤 @{owner_username}</span>
                                    <span class="badge {badge_class}" style="font-size:0.65rem; padding:3px 8px;">{sentimento}</span>
                                </div>
                                <div class="instagram-body" style="padding:15px;">
                                    <p class="instagram-caption" style="font-size:0.82rem; margin:0;">"{caption[:150] + '...' if len(caption) > 150 else caption}"</p>
                                </div>
                            </div>
                            """, unsafe_allow_html=True)
                    else:
                        st.error(f"Nenhum post encontrado ou erro na chamada API: {resultados}")
        else:
            # Integrations visual representation placeholder (interactive and visually premium)
            st.markdown("""
            <div class="glass-card" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔌</div>
                <h4 style="margin:0 0 8px 0; color:#FFF; font-weight:700;">Dashboard de Integração</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                    Configure as chaves da API à esquerda para puxar as mídias em tempo real. A DunasTech faz a coleta dinâmica do feed do Instagram em menos de 45 segundos.
                </p>
            </div>
            """, unsafe_allow_html=True)

# 5. Componente WorkflowCTA (B2C Travel Assistant integrado)
def render_workflow_cta():
    st.markdown("""
    <div id="workflow-cta" class="section-title">
        🧭 Workflow CTA: <span class="gradient-text-blue">O Guia do Turista em Ação</span>
    </div>
    <p class="section-subtitle">Simule a experiência real do usuário (B2C) e veja o algoritmo de recomendação direcionando os turistas.</p>
    """, unsafe_allow_html=True)
    
    col_inputs, col_cards = st.columns([1, 2])
    
    with col_inputs:
        st.markdown("<h4 style='color:#FFF; font-weight:700; margin-top:0;'>1. Selecione seu Perfil:</h4>", unsafe_allow_html=True)
        
        vibes_selecionadas = st.multiselect(
            "Suas vibes preferidas:",
            options=[
                "Natureza & Relax",
                "Aventura & Passeios",
                "Praia Paradisíaca",
                "Agito & Vida Noturna",
                "Tendência & Surf",
                "Urbano & Culture",
                "Fácil Acesso & Serviços",
                "Esportes de Vento & Vela",
                "Tranquilidade & Sossego"
            ],
            default=["Natureza & Relax"],
            key="vibes_workflow"
        )
        
        orcamento = st.select_slider(
            "Orçamento ideal:",
            options=["Econômico", "Moderado", "Luxo"],
            value="Moderado",
            key="orcamento_workflow"
        )
        
        acompanhante = st.selectbox(
            "Quem te acompanha?",
            options=["Solo", "Casal", "Família", "Amigos"],
            key="acompanhante_workflow"
        )
        
        st.markdown("<div style='margin-top: 15px;'>", unsafe_allow_html=True)
        gerar_match = st.button("✨ Buscar Destino Combinado", key="btn_b2c_workflow")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_cards:
        st.markdown("<h4 style='color:#FFF; font-weight:700; margin-top:0;'>2. Destino Ideal Identificado:</h4>", unsafe_allow_html=True)
        
        if len(vibes_selecionadas) == 0:
            st.info("💡 Escolha suas vibes preferidas à esquerda para processar o algoritmo de afinidade.")
        else:
            mapa_preco = {"Econômico": 1, "Moderado": 2, "Luxo": 3}
            preco_user = mapa_preco[orcamento]
            
            recomendacoes = []
            for dest in DESTINOS_B2C:
                vibe_hits = sum(1 for v in vibes_selecionadas if v in dest["vibes"])
                vibe_score = (vibe_hits / len(vibes_selecionadas)) * 55
                
                diff_preco = abs(dest["valor_preco"] - preco_user)
                preco_score = 25 if diff_preco == 0 else (15 if diff_preco == 1 else 5)
                
                acomp_score = 20 if acompanhante in dest["acompanhantes"] else 5
                
                total_score = vibe_score + preco_score + acomp_score
                recomendacoes.append((dest, total_score))
            
            recomendacoes.sort(key=lambda x: x[1], reverse=True)
            
            # Show only the top recommendation for landing page CTA styling clean look
            melhor_dest, score_dest = recomendacoes[0]
            
            st.markdown(f"""
            <div class="match-card" style="border-left: 6px solid var(--accent-teal);">
                <div class="match-header">
                    <div>
                        <h3 style="margin: 0; color: #FFF; font-weight: 700; font-size: 1.3rem;">{melhor_dest['nome']}</h3>
                        <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">📍 {melhor_dest['municipio']}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="match-percentage-badge">{score_dest:.0f}% Afinidade</span>
                        <span class="match-price-badge">{melhor_dest['categoria_preco']}</span>
                    </div>
                </div>
                <p style="font-size: 0.9rem; color: #E2E8F0; line-height: 1.5; margin: 0 0 15px 0;">{melhor_dest['descricao']}</p>
            </div>
            """, unsafe_allow_html=True)
            
            col_l1, col_l2 = st.columns([1, 1])
            with col_l1:
                st.image(melhor_dest["imagem"], use_container_width=True)
            with col_d1 := col_l2:
                st.markdown("🎯 **Atividades Recomendadas:**")
                for atracao in melhor_dest["atracoes"]:
                    st.markdown(f"- {atracao}")
                
                tags_html = "".join([f'<span style="background: rgba(0, 229, 255, 0.08); color: #00E5FF; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; margin-right: 6px; font-weight: 600; display: inline-block; margin-top:10px; border: 1px solid rgba(0, 229, 255, 0.15);">{v}</span>' for v in melhor_dest["vibes"]])
                st.markdown(tags_html, unsafe_allow_html=True)

# 6. Componente PreFooter (Indicadores Consolidados)
def render_pre_footer():
    st.markdown("""
    <div id="pre-footer" class="section-title">
        📈 Indicadores do <span class="gradient-text-orange">Ecossistema</span>
    </div>
    <p class="section-subtitle">Métricas gerais registradas no banco de dados consolidado da DunasTech.</p>
    """)
    
    df_mock = carregar_dados_mock()
    
    st.markdown(f"""
    <div class="kpi-container">
        <div class="kpi-card" style="text-align: center;">
            <span class="kpi-title">👥 Visitantes Mapeados</span>
            <span class="kpi-value">{df_mock['Fluxo_Visitantes (Mês)'].sum():,}</span>
            <span class="kpi-sub" style="color: #10B981;">Total de fluxo monitorado</span>
        </div>
        <div class="kpi-card" style="text-align: center;">
            <span class="kpi-title">💰 Receita Regional Estimada</span>
            <span class="kpi-value">R$ {df_mock['Receita_Estimada (R$ Milhões)'].sum()}M</span>
            <span class="kpi-sub" style="color: #10B981;">Impacto no comércio local</span>
        </div>
        <div class="kpi-card" style="text-align: center;">
            <span class="kpi-title">🏥 Média de Saúde ISA</span>
            <span class="kpi-value">{df_mock['ISA_Score'].mean():.1f}/100</span>
            <span class="kpi-sub" style="color: #FF8C00;">Mapeado por 4 atrativos chave</span>
        </div>
        <div class="kpi-card" style="text-align: center;">
            <span class="kpi-title">💼 Investimento Identificado</span>
            <span class="kpi-value">R$ {df_mock['Investimento_Publico (R$ Mil)'].sum():,.0f}k</span>
            <span class="kpi-sub" style="color: #94A3B8;">Cadastur + Alocações locais</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# 7. Componente Footer
def render_footer():
    st.markdown("""
    <div id="footer" style="margin-top: 80px; padding: 40px 0 20px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
        <h4 style="color: #FFF; font-weight: 800; font-size: 1.1rem; margin-bottom: 8px;">
            DUNAS<span style="color: #FF8C00;">TECH</span>
        </h4>
        <p style="margin: 4px 0 15px 0;">
            Desenvolvido pela Equipe Dunas Tech para o Eixo 3 do Observatório Inteligente Potiguar.
        </p>
        <p style="margin: 0; font-size: 0.78rem;">
            Stack tecnológica: Python, Streamlit, Apify Actor, Plotly, Pandas, Tailwind Layout.
        </p>
        <p style="margin-top: 20px; font-size: 0.75rem; opacity: 0.5;">
            DunasTech © 2026. Todos os direitos reservados.
        </p>
    </div>
    """, unsafe_allow_html=True)


# ==========================================
# GESTÃO DO RENDER DE ACORDO COM A ABA
# ==========================================

if view_mode == "🌐 Apresentação Completa (Pitch)":
    # Render all components sequentially
    render_hero()
    render_what_we_automate()
    render_case_study()
    render_integrations()
    st.markdown("<br><br>", unsafe_allow_html=True)
    render_workflow_cta()
    st.markdown("<br><br>", unsafe_allow_html=True)
    render_pre_footer()
    render_footer()

elif view_mode == "⚡ Hero & Conceito":
    render_hero()
    render_footer()

elif view_mode == "🤖 O que Automatizamos":
    render_what_we_automate()
    render_footer()

elif view_mode == "📊 Estudo de Caso (B2G)":
    render_case_study()
    render_footer()

elif view_mode == "🔌 Integrações (Apify)":
    render_integrations()
    render_footer()

elif view_mode == "🧭 Assistente B2C":
    render_workflow_cta()
    render_footer()

elif view_mode == "📈 Indicadores Consolidados":
    render_pre_footer()
    render_footer()
