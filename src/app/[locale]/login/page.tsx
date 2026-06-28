'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, User, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { signInWithGoogle, signInWithCPF, error, loading, clearError, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'choice' | 'cpf'>('choice');
  const [docType, setDocType] = useState<'cpf' | 'rne' | 'passport'>('cpf');
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleCPFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signInWithCPF(cpf, name, email);
    if (!error) router.push('/');
  };

  const handleGoogleLogin = async () => {
    clearError();
    await signInWithGoogle();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <Card className="!p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl gradient-ocean mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🏖️</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Bem-vindo ao DunasTech</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Entre para avaliar destinos e contribuir com o observatório
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-[var(--color-danger)] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            </div>
          )}

          {mode === 'choice' ? (
            <div className="space-y-4">
              {/* Google Login */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-center gap-3"
                onClick={handleGoogleLogin}
                loading={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-text-muted)]">ou continue com</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              {/* Document Login option */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-center"
                icon={CreditCard}
                onClick={() => setMode('cpf')}
              >
                Cadastrar com CPF / RNE / Passaporte
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCPFSubmit} className="space-y-4 animate-fade-in-up">
              <button
                type="button"
                onClick={() => { setMode('choice'); clearError(); }}
                className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
              >
                ← Voltar às opções
              </button>

              {/* Document Type Tab Selectors */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                  Tipo de Documento
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[var(--color-surface-alt)] p-1 rounded-xl border border-[var(--color-border-light)]">
                  {[
                    { id: 'cpf', label: 'CPF' },
                    { id: 'rne', label: 'RNE' },
                    { id: 'passport', label: 'Passaporte' }
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setDocType(doc.id as any);
                        setCpf(''); // Clear document number input
                      }}
                      className={cn(
                        "py-1.5 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer",
                        docType === doc.id
                          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-none"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]/30"
                      )}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label={
                  docType === 'cpf' ? 'CPF' :
                  docType === 'rne' ? 'RNE (Registro Nacional de Estrangeiro)' : 'Passaporte Mercosul'
                }
                placeholder={
                  docType === 'cpf' ? '000.000.000-00' :
                  docType === 'rne' ? 'W000000-X' : 'AB123456'
                }
                maskType={docType === 'cpf' ? 'cpf' : undefined}
                icon={CreditCard}
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />

              <Input
                label="Nome completo"
                placeholder="Seu nome"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
              />

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full justify-center"
                loading={loading}
              >
                Criar conta
              </Button>
            </form>
          )}

          {/* Secure database badge */}
          <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-[var(--color-border-light)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Auth & Database Criptografado</span>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-4">
            Ao entrar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </Card>
      </div>
    </div>
  );
}
