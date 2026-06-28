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
  Smartphone,
  BarChart3,
  Check,
  Star,
  Maximize2,
  Minimize2,
  ChevronDown,
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
import { Badge } from "@/components/ui/Badge";

// Utility function to merge classes safely
const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export default function PitchPage() {
  // Navigation State (6 slides now)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompter, setShowPrompter] = useState(true);

  // Timer State (3-minute pitch pacer)
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // B2C Simulator State
  const [simulatedDest, setSimulatedDest] = useState("Praia da Pipa");
  const [simulatedRating, setSimulatedRating] = useState(5);
  const [simulatedCriteria, setSimulatedCriteria] = useState<Record<string, boolean>>({
    limpo: true,
    preservado: true,
    seguranca: true
  });
  const [simulatedComment, setSimulatedComment] = useState("");
  const [simulatedConformity, setSimulatedConformity] = useState<"yes" | "no">("yes");
  const [simulatedSubmitted, setSimulatedSubmitted] = useState(false);

  // B2C Route Generator Simulator State
  const [simulatorTab, setSimulatorTab] = useState<"route" | "evaluate">("route");
  const [routeCategory, setRouteCategory] = useState<"sol" | "aventura" | "gastronomia">("sol");
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);

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
    } else if (timeLeft === 0 && isTimerRunning) {
      setTimeout(() => {
        setIsTimerRunning(false);
      }, 0);
    }
    return () => clearInterval(timer);
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

  // Keyboard navigation (6 slides modulo check)
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

  // Fullscreen change listener
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
      text: "Excelente: ISA saudável em 86. Baixa saturação (48%) e alta percepção de segurança/limpeza na orla. Oportunidade: Destacar destino em campanhas estaduais de ecoturismo premium."
    }
  };

  // exact copy of prompter scripts matching cover page + user pitch
  const prompterScripts = [
    "Olá, banca avaliadora! Nós somos a DunasTech, e este é o primeiro Observatório Inteligente do Turismo do Rio Grande do Norte. Vamos mostrar como transformamos o turismo de nosso estado no Hackathon do Sol.",
    "O turismo não é apenas uma atividade no Rio Grande do Norte. Ele é o nosso motor. Hoje, os segmentos de Comércio, Serviços e Turismo representam 76% do PIB estadual, 75% da arrecadação de ICMS e 73% dos empregos formais. Mas esse motor está operando no escuro. Atualmente, os dados estão espalhados em dezenas de fontes e painéis que só mostram o passado. Nós sabemos exatamente onde o turista está, mas o poder público não sabe como o destino está sendo cuidado.",
    "Para mudar esse cenário, criamos o primeiro Observatório Inteligente do Turismo. Nós desenvolvemos um guia turístico inteligente que transforma o turista e o morador local em verdadeiros sensores distribuídos pelo território. Com apenas três cliques, nós coletamos o sentimento real da ponta. Ou seja, nós não apenas guiamos o turista, nós ouvimos o destino.",
    "Essas avaliações feitas em tempo real são enviadas diretamente para o nosso painel de gestão governamental, voltado para o B2G. Mas nós fomos além. Integrada à API do Instagram, nossa Inteligência Artificial varre fotos e hashtags públicas para medir o fluxo real e identificar problemas. Tudo isso alimenta o nosso KPI exclusivo: o Índice de Saúde do Atrativo, o ISA. Cruzando informações de fluxo, infraestrutura e sustentabilidade, a nossa IA Generativa não mostra apenas gráficos frios. Ela gera novos dados e permite identificar problemas que antes não eram mensurados, emitindo alertas automáticos na tela do gestor como: 'Atenção: Aumento de 42% no fluxo turístico, mas as avaliações indicam necessidade urgente de limpeza e manutenção'.",
    "E como isso se sustenta e impacta o mercado? Nossas rotas inteligentes, feitas por IA, priorizam e recomendam exclusivamente negócios, guias e hotéis que possuam o registro regular no Cadastur do Ministério do Turismo. Com isso, nós incentivamos a formalização do pequeno e microempreendedor, gerando um mapa seguro e legalizado. Nós monetizamos a plataforma através de um SaaS Público B2G, onde as prefeituras pagam para ter acesso à inteligência e zeladoria em tempo real, e de um modelo B2B Freemium, que oferece destaque patrocinado para as empresas locais.",
    "A Dunas Tech une a voz do cidadão, os dados do governo e o poder da Inteligência Artificial em uma única plataforma. Nós não queremos apenas atrair turistas para o Rio Grande do Norte. Nós queremos garantir que os nossos destinos estejam saudáveis e preservados para recebê-los amanhã. Muito obrigado."
  ];

  // Handler for B2C Form Submission simulation
  const handleB2CSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedSubmitted(true);
  };

  const resetB2CSimulator = () => {
    setSimulatedSubmitted(false);
    setSimulatedRating(5);
    setSimulatedCriteria({ limpo: true, preservado: true, seguranca: true });
    setSimulatedComment("");
  };

  const toggleCriterion = (key: string) => {
    setSimulatedCriteria(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
  };

  return (
    <div className="bg-[#FFFDF6] text-[#1E293B] min-h-screen font-sans overflow-hidden select-none">
      
      {/* 1. Timer Pacer Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#FFF2CC] z-50">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            timeLeft <= 30
              ? "bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
              : "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
          )}
          style={{ width: `${((180 - timeLeft) / 180) * 100}%` }}
        />
      </div>

      {/* 2. Top Header Controls */}
      <header className="fixed top-3 left-0 w-full z-45 px-6 py-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 bg-white/90 border border-amber-200/80 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto shadow-sm">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao App</span>
          </Link>
          <span className="text-amber-200">|</span>
          <span className="flex items-center gap-1 text-[11px] font-black text-amber-600 uppercase tracking-widest">
            <Sun className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
            Hackathon do Sol 2026
          </span>
        </div>

        {/* Presenter widgets */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 border border-amber-200/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
          {/* Timer Display */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
            <span className={cn(timeLeft <= 30 ? "text-red-500 font-extrabold animate-pulse" : "text-slate-800")}>
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center gap-1 border-l border-amber-200 pl-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:text-amber-600 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title={isTimerRunning ? "Pausar" : "Iniciar"}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setTimeLeft(180);
                  setIsTimerRunning(false);
                }}
                className="p-1 hover:text-amber-600 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <span className="text-amber-200">|</span>

          {/* Toggle Script */}
          <button
            onClick={() => setShowPrompter(!showPrompter)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer",
              showPrompter ? "bg-amber-100 text-amber-700 border border-amber-300" : "text-slate-400 border border-slate-100 hover:bg-slate-50"
            )}
          >
            Prompter
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:text-slate-700 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Main Slide Deck (100vh snap scroll) */}
      <main className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#FFFDF6]">
        
        {/* SLIDE 0: PÁGINA DE ROSTO (COVER PAGE) */}
        <section
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-slide-index="0"
          className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #FFFDF6 0%, #FFF3CE 40%, #FFE5A3 100%)",
          }}
        >
          {/* Sunny background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/10 blur-[140px] pointer-events-none" />
          
          <div className="max-w-5xl w-full text-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={currentSlide === 0 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>HACKATHON DO SOL 2026 — NATAL/RN</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-8xl font-black tracking-tighter text-slate-900 leading-none"
              >
                DUNAS<span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">TECH</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-2xl text-slate-700 font-extrabold uppercase tracking-wider max-w-2xl mx-auto border-y border-amber-300/40 py-3"
              >
                Observatório Inteligente do Turismo
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-medium"
            >
              Conectando a voz do turista, dados do governo e Inteligência Artificial para planejar a sustentabilidade dos atrativos do Rio Grande do Norte.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6"
            >
              <button
                onClick={() => navigateToSlide(1)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mx-auto shadow-md hover:from-amber-600 hover:to-red-600 active:scale-[0.98] transition-all cursor-pointer pointer-events-auto"
              >
                <span>Iniciar Apresentação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 0 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center pt-16 text-slate-400 animate-bounce"
            >
              <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold">
                <span>Role para baixo para avançar</span>
                <ChevronDown className="w-4 h-4 text-amber-500" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* SLIDE 1: O GANCHO */}
        <section
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-slide-index="1"
          className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #FFFDF6 0%, #FFF4D1 50%, #FFE9B3 100%)",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/10 blur-[130px] pointer-events-none" />
          
          <div className="max-w-5xl w-full text-center space-y-7 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={currentSlide === 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>01. O GANCHO: ECONOMIA DO TURISMO</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              O motor da nossa economia <br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 bg-clip-text text-transparent">
                não pode operar no escuro.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 1 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed"
            >
              O turismo representa o motor do Rio Grande do Norte. Contudo, a gestão pública opera com dados fragmentados do passado e sem monitoramento de zeladoria ecológica.
            </motion.p>

            {/* Light Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 max-w-4xl mx-auto">
              {[
                { value: "76%", label: "do PIB Estadual", desc: "Comércio, Serviços e Turismo" },
                { value: "75%", label: "da Arrecadação de ICMS", desc: "Arrecadação tributária do RN" },
                { value: "73%", label: "dos Empregos Formais", desc: "Geração de trabalho estruturado" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="bg-white/80 border border-amber-200/50 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 to-orange-500" />
                  <span className="text-5xl font-black text-slate-900 block mb-1 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 tracking-wide">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {stat.desc}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 2: A SOLUÇÃO */}
        <section
          ref={(el) => { sectionRefs.current[2] = el; }}
          data-slide-index="2"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #FFFDF6 0%, #FFF1C5 50%, #FFE5A3 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
            <div className="lg:col-span-6 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                <span>02. A SOLUÇÃO: GUIA INTELIGENTE & SENSORES</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
              >
                Transformando o cidadão <br />
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  em sensor vivo.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={currentSlide === 2 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium"
              >
                Desenvolvemos um guia turístico inteligente que transforma o turista e o morador em sensores distribuídos. Com apenas 3 cliques rápidos, capturamos o sentimento e o estado real da infraestrutura dos atrativos.
              </motion.p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Engajamento Mobile em 3 Cliques", desc: "Checkboxes visuais e práticos eliminam digitação demorada." },
                  { title: "Zeladoria e Auditoria Social", desc: "Mapeamento em tempo real de limpeza, conservação e segurança." },
                  { title: "Guia Integrado ao Cadastur", desc: "Direciona fluxo exclusivamente para parceiros formalizados." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-cyan-100 flex items-center justify-center mt-1 flex-shrink-0 text-cyan-600">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                animate={currentSlide === 2 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.9, rotateY: 15 }}
                transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
                className="w-[285px] h-[550px] rounded-[40px] border-4 border-slate-200 bg-white shadow-xl relative flex flex-col p-3.5 overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-200 rounded-b-2xl z-20" />

                {/* B2C Simulator Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 mb-3 z-10 shrink-0">
                  <button
                    onClick={() => {
                      setSimulatorTab("route");
                      setSimulatedSubmitted(false);
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer",
                      simulatorTab === "route" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    🗺️ Rotas IA
                  </button>
                  <button
                    onClick={() => {
                      setSimulatorTab("evaluate");
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer",
                      simulatorTab === "evaluate" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    ✍️ Avaliar
                  </button>
                </div>

                {/* Smartphone Scrollable Screen Content */}
                <div className="flex-1 overflow-y-auto px-1 pt-1 pb-2 text-left space-y-3.5 scrollbar-thin select-none">
                  
                  {/* TAB 1: ROUTE GENERATOR */}
                  {simulatorTab === "route" && (
                    <div className="space-y-4">
                      {!routeGenerated ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Destino Principal</label>
                            <select
                              value={simulatedDest}
                              onChange={(e) => setSimulatedDest(e.target.value)}
                              className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                              <option value="Praia da Pipa">Praia da Pipa (Tibau do Sul)</option>
                              <option value="Ponta Negra">Ponta Negra e Morro (Natal)</option>
                              <option value="Dunas de Genipabu">Dunas de Genipabu (Extremoz)</option>
                              <option value="São Miguel do Gostoso">São Miguel do Gostoso</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Estilo de Viagem</label>
                            <div className="flex flex-col gap-1.5">
                              {([
                                { id: "sol", label: "☀️ Sol e Praia", desc: "Orlas, jangadas e relaxamento" },
                                { id: "aventura", label: "🏄 Aventura e Vento", desc: "Dunas, buggy e kitesurf" },
                                { id: "gastronomia", label: "🍽️ Rota Gastronômica", desc: "Melhores pratos potiguares" }
                              ] as const).map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setRouteCategory(cat.id)}
                                  className={cn(
                                    "w-full p-2 rounded-xl text-left border transition-all cursor-pointer flex justify-between items-center",
                                    routeCategory === cat.id
                                      ? "bg-cyan-50 border-cyan-300 text-cyan-800"
                                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                                  )}
                                >
                                  <div>
                                    <span className="text-[11px] font-extrabold block">{cat.label}</span>
                                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{cat.desc}</span>
                                  </div>
                                  {routeCategory === cat.id && (
                                    <Check className="w-3.5 h-3.5 text-cyan-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={generatingRoute}
                            onClick={() => {
                              setGeneratingRoute(true);
                              setTimeout(() => {
                                setGeneratingRoute(false);
                                setRouteGenerated(true);
                              }, 1500);
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:from-cyan-600 hover:to-teal-600 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {generatingRoute ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Criando Rota IA...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                <span>Gerar Rota Inteligente</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3.5 animate-scale-in">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              🛡️ 100% Cadastur
                            </span>
                            <button
                              onClick={() => setRouteGenerated(false)}
                              className="text-[9px] text-cyan-600 underline font-bold cursor-pointer"
                            >
                              Nova Rota
                            </button>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-3">
                            <h4 className="text-xs font-black text-slate-800 leading-snug">
                              Roteiro Personalizado: {simulatedDest.split(" e ")[0]}
                            </h4>

                            {/* Mini Interactive Vector Map */}
                            <div className="w-full h-24 bg-sky-50/60 border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center">
                              {/* Background ocean & beach curves */}
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                                {/* Coastline shape */}
                                <path
                                  d="M 0,90 Q 60,85 100,50 T 200,30 L 200,100 L 0,100 Z"
                                  fill="#FEFBF0"
                                  stroke="#FFE4A3"
                                  strokeWidth="1.5"
                                />
                                {/* Ocean waves details */}
                                <path d="M 30,30 Q 50,25 70,30" stroke="#bae6fd" strokeWidth="1" fill="none" opacity="0.6" />
                                <path d="M 120,20 Q 140,15 160,20" stroke="#bae6fd" strokeWidth="1" fill="none" opacity="0.6" />

                                {/* Route path connection line */}
                                <path
                                  d="M 50,65 Q 90,55 130,45"
                                  stroke="var(--color-primary)"
                                  strokeWidth="1.5"
                                  strokeDasharray="3,3"
                                  fill="none"
                                  className="animate-pulse"
                                />
                              </svg>

                              {/* Stop Pin 1 */}
                              <div className="absolute" style={{ left: "22%", top: "60%" }}>
                                <span className="absolute -left-1 -top-1 h-4.5 w-4.5 rounded-full bg-cyan-400/30 animate-ping" />
                                <div className="h-2.5 w-2.5 rounded-full bg-cyan-600 border border-white shadow-sm flex items-center justify-center relative group">
                                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[6px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Stop 1
                                  </span>
                                </div>
                              </div>

                              {/* Stop Pin 2 */}
                              <div className="absolute" style={{ left: "45%", top: "50%" }}>
                                <span className="absolute -left-1 -top-1 h-4.5 w-4.5 rounded-full bg-amber-400/30 animate-ping" />
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 border border-white shadow-sm flex items-center justify-center relative group">
                                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[6px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Stop 2
                                  </span>
                                </div>
                              </div>

                              {/* Stop Pin 3 */}
                              <div className="absolute" style={{ left: "72%", top: "38%" }}>
                                <span className="absolute -left-1 -top-1 h-4.5 w-4.5 rounded-full bg-green-400/30 animate-ping" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-600 border border-white shadow-sm flex items-center justify-center relative group">
                                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-[6px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Stop 3
                                  </span>
                                </div>
                              </div>

                              <span className="absolute bottom-1 right-2 text-[7px] font-bold text-amber-800 uppercase tracking-widest bg-amber-100/60 px-1 rounded">
                                Mapa da Rota IA
                              </span>
                            </div>
                            
                            {/* Dynamic Stops */}
                            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-cyan-100">
                              
                              {/* Stop 1: Hotel */}
                              <div className="flex gap-2.5 relative z-10 items-start">
                                <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-cyan-200">1</div>
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-extrabold text-slate-800 block">Hospedagem Recomendada</span>
                                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                    Pousada Regularizada Cadastur
                                  </p>
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7px] font-semibold bg-green-50 border border-green-150 text-green-700">
                                    🛡️ Cadastur Ativo
                                  </span>
                                </div>
                              </div>

                              {/* Stop 2: Activity */}
                              <div className="flex gap-2.5 relative z-10 items-start">
                                <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-cyan-200">2</div>
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-extrabold text-slate-800 block">Atração & Guias Locais</span>
                                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                    {routeCategory === "sol" && "Passeio de Jangada Tradicional"}
                                    {routeCategory === "aventura" && "Passeio de Buggy Credenciado"}
                                    {routeCategory === "gastronomia" && "Passeio Cultural Potiguar"}
                                  </p>
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7px] font-semibold bg-green-50 border border-green-150 text-green-700">
                                    🛡️ Cadastur Ativo
                                  </span>
                                </div>
                              </div>

                              {/* Stop 3: Restaurant */}
                              <div className="flex gap-2.5 relative z-10 items-start">
                                <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-cyan-200">3</div>
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-extrabold text-slate-800 block">Ponto Gastronômico</span>
                                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                    Restaurante Regional Parceiro
                                  </p>
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7px] font-semibold bg-green-50 border border-green-150 text-green-700">
                                    🛡️ Cadastur Ativo
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>

                          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-2.5 text-left">
                            <p className="text-[8.5px] leading-relaxed text-slate-500 font-medium">
                              💡 As rotas inteligentes priorizam apenas operadores com Cadastur ativo, reduzindo o mercado informal e aumentando a segurança do turista.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: EVALUATIONS */}
                  {simulatorTab === "evaluate" && (
                    <div className="space-y-4">
                      {!simulatedSubmitted ? (
                        <form onSubmit={handleB2CSubmit} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Selecione o Destino</label>
                            <select
                              value={simulatedDest}
                              onChange={(e) => setSimulatedDest(e.target.value)}
                              className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                              <option value="Praia da Pipa">Praia da Pipa (Tibau do Sul)</option>
                              <option value="Ponta Negra">Ponta Negra e Morro (Natal)</option>
                              <option value="Dunas de Genipabu">Dunas de Genipabu (Extremoz)</option>
                              <option value="São Miguel do Gostoso">São Miguel do Gostoso</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nota Geral</label>
                            <div className="flex gap-1.5">
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
                                      s <= simulatedRating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

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
                                          ? "bg-red-50 border-red-200 text-red-700"
                                          : "bg-cyan-50 border-cyan-200 text-cyan-700"
                                        : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                                    )}
                                  >
                                    <span>{c.emoji}</span>
                                    <span>{c.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                            <label className="text-[9px] font-extrabold text-slate-600 leading-tight block">
                              🔎 Auditoria: A infraestrutura condiz com as fotos anunciadas?
                            </label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSimulatedConformity("yes")}
                                className={cn(
                                  "flex-1 py-1 rounded-md text-[9px] font-bold border transition-colors cursor-pointer",
                                  simulatedConformity === "yes"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-white border-slate-200 text-slate-400"
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
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-white border-slate-200 text-slate-400"
                                )}
                              >
                                Divergente
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md hover:from-cyan-600 hover:to-teal-600 active:scale-[0.97] transition-all cursor-pointer"
                          >
                            Enviar Avaliação
                          </button>
                        </form>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="h-full flex flex-col justify-center items-center text-center space-y-4 pt-16"
                        >
                          <div className="w-14 h-14 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-slate-900">Avaliação Enviada!</h3>
                            <p className="text-[10px] text-slate-500 max-w-[200px] font-medium">
                              Dados de zeladoria integrados ao painel do gestor municipal.
                            </p>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-[9px] text-amber-800 font-bold tracking-wide uppercase">
                            +10 Pontos Acumulados
                          </div>
                          <button
                            onClick={resetB2CSimulator}
                            className="text-[10px] text-slate-400 underline hover:text-slate-600 pt-6 cursor-pointer"
                          >
                            Avaliar Outro Destino
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                </div>

                <div className="w-24 h-1 bg-slate-200 rounded-full mx-auto mb-1 flex-shrink-0" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SLIDE 3: O DIFERENCIAL */}
        <section
          ref={(el) => { sectionRefs.current[3] = el; }}
          data-slide-index="3"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #FFFDF6 0%, #FFEFC0 50%, #FFE193 100%)",
          }}
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
            <div className="lg:col-span-7 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={currentSlide === 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                      Observatório B2G Inteligente
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
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {dest.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Índice ISA</span>
                    <span className={cn("text-2xl sm:text-3xl font-black block my-1.5", aiInsightsMap[dashboardDest].isa < 60 ? "text-red-500" : "text-amber-600")}>
                      {aiInsightsMap[dashboardDest].isa} / 100
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Saúde do Atrativo</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-bold">Fluxo Local</span>
                    <span className="text-2xl sm:text-3xl font-black block my-1.5 text-cyan-600">
                      {aiInsightsMap[dashboardDest].saturated}%
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Varredura de Saturação</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-bold">Cadastur</span>
                    <span className="text-2xl sm:text-3xl font-black block my-1.5 text-green-600">
                      94.2%
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Parceiros Regularizados</span>
                    <div className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="h-40 bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#475569" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#475569" }} domain={[0, 100]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="isa" name="ISA" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const isAlert = entry.isa < 60;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={isAlert ? "#ef4444" : "#f59e0b"}
                            />
                          );
                        })}
                      </Bar>
                      <Bar dataKey="saturacao" name="Saturação" fill="#06b6d4" opacity={0.3} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-200 rounded-xl space-y-1 text-left relative overflow-hidden">
                  <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>DunasIA — Alerta e Diagnóstico Automático</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700 font-bold italic">
                    &ldquo;{aiInsightsMap[dashboardDest].text}&rdquo;
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={currentSlide === 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-250 text-amber-800 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>03. O DIFERENCIAL: IA & INSTAGRAM SCRAPER</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={currentSlide === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
              >
                Inteligência Artificial & <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Índice ISA
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={currentSlide === 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium"
              >
                A nossa Inteligência Artificial não apenas calcula gráficos. Integrada à API do Instagram, ela varre posts públicos sob hashtags locais para estimar tráfego e emitir alertas preditivos de zeladoria ao gestor.
              </motion.p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Métrica Unificada: Índice ISA", desc: "Convergência de dados de sustentabilidade e infraestrutura." },
                  { title: "Auditoria Social via Instagram", desc: "Varredura automatizada para medir o sentimento real." },
                  { title: "Alertas Gerados em Tempo Real", desc: "Aviso de saturação, resíduos na areia ou acessibilidade crítica." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={currentSlide === 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-amber-100 flex items-center justify-center mt-1 flex-shrink-0 text-amber-600">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4: MODELO DE NEGÓCIOS & CADASTUR */}
        <section
          ref={(el) => { sectionRefs.current[4] = el; }}
          data-slide-index="4"
          className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden p-6 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #FFFDF6 0%, #FFEBBF 50%, #FFDF9B 100%)",
          }}
        >
          <div className="max-w-5xl w-full text-center space-y-7 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={currentSlide === 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-800 text-xs font-bold uppercase tracking-wider"
            >
              <Building2 className="w-3.5 h-3.5 text-green-600" />
              <span>04. SUSTENTABILIDADE FINANCEIRA E CADASTUR</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
            >
              Estímulo à Formalização & <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Monetização Dual
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto font-medium"
            >
              Unimos o incentivo regulatório do Ministério do Turismo com a sustentabilidade do ecossistema local do RN, gerando renda e segurança jurídica.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 max-w-4xl mx-auto items-stretch">
              
              {/* Cadastur Banner Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/90 border border-green-200 rounded-2xl p-6 text-left flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-green-550/10 flex items-center justify-center text-green-600 bg-green-50">
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Força Cadastur</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Nossas rotas inteligentes recomendam <strong>exclusivamente</strong> guias, pousadas e receptivos com registro regular no Cadastur, incentivando a formalização local.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  Incentivo Regulatório
                </div>
              </motion.div>

              {/* Private B2B Model */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/90 border border-slate-200 rounded-2xl p-6 text-left flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-550/10 flex items-center justify-center text-amber-600 bg-amber-50">
                    <Building2 className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">B2B Freemium</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Destaques patrocinados, planos de fidelidade de rotas e relatórios estatísticos de satisfação para operadoras locais.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-extrabold">Exposição Adicional</span>
                  <span className="text-sm font-black text-amber-600">Patrocínio CPC</span>
                </div>
              </motion.div>

              {/* Public B2G SaaS */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/90 border border-slate-200 rounded-2xl p-6 text-left flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <Globe className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">SaaS Público B2G</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Licenciamento anual pago por prefeituras e órgãos estaduais para acesso à zeladoria, mapas preditivos e diagnósticos automatizados.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-extrabold">Assinatura Anual</span>
                  <span className="text-sm font-black text-cyan-600">SaaS B2G Governamental</span>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SLIDE 5: CONCLUSÃO */}
        <section
          ref={(el) => { sectionRefs.current[5] = el; }}
          data-slide-index="5"
          className="h-screen w-full snap-start relative flex flex-col justify-center items-center overflow-hidden p-6 sm:p-12"
        >
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1600&h=900&fit=crop')",
              filter: "brightness(0.6) contrast(1.05)"
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF6] via-transparent to-transparent z-0 opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/10 blur-3xl z-0 pointer-events-none" />

          <div className="max-w-4xl w-full text-center space-y-7 z-10 bg-white/70 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-amber-200/50 shadow-lg relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSlide === 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-md"
            >
              <Sun className="w-8 h-8 text-white animate-spin-slow" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight"
            >
              DUNAS<span className="text-amber-500">TECH</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={currentSlide === 5 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-800 max-w-3xl mx-auto font-bold leading-relaxed tracking-wide"
            >
              Nós não queremos apenas atrair turistas para o Rio Grande do Norte. Nós queremos garantir que os nossos destinos estejam saudáveis e preservados para recebê-los amanhã.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={currentSlide === 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-amber-600 hover:to-red-600 shadow-md active:scale-[0.98] transition-all cursor-pointer pointer-events-auto"
              >
                <span>Experimentar Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/gestao"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer pointer-events-auto"
              >
                <span>Painel Governamental</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={currentSlide === 5 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-slate-500 pt-8 flex flex-col items-center gap-1 font-bold uppercase tracking-wider"
            >
              <span>DunasTech — Hackathon do Sol 2026</span>
              <span>Eixo: Observatório Potiguar Inteligente</span>
            </motion.div>

            {/* QR Code Container at Bottom Right of the Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={currentSlide === 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute bottom-6 right-6 hidden md:flex flex-col items-center p-2.5 bg-white border border-amber-200 rounded-2xl shadow-md z-20 hover:scale-105 transition-transform"
            >
              <img
                src="/images/qrcode-pitch.png"
                alt="QR Code Acesse o Sistema"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <span className="text-[7.5px] font-black text-amber-800 uppercase tracking-widest mt-1.5 leading-none">
                Acesse o Sistema
              </span>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 4. Floating Slide Navigation Dock (Bottom - 6 buttons now) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 border border-amber-200/80 backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-4 shadow-sm">
        <div className="flex gap-2">
          {[
            { label: "Capa" },
            { label: "O Gancho" },
            { label: "B2C Turista" },
            { label: "B2G Gestão" },
            { label: "Sustentabilidade" },
            { label: "Fechamento" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigateToSlide(i)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all cursor-pointer",
                currentSlide === i
                  ? "bg-amber-50 border-amber-50 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
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
            className="fixed bottom-20 left-1/2 z-40 w-[95%] max-w-2xl bg-white/95 border border-amber-200 backdrop-blur-md rounded-2xl p-4 shadow-lg flex gap-3 text-left items-start"
          >
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 flex-shrink-0 mt-0.5 border border-amber-100">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Roteiro do Apresentador (3 Minutos)</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Aperte ESPAÇO para avançar</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 font-bold">
                {prompterScripts[currentSlide]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
