"use client";

import {
  Zap,
  Building2,
  Crown,
  BarChart3,
  Smartphone,
  Globe,
  Shield,
  TrendingUp,
  BadgeDollarSign,
  Users,
  ArrowRight,
} from "lucide-react";

export default function PitchView() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          Modelo de Negócios
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Como a <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">DunasTech</span> gera receita
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Plataforma de inteligência turística com modelo de monetização em duas frentes: 
          Freemium B2B para o setor privado e SaaS recorrente para o poder público.
        </p>
      </div>

      {/* Revenue Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* B2B Card */}
        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-2xl p-6 space-y-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Modelo B2B</h2>
              <p className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider">Freemium + Ads</p>
            </div>
          </div>

          <div className="space-y-3">
            <Feature
              icon={<Shield className="w-4 h-4" />}
              title="Presença Gratuita (Cadastur)"
              description="Empresas validadas no Cadastur aparecem automaticamente nas rotas recomendadas do app — incentivando a formalização."
              color="amber"
            />
            <Feature
              icon={<Crown className="w-4 h-4" />}
              title="Destaque Patrocinado (Ads/CPC)"
              description="Negócios podem pagar para aparecer no topo das recomendações em formato de Ads com modelo de custo por clique."
              color="amber"
            />
            <Feature
              icon={<BarChart3 className="w-4 h-4" />}
              title="Painel Premium de Mercado"
              description="Assinatura para acesso a analytics de fluxo, perfil de turista e tendências — inteligência de mercado para pousadas e restaurantes."
              color="amber"
            />
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Receita Projetada (Ano 1)</span>
              <span className="text-sm font-bold text-amber-400">R$ 180K — R$ 420K</span>
            </div>
          </div>
        </div>

        {/* B2G Card */}
        <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/15 rounded-2xl p-6 space-y-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Modelo B2G</h2>
              <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider">SaaS Recorrente</p>
            </div>
          </div>

          <div className="space-y-3">
            <Feature
              icon={<TrendingUp className="w-4 h-4" />}
              title="Dashboard Preditivo"
              description="Assinatura mensal/anual por prefeituras para acesso ao Observatório de Gestão com ISA, dados de transporte e alerts em tempo real."
              color="cyan"
            />
            <Feature
              icon={<Smartphone className="w-4 h-4" />}
              title="Sensor Social Integrado"
              description="Monitoramento automático do Instagram e feedback do turista como indicadores de saúde do destino — um termômetro social."
              color="cyan"
            />
            <Feature
              icon={<BadgeDollarSign className="w-4 h-4" />}
              title="Relatórios IA Gerenciais"
              description="Diagnósticos gerados por Gemini para tomada de decisão, priorizando investimentos e intervenções de manutenção."
              color="cyan"
            />
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Receita Projetada (Ano 1)</span>
              <span className="text-sm font-bold text-cyan-400">R$ 360K — R$ 1.2M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">
          Por que prefeituras pagam pelo <span className="text-amber-400">DunasTech</span>?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ValueCard
            emoji="🛡️"
            title="Sustentabilidade"
            text="Prevenção de degradação ambiental por superlotação antes que se torne irreversível."
          />
          <ValueCard
            emoji="📊"
            title="Dados em Tempo Real"
            text="Substituição de pesquisas manuais por monitoramento contínuo e automático."
          />
          <ValueCard
            emoji="🤖"
            title="IA Acionável"
            text="Diagnósticos e recomendações prontos para apresentar em reuniões de gabinete."
          />
        </div>
      </div>

      {/* TAM */}
      <div className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Mercado Endereçável</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-2xl font-extrabold text-violet-400">167</span>
            <span className="block text-[10px] text-slate-500 uppercase mt-1">Municípios no RN</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-violet-400">5.570</span>
            <span className="block text-[10px] text-slate-500 uppercase mt-1">Municípios no Brasil</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-violet-400">R$ 9.4B</span>
            <span className="block text-[10px] text-slate-500 uppercase mt-1">Turismo RN (2025)</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 pb-8">
        <p className="text-slate-500 text-sm">
          Equipe <span className="font-bold text-white">Dunas Tech</span> — Hackathon do Sol 2026
        </p>
        <p className="text-xs text-slate-600">
          Eixo 3: Observatório Inteligente Potiguar
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "amber" | "cyan";
}) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ValueCard({ emoji, title, text }: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center space-y-2 hover:border-amber-500/15 transition-all">
      <span className="text-2xl">{emoji}</span>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
