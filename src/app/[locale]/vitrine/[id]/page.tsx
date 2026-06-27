'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Star, Phone, ShieldCheck, MapPin, Building, Award, CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cadasturData } from '@/data/mockData';
import TouristLayout from '@/components/tourist/TouristLayout';
import { slugify } from '@/lib/utils';

export default function VitrinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const negocio = cadasturData.find((b) => b.id === resolvedParams.id);

  if (!negocio) {
    return (
      <TouristLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center animate-scale-in">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Estabelecimento não encontrado</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Este local não está registrado ou foi removido.
          </p>
          <Button onClick={() => router.back()} className="mt-6" icon={ArrowLeft}>
            Voltar
          </Button>
        </div>
      </TouristLayout>
    );
  }

  return (
    <TouristLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* Back navigation */}
        <div>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página anterior
          </button>
        </div>

        {/* Storefront Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Main Info Card */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="md">
                  {negocio.tipo}
                </Badge>
                {negocio.regularizado && (
                  <Badge variant="success" size="md" dot>
                    Selo Cadastur Regularizado
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                {negocio.nome}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                <Link href={`/destino/${slugify(negocio.destino)}`} className="hover:underline hover:text-[var(--color-primary)] transition-colors">
                  {negocio.destino}
                </Link>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre o Estabelecimento</CardTitle>
              </CardHeader>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {negocio.descricao || 'Este estabelecimento parceiro oferece serviços especializados para turistas no Rio Grande do Norte, com garantia de qualidade e suporte do Cadastur.'}
              </p>
            </Card>

            {/* Certifications and safety badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card padding="sm" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">Segurança Certificada</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Verificado pela observadoria</p>
                </div>
              </Card>
              <Card padding="sm" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">Operação Regular</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Cadastro ativo e homologado</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Info/Contact Card */}
          <div className="md:col-span-5 space-y-6">
            {/* Storefront Image */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md">
              <Image
                src={negocio.imagem || 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&h=500&fit=crop'}
                alt={negocio.nome}
                fill
                className="object-cover"
              />
            </div>

            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">Avaliação Geral</span>
                <div className="flex items-center gap-1 bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1 rounded-xl text-xs font-bold border border-[var(--color-accent)]/20">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {negocio.nota}
                </div>
              </div>

              {negocio.telefone && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Telefone / Contato</span>
                  <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                    {negocio.telefone}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <a 
                  href={`tel:${negocio.telefone}`}
                  className="w-full"
                >
                  <Button className="w-full justify-center" icon={Phone}>
                    Fazer Contato Direto
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TouristLayout>
  );
}
