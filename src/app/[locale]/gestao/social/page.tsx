"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { destinosInfo, fluxoData } from "@/data/mockData";
import { Share2, Heart, MessageCircle, Camera, Loader2 } from "lucide-react";

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

  const currentFluxo = fluxoData.find((f) => f.destino === selectedDestino);

  const fetchInstagramData = async () => {
    setLoading(true);
    try {
      const hashtag = currentFluxo?.hashtag_instagram || "pontanegranatal";
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag, forceRefresh }),
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
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
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

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Total Curtidas</span>
                  <span className="text-lg font-black block mt-1 text-red-500">{instagramData?.totalLikes.toLocaleString("pt-BR")}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-extrabold">Total Comentários</span>
                  <span className="text-lg font-black block mt-1 text-cyan-500">{instagramData?.totalComments.toLocaleString("pt-BR")}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

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
