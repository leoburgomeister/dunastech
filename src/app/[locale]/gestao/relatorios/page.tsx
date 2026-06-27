"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, Download, CheckCircle, FileSpreadsheet, Loader2 } from "lucide-react";

export default function RelatoriosGestaoPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const triggerDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      // Simulate file download
      alert(`Download de relatório "${id}" iniciado com sucesso!`);
    }, 1500);
  };

  const reportFiles = [
    {
      id: "pdf-auditoria",
      title: "Relatório Mensal de Auditoria e Sustentabilidade",
      desc: "Resumo gerencial contendo o Índice ISA consolidado de todas as praias e as recomendações de IA.",
      format: "PDF",
      size: "2.4 MB"
    },
    {
      id: "csv-feedbacks",
      title: "Banco de Dados de Feedbacks (Raw Data)",
      desc: "Histórico completo em planilha de todas as avaliações e tags coletadas dos turistas.",
      format: "CSV",
      size: "820 KB"
    },
    {
      id: "xml-prestacao-contas",
      title: "Demonstrativo para Prestação de Contas (IBGE/Federal)",
      desc: "Arquivo estruturado com fluxo de visitantes e investimentos locais para justificativa de fundos.",
      format: "XML",
      size: "140 KB"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Relatórios e Prestação de Contas</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Exportação de dados estruturados para prefeituras e órgãos federais.
            </p>
          </div>
          <Badge variant="primary" size="md">Dados atualizados hoje</Badge>
        </div>

        {/* Report List */}
        <div className="space-y-4">
          {reportFiles.map((f) => (
            <Card key={f.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 text-left">
                <div className="p-3 bg-[var(--color-primary-soft)] rounded-xl text-[var(--color-primary)] flex-shrink-0 mt-0.5">
                  {f.format === "CSV" ? (
                    <FileSpreadsheet className="w-6 h-6" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[var(--color-text)] leading-snug">{f.title}</h3>
                    <Badge variant={f.format === "PDF" ? "info" : f.format === "CSV" ? "success" : "warning"} size="sm">
                      {f.format}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
                    {f.desc}
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold">Tamanho: {f.size}</span>
                </div>
              </div>

              <Button
                onClick={() => triggerDownload(f.id)}
                disabled={downloading !== null}
                size="sm"
                variant="secondary"
              >
                {downloading === f.id ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Baixando...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </span>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Compliance Card */}
        <Card className="p-6 bg-green-500/5 border border-green-500/20 text-left space-y-4">
          <div className="flex items-center gap-2 text-green-400 font-extrabold text-xs uppercase tracking-wider">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Auditoria Cadastur & Sustentabilidade Legal</span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Todos os relatórios gerados pelo DunasTech cumprem com a regulamentação municipal e as diretrizes do Ministério do Turismo. A priorização exclusiva de parceiros formalizados no **Cadastur** garante a integridade legal da amostragem estatística.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}
