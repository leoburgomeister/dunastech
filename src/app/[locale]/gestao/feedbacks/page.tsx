"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { subscribeFeedbacks } from "@/lib/firebase";
import type { Feedback } from "@/data/mockData";
import { Star, Clock, Filter, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbacksGestaoPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string | "all">("all");

  useEffect(() => {
    const unsub = subscribeFeedbacks(setFeedbacks);
    return () => unsub();
  }, []);

  // Filter feedbacks list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      const matchRating = selectedRating === "all" || fb.nota_geral === selectedRating;
      const matchTag =
        selectedTag === "all" ||
        (selectedTag === "limpo" && fb.limpo) ||
        (selectedTag === "preservado" && fb.preservado) ||
        (selectedTag === "seguranca" && fb.seguranca) ||
        (selectedTag === "superlotado" && fb.superlotado);
      return matchRating && matchTag;
    });
  }, [feedbacks, selectedRating, selectedTag]);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Zeladoria e Auditoria Social</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Feedbacks em tempo real enviados por turistas e cidadãos locais.
            </p>
          </div>
          <Badge variant="success" size="md">{feedbacks.length} Feedbacks Totais</Badge>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
            <Filter className="w-4 h-4 text-[var(--color-primary)]" />
            <span>FILTROS:</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Rating Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">Nota:</span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="text-xs p-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                <option value="all">Todas</option>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="text-xs p-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)]"
              >
                <option value="all">Todas as Tags</option>
                <option value="limpo">🧹 Limpo e conservado</option>
                <option value="preservado">🌿 Bem preservado</option>
                <option value="seguranca">🔒 Seguro</option>
                <option value="superlotado">🚫 Superlotado</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Feedbacks Grid */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">Nenhum feedback corresponde aos filtros selecionados</p>
            <p className="text-xs mt-1">Experimente limpar os filtros ou submeter um feedback pelo app.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((fb, idx) => (
              <Card key={fb.id || idx} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[var(--color-text)]">{fb.destino}</h3>
                    <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {fb.timestamp ? new Date(fb.timestamp).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—"}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3.5 w-3.5",
                          s <= fb.nota_geral
                            ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                            : "text-[var(--color-border)]"
                        )}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  {fb.comentario && (
                    <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed bg-[var(--color-surface-alt)] p-3 rounded-lg border border-[var(--color-border-light)]">
                      &ldquo;{fb.comentario}&rdquo;
                    </p>
                  )}
                </div>

                {/* Audit Tags list */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border-light)]">
                  {fb.limpo && <Badge variant="success" size="sm">🧹 Limpo</Badge>}
                  {fb.preservado && <Badge variant="success" size="sm">🌿 Preservado</Badge>}
                  {fb.seguranca && <Badge variant="info" size="sm">🔒 Seguro</Badge>}
                  {fb.sinalizado && <Badge variant="info" size="sm">🪧 Sinalizado</Badge>}
                  {fb.acessibilidade && <Badge variant="info" size="sm">♿ Acessível</Badge>}
                  {fb.custo_beneficio && <Badge variant="success" size="sm">💰 Preço Justo</Badge>}
                  {fb.superlotado && <Badge variant="danger" size="sm">⚠️ Lotado</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
