"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { destinosInfo, fluxoData } from "@/data/mockData";
import { Share2, Heart, MessageCircle, Camera, Loader2, Settings, Key, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramPost {
  id: string;
  ownerUsername: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sentiment: string;
}

interface InstagramResult {
  source: string;
  hashtag: string;
  posts: InstagramPost[];
  totalLikes: number;
  totalComments: number;
  cachedAt?: number;
}

export default function SocialGestaoPage() {
  const [selectedDestino, setSelectedDestino] = useState(destinosInfo[0].nome);
  const [instagramData, setInstagramData] = useState<InstagramResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [expandedKPI, setExpandedKPI] = useState<'hashtag' | 'likes' | 'comments' | null>(null);
  
  // Apify Token local state
  const [apiToken, setApiToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dunastech_apify_token") || "";
    }
    return "";
  });
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  const currentFluxo = fluxoData.find((f) => f.destino === selectedDestino);

  const saveToken = () => {
    localStorage.setItem("dunastech_apify_token", apiToken);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 3000);
  };

  const fetchInstagramData = async () => {
    setLoading(true);
    try {
      const hashtag = currentFluxo?.hashtag_instagram || "pontanegranatal";
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag, forceRefresh, apiToken }),
      });
      const data = await res.json();
      setInstagramData(data);
      setForceRefresh(false); // Reset after successful fetch
    } catch (err) {
      console.error("Error fetching Instagram posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Social Listening e Sensor do Instagram</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Varredura de hashtags públicas via Apify Scraper para medir fluxo e sentimento.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Settings button */}
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              title="Configurações de API"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Force Refresh toggle checkbox */}
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
              />
              <span>Forçar atualização</span>
            </label>

            <select
              value={selectedDestino}
              onChange={(e) => {
                setSelectedDestino(e.target.value);
                setInstagramData(null);
              }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-text)] focus:outline-none cursor-pointer"
            >
              {destinosInfo.map((d) => (
                <option key={d.nome} value={d.nome}>
                  📍 {d.nome.split(" e ")[0]}
                </option>
              ))}
            </select>

            <Button
              onClick={fetchInstagramData}
              disabled={loading}
              size="sm"
              icon={loading ? undefined : Share2}
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...
                </span>
              ) : (
                "Buscar Posts"
              )}
            </Button>
          </div>
        </div>

        {/* API Settings Collapsible Card */}
        {showTokenInput && (
          <Card className="p-4 border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)]/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[var(--color-primary)]" />
                Configuração do Token do Apify Scraper
              </h3>
              <span className="text-[10px] text-[var(--color-text-muted)]">Salvo localmente no navegador</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Insira seu API Token do Apify (apify_api_...)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Button
                onClick={saveToken}
                size="sm"
                variant={tokenSaved ? "accent" : "primary"}
              >
                {tokenSaved ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Salvo!
                  </span>
                ) : (
                  "Salvar Chave"
                )}
              </Button>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              Você pode encontrar o seu token de API em seu perfil do Apify sob a aba <strong>Settings &gt; Integrations</strong>. O token é necessário para buscar dados orgânicos em tempo real do Instagram.
            </p>
          </Card>
        )}

        {/* Warning Banner if Token is missing */}
        {!apiToken && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/20 text-left">
            <Key className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-warning)] font-bold">
                Integração do Instagram rodando em modo Simulado
              </p>
              <p className="text-[10px] text-[var(--color-warning)] leading-relaxed opacity-90">
                Como nenhum token do Apify foi configurado ainda, o sistema exibirá dados históricos mockados. Para utilizar a API real e buscar posts ao vivo, clique no ícone de engrenagem <Settings className="inline w-3 h-3 mx-0.5" /> no canto superior direito e insira o seu token pessoal.
              </p>
            </div>
          </div>
        )}


        {/* Scraped Output */}
        {!instagramData && !loading ? (
          <div className="text-center py-20 text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <Camera className="h-12 w-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="text-sm font-semibold">Nenhum post carregado ainda</p>
            <p className="text-xs mt-1">Selecione o destino e clique em &ldquo;Buscar Posts&rdquo; para iniciar a varredura da hashtag #{currentFluxo?.hashtag_instagram || "pontanegranatal"}.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-24 text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-medium">Conectando ao Apify Instagram Scraper...</p>
            <p className="text-xs max-w-[280px]">Buscando os 3 posts mais curtidos sob a hashtag #{currentFluxo?.hashtag_instagram || "pontanegranatal"}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setExpandedKPI(expandedKPI === 'hashtag' ? null : 'hashtag')}
                className={cn(
                  "bg-[var(--color-surface)] border p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-primary)] transition-all select-none",
                  expandedKPI === 'hashtag' ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/5" : "border-[var(--color-border)]"
                )}
              >
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Hashtag Rastreada</span>
                  <span className="text-lg font-black block mt-1 text-[var(--color-primary)]">#{instagramData?.hashtag}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)] mt-1.5 block">
                    Origem: {instagramData?.source === "apify-cache" ? "💾 Cache do Servidor" : instagramData?.source === "apify" ? "⚡ Ao vivo (Apify)" : instagramData?.source === "mock-cache" ? "💾 Cache Simulado" : "🤖 Simulado"}
                    {instagramData?.cachedAt && ` (${new Date(instagramData.cachedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)]">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>

              <div 
                onClick={() => setExpandedKPI(expandedKPI === 'likes' ? null : 'likes')}
                className={cn(
                  "bg-[var(--color-surface)] border p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-red-500 transition-all select-none",
                  expandedKPI === 'likes' ? "border-red-500 bg-red-500/5" : "border-[var(--color-border)]"
                )}
              >
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Total Curtidas</span>
                  <span className="text-lg font-black block mt-1 text-red-500">{instagramData?.totalLikes.toLocaleString("pt-BR")}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>

              <div 
                onClick={() => setExpandedKPI(expandedKPI === 'comments' ? null : 'comments')}
                className={cn(
                  "bg-[var(--color-surface)] border p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-cyan-500 transition-all select-none",
                  expandedKPI === 'comments' ? "border-cyan-500 bg-cyan-500/5" : "border-[var(--color-border)]"
                )}
              >
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Total Comentários</span>
                  <span className="text-lg font-black block mt-1 text-cyan-500">{instagramData?.totalComments.toLocaleString("pt-BR")}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Expanded KPI Detail Block */}
            {expandedKPI && (
              <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 animate-fade-in space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2">
                  <h3 className="font-bold text-xs text-[var(--color-text)] flex items-center gap-2">
                    {expandedKPI === 'hashtag' && <>📱 Sentimento dos Posts na Hashtag #{instagramData?.hashtag}</>}
                    {expandedKPI === 'likes' && <>❤️ Posts com Maior Engajamento de Curtidas (Top 3)</>}
                    {expandedKPI === 'comments' && <>💬 Posts com Maior Engajamento de Comentários (Top 3)</>}
                  </h3>
                  <button 
                    onClick={() => setExpandedKPI(null)}
                    className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                  >
                    Fechar [x]
                  </button>
                </div>

                {expandedKPI === 'hashtag' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-emerald-500 block">Positivo</span>
                      <span className="font-black text-lg text-[var(--color-text)]">
                        {instagramData?.posts.filter(p => p.sentiment === "Positivo").length || 0} posts
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-blue-500 block">Neutro</span>
                      <span className="font-black text-lg text-[var(--color-text)]">
                        {instagramData?.posts.filter(p => p.sentiment === "Neutro").length || 0} posts
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-red-500 block">Negativo</span>
                      <span className="font-black text-lg text-[var(--color-text)]">
                        {instagramData?.posts.filter(p => p.sentiment === "Negativo").length || 0} posts
                      </span>
                    </div>
                  </div>
                )}

                {(expandedKPI === 'likes' || expandedKPI === 'comments') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[...(instagramData?.posts || [])]
                      .sort((a, b) => expandedKPI === 'likes' ? b.likesCount - a.likesCount : b.commentsCount - a.commentsCount)
                      .slice(0, 3)
                      .map((post) => (
                        <div key={post.id} className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-xl space-y-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-[var(--color-text)]">@{post.ownerUsername}</span>
                              <Badge variant={post.sentiment === "Positivo" ? "success" : post.sentiment === "Neutro" ? "info" : "danger"} size="sm">
                                {post.sentiment}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">{post.caption}</p>
                          </div>
                          <div className="flex items-center gap-3 pt-1 border-t border-[var(--color-border-light)] mt-1.5 text-[9px] text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500 fill-current" /> {post.likesCount}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-cyan-500" /> {post.commentsCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            )}

            {/* Scraped Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instagramData?.posts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col justify-between p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--color-text)]">@{post.ownerUsername}</span>
                      <Badge variant={post.sentiment === "Positivo" ? "success" : post.sentiment === "Neutro" ? "info" : "danger"} size="sm">
                        Sentimento: {post.sentiment}
                      </Badge>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-4 bg-[var(--color-surface-alt)] p-3 rounded-lg border border-[var(--color-border-light)]">
                      {post.caption || "[Sem legenda]"}
                    </p>
                  </div>

                  <div className="flex gap-4 items-center pt-2 border-t border-[var(--color-border-light)] text-[var(--color-text-muted)] text-xs">
                    <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4 fill-current" /> {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors">
                      <MessageCircle className="w-4 h-4" /> {post.commentsCount}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
