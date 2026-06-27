'use client';

import { useState } from 'react';
import { ClipboardCheck, Send, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/providers/AuthProvider';
import { addFeedback } from '@/lib/firebase';
import { allDestinos, avaliacaoOptions } from '@/data/mockData';
import Link from 'next/link';

const criteria = [
  { key: 'limpo', emoji: '🧹', label: 'Limpo e conservado' },
  { key: 'sinalizado', emoji: '🪧', label: 'Boa sinalização' },
  { key: 'preservado', emoji: '🌿', label: 'Bem preservado' },
  { key: 'acessibilidade', emoji: '♿', label: 'Acessível' },
  { key: 'seguranca', emoji: '🔒', label: 'Seguro' },
  { key: 'custo_beneficio', emoji: '💰', label: 'Bom custo-benefício' },
  { key: 'conservacao', emoji: '🏗️', label: 'Bem conservado' },
  { key: 'superlotado', emoji: '🚫', label: 'Superlotado', negative: true },
];

export default function EvaluationPage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedDest, setSelectedDest] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState('');
  const [conformity, setConformity] = useState<'yes' | 'no'>('yes');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCriteria = (key: string) => {
    setSelectedCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest || rating === 0) return;

    setLoading(true);
    try {
      const conformityTag = `[Conformidade da Descrição: ${conformity === 'yes' ? 'Sim, condiz com o anunciado' : 'Não, há divergências'}]`;
      const finalComment = comment.trim() ? `${conformityTag} ${comment}` : conformityTag;

      await addFeedback({
        destino: selectedDest,
        nota_geral: rating,
        limpo: !!selectedCriteria.limpo,
        sinalizado: !!selectedCriteria.sinalizado,
        preservado: !!selectedCriteria.preservado,
        acessibilidade: !!selectedCriteria.acessibilidade,
        seguranca: !!selectedCriteria.seguranca,
        custo_beneficio: !!selectedCriteria.custo_beneficio,
        conservacao: !!selectedCriteria.conservacao,
        superlotado: !!selectedCriteria.superlotado,
        comentario: finalComment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-scale-in">
        <div className="h-16 w-16 rounded-2xl bg-[var(--color-primary-soft)] mx-auto flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Login necessário</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Faça login para avaliar destinos e contribuir com o observatório do turismo.
        </p>
        <Link href="/login">
          <Button size="lg">Entrar</Button>
        </Link>
      </div>
    );
  }

  // Thank you state
  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-scale-in">
        <div className="h-16 w-16 rounded-2xl bg-[var(--color-success-soft)] mx-auto flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Obrigado pela sua avaliação!</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Sua contribuição ajuda a manter o turismo sustentável no RN.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setSubmitted(false);
            setSelectedDest('');
            setRating(0);
            setSelectedCriteria({});
            setComment('');
          }}
        >
          Avaliar outro destino
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Avalie este destino</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Sua avaliação ajuda a monitorar a saúde dos atrativos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {/* Select Destination */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
              Selecione o destino
            </label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/30 focus:border-[var(--color-border-focus)] cursor-pointer"
            >
              <option value="">Escolha um destino...</option>
              {allDestinos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
              Nota geral
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Criteria toggles */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 block">
              O que você observou?
            </label>
            <div className="flex flex-wrap gap-2">
              {criteria.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCriteria(c.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer
                    transition-all duration-200 border
                    ${selectedCriteria[c.key]
                      ? c.negative
                        ? 'bg-[var(--color-danger-soft)] border-[var(--color-danger)]/30 text-[var(--color-danger)]'
                        : 'bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-[var(--color-success)]'
                      : 'bg-[var(--color-surface-alt)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
                    }
                  `}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description Conformity */}
          <div className="p-4 rounded-xl bg-[var(--color-accent-soft)]/20 border border-[var(--color-accent)]/20 space-y-3">
            <label className="text-xs font-semibold text-[var(--color-text)] block">
              🔍 Auditoria de Conformidade: A infraestrutura e belezas naturais do local correspondem ao que está descrito nas fotos e anúncios?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConformity('yes')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors ${conformity === 'yes' ? 'bg-[var(--color-success-soft)] border-[var(--color-success)]/40 text-[var(--color-success)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
              >
                👍 Sim, condiz perfeitamente
              </button>
              <button
                type="button"
                onClick={() => setConformity('no')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors ${conformity === 'no' ? 'bg-[var(--color-danger-soft)] border-[var(--color-danger)]/40 text-[var(--color-danger)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
              >
                👎 Não, há divergências
              </button>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/30 focus:border-[var(--color-border-focus)] resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center"
            icon={Send}
            loading={loading}
            disabled={!selectedDest || rating === 0}
          >
            Enviar Avaliação
          </Button>
        </Card>
      </form>
    </div>
  );
}
