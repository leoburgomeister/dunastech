"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Zap,
  Building2,
  Globe,
  Users,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  BarChart3,
  Check,
  Star,
  Maximize2,
  Minimize2,
  ChevronDown,
  Lock,
  MessageSquare
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

// Helper helper function to merge classes without importing tailwind-merge if not needed
const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export default function PitchPage() {
  // Navigation State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompter, setShowPrompter] = useState(true);

  // Timer State (3-minute pitch pacer)
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // B2C Simulator State
  const [simulatedDest, setSimulatedDest] = useState("Praia da Pipa");
  const [simulatedRating, setSimulatedRating] = useState(4);
  const [simulatedCriteria, setSimulatedCriteria] = useState<Record<string, boolean>>({
    limpo: true,
    preservado: true,
    seguranca: true
  });
  const [simulatedComment, setSimulatedComment] = useState("");
  const [simulatedConformity, setSimulatedConformity] = useState<"yes" | "no">("yes");
  const [simulatedSubmitted, setSimulatedSubmitted] = useState(false);

  // B2G Simulator State
  const [dashboardDest, setDashboardDest] = useState("Ponta Negra");

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // 180 seconds countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is writing in input or textarea in B2C simulator
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable"))
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        navigateToSlide((currentSlide + 1) % 5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateToSlide((currentSlide - 1 + 5) % 5);
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

  const navigateToSlide = (index: number) => {
    if (index >= 0 && index < 5) {
      sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
      setCurrentSlide(index);
    }
  };

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

  // Check if fullscreen changed outside our button (like Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Mock data for B2G Dashboard Simulator Chart
  const chartData = [
    { name: "Pipa", isa: 79, saturacao: 76 },
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
      text: "Atenção: Aumento de 42% no fluxo turístico em Ponta Negra, mas as avaliações de turistas indicam queda acentuada no ISA para 42 (Necessidade urgente de limpeza e manutenção no Morro do Careca). Equipe extra de zeladoria recomendada imediatamente."
    },
    "Praia da Pipa": {
      alert: false,
      saturated: 76,
      isa: 79,
      text: "Estável: Saturação em 76% e ISA de 79. Preservação ecológica e saneamento básico em alta conformidade. Sugestão: Reforçar placas e sinalização de rotas Cadastur no acesso às falésias da Praia do Amor."
    },
    "São Miguel do Gostoso": {
      alert: false,
      saturated: 48,
      isa: 86,
      text: "Excelente: ISA saudável em 86. Baixa saturação (48%) e alta percepção de segurança/limpeza na orla. Oportunidade: Destacar destino em campanhas estaduais de turismo sustentável premium."
    }
  };

  // Prompter speech script for each slide (Storytelling)
  const prompterScripts = [
    "🎙️ Gancho do Pitch: 'O turismo não é apenas uma atividade no Rio Grande do Norte. Ele é o nosso motor. Hoje, os segmentos de Comércio, Serviços e Turismo representam 76% do PIB estadual, 75% da arrecadação de ICMS e 73% dos empregos formais. Mas esse motor está operando no escuro. Os dados estão espalhados em dezenas de fontes e painéis que só mostram o passado. Nós sabemos onde o turista está, mas o poder público não sabe como o destino está sendo cuidado.'",
    "🎙️ Roteiro da Solução: 'Para resolver isso, criamos a Dunas Tech: O primeiro Observatório Inteligente e Vivo do Turismo. Nossa jornada começa na palma da mão do usuário. Criamos um guia turístico inteligente que transforma o turista e o morador local em sensores distribuídos pelo território. Com apenas 3 cliques e opções de checkbox (como \"Local Limpo\", \"Bem Sinalizado\"), coletamos o sentimento real da ponta sem depender de textos longos.'",
    "🎙️ Roteiro do Diferencial: 'Essas avaliações em tempo real são enviadas para o nosso painel de gestão (B2G). Mas fomos além. Integrada à API do Instagram, nossa IA varre fotos e hashtags públicas para medir o fluxo real e identificar problemas visuais, como acúmulo de lixo. Tudo isso alimenta o nosso KPI exclusivo: o Índice de Saúde do Atrativo (ISA). A IA Generativa gera recomendações diretas na tela do prefeito, como alertas de saturação ou manutenção urgentes.'",
    "🎙️ Roteiro de Negócios: 'E como isso se sustenta? Nossas rotas inteligentes feitas por IA priorizam e recomendam exclusivamente negócios, guias e hotéis registrados no Cadastur do Ministério do Turismo. Com isso, incentivamos a formalização do pequeno e microempreendedor, gerando um mapa seguro e legalizado. Monetizamos através de um SaaS Público (B2G), onde prefeituras pagam por dados, e um modelo B2B Freemium com anúncios patrocinados.'",
    "🎙️ Fechamento: 'A Dunas Tech une a voz do cidadão, os dados do governo e o poder da Inteligência Artificial em uma única plataforma. Nós não queremos apenas atrair turistas para o Rio Grande do Norte. Nós queremos garantir que os nossos destinos estejam saudáveis e preservados para recebê-los amanhã. Muito obrigado.'"
  ];

  // Handler for B2C Form Submission simulation
  const handleB2CSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedSubmitted(true);
  };

  const resetB2CSimulator = () => {
    setSimulatedSubmitted(false);
    setSimulatedRating(4);
    setSimulatedCriteria({ limpo: true, preservado: true, seguranca: true });
    setSimulatedComment("");
  };

  const toggleCriterion = (key: string) => {
    setSimulatedCriteria(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="dark bg-[#030611] text-[#f1f5f9] min-h-screen font-sans overflow-hidden select-none">
      {/* 1. Timer Pacer Bar (very top edge) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#0b0f19] z-50">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            timeLeft <= 30
              ? "bg-gradient-to-r from-red-600 to-red-500 animate-pulse"
              : timeLeft <= 90
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500"
          )}
          style={{ width: `${((180 - timeLeft) / 180) * 100}%` }}
        />
      </div>

      {/* 2. Top Header Controls */}
      <header className="fixed top-2 left-0 w-full z-40 px-6 py-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 bg-slate-950/75 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto shadow-lg">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Sistema</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Zap className="w-3 h-3 animate-pulse" />
            Hackathon do Sol
          </span>
        </div>

        {/* Presentation widgets */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/75 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
          {/* Pitch Timer Display */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <span className={cn(timeLeft <= 30 ? "text-red-400 font-extrabold animate-pulse" : "text-white")}>
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:text-white text-slate-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title={isTimerRunning ? "Pausar Cronômetro" : "Iniciar Cronômetro"}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setTimeLeft(180);
                  setIsTimerRunning(false);
                }}
                className="p-1 hover:text-white text-slate-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Reiniciar Cronômetro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <span className="text-white/20">|</span>

          {/* Toggle Screen and Prompter */}
          <button
            onClick={() => setShowPrompter(!showPrompter)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer",
              showPrompter ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 border border-white/5 hover:bg-white/5"
            )}
          >
            Prompter
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-white text-slate-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Main Slide Container (100vh Snap Scroll) */}
      <main className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        
        {/* SLIDE 1: O GANCHO */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-slide-index="0"
          className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "radial-gradient(circle at center, #0d1635 0%, #030611 100%)",
          }}
        >
          {/* Glowing solar mesh in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-amber-500/5 to-orange-600/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={currentSlide === 0 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>DUNAS TECH — OBSERVATÓRIO INTELIGENTE</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
            >
              O motor da economia opera <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                no escuro.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto font-light leading-relaxed"
            >
              O turismo representa o coração do Rio Grande do Norte. Mas a tomada de decisão ainda é lenta, reativa e baseada em dados frios do passado.
            </motion.p>

            {/* Key stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
              {[
                { value: "76%", label: "do PIB Estadual", sub: "Comércio, Serviços e Turismo" },
                { value: "75%", label: "do ICMS Arrecadado", sub: "Arrecadação do Estado do RN" },
                { value: "73%", label: "dos Empregos Formais", sub: "Geração de trabalho no estado" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                  className="bg-slate-950/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle top amber highlight */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                  <span className="text-5xl sm:text-6xl font-extrabold text-white block mb-1 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 tracking-wide">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {stat.sub}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex justify-center pt-8 text-slate-500 animate-bounce"
            >
              <div className="flex flex-col items-center gap-1 text-[11px] uppercase tracking-wider">
                <span>Role para baixo ou aperte Espaço</span>
                <ChevronDown className="w-4 h-4 text-amber-500" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* SLIDE 2: A SOLUÇÃO (Turista como sensor B2C) */}
        <section
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-slide-index="1"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "radial-gradient(circle at center, #090e25 0%, #030611 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
            {/* Lado Esquerdo: Falas e Storytelling */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={currentSlide === 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>02. A SOLUÇÃO: SENSOR SOCIAL MÓVEL</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl font-black text-white tracking-tight"
              >
                O Turista como um <br />
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Sensor Vivo
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={currentSlide === 1 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-base sm:text-lg leading-relaxed font-light"
              >
                Nossa jornada começa na palma da mão. Criamos um guia turístico mobile-first que engaja o turista a auditar atrativos com apenas 3 cliques rápidos (através de tags rápidas de infraestrutura), eliminando textos longos e gerando dados estruturados em tempo real.
              </motion.p>

              <div className="space-y-4 pt-4">
                {[
                  { title: "Guia Inteligente com Cadastur", desc: "Prioriza exclusivamente o turismo regularizado e legalizado." },
                  { title: "Auditoria Social em 3 Cliques", desc: "Checkboxes rápidos (Limpo, Seguro, Superlotado) alimentam o banco." },
                  { title: "Gamificação & Incentivo", desc: "Turista acumula pontos de conformidade e cupons em estabelecimentos locais." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={currentSlide === 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-1 flex-shrink-0 text-cyan-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Lado Direito: Simulador de Smartphone B2C Interativo */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
                animate={currentSlide === 1 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.85, rotateY: 15 }}
                transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
                className="w-[280px] h-[550px] rounded-[40px] border-4 border-slate-800 bg-[#060913] shadow-2xl relative flex flex-col p-3.5 overflow-hidden"
                style={{
                  boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                }}
              >
                {/* Notch / Speaker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-black rounded-full mb-1" />
                </div>

                {/* Smartphone Screen Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 pt-3.5 px-1.5 z-10">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black tracking-wider">DUNAS<span className="text-amber-400">TECH</span></span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold tracking-wide uppercase scale-90">B2C App</div>
                </div>

                {/* Mockup Screen Content */}
                <div className="flex-1 overflow-y-auto px-1 pt-3.5 pb-2 text-left space-y-3.5 scrollbar-thin select-none">
                  {!simulatedSubmitted ? (
                    <form onSubmit={handleB2CSubmit} className="space-y-4">
                      {/* Destination Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Selecione o Destino</label>
                        <select
                          value={simulatedDest}
                          onChange={(e) => setSimulatedDest(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="Praia da Pipa">Praia da Pipa (Tibau do Sul)</option>
                          <option value="Ponta Negra">Ponta Negra e Morro (Natal)</option>
                          <option value="Dunas de Genipabu">Dunas de Genipabu (Extremoz)</option>
                          <option value="São Miguel do Gostoso">São Miguel do Gostoso</option>
                        </select>
                      </div>

                      {/* Ratings */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nota Geral do Local</label>
                        <div className="flex gap-1.5 py-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSimulatedRating(s)}
                              className="cursor-pointer focus:outline-none transform hover:scale-110 active:scale-95 transition-transform"
                            >
                              <Star
                                className={cn(
                                  "w-5 h-5",
                                  s <= simulatedRating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Auditory checklist criteria */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">O que você observou?</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { key: "limpo", label: "Local Limpo", emoji: "🧹" },
                            { key: "preservado", label: "Preservado", emoji: "🌿" },
                            { key: "seguranca", label: "Seguro", emoji: "🔒" },
                            { key: "superlotado", label: "Lotado", emoji: "⚠️", negative: true }
                          ].map((c) => {
                            const active = !!simulatedCriteria[c.key];
                            return (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() => toggleCriterion(c.key)}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
                                  active
                                    ? c.negative
                                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                                      : "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                                    : "bg-slate-900 border-white/5 text-slate-400 hover:border-slate-800"
                                )}
                              >
                                <span>{c.emoji}</span>
                                <span>{c.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conformity test block */}
                      <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2 space-y-1.5">
                        <label className="text-[9px] font-extrabold text-slate-300 leading-tight block">
                          🔎 Auditoria: A infraestrutura condiz com o anunciado nas fotos?
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSimulatedConformity("yes")}
                            className={cn(
                              "flex-1 py-1 rounded-md text-[9px] font-bold border transition-colors cursor-pointer",
                              simulatedConformity === "yes"
                                ? "bg-green-500/10 border-green-500/40 text-green-400"
                                : "bg-slate-950 border-white/5 text-slate-500"
                            )}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setSimulatedConformity("no")}
                            className={cn(
                              "flex-1 py-1 rounded-md text-[9px] font-bold border transition-colors cursor-pointer",
                              simulatedConformity === "no"
                                ? "bg-red-500/10 border-red-500/40 text-red-400"
                                : "bg-slate-950 border-white/5 text-slate-500"
                            )}
                          >
                            Divergente
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-teal-400 active:scale-[0.97] transition-all cursor-pointer"
                      >
                        Enviar Avaliação
                      </button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col justify-center items-center text-center space-y-4 pt-16"
                    >
                      <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <CheckCircle2 className="w-8 h-8 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white">Avaliação Enviada!</h3>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">
                          Dados integrados ao observatório B2G em tempo real via Firebase.
                        </p>
                      </div>
                      <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-full text-[9px] text-amber-400 font-bold tracking-wide uppercase">
                        +10 Pontos Acumulados
                      </div>
                      <button
                        onClick={resetB2CSimulator}
                        className="text-[10px] text-slate-500 underline hover:text-white pt-6 cursor-pointer"
                      >
                        Avaliar Outro Destino
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Smartphone Home Bar */}
                <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mb-1 flex-shrink-0" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SLIDE 3: O DIFERENCIAL (Dashboard B2G & IA) */}
        <section
          ref={(el) => { sectionRefs.current[2] = el; }}
          data-slide-index="2"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "radial-gradient(circle at center, #0e0a24 0%, #030611 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
            {/* Lado Esquerdo: Dashboard B2G Interativo */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={currentSlide === 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full bg-[#080d1e]/80 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4"
              >
                {/* Dashboard top header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Painel de Gestão Governamental (B2G)
                    </h3>
                  </div>
                  <div className="flex gap-1.5">
                    {["Ponta Negra", "Praia da Pipa", "São Miguel do Gostoso"].map((dest) => (
                      <button
                        key={dest}
                        onClick={() => setDashboardDest(dest)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer",
                          dashboardDest === dest
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-slate-800"
                        )}
                      >
                        {dest.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dashboard grid structure */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* KPI ISA */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">ISA Dinâmico</span>
                    <span className={cn("text-2xl sm:text-3xl font-black block my-1.5", aiInsightsMap[dashboardDest].isa < 60 ? "text-red-400" : "text-amber-400")}>
                      {aiInsightsMap[dashboardDest].isa} / 100
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Índice Saúde do Atrativo</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-amber-500/5 flex items-center justify-center text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  {/* KPI Saturation */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Pressão de Fluxo</span>
                    <span className="text-2xl sm:text-3xl font-black block my-1.5 text-cyan-400">
                      {aiInsightsMap[dashboardDest].saturated}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Capacidade de Carga</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-cyan-500/5 flex items-center justify-center text-cyan-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  {/* KPI Cadastur percentage */}
                  <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Formalização</span>
                    <span className="text-2xl sm:text-3xl font-black block my-1.5 text-green-400">
                      94.2%
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Parceiros Regularizados</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-green-500/5 flex items-center justify-center text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Recharts dynamic representation */}
                <div className="h-40 bg-slate-950/40 border border-white/5 rounded-xl p-2.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "#060913", borderColor: "rgba(255,255,255,0.1)", fontSize: "10px" }} />
                      <Bar dataKey="isa" name="ISA" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          // Highlight Ponta Negra dynamically
                          const isAlert = entry.isa < 60;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isAlert ? "#f87171" : "#f0c75e"}
                            />
                          );
                        })}
                      </Bar>
                      <Bar dataKey="saturacao" name="Saturação" fill="#22d3ee" opacity={0.4} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gemini AI recommendations console */}
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl space-y-1.5 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Gemini AI — Diagnóstico e Ação Recomendada</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-300 font-medium">
                    {aiInsightsMap[dashboardDest].text}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Lado Direito: Storytelling text */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>03. O DIFERENCIAL: IA & MÉTRICAS</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl font-black text-white tracking-tight"
              >
                Inteligência Artificial & <br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Índice ISA
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={currentSlide === 2 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-base sm:text-lg leading-relaxed font-light"
              >
                Integramos o feedback em tempo real com dados de redes sociais (Instagram via Apify API Scraper). Nosso algoritmo gera o KPI exclusivo **ISA (Índice de Saúde do Atrativo)** e recomenda ações imediatas de zeladoria pública.
              </motion.p>

              <div className="space-y-4 pt-4">
                {[
                  { title: "ISA (Índice de Saúde do Atrativo)", desc: "Mapeamento em tempo real do nível de preservação, segurança e limpeza." },
                  { title: "Social Listening (Instagram)", desc: "IA analisa imagens e publicações para monitorar o acúmulo de resíduos e superlotação." },
                  { title: "Diagnósticos Acionáveis", desc: "IA Generativa sugere intervenções diretas na orla aos órgãos governamentais." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-1 flex-shrink-0 text-amber-400">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4: MODELO DE NEGÓCIOS */}
        <section
          ref={(el) => { sectionRefs.current[3] = el; }}
          data-slide-index="3"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "radial-gradient(circle at center, #08112d 0%, #030611 100%)",
          }}
        >
          <div className="max-w-5xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={currentSlide === 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>04. SUSTENTABILIDADE FINANCEIRA</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-white tracking-tight"
            >
              Modelo de Negócios Dual & <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Incentivo à Formalização
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto font-light"
            >
              O sistema une monetização pública e privada em um círculo virtuoso. As rotas recomendadas por IA guiam turistas **exclusivamente** para negócios formalizados no Cadastur.
            </motion.p>

            {/* Pricing / Business Model Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto items-stretch">
              
              {/* Cadastur Banner Card */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-950/60 border border-green-500/20 rounded-2xl p-6 text-left flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">Força Cadastur</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Priorização de hotéis, guias e pousadas regularizados nas rotas do app. Estímulo direto à formalização de microempreendedores locais no RN.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.05] text-[10px] text-green-400 font-bold uppercase tracking-wider">
                  Incentivo Regulatório
                </div>
              </motion.div>

              {/* Private B2B Model */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-left flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Building2 className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">B2B: Empresas de Turismo</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Freemium + CPC Ads + Analytics.</strong> Cadastro e mapa gratuitos. Modelo de CPC patrocinado para se destacar nas sugestões e painéis analíticos premium para pousadas.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.05]">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Assinatura Premium</span>
                  <span className="text-base font-black text-amber-400">R$ 149 /mês</span>
                </div>
              </motion.div>

              {/* Public B2G SaaS */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-left flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Globe className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">B2G: Secretarias de Turismo</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>SaaS por Assinatura Anual.</strong> Painel completo com IA preditiva, geração automática de relatórios IBGE, e canal direto de zeladoria social de orla.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.05]">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Licenciamento Anual</span>
                  <span className="text-sm sm:text-base font-black text-cyan-400">R$ 18k a 60k /ano</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SLIDE 5: ENCERRAMENTO (O Impacto) */}
        <section
          ref={(el) => { sectionRefs.current[4] = el; }}
          data-slide-index="4"
          className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
        >
          {/* Fullscreen background image with heavy dark overlay */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1600&h=900&fit=crop')",
              filter: "brightness(0.18) contrast(1.1)"
            }}
          />

          {/* Golden/Red sunset radial flare overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030611] via-transparent to-transparent z-0 opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-amber-600/10 via-orange-600/5 to-transparent blur-3xl z-0 pointer-events-none" />

          <div className="max-w-4xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSlide === 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20"
            >
              <Sun className="w-9 h-9 text-slate-950 animate-spin-slow" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black text-white tracking-tight"
            >
              DUNAS<span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">TECH</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-2xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed tracking-wide italic"
            >
              &ldquo;Não gerenciamos apenas turismo. Prevemos o futuro da sustentabilidade urbana.&rdquo;
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:from-amber-300 hover:to-red-400 shadow-xl shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer pointer-events-auto"
              >
                <span>Experimentar Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/gestao"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:bg-slate-900 hover:border-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer pointer-events-auto"
              >
                <span>Painel Administrativo</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-slate-500 pt-16 flex flex-col items-center gap-1"
            >
              <span>DunasTech — Hackathon do Sol 2026</span>
              <span>Eixo 3: Observatório Inteligente Potiguar</span>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 4. Floating Slide Navigation Dock (Bottom) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/80 border border-white/10 backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-4 shadow-2xl">
        <div className="flex gap-2">
          {[
            { label: "Introdução" },
            { label: "B2C Turista" },
            { label: "B2G Gestão" },
            { label: "Sustentabilidade" },
            { label: "Visão Geral" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigateToSlide(i)}
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer",
                currentSlide === i
                  ? "bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:border-slate-800 hover:text-white"
              )}
              title={item.label}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </nav>

      {/* 5. Floating Presenter Prompter (Script Box) */}
      <AnimatePresence>
        {showPrompter && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 100, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1/2 z-40 w-[95%] max-w-2xl bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex gap-3 text-left items-start"
          >
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Script Prompter (3min Pitch)</span>
                <span className="text-[9px] text-slate-500 font-medium">Use as setas para alternar os slides</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-300 font-medium">
                {prompterScripts[currentSlide]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
