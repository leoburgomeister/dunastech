"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Smartphone,
  BarChart3,
  Check,
  Star,
  Maximize2,
  Minimize2,
  ChevronDown,
  MessageSquare,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { PotiLogo } from "@/components/ui/PotiLogo";

// Utility function to merge classes safely
const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export default function PitchPage() {
  // Navigation State (6 slides)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompter, setShowPrompter] = useState(true);

  // Timer State (3-minute pitch pacer)
  const [timeLeft, setTimeLeft] = useState(180); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // B2C Simulator State
  const [viewMode, setViewMode] = useState<"turista" | "governo">("turista");
  const [simulatorTab, setSimulatorTab] = useState<"route" | "evaluate">("route");
  const [simulatedDest, setSimulatedDest] = useState("Praia da Pipa");
  const [routeCategory, setRouteCategory] = useState<"sol" | "aventura" | "gastronomia">("sol");
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);
  const [simulatedRating, setSimulatedRating] = useState(5);
  const [simulatedCriteria, setSimulatedCriteria] = useState<Record<string, boolean>>({
    limpo: true,
    preservado: true,
    seguranca: true
  });
  const [simulatedComment, setSimulatedComment] = useState("");
  const [simulatedSubmitted, setSimulatedSubmitted] = useState(false);
  const [simulatedCadasturIrregular, setSimulatedCadasturIrregular] = useState(false);

  // B2G Simulator State
  const [dashboardDest, setDashboardDest] = useState("Ponta Negra");

  // Actor Ecosystem State
  const [activeActorTab, setActiveActorTab] = useState("tourist");

  // Cadastur Notification simulation
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // Path-based locale detection (deferred to avoid SSR hydration mismatch)
  const [locale, setLocale] = useState("pt-BR");
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const path = window.location.pathname;
      if (path.includes("/en")) {
        setLocale("en");
      } else if (path.includes("/es")) {
        setLocale("es");
      }
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const dict: Record<string, Record<string, string>> = {
    "pt-BR": {
      back: "Voltar ao App",
      prompter: "Prompter",
      fullscreen: "Tela Cheia",
      timer: "Timer",
      spaceToAdvance: "Aperte ESPAÇO para avançar",
      presenterScript: "Roteiro do Apresentador (3 Minutos)"
    },
    "en": {
      back: "Back to App",
      prompter: "Script",
      fullscreen: "Fullscreen",
      timer: "Timer",
      spaceToAdvance: "Press SPACE to advance",
      presenterScript: "Presenter Script (3 Minutes)"
    },
    "es": {
      back: "Volver a la App",
      prompter: "Guión",
      fullscreen: "Pantalla Completa",
      timer: "Cronómetro",
      spaceToAdvance: "Presiona ESPACIO para avanzar",
      presenterScript: "Guión del Presentador (3 Minutos)"
    }
  };

  const t = (key: string) => dict[locale]?.[key] || dict["pt-BR"][key];

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Navigate to slide
  function navigateToSlide(index: number) {
    if (index >= 0 && index < 6) {
      sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
      setCurrentSlide(index);
    }
  }

  // Keyboard navigation (6 slides)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable"))
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        navigateToSlide((currentSlide + 1) % 6);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateToSlide((currentSlide - 1 + 6) % 6);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  // Intersection Observer for scroll snapping
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-slide-index"));
          if (!isNaN(index)) {
            setCurrentSlide(index);
          }
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Mock data for B2G Dashboard Simulator Chart
  const chartData = [
    { name: "Praia da Pipa", isa: 79, saturacao: 76 },
    { name: "Ponta Negra", isa: 42, saturacao: 88 },
    { name: "Genipabu", isa: 68, saturacao: 62 },
    { name: "Gostoso", isa: 86, saturacao: 48 },
    { name: "Maracajaú", isa: 70, saturacao: 54 }
  ];

  // AI Insights definitions
  const aiInsightsMap: Record<string, { alert: boolean; text: string; saturated: number; isa: number }> = {
    "Ponta Negra": {
      alert: true,
      saturated: 88,
      isa: 42,
      text: "Atenção: Aumento de 42% no fluxo turístico. Avaliações de turistas indicam queda no ISA para 42 (morro do careca). Necessidade urgente de equipe extra de zeladoria."
    },
    "Praia da Pipa": {
      alert: false,
      saturated: 76,
      isa: 79,
      text: "Estável: Saturação em 76% e ISA de 79. Preservação ecológica em alta conformidade. Recomendado reforçar sinalização Cadastur no acesso às falésias."
    },
    "São Miguel do Gostoso": {
      alert: false,
      saturated: 48,
      isa: 86,
      text: "Excelente: ISA de 86. Baixa saturação (48%) e alta percepção de segurança. Oportunidade: Destacar destino em campanhas estaduais de turismo sustentável."
    }
  };

  // Roteiro do apresentador (3 min) — alinhado ao pitch desenvolvido para o CONETUR.
  // Um bloco por slide. Números de mercado a conferir em fonte primária antes do palco.
  const prompterScripts = [
    // Slide 0 — Abertura (0:00–0:25)
    "Secretário, conselheiros: o turismo é cerca de 76% do PIB e 75% do ICMS do Rio Grande do Norte. E hoje se decide sobre essa força olhando pelo retrovisor — dados que chegam meses depois, dispersos em planilhas. Somos a DunasTech, e criamos o POTI: a Plataforma de Observação do Turismo Inteligente.",
    // Slide 1 — O Desafio (0:25–0:55)
    "O turismo gera dados todos os dias; o desafio é transformá-los em decisão. Aqui, ele é 76% do PIB de serviços, 75% do ICMS e 73% dos empregos formais — mas a secretaria que administra isso opera com poucos servidores e sem um turismólogo dedicado a dados. E o momento é único: só entre janeiro e maio de 2026 foram 34.815 turistas internacionais, mais que todo o ano de 2025, com cerca de R$ 1,7 bilhão injetados na alta estação. Fluxo sem controle destrói o atrativo.",
    // Slide 2 — A Solução + ISA (0:55–1:40)
    "O POTI é uma camada de inteligência com duas faces sobre o mesmo dado. Para o turista: um assistente que monta o roteiro do dia em menos de 15 minutos, recomendando só prestadores regularizados no Cadastur. Para o governo: um observatório preditivo. O coração é o ISA — Índice de Saúde do Atrativo: limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação e lotação. Em tempo real, o gestor vê qual atrativo está adoecendo antes de virar crise. E não é maquete: já consumimos dados reais de Cadastur, IBGE e dos destinos dos três polos.",
    // Slide 3 — Ecossistema (1:40–2:05)
    "Um ecossistema com quatro atores. O turista vira sensor vivo de zeladoria. O gestor público enxerga o ISA e recebe alertas preditivos. O trade local regularizado ganha uma vitrine auditável — incentivo direto à formalização. E o console técnico garante segurança e conformidade com a LGPD, com as interações do turista anonimizadas antes de qualquer agregação.",
    // Slide 4 — Sustentabilidade + Impacto (2:05–2:35)
    "O modelo se sustenta em três canais: roteiros B2C gratuitos, destaque por CPC para o trade credenciado no Cadastur, e assinatura SaaS para o governo. E o impacto territorial é claro: ajudamos o estado a distribuir o fluxo para o interior — nossa meta é aumentar em 30% os roteiros para fora da Costa das Dunas — e a formalizar o setor, porque só quem está no Cadastur é recomendado.",
    // Slide 5 — Pedido + Fecho (2:35–3:00)
    "Não viemos pedir cheque. Viemos propor uma parceria de dados: acesso às bases oficiais e um piloto com a Secretaria de Turismo. Em troca, o estado ganha um observatório vivo do próprio turismo, sem depender de consultoria externa. POTI, da DunasTech: transformamos o turismo do RN de intuição em inteligência. Muito obrigado."
  ];

  // Custom tooltip style for charts
  const tooltipStyle = {
    backgroundColor: "#0E3B3F",
    border: "1px solid rgba(76, 179, 182, 0.2)",
    borderRadius: "12px",
    fontSize: "11px",
    color: "#F7F4EE",
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F7F4EE] theme-gestao font-sans text-[#0E2325]">
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-50 h-14 bg-[#0E3B3F] border-b border-[#0F6B6D]/40 px-4 flex items-center justify-between text-[#CDE6E6] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="../gestao"
            className="flex items-center gap-1.5 text-xs font-bold hover:text-[#F7F4EE] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Link>
          <div className="h-4 w-px bg-[#0F6B6D]/45" />
          <div className="flex items-center gap-2">
            <PotiLogo className="h-6 w-6" />
            <span className="text-xs font-black tracking-widest text-[#F7F4EE]">POTI RN PITCH</span>
          </div>
        </div>

        {/* Presentation Controls */}
        <div className="flex items-center gap-3.5">
          {/* 3-Minute Timer */}
          <div className="flex items-center gap-2 bg-[#092426] px-2.5 py-1 rounded-lg border border-[#0F6B6D]/30 text-xs font-bold font-mono">
            <Clock className={cn("w-3.5 h-3.5", isTimerRunning ? "text-[#4CB3B6] animate-pulse" : "text-[#7E9798]")} />
            <span className={timeLeft <= 30 && timeLeft > 0 ? "text-red-400 animate-pulse" : "text-[#F7F4EE]"}>
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[#4CB3B6] hover:text-[#F7F4EE] transition-colors ml-1 cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimeLeft(180);
              }}
              className="text-[#7E9798] hover:text-[#F7F4EE] transition-colors ml-1 cursor-pointer"
              title="Reiniciar"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#0F6B6D]/45" />

          {/* Toggle Script */}
          <button
            onClick={() => setShowPrompter(!showPrompter)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer",
              showPrompter ? "bg-[#4CB3B6] text-[#0E3B3F] font-black" : "text-[#7E9798] border border-[#0F6B6D]/40 hover:bg-[#0F6B6D]/30"
            )}
          >
            {t('prompter')}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 hover:text-[#F7F4EE] text-[#7E9798] rounded-lg transition-colors cursor-pointer"
            title={t('fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Slides Scrollable Viewport */}
      <main className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#F7F4EE]">
        
        {/* SLIDE 0: PÁGINA DE ROSTO (COVER PAGE) */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-slide-index="0"
          className="h-full w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12 text-[#F7F4EE]"
          style={{
            background: "linear-gradient(135deg, #0E3B3F 0%, #092426 50%, #06181A 100%)",
          }}
        >
          {/* Data connections animation backgrounds */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-[#4CB3B6]/15 to-[#D4A017]/5 blur-[120px] pointer-events-none animate-pulse" />
          
          <div className="max-w-4xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSlide === 0 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              className="flex justify-center mb-2"
            >
              <PotiLogo className="h-24 w-24 bg-[#0E3B3F]/40 p-4 rounded-3xl border border-[#0F6B6D]/50 shadow-2xl" />
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black tracking-tight leading-none"
              >
                Poti RN <span className="text-[#D4A017]">Gestão</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-lg text-[#CDE6E6] font-bold uppercase tracking-widest max-w-2xl mx-auto border-y border-[#0F6B6D]/40 py-2.5"
              >
                Inteligência Turística para Decisões Estratégicas
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#7E9798] text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed"
            >
              Monitore indicadores, acompanhe tendências e transforme dados em ações para desenvolver o turismo do Rio Grande do Norte.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => navigateToSlide(2)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#4CB3B6] hover:bg-[#63C7C9] text-[#0E3B3F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#4CB3B6]/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Explorar Indicadores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateToSlide(3)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-transparent border border-[#0F6B6D] hover:bg-[#0F6B6D]/20 text-[#F7F4EE] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Ver Painel Executivo</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center pt-8 text-[#7E9798] animate-bounce"
            >
              <div className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold">
                <span>Role para baixo ou aperte ESPAÇO</span>
                <ChevronDown className="w-4 h-4 text-[#D4A017]" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* SLIDE 1: A PROVOCAÇÃO */}
        <section
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-slide-index="1"
          className="h-full w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #F7F4EE 0%, #EBE8DE 100%)",
          }}
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,107,109,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,107,109,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          <div className="max-w-4xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={currentSlide === 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E3B3F]/10 border border-[#0E3B3F]/25 text-[#0E3B3F] text-xs font-black uppercase tracking-wider"
            >
              <Users className="w-3.5 h-3.5 text-[#0F6B6D]" />
              <span>01. O DESAFIO DO CRESCIMENTO</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-[#0E2325] tracking-tight leading-tight"
            >
              &ldquo;O turismo gera dados todos os dias. <br />
              <span className="text-[#0F6B6D]">O desafio é transformá-los em decisões.&rdquo;</span>
            </motion.h2>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { val: "76%", label: "do PIB do setor de Serviços no RN" },
                { val: "75%", label: "da arrecadação de ICMS estadual" },
                { val: "73%", label: "dos empregos formais gerados" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="bg-white border border-[#E3DDD0] rounded-xl p-5 text-center shadow-sm"
                >
                  <span className="text-3xl sm:text-4xl font-black text-[#0E3B3F] block">{stat.val}</span>
                  <span className="text-[11px] text-[#3D595B] font-bold tracking-tight block mt-1 leading-snug">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Critical insight banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-4 bg-[#FCF6E5] border border-[#D4A017]/35 rounded-xl text-center max-w-2xl mx-auto shadow-sm"
            >
              <p className="text-xs sm:text-sm font-semibold text-[#0E2325] leading-relaxed">
                ⚠️ O turismo é o principal motor econômico potiguar. Mas a gestão governamental opera no escuro, sem indicadores integrados em tempo real. <strong className="text-[#C2410C]">Fluxo sem controle ameaça a sustentabilidade dos destinos.</strong>
              </p>
            </motion.div>
          </div>
        </section>

        {/* SLIDE 2: A SOLUÇÃO (B2C & B2G Simulators) */}
        <section
          ref={(el) => { sectionRefs.current[2] = el; }}
          data-slide-index="2"
          className="h-full w-full snap-start relative flex items-center justify-center overflow-hidden p-4 sm:p-12 transition-all duration-700"
          style={{
            background: "linear-gradient(135deg, #F7F4EE 0%, #EBE8DE 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center z-10">
            {/* Left Column: Solution introduction */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E3B3F]/10 border border-[#0E3B3F]/25 text-[#0E3B3F] text-xs font-black uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F6B6D]" />
                <span>02. SOLUÇÃO INTEGRADA</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-4xl font-black text-[#0E2325] tracking-tight leading-tight"
              >
                Dados que conectam. <br />
                <span className="text-[#0F6B6D]">Gestão que transforma.</span>
              </motion.h2>

              <p className="text-[#3D595B] text-xs sm:text-sm leading-relaxed font-semibold">
                O Poti RN Gestão conecta os dois mundos: a jornada sensorial do turista e a tomada de decisão inteligente do gestor público, baseada no **Índice de Saúde do Atrativo (ISA)**.
              </p>

              {/* ISA spotlight box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl border border-[#4CB3B6]/30 bg-white/70 shadow-sm relative overflow-hidden"
              >
                <div className="absolute -right-3 -top-5 text-[64px] font-black text-[#4CB3B6]/5 select-none pointer-events-none">
                  ISA
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4CB3B6]/10 border border-[#4CB3B6]/20 text-[#0F6B6D] text-[9px] font-black uppercase tracking-wider mb-2">
                  ★ Indicador Central
                </div>
                <h3 className="text-xs font-extrabold text-[#0E2325] mb-1">Índice de Saúde do Atrativo (ISA)</h3>
                <p className="text-[11px] text-[#3D595B] leading-relaxed mb-3">
                  Score de 0 a 100 ponderando reclamações de turistas, ocupação de hotéis, saturação geográfica de visitantes e regularidade do comércio local.
                </p>
                <div className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-[#E3DDD0]">
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black text-[#C2410C] leading-none">42</span>
                    <span className="text-[8px] text-[#7E9798] font-bold uppercase mt-1">/100 · Ponta Negra</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[8px] text-[#C2410C] font-extrabold tracking-wider mb-1">⚠️ ATENÇÃO EXTREMA</div>
                    <div className="h-1.5 bg-[#E3DDD0] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#C2410C] to-[#D4A017]" style={{ width: "42%" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Phone Simulator */}
            <div className="lg:col-span-7 flex flex-col items-center gap-3">
              {/* Profile Toggle Switch */}
              <div className="bg-white/95 p-1 rounded-xl flex gap-1.5 border border-[#E3DDD0] shadow-sm z-20">
                <button
                  onClick={() => setViewMode("turista")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1",
                    viewMode === "turista"
                      ? "bg-[#0E3B3F] text-white shadow-sm"
                      : "text-[#3D595B] hover:text-[#0E2325]"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Turista (Explorador)
                </button>
                <button
                  onClick={() => setViewMode("governo")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1",
                    viewMode === "governo"
                      ? "bg-[#0E3B3F] text-white shadow-sm"
                      : "text-[#3D595B] hover:text-[#0E2325]"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Governo (Gestão)
                </button>
              </div>

              {/* RENDER VIEW MODE: TURISTA */}
              {viewMode === "turista" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-[280px] h-[450px] rounded-[36px] border-4 border-[#0E3B3F] bg-white shadow-2xl relative flex flex-col p-3 overflow-hidden"
                >
                  {/* Phone camera notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0E3B3F] rounded-b-xl z-20" />

                  {/* Simulator inner tabs */}
                  <div className="flex bg-[#F7F4EE] p-0.5 rounded-lg border border-[#E3DDD0] mb-2 z-10 shrink-0 mt-2">
                    <button
                      onClick={() => {
                        setSimulatorTab("route");
                        setSimulatedSubmitted(false);
                      }}
                      className={cn(
                        "flex-1 py-1 rounded-md text-[9px] font-black transition-colors cursor-pointer",
                        simulatorTab === "route" ? "bg-white text-[#0E3B3F] shadow-sm" : "text-[#7E9798]"
                      )}
                    >
                      🗺️ Rotas IA
                    </button>
                    <button
                      onClick={() => setSimulatorTab("evaluate")}
                      className={cn(
                        "flex-1 py-1 rounded-md text-[9px] font-black transition-colors cursor-pointer",
                        simulatorTab === "evaluate" ? "bg-white text-[#0E3B3F] shadow-sm" : "text-[#7E9798]"
                      )}
                    >
                      ✍️ Avaliar
                    </button>
                  </div>

                  {/* Smartphone Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-0.5 pt-1 text-left space-y-3">
                    {simulatorTab === "route" && (
                      <div className="space-y-3.5">
                        {!routeGenerated ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-[#7E9798] uppercase tracking-wider">Destino Principal</label>
                              <select
                                value={simulatedDest}
                                onChange={(e) => setSimulatedDest(e.target.value)}
                                className="w-full text-[10px] p-2 rounded-lg bg-[#F7F4EE] border border-[#E3DDD0] text-[#0E2325] font-bold focus:outline-none focus:border-[#0E3B3F]"
                              >
                                <option value="Praia da Pipa">Pipa (Tibau do Sul)</option>
                                <option value="Ponta Negra">Ponta Negra (Natal)</option>
                                <option value="São Miguel do Gostoso">São Miguel do Gostoso</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-[#7E9798] uppercase tracking-wider block font-bold">Estilo de Viagem</label>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { id: "sol", label: "☀️ Sol" },
                                  { id: "aventura", label: "🏄 Dunas" },
                                  { id: "gastronomia", label: "🍽️ Peixe" }
                                ].map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setRouteCategory(cat.id as "sol" | "aventura" | "gastronomia")}
                                    className={cn(
                                      "py-1 rounded-md text-[9px] font-bold border transition-all cursor-pointer",
                                      routeCategory === cat.id
                                        ? "bg-[#0E3B3F] border-[#0E3B3F] text-white"
                                        : "bg-[#F7F4EE] border-[#E3DDD0] text-[#3D595B]"
                                    )}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-[#FCF6E5] border border-[#D4A017]/30 rounded-lg">
                              <span className="text-[8px] font-bold text-[#0E2325]">Forçar Operador Irregular</span>
                              <button
                                type="button"
                                onClick={() => setSimulatedCadasturIrregular(!simulatedCadasturIrregular)}
                                className={cn(
                                  "w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer relative",
                                  simulatedCadasturIrregular ? "bg-[#C2410C]" : "bg-[#7E9798]"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-3 h-3 bg-white rounded-full transition-all shadow-sm absolute top-0.5",
                                    simulatedCadasturIrregular ? "right-1" : "left-1"
                                  )}
                                />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={generatingRoute}
                              onClick={() => {
                                setGeneratingRoute(true);
                                setTimeout(() => {
                                  setGeneratingRoute(false);
                                  setRouteGenerated(true);
                                }, 1000);
                              }}
                              className="w-full py-2 rounded-lg bg-[#0E3B3F] hover:bg-[#0F6B6D] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                            >
                              {generatingRoute ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                                  <span>Gerar Rota com IA</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3.5 animate-scale-in text-xs">
                            <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-1.5">
                              <span className="text-[9px] font-black text-[#0F6B6D] uppercase">🗺️ Rota IA Sugerida</span>
                              <button
                                onClick={() => setRouteGenerated(false)}
                                className="text-[8px] text-[#0E3B3F] underline font-bold"
                              >
                                Nova Rota
                              </button>
                            </div>
                            
                            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E3DDD0]">
                              {/* Item 1 */}
                              <div className="flex gap-2 relative z-10 items-start">
                                <div className="w-6 h-6 rounded-full bg-[#0E3B3F] text-white flex items-center justify-center text-[9px] font-black shrink-0 border border-[#0E3B3F]/20">1</div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black text-[#0E2325] block">Hospedagem Recomendada</span>
                                  <p className="text-[8px] text-[#7E9798] leading-tight">Pousada Canto Potiguar</p>
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[6px] font-semibold bg-[#EBF7F7] border border-[#0F6B6D]/20 text-[#0F6B6D]">
                                    🛡️ Cadastur Ativo
                                  </span>
                                </div>
                              </div>

                              {/* Item 2 */}
                              <div className="flex gap-2 relative z-10 items-start">
                                <div className="w-6 h-6 rounded-full bg-[#0E3B3F] text-white flex items-center justify-center text-[9px] font-black shrink-0 border border-[#0E3B3F]/20">2</div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black text-[#0E2325] block">Passeio Recomendado</span>
                                  <p className="text-[8px] text-[#7E9798] leading-tight">
                                    {routeCategory === "sol" && "Jangada no Mar de Pipa"}
                                    {routeCategory === "aventura" && "Buggy Ecológico nas Dunas"}
                                    {routeCategory === "gastronomia" && "Almoço Regional na Falésia"}
                                  </p>
                                  {simulatedCadasturIrregular ? (
                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[6px] font-semibold bg-[#FDF2E9] border border-[#C2410C]/20 text-[#C2410C] animate-pulse">
                                      ⚠️ Sem Cadastur
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[6px] font-semibold bg-[#EBF7F7] border border-[#0F6B6D]/20 text-[#0F6B6D]">
                                      🛡️ Cadastur Ativo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {simulatorTab === "evaluate" && (
                      <div className="space-y-3 text-[10px]">
                        {!simulatedSubmitted ? (
                          <div className="space-y-3">
                            <span className="text-[8px] font-black text-[#7E9798] uppercase block border-b border-[#E3DDD0] pb-1">Zeladoria Cidadã</span>
                            <div className="flex items-center gap-1.5 my-1 justify-center bg-[#F7F4EE] p-1.5 rounded-lg border border-[#E3DDD0]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setSimulatedRating(star)}
                                  className="cursor-pointer"
                                >
                                  <Star className={cn("w-4.5 h-4.5", star <= simulatedRating ? "text-[#D4A017] fill-[#D4A017]" : "text-[#7E9798]")} />
                                </button>
                              ))}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[#7E9798] uppercase tracking-wider block">O que você observou no local?</label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: "limpo", label: "🧹 Limpeza" },
                                  { id: "preservado", label: "🌿 Preservação" },
                                  { id: "seguranca", label: "🔒 Segurança" },
                                  { id: "superlotado", label: "🚫 Superlotado" }
                                ].map((crit) => {
                                  const checked = simulatedCriteria[crit.id] || false;
                                  return (
                                    <button
                                      key={crit.id}
                                      type="button"
                                      onClick={() => setSimulatedCriteria({ ...simulatedCriteria, [crit.id]: !checked })}
                                      className={cn(
                                        "py-1 px-2 rounded-lg border transition-all text-center font-bold text-[8px]",
                                        checked
                                          ? crit.id === "superlotado"
                                            ? "bg-[#FDF2E9] border-[#C2410C]/40 text-[#C2410C]"
                                            : "bg-[#EBF7F7] border-[#0F6B6D]/40 text-[#0F6B6D]"
                                          : "bg-white border-[#E3DDD0] text-[#3D595B]"
                                      )}
                                    >
                                      {crit.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <textarea
                              placeholder="Quer registrar algum comentário?"
                              value={simulatedComment}
                              onChange={(e) => setSimulatedComment(e.target.value)}
                              className="w-full text-[9px] p-2 rounded-lg bg-[#F7F4EE] border border-[#E3DDD0] text-[#0E2325] focus:outline-none focus:border-[#0E3B3F] h-12 resize-none"
                            />

                            <button
                              type="button"
                              onClick={() => setSimulatedSubmitted(true)}
                              className="w-full py-2 rounded-lg bg-[#0E3B3F] hover:bg-[#0F6B6D] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer text-[9px]"
                            >
                              Enviar Feedback
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-8 space-y-3 animate-scale-in">
                            <div className="w-12 h-12 bg-[#EBF7F7] border border-[#0F6B6D]/20 rounded-full flex items-center justify-center mx-auto text-[#0F6B6D]">
                              <Check className="w-6 h-6" />
                            </div>
                            <h4 className="text-[11px] font-black text-[#0E2325]">Obrigado por sua voz!</h4>
                            <p className="text-[9px] text-[#7E9798] leading-relaxed px-4">
                              Seus dados foram integrados em tempo real ao score do destino no observatório.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSimulatedSubmitted(false);
                                setSimulatedComment("");
                              }}
                              className="text-[8px] text-[#0E3B3F] underline font-bold"
                            >
                              Enviar outra avaliação
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* RENDER VIEW MODE: GESTÃO GOVERNO */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-[380px] h-[450px] bg-[#0E3B3F] rounded-[24px] border-4 border-[#0E3B3F] shadow-2xl p-4 flex flex-col justify-between overflow-hidden text-[#F7F4EE]"
                >
                  <div className="flex items-center justify-between border-b border-[#0F6B6D]/45 pb-2 text-[10px]">
                    <div className="flex items-center gap-1">
                      <PotiLogo className="h-5 w-5" />
                      <span className="font-black text-[#F7F4EE]">POTI GESTÃO</span>
                    </div>
                    <div className="flex gap-1">
                      {["Ponta Negra", "Praia da Pipa", "São Miguel do Gostoso"].map((dest) => (
                        <button
                          key={dest}
                          onClick={() => setDashboardDest(dest)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer",
                            dashboardDest === dest
                              ? "bg-[#4CB3B6] border-[#4CB3B6] text-[#0E3B3F]"
                              : "bg-[#092426] border-[#0F6B6D]/40 text-[#CDE6E6]"
                          )}
                        >
                          {dest.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2 text-[9px]">
                    <div className="bg-[#092426] border border-[#0F6B6D]/40 rounded-xl p-2 text-left relative overflow-hidden">
                      <span className="text-[#7E9798] uppercase text-[7px] font-bold block">Score ISA</span>
                      <span className={cn("text-base font-black block my-0.5", aiInsightsMap[dashboardDest].isa < 60 ? "text-red-400" : "text-[#D4A017]")}>
                        {aiInsightsMap[dashboardDest].isa}/100
                      </span>
                    </div>
                    <div className="bg-[#092426] border border-[#0F6B6D]/40 rounded-xl p-2 text-left relative overflow-hidden">
                      <span className="text-[#7E9798] uppercase text-[7px] font-bold block">Saturação</span>
                      <span className="text-base font-black text-[#4CB3B6] block my-0.5">
                        {aiInsightsMap[dashboardDest].saturated}%
                      </span>
                    </div>
                    <div className="bg-[#092426] border border-[#0F6B6D]/40 rounded-xl p-2 text-left relative overflow-hidden">
                      <span className="text-[#7E9798] uppercase text-[7px] font-bold block">Cadastur</span>
                      <span className="text-base font-black text-green-400 block my-0.5">
                        94.2%
                      </span>
                    </div>
                  </div>

                  {/* Recharts Mini Dashboard Chart */}
                  <div className="h-28 bg-[#092426] border border-[#0F6B6D]/40 rounded-xl p-1.5 flex flex-col justify-between">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: -25 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="rgba(76, 179, 182, 0.08)" />
                        <XAxis dataKey="name" tick={{ fontSize: 7, fill: "#7E9798" }} />
                        <YAxis tick={{ fontSize: 7, fill: "#7E9798" }} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="isa" name="ISA" radius={[2, 2, 0, 0]}>
                          {chartData.map((entry, index) => {
                            const isAlert = entry.isa < 60;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={isAlert ? "#ef4444" : "#D4A017"}
                              />
                            );
                          })}
                        </Bar>
                        <Bar dataKey="saturacao" name="Saturação" fill="#4CB3B6" opacity={0.25} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* AI Diagnostic Text Box */}
                  <div className="bg-[#092426] border border-[#4CB3B6]/20 rounded-xl p-2.5 text-left text-[9px] leading-relaxed my-2 relative">
                    <div className="flex items-center gap-1 text-[8px] font-black text-[#D4A017] uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3 text-[#D4A017] animate-pulse" />
                      <span>Alerta PotiIA</span>
                    </div>
                    <p className="text-[#CDE6E6] font-semibold italic leading-tight">
                      &ldquo;{aiInsightsMap[dashboardDest].text}&rdquo;
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* SLIDE 3: O ECOSSISTEMA DE ATORES */}
        <section
          ref={(el) => { sectionRefs.current[3] = el; }}
          data-slide-index="3"
          className="h-full w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #F7F4EE 0%, #EBE8DE 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
            <div className="lg:col-span-5 space-y-5 text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={currentSlide === 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E3B3F]/10 border border-[#0E3B3F]/25 text-[#0E3B3F] text-xs font-black uppercase tracking-wider"
              >
                <Users className="w-4 h-4 text-[#0F6B6D]" />
                <span>03. ECOSSISTEMA DO TERRITÓRIO</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl font-black text-[#0E2325] tracking-tight leading-none"
              >
                Zeladoria, Sustentabilidade <br />
                <span className="text-[#0F6B6D]">& Negócios Locais</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={currentSlide === 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#3D595B] text-xs sm:text-sm leading-relaxed font-semibold"
              >
                Integramos todos os envolvidos no turismo. O turista vira o fiscal da preservação, e o trade turístico formalizado ganha inteligência comercial direta.
              </motion.p>

              {/* Actors Tabs Selectors */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { id: "tourist", label: "👤 Turista & Local", desc: "Zeladoria e rotas IA" },
                  { id: "prefeitura", label: "🏛️ Gestor Público", desc: "Dashboard e ISA" },
                  { id: "entrepreneur", label: "💼 Empreendedor", desc: "Vitrine e Cadastur" },
                  { id: "admin", label: "🛠️ Admin Técnico", desc: "Logs e Segurança" }
                ].map((actor) => (
                  <button
                    key={actor.id}
                    onClick={() => setActiveActorTab(actor.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[68px] relative overflow-hidden group select-none shadow-sm",
                      activeActorTab === actor.id
                        ? "bg-[#0E3B3F] border-[#0E3B3F] text-white"
                        : "bg-white border-[#E3DDD0] text-[#3D595B] hover:border-[#0F6B6D] hover:bg-white"
                    )}
                  >
                    <span className="font-extrabold text-[11px] leading-tight block">{actor.label}</span>
                    <span className={cn("text-[9px] line-clamp-1 block mt-0.5 leading-normal", activeActorTab === actor.id ? "text-[#CDE6E6]" : "text-[#7E9798]")}>{actor.desc}</span>
                    {activeActorTab === actor.id && (
                      <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: High Fidelity Mockups Container */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={currentSlide === 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white border border-[#E3DDD0] rounded-2xl p-5 shadow-md min-h-[360px] flex flex-col justify-between text-left"
              >
                <AnimatePresence mode="wait">
                  {activeActorTab === "tourist" && (
                    <motion.div
                      key="tourist-mock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between text-[#0E2325]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-2">
                          <span className="text-xs font-black text-[#0E3B3F] uppercase tracking-wider">Perfil: Turista & Cidadão</span>
                          <span className="text-[10px] font-bold text-[#0F6B6D] bg-[#EBF7F7] px-2 py-0.5 rounded-full">B2C</span>
                        </div>
                        <h4 className="text-base font-black">Co-criador do Destino Sustentável</h4>
                        <p className="text-xs text-[#3D595B] leading-relaxed font-semibold">
                          Ao viajar pelo RN, o visitante acessa rotas sugeridas por IA, recebe ofertas integradas com o trade local e atua ativamente relatando problemas de infraestrutura ou limpeza na orla.
                        </p>
                        
                        <div className="bg-[#F7F4EE] border border-[#E3DDD0] rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span>📍 Relato: Lixo na praia (Pipa)</span>
                            <span className="text-[#C2410C]">Pendente</span>
                          </div>
                          <p className="text-[10px] text-[#7E9798]">Enviado hoje às 12:43 por Leo B. com geolocalização exata.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#EBF7F7] border border-[#0F6B6D]/20 rounded-xl text-[10px] text-[#0F6B6D] font-bold leading-normal mt-2 flex items-start gap-1.5">
                        <span>💡</span>
                        <span>Diferencial: O turista deixa de ser apenas consumidor e passa a atuar como sensor vivo de zeladoria urbana.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeActorTab === "prefeitura" && (
                    <motion.div
                      key="prefeitura-mock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between text-[#0E2325]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-2">
                          <span className="text-xs font-black text-[#0E3B3F] uppercase tracking-wider">Perfil: Gestor Público</span>
                          <span className="text-[10px] font-bold text-[#D4A017] bg-[#FCF6E5] px-2 py-0.5 rounded-full font-black">B2G SaaS</span>
                        </div>
                        <h4 className="text-base font-black">Centro de Inteligência Turística</h4>
                        <p className="text-xs text-[#3D595B] leading-relaxed font-semibold">
                          Permite que secretarias e órgãos estaduais analisem indicadores integrados, recebam diagnósticos gerados por IA e direcionem investimentos nas praias com problemas de infraestrutura.
                        </p>
                        
                        <div className="bg-[#0E3B3F] text-[#F7F4EE] rounded-xl p-3.5 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#0F6B6D]/45 pb-1 mb-1">
                            <span>🤖 DunasIA Insight</span>
                            <span className="text-[#D4A017]">Ação recomendada</span>
                          </div>
                          <p className="text-[9px] text-[#CDE6E6] leading-relaxed italic">
                            &ldquo;Taxa de insatisfação em Ponta Negra subiu 14% devido a resíduos na areia. Recomenda-se alocação emergencial de equipe de varredura.&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#FCF6E5] border border-[#D4A017]/20 rounded-xl text-[10px] text-[#D4A017] font-bold leading-normal mt-2 flex items-start gap-1.5 font-semibold">
                        <span>💡</span>
                        <span className="text-[#0E2325]">Diferencial: Painel centralizado que ajuda gestores públicos a transformarem reclamações brutas em ações de reparo urbano.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeActorTab === "entrepreneur" && (
                    <motion.div
                      key="entrepreneur-mock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between text-[#0E2325]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-2">
                          <span className="text-xs font-black text-[#0E3B3F] uppercase tracking-wider">Perfil: Empreendedor Local</span>
                          <span className="text-[10px] font-bold text-purple-650 bg-purple-50 px-2 py-0.5 rounded-full">B2B Freemium</span>
                        </div>
                        <h4 className="text-base font-black">Formalização Recompensada</h4>
                        <p className="text-xs text-[#3D595B] leading-relaxed font-semibold">
                          Hotéis, bugueiros e guias locais regularizados no Cadastur do Ministério do Turismo ganham destaque exclusivo nas rotas inteligentes geradas por IA, incentivando a legalidade tributária e sanitária.
                        </p>
                        
                        <div className="bg-white border border-[#E3DDD0] rounded-xl p-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-[#0F6B6D] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                            Cadastur Regular
                          </div>
                          <h5 className="text-xs font-black">Buggy Aventura Potiguar</h5>
                          <p className="text-[9px] text-[#7E9798]">Natal/RN · Credenciado Emprotur</p>
                          <div className="flex items-center justify-between text-[9px] text-[#3D595B] font-bold mt-2">
                            <span>⭐ 4.98 (120 avaliações)</span>
                            <span className="text-[#0F6B6D]">100% Conformidade</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-[#EBF7F7] border border-[#0F6B6D]/20 rounded-xl text-[10px] text-[#0F6B6D] font-bold leading-normal mt-2 flex items-start gap-1.5">
                        <span>💡</span>
                        <span>Diferencial: Criamos uma força centrípeta de regularização regulatória e fiscal (Cadastur) no trade local.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeActorTab === "admin" && (
                    <motion.div
                      key="admin-mock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 flex-1 flex flex-col justify-between text-[#0E2325]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-2">
                          <span className="text-xs font-black text-[#0E3B3F] uppercase tracking-wider">Console Técnico</span>
                          <span className="text-[10px] font-bold text-[#7E9798] bg-[#F7F4EE] px-2 py-0.5 rounded-full">SYS</span>
                        </div>
                        <h4 className="text-base font-black">Integridade de Dados & Segurança</h4>
                        <p className="text-xs text-[#3D595B] leading-relaxed font-semibold">
                          Monitora logs de auditoria, conexões com Supabase Auth, Firestore realtime listeners, e a conformidade com a LGPD e regulamentos estaduais.
                        </p>
                        
                        <div className="bg-[#092426] font-mono text-[9px] text-[#4CB3B6] rounded-xl p-3.5 space-y-1">
                          <p>LOG: [AUTH] Token JWT verificado para Gestor.</p>
                          <p>LOG: [FIRESTORE] Ouvinte ativo no canal feedbacks.</p>
                          <p>LOG: [API] Scraper Apify hashtags carregado.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#FDF2E9] border border-[#C2410C]/20 rounded-xl text-[10px] text-[#C2410C] font-bold leading-normal mt-2 flex items-start gap-1.5">
                        <span>💡</span>
                        <span>Diferencial: Auditoria contínua de segurança garante confiabilidade na base de dados governamentais.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SLIDE 4: SUSTENTABILIDADE FINANCEIRA E CADASTUR */}
        <section
          ref={(el) => { sectionRefs.current[4] = el; }}
          data-slide-index="4"
          className="h-full w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #F7F4EE 0%, #EBE8DE 100%)",
          }}
        >
          <div className="max-w-5xl w-full text-center space-y-6 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={currentSlide === 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E3B3F]/10 border border-[#0E3B3F]/25 text-[#0E3B3F] text-xs font-black uppercase tracking-wider"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0F6B6D]" />
              <span>04. SUSTENTABILIDADE FINANCEIRA & REGULARIDADE</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-[#0E2325] tracking-tight leading-none"
            >
              Três canais de receita. <br />
              <span className="text-[#0F6B6D]">Impacto territorial permanente.</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 max-w-4xl mx-auto items-stretch">
              {/* Card 1: B2C */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-[#E3DDD0] rounded-xl p-5 text-left flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#0F6B6D] font-black uppercase bg-[#EBF7F7] px-2 py-0.5 rounded-full">Turista (B2C)</span>
                    <span className="text-sm">👤</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0E2325]">Roteiros Inteligentes</h3>
                  <p className="text-[11px] text-[#3D595B] leading-relaxed">
                    Acesso a rotas personalizadas via IA e envio de feedbacks por WhatsApp de forma 100% gratuita. Recompensas digitais incentivam avaliações.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E3DDD0] text-[9px] text-[#0F6B6D] font-black uppercase tracking-wider">
                  Experiência Livre
                </div>
              </motion.div>

              {/* Card 2: B2B Freemium */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white border border-[#E3DDD0] rounded-xl p-5 text-left flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-purple-750 font-black uppercase bg-purple-50 px-2 py-0.5 rounded-full">Trade (B2B CPC)</span>
                    <span className="text-sm">💼</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0E2325]">Destaque por CPC</h3>
                  <p className="text-[11px] text-[#3D595B] leading-relaxed">
                    Negócios regularizados no Cadastur contam com vitrine gratuita. Podem patrocinar sua exibição em destaque nas rotas de turistas via CPC (Custo por Clique).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E3DDD0] text-[9px] text-purple-650 font-black uppercase tracking-wider">
                  CPC Freemium
                </div>
              </motion.div>

              {/* Card 3: SaaS B2G */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white border border-[#E3DDD0] rounded-xl p-5 text-left flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#D4A017] font-black uppercase bg-[#FCF6E5] px-2 py-0.5 rounded-full">Governo (B2G SaaS)</span>
                    <span className="text-sm">🏛️</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0E2325]">Assinatura Observatório</h3>
                  <p className="text-[11px] text-[#3D595B] leading-relaxed">
                    Prefeituras e órgãos do estado contratam licenças anuais do SaaS para monitorar zeladoria turística, obter diagnósticos ISA e planejar obras públicas.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E3DDD0] text-[9px] text-[#D4A017] font-black uppercase tracking-wider">
                  Licenciamento Anual
                </div>
              </motion.div>
            </div>

            {/* Cadastur alert banner simulator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 max-w-4xl mx-auto bg-[#FCF6E5] border border-[#D4A017]/35 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-left shadow-sm relative overflow-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-[#D4A017]/15 flex items-center justify-center text-[#D4A017] flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider mb-0.5">🏅 Força Cadastur — Regularização Preventiva</h4>
                <p className="text-xs text-[#0E2325] leading-relaxed font-semibold">
                  A plataforma detecta negócios que estão prestes a ter a certificação vencida e envia auto-notificações via WhatsApp/E-mail. Ajuda o microempreendedor a se regularizar antes de ser penalizado.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSendingNotification(true);
                    setTimeout(() => {
                      setSendingNotification(false);
                      setNotificationSent(true);
                    }, 1000);
                  }}
                  className="px-3.5 py-1.5 bg-[#0E3B3F] text-white hover:bg-[#0F6B6D] transition-colors rounded-lg font-black text-[9px] uppercase tracking-wider whitespace-nowrap cursor-pointer"
                >
                  {sendingNotification ? "Disparando..." : notificationSent ? "Notificação Enviada!" : "Simular Alerta"}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SLIDE 5: CONCLUSÃO */}
        <section
          ref={(el) => { sectionRefs.current[5] = el; }}
          data-slide-index="5"
          className="h-full w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12 text-[#F7F4EE]"
          style={{
            background: "linear-gradient(135deg, #0E3B3F 0%, #092426 50%, #06181A 100%)",
          }}
        >
          {/* Glowing backdrops */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-r from-[#4CB3B6]/15 to-[#D4A017]/10 blur-[130px] z-0 pointer-events-none" />

          <div className="max-w-3xl w-full text-center space-y-6 z-10 bg-[#0E3B3F]/40 backdrop-blur-md p-6 sm:p-10 rounded-2xl border border-[#0F6B6D]/40 shadow-2xl relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSlide === 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-[#0E3B3F] border border-[#0F6B6D]/50 flex items-center justify-center mx-auto shadow-xl"
            >
              <PotiLogo className="w-9 h-9" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight"
            >
              Poti RN <span className="text-[#D4A017]">Gestão</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 5 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-[#CDE6E6] max-w-xl mx-auto font-semibold leading-relaxed"
            >
              **Dados que conectam. Gestão que transforma. Turismo que cresce.**
            </motion.p>
            
            <p className="text-xs text-[#7E9798] max-w-lg mx-auto font-medium">
              Transformando dados dispersos em desenvolvimento turístico sustentável de longo prazo para o Rio Grande do Norte.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
            >
              <Link
                href="../gestao"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#4CB3B6] hover:bg-[#63C7C9] text-[#0E3B3F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#4CB3B6]/15 transition-all cursor-pointer pointer-events-auto shadow-md"
              >
                <span>Acessar Painel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="../"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-transparent border border-[#0F6B6D] text-white hover:bg-[#0F6B6D]/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer pointer-events-auto"
              >
                <span>Voltar ao App</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 5 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[9px] text-[#7E9798] pt-6 flex flex-col items-center gap-1 font-extrabold uppercase tracking-wider border-t border-[#0F6B6D]/30 mt-6"
            >
              <span>POTI · uma solução DunasTech · Hackathon do Sol 2026 · Natal/RN</span>
              <span>Inteligência Territorial Governamental</span>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 3. Floating Slide Navigation Dock (6 buttons) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0E3B3F]/95 border border-[#0F6B6D]/45 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-4 shadow-2xl text-[#CDE6E6]">
        <div className="flex gap-2">
          {[
            { label: "Abertura" },
            { label: "O Desafio" },
            { label: "A Solução" },
            { label: "Ecossistema" },
            { label: "Sustentabilidade" },
            { label: "Conclusão" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigateToSlide(i)}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all cursor-pointer",
                currentSlide === i
                  ? "bg-[#4CB3B6] border-[#4CB3B6] text-[#0E3B3F] font-bold shadow-md shadow-[#4CB3B6]/15 scale-105"
                  : "bg-[#092426] border-[#0F6B6D]/40 text-[#7E9798] hover:border-[#4CB3B6]/50 hover:text-[#F7F4EE]"
              )}
              title={item.label}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. Floating Presenter Prompter (Script Box) */}
      <AnimatePresence>
        {showPrompter && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 100, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1/2 z-40 w-[95%] max-w-xl bg-white border border-[#E3DDD0] rounded-2xl p-4 shadow-xl flex gap-3 text-left items-start"
          >
            <div className="p-2 bg-[#0E3B3F]/10 rounded-xl text-[#0E3B3F] flex-shrink-0 mt-0.5 border border-[#0E3B3F]/15">
              <MessageSquare className="w-5 h-5 text-[#0F6B6D] animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#0E3B3F] uppercase tracking-wider">{t('presenterScript')}</span>
                <span className="text-[9px] text-[#7E9798] font-bold uppercase">{t('spaceToAdvance')}</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-[#3D595B] font-semibold italic">
                {prompterScripts[currentSlide]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
