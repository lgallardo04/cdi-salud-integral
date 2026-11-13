import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Eye,
  Pill,
  Microscope,
  Video,
  Calendar,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Building2,
  Users,
  Cpu,
  Layers,
  Lock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  Flame,
  Radio,
  LucideIcon
} from 'lucide-react';
import { ModuloNombre } from '../types';

interface LandingPageViewProps {
  setActiveModule?: (mod: ModuloNombre | any) => void;
  onNavigate?: (mod: string) => void;
}

interface SpecialtyCard {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  module: ModuloNombre;
  icon: LucideIcon;
  tags: string[];
  metrics: { label: string; value: string };
  gradient: string;
  borderGlow: string;
  badgeColor: string;
  isFeatured?: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  setActiveModule,
  onNavigate,
}) => {
  const navigateTo = (mod: string) => {
    if (setActiveModule) {
      setActiveModule(mod as ModuloNombre);
    } else if (onNavigate) {
      onNavigate(mod);
    }
  };

  // State for live controls
  const [bpmMode, setBpmMode] = useState<72 | 105 | 135>(72);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isECGPaused, setIsECGPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [patientIdInput, setPatientIdInput] = useState('');
  
  // Manchester triage simulator state
  const [selectedTriageSymptom, setSelectedTriageSymptom] = useState<number>(0);

  // Persistent navigation & scroll tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'especialidades' | 'triaje' | 'portal'>('hero');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    const wrapper = document.querySelector('.landing-fullscreen-wrapper');
    if (wrapper) {
      wrapper.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll listener for sticky nav active section and floating back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = document.querySelector('.landing-fullscreen-wrapper');
      const scrollTop = wrapper ? wrapper.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);

      setShowScrollTop(scrollTop > 220);

      const sections: ('hero' | 'especialidades' | 'triaje' | 'portal')[] = ['portal', 'triaje', 'especialidades', 'hero'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 240) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    const wrapper = document.querySelector('.landing-fullscreen-wrapper');
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Canvas ref for ECG telemetry
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Live real-time Caracas clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-VE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Beep sound generator for ECG R-wave peak
  const playHeartbeatBeep = () => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.035, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.055);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.06);
      }
    } catch {
      // Audio context policy safe fallback
    }
  };

  // High-precision ECG telemetry loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 540);
    let height = (canvas.height = 190);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 190;
    };
    window.addEventListener('resize', handleResize);

    let sweepX = 0;
    let lastBeatTime = performance.now();

    // Trace buffer
    const points: { x: number; y: number }[] = [];
    const maxPoints = 280;

    const render = (now: number) => {
      if (!ctx) return;

      if (!isECGPaused) {
        // Calculate beat interval from BPM
        const beatInterval = (60 / bpmMode) * 1000;
        const timeSinceLastBeat = now - lastBeatTime;
        const beatCycle = (timeSinceLastBeat % beatInterval) / beatInterval;

        // Generate synthetic ECG P-Q-R-S-T voltage
        let voltage = 0;
        if (beatCycle >= 0.08 && beatCycle < 0.16) {
          // P Wave (Atrial depolarization)
          const pT = (beatCycle - 0.08) / 0.08;
          voltage = Math.sin(pT * Math.PI) * 12;
        } else if (beatCycle >= 0.19 && beatCycle < 0.22) {
          // Q Wave (Septal depolarization)
          voltage = -9;
        } else if (beatCycle >= 0.22 && beatCycle < 0.27) {
          // R Wave (Ventricular depolarization, sharp peak)
          const rT = (beatCycle - 0.22) / 0.05;
          voltage = Math.sin(rT * Math.PI) * 68;
          if (rT > 0.45 && rT < 0.55 && timeSinceLastBeat >= beatInterval * 0.9) {
            playHeartbeatBeep();
          }
        } else if (beatCycle >= 0.27 && beatCycle < 0.31) {
          // S Wave
          voltage = -20;
        } else if (beatCycle >= 0.38 && beatCycle < 0.52) {
          // T Wave (Ventricular repolarization)
          const tT = (beatCycle - 0.38) / 0.14;
          voltage = Math.sin(tT * Math.PI) * 20;
        } else {
          // Isoelectric baseline with tiny physiological fluctuation
          voltage = (Math.sin(now * 0.005) * 1.2) + (Math.random() - 0.5) * 0.6;
        }

        const baseline = height / 2;
        const currentY = baseline - voltage;

        // Increment sweep
        const speed = (width / (beatInterval * 2.6)) * 16;
        sweepX += speed;
        if (sweepX > width) {
          sweepX = 0;
          points.length = 0;
        }

        points.push({ x: sweepX, y: currentY });
        if (points.length > maxPoints) {
          points.shift();
        }
      }

      // Draw background (#080f18)
      ctx.fillStyle = '#080f18';
      ctx.fillRect(0, 0, width, height);

      // Draw clinical grid
      ctx.lineWidth = 1;
      const gridSize = 18;

      // Minor grid
      ctx.strokeStyle = 'rgba(78, 222, 163, 0.05)';
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid
      ctx.strokeStyle = 'rgba(0, 241, 253, 0.12)';
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize * 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize * 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw ECG phosphor trail
      if (points.length > 1) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = bpmMode === 135 ? '#ffb4ab' : '#4edea3';
        ctx.strokeStyle = bpmMode === 135 ? '#ffb4ab' : '#4edea3';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          const pt = points[i];
          if (Math.abs(pt.x - points[i - 1].x) > 40) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glowing sweep scan head
        const currentPt = points[points.length - 1];
        if (currentPt) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00f1fd';
          ctx.beginPath();
          ctx.arc(currentPt.x, currentPt.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [bpmMode, isECGPaused, isAudioMuted]);

  // Concert poster specialty cards data
  const specialtyCards: SpecialtyCard[] = [
    {
      id: 'spec-imagenologia',
      code: 'RAD-3D // PACS-VOL',
      title: 'Imagenología Digital 3D & Tomografía Resonante',
      subtitle: 'Reconstrucción Volumétrica en Tiempo Real',
      category: 'TECNOLOGÍA INSIGNIA',
      description:
        'Tomografía axial computarizada multicorte y resonancia magnética 3 Tesla con reconstrucción tridimensional instantánea, reducción de artefactos por IA y visualización directa en expediente clínico.',
      module: 'imagenologia',
      icon: Microscope,
      tags: ['DICOM 3.0', 'Resonancia 3T', 'Reconstrucción 3D', 'IA Asistida', 'Entrega QR'],
      metrics: { label: 'Capacidad Mensual', value: '6,500+ Estudios' },
      gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
      borderGlow: 'hover:border-[#00f1fd]/80 hover:shadow-[0_0_35px_rgba(0,241,253,0.3)]',
      badgeColor: 'bg-cyan-500/10 text-[#00f1fd] border-cyan-500/30',
      isFeatured: true,
    },
    {
      id: 'spec-oftalmologia',
      code: 'OFT-LSR // MILAGRO',
      title: 'Misión Milagro Oftalmología de Alta Precisión',
      subtitle: 'Centro Quirúrgico Láser Ocular Especializado',
      category: 'CIRUGÍA DE ALTA COMPLEJIDAD',
      description:
        'Microcirugía de catarata por facoemulsificación, corrección refractiva láser Excimer, biometría óptica de coherencia y tonometría digital para pesquisa de glaucoma.',
      module: 'oftalmologia',
      icon: Eye,
      tags: ['Láser Excimer', 'Facoemulsificación', 'Topografía Corneal', 'Gratuito'],
      metrics: { label: 'Cirugías Exitosas', value: '+3,420 Realizadas' },
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderGlow: 'hover:border-[#4edea3]/80 hover:shadow-[0_0_35px_rgba(78,222,163,0.3)]',
      badgeColor: 'bg-emerald-500/10 text-[#4edea3] border-emerald-500/30',
    },
    {
      id: 'spec-farmacia',
      code: 'FAR-ROB // KARDEX-FEFO',
      title: 'Farmacia Robótica Inteligente',
      subtitle: 'Dispensación Automatizada con Trazabilidad RFID',
      category: 'SUMINISTRO MÉDICO CONTINUO',
      description:
        'Dispensación estricta bajo metodología FEFO con control térmico activo 2°C-8°C para fármacos biológicos, validación de récipes mediante QR y cero desabastecimiento.',
      module: 'farmacia',
      icon: Pill,
      tags: ['Kardex FEFO', 'Validación QR', 'Control Térmico', 'Kits Quirúrgicos'],
      metrics: { label: 'Medicamentos Despachados', value: '+48,000 Unidades' },
      gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
      borderGlow: 'hover:border-indigo-400/80 hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'spec-nutricion',
      code: 'NUT-MET // INN-BIO',
      title: 'Nutrición Clínica Avanzada',
      subtitle: 'Bioimpedancia Octapolar & Metagenómica',
      category: 'PREVENCIÓN & METABOLISMO',
      description:
        'Evaluación antropométrica y bioimpedanciométrica multicompartimental. Planes dietoterapéuticos de precisión para síndrome metabólico, gestación y pediatría comunitaria.',
      module: 'nutricion',
      icon: HeartPulse,
      tags: ['Bioimpedancia 8-Puntos', 'Normativa INN', 'Planes Terapéuticos', 'MUAC'],
      metrics: { label: 'Evaluaciones Clínicas', value: '+2,300 Pacientes' },
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderGlow: 'hover:border-amber-400/80 hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    {
      id: 'spec-hospitalizacion',
      code: 'UCI-CRIT // NEWS2-HD',
      title: 'Unidad de Cuidados Intensivos & Monitoreo Vital',
      subtitle: 'Trauma Shock & Soporte Hemodinámico Continuo',
      category: 'SOPORTE CRÍTICO 24/7',
      description:
        'Salas de aislamiento con presión negativa, monitoreo multiparamétrico continuo, ventilación mecánica inteligente y score automatizado de deterioro clínico NEWS2.',
      module: 'hospitalizacion',
      icon: ShieldAlert,
      tags: ['Score NEWS2', 'Presión Negativa', 'Telemetría UCI', 'Cero Infección'],
      metrics: { label: 'Disponibilidad Camas', value: '100% Operativas' },
      gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      borderGlow: 'hover:border-[#ffb4ab]/80 hover:shadow-[0_0_35px_rgba(255,180,171,0.3)]',
      badgeColor: 'bg-rose-500/10 text-[#ffb4ab] border-rose-500/30',
    },
    {
      id: 'spec-telemedicina',
      code: 'TEL-MED // E2E-CRYPT',
      title: 'Telemedicina HD & Triaje IA',
      subtitle: 'Red de Telediagnóstico Interhospitalario',
      category: 'CONECTIVIDAD CLÍNICA',
      description:
        'Salas virtuales encriptadas de ultra-baja latencia para interconsultas especializadas, teleorientación médica comunitaria y diagnóstico colaborativo remoto.',
      module: 'telemedicina',
      icon: Video,
      tags: ['Cifrado SHA-512', 'Video 1080p', 'Audio HD', 'Ficha Integrada'],
      metrics: { label: 'Interconsultas Remotas', value: '+1,950 Sesiones' },
      gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
      borderGlow: 'hover:border-[#00f1fd]/80 hover:shadow-[0_0_35px_rgba(0,241,253,0.3)]',
      badgeColor: 'bg-teal-500/10 text-[#00f1fd] border-teal-500/30',
    },
  ];

  // Manchester simulator rules
  const triageOptions = [
    {
      label: 'Dolor Torácico Opresivo / Paro Cardiorrespiratorio',
      level: 'NIVEL 1: RESUCITACIÓN (ROJO)',
      time: 'Inmediata (0 min)',
      badge: 'bg-[#ba1a1a] text-white shadow-[0_0_20px_rgba(186,26,26,0.6)] border border-[#ffb4ab]/50',
      newsScore: 'Score NEWS2: 12 (Riesgo Extremo de Colapso)',
      action: 'Activación Inmediata de Sala Trauma Shock, Código Azul y Vía Aérea Avanzada.',
    },
    {
      label: 'Dificultad Respiratoria Aguda / Cefalea Severa con Vómitos',
      level: 'NIVEL 2: EMERGENCIA (NARANJA)',
      time: '< 10 minutos',
      badge: 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-400/40',
      newsScore: 'Score NEWS2: 7 (Riesgo Alto)',
      action: 'Canalización venosa inmediata, oxigenoterapia al 100% y evaluación por médico especialista.',
    },
    {
      label: 'Fiebre Alta Continua / Dolor Abdominal Agudo Moderado',
      level: 'NIVEL 3: URGENCIA (AMARILLO)',
      time: '< 60 minutos',
      badge: 'bg-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.5)] font-bold',
      newsScore: 'Score NEWS2: 4 (Riesgo Medio)',
      action: 'Toma de signos vitales seriados cada 30 min y orden prioritaria de analítica de laboratorio.',
    },
    {
      label: 'Trauma Menor en Miembros / Infección Respiratoria Leve',
      level: 'NIVEL 4: MENOR (VERDE)',
      time: '< 120 minutos',
      badge: 'bg-[#10b981] text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-bold',
      newsScore: 'Score NEWS2: 1 (Riesgo Bajo)',
      action: 'Atención ambulatoria, curas menores y administración de pauta analgésica estándar.',
    },
    {
      label: 'Control Preventivo / Renovación de Récipe Médico',
      level: 'NIVEL 5: NO URGENTE (AZUL)',
      time: '< 240 minutos',
      badge: 'bg-[#0284c7] text-white shadow-[0_0_20px_rgba(2,132,199,0.5)]',
      newsScore: 'Score NEWS2: 0 (Sin Deterioro)',
      action: 'Enrutamiento a Consulta Externa programada o retiro directo en ventanilla de farmacia.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-[#dce3f0] font-sans selection:bg-[#00f1fd] selection:text-slate-950 overflow-x-hidden relative">
      {/* Luxury Clinic Styles & Keyframe Animations */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-1deg); }
        }
        @keyframes radarScan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; filter: blur(25px); transform: scale(1); }
          50% { opacity: 0.75; filter: blur(45px); transform: scale(1.06); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .anim-float { animation: floatSlow 6s ease-in-out infinite; }
        .anim-float-rev { animation: floatReverse 7s ease-in-out infinite; }
        .anim-radar { animation: radarScan 10s linear infinite; }
        .anim-spin-slow { animation: spinSlow 28s linear infinite; }
        .anim-glow { animation: pulseGlow 5s ease-in-out infinite; }
        
        .cyber-grid {
          background-size: 48px 48px;
          background-image: 
            linear-gradient(to right, rgba(78, 222, 163, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(78, 222, 163, 0.035) 1px, transparent 1px);
        }
        .glass-clinic-card {
          background: rgba(11, 21, 40, 0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(0, 241, 253, 0.25);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        .laser-glow {
          box-shadow: 0 0 35px -5px rgba(0, 241, 253, 0.35);
        }
        .emerald-glow {
          box-shadow: 0 0 30px -5px rgba(16, 185, 129, 0.3);
        }
      `}</style>

      {/* STICKY HEADER SYSTEM: Telemetry banner + Persistent Navigation Floating Bar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#080f18]/95 border-b border-[#00f1fd]/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        {/* Sub-bar 1: Medical Telemetry & Hospital Status */}
        <div className="border-b border-[#00f1fd]/15 bg-[#050b14]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10b981]/15 border border-[#4edea3]/40 text-[#4edea3] font-mono text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping inline-block"></span>
                SISTEMA HOSPITALARIO OPERATIVO
              </span>
              <span className="hidden sm:inline text-slate-400 font-mono text-[10px]">
                ASIC RED BARRIO ADENTRO • MPPS VENEZUELA
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-slate-300 text-[11px]">
              <div className="flex items-center gap-1 text-[#00f1fd]">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>BPM: {bpmMode} STABLE</span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-[#4edea3]">
                <ShieldCheck className="w-3 h-3" />
                <span>SpO2: 99.4% NOMINAL</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{currentTime || '12:00:00'} VET</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-bar 2: Navigation Bar with Quick Jump Links and System Access CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          {/* Logo Brand / Hero scroll */}
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 group cursor-pointer text-left shrink-0"
            title="Ir al inicio"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f1fd]/20 to-[#10b981]/20 border border-[#00f1fd]/40 flex items-center justify-center text-[#00f1fd] group-hover:border-[#00f1fd] group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(0,241,253,0.2)]">
              <Stethoscope className="w-4 h-4 text-[#00f1fd]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white group-hover:text-[#00f1fd] transition-colors leading-tight">
                CDI SALUD INTEGRAL
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-[#4edea3] tracking-widest uppercase">
                ALTA TECNOLOGÍA BIOMÉDICA
              </span>
            </div>
          </button>

          {/* Persistent Quick Jump Links [#hero, #especialidades, #triaje, #portal] */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'hero'
                  ? 'bg-[#00f1fd]/20 text-[#00f1fd] border border-[#00f1fd]/50 shadow-[0_0_12px_rgba(0,241,253,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span>Inicio</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('especialidades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'especialidades'
                  ? 'bg-[#00f1fd]/20 text-[#00f1fd] border border-[#00f1fd]/50 shadow-[0_0_12px_rgba(0,241,253,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span>Especialidades</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('triaje')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'triaje'
                  ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/50 shadow-[0_0_12px_rgba(255,180,171,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span>Triaje Manchester</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('portal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === 'portal'
                  ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/50 shadow-[0_0_12px_rgba(78,222,163,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span>Portal Paciente</span>
            </button>
          </nav>

          {/* Quick CTA: Ingresar al Sistema Clínico */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00f1fd] via-[#4edea3] to-[#10b981] hover:brightness-110 active:scale-95 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,241,253,0.4)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Ingresar al Sistema Clínico</span>
              <span className="sm:hidden">Sistema Clínico</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: 12-COLUMN CONCERT-POSTER LAYOUT */}
      <section id="hero" className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 cyber-grid overflow-hidden">
        {/* Ambient bioluminescent glows */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#00f1fd]/10 rounded-full anim-glow pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#10b981]/10 rounded-full anim-glow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* LEFT 7 COLUMNS: DISPLAY TITLES, HOLOGRAPHIC QUICK BADGES & 4 MAIN CTAS */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Prestigious Medical Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b1528] border border-[#00f1fd]/40 text-[#00f1fd] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,241,253,0.2)] mb-5 self-start">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping inline-block"></span>
                INSTITUTO DE PRECISIÓN BIOMÉDICA & DIAGNÓSTICO AVANZADO
              </div>

              {/* Bold Concert-Poster Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase leading-[1.05] text-white">
                CDI SALUD INTEGRAL
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fd] via-[#4edea3] to-[#10b981] drop-shadow-[0_0_35px_rgba(0,241,253,0.35)]">
                  CENTRO MÉDICO DE ALTA TECNOLOGÍA
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                Infraestructura asistencial de alta complejidad que integra 25 módulos clínicos,
                historia médica electrónica digital, triaje inteligente Manchester NEWS2 y farmacia robótica
                bajo estándar FEFO con sincronización híbrida en la nube.
              </p>

              {/* 4 Holographic Quick Badges as Interactive CTAs */}
              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigateTo('triaje')}
                  className="p-2.5 rounded-xl bg-[#0b1528]/90 border border-[#10b981]/40 hover:border-[#10b981] hover:bg-[#10b981]/15 backdrop-blur-md flex items-center gap-2 text-left cursor-pointer transition-all group"
                  title="Ir a Emergencias y Triaje"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shrink-0 group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight group-hover:text-[#4edea3] transition-colors">Atención 24/7</div>
                    <div className="text-[9px] text-[#4edea3] font-mono">Código Rojo Activo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('oftalmologia')}
                  className="p-2.5 rounded-xl bg-[#0b1528]/90 border border-[#00f1fd]/40 hover:border-[#00f1fd] hover:bg-[#00f1fd]/15 backdrop-blur-md flex items-center gap-2 text-left cursor-pointer transition-all group"
                  title="Ir a Misión Milagro Oftalmología"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00f1fd]/20 border border-[#00f1fd]/40 flex items-center justify-center text-[#00f1fd] shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight group-hover:text-[#00f1fd] transition-colors">Cirugía Láser HD</div>
                    <div className="text-[9px] text-[#00f1fd] font-mono">Excimer Precision</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('telemedicina')}
                  className="p-2.5 rounded-xl bg-[#0b1528]/90 border border-teal-500/40 hover:border-teal-400 hover:bg-teal-500/15 backdrop-blur-md flex items-center gap-2 text-left cursor-pointer transition-all group"
                  title="Ir a Telemedicina HD"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight group-hover:text-teal-300 transition-colors">Telemedicina HD</div>
                    <div className="text-[9px] text-teal-300 font-mono">Cifrado SHA-512</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('triaje')}
                  className="p-2.5 rounded-xl bg-[#0b1528]/90 border border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/15 backdrop-blur-md flex items-center gap-2 text-left cursor-pointer transition-all group"
                  title="Ver Triaje Manchester IA"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300 shrink-0 group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight group-hover:text-violet-300 transition-colors">Triaje IA</div>
                    <div className="text-[9px] text-violet-300 font-mono">NEWS2 Score</div>
                  </div>
                </button>
              </div>

              {/* 4 Interactive CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-[#00f1fd] via-[#4edea3] to-[#10b981] hover:brightness-110 active:scale-95 transition-all laser-glow cursor-pointer"
                >
                  <Cpu className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>Ingresar al Sistema Clínico</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigateTo('portal_paciente')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base text-[#4edea3] bg-[#0b1528]/90 hover:bg-[#111f38] border border-[#4edea3]/50 hover:border-[#4edea3] active:scale-95 transition-all emerald-glow cursor-pointer"
                >
                  <Users className="w-5 h-5 text-[#4edea3]" />
                  <span>Portal del Paciente</span>
                </button>

                <button
                  onClick={() => navigateTo('triaje')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base text-[#ffb4ab] bg-[#2a0e12]/80 hover:bg-[#3d131a] border border-[#ffb4ab]/50 hover:border-[#ffb4ab] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,180,171,0.25)] cursor-pointer"
                >
                  <ShieldAlert className="w-5 h-5 text-[#ffb4ab] animate-pulse" />
                  <span>Triaje Rápido de Emergencia</span>
                </button>

                <button
                  onClick={() => navigateTo('citas')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-200 bg-[#080f18] hover:bg-[#0f1b2b] border border-slate-700 hover:border-slate-500 active:scale-95 transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5 text-[#00f1fd]" />
                  <span>Agendar Cita</span>
                </button>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: TELEMETRY & 3D HOLOGRAPHIC MEDICAL CROSS HUD */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#080f18] border-2 border-[#00f1fd]/40 laser-glow overflow-hidden">
                
                {/* HUD Header Bar */}
                <div className="px-5 py-3 bg-[#0b1528] border-b border-[#00f1fd]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-ping"></span>
                    <span className="font-mono text-xs font-bold text-[#00f1fd] tracking-wider">
                      TELEMETRÍA CRÍTICA EN VIVO
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audio Toggle */}
                    <button
                      onClick={() => {
                        setIsAudioMuted(!isAudioMuted);
                        if (isAudioMuted && !audioCtxRef.current) {
                          try {
                            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                            audioCtxRef.current = new AudioCtx();
                          } catch {
                            // Safe fallback
                          }
                        }
                      }}
                      title={isAudioMuted ? 'Activar tono cardíaco' : 'Silenciar monitor'}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        !isAudioMuted
                          ? 'bg-[#00f1fd]/20 border-[#00f1fd] text-[#00f1fd]'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    {/* Pause/Play */}
                    <button
                      onClick={() => setIsECGPaused(!isECGPaused)}
                      className="p-1.5 rounded-lg border bg-slate-900 border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {!isECGPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3D Holographic Medical Cross Showcase Area */}
                <div className="relative h-44 bg-[#050b14] flex items-center justify-center overflow-hidden border-b border-[#00f1fd]/20">
                  {/* Concentric rotating orbital rings */}
                  <div className="absolute w-40 h-40 rounded-full border border-dashed border-[#00f1fd]/30 anim-spin-slow"></div>
                  <div className="absolute w-32 h-32 rounded-full border border-[#4edea3]/40 anim-radar"></div>
                  <div className="absolute w-20 h-20 rounded-full bg-[#00f1fd]/10 backdrop-blur-md"></div>

                  {/* 3D Luminous Medical Cross */}
                  <div className="relative z-10 w-16 h-16 flex items-center justify-center">
                    {/* Vertical Beam (Emerald) */}
                    <div className="absolute w-5 h-16 rounded-full bg-gradient-to-b from-[#4edea3] to-[#10b981] shadow-[0_0_25px_rgba(78,222,163,0.8)]"></div>
                    {/* Horizontal Beam (Cyan) */}
                    <div className="absolute w-16 h-5 rounded-full bg-gradient-to-r from-[#00f1fd] to-[#00b2d0] shadow-[0_0_25px_rgba(0,241,253,0.8)]"></div>
                    {/* Crystal Center Core */}
                    <div className="relative z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_#ffffff]">
                      <HeartPulse className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                    </div>
                  </div>

                  {/* Floating bioseñal indicators inside HUD */}
                  <div className="absolute top-3 left-4 px-2.5 py-1 rounded bg-[#0b1528]/90 border border-[#00f1fd]/40 font-mono text-[10px] text-[#00f1fd] font-bold">
                    BPM: {bpmMode} STABLE
                  </div>
                  <div className="absolute top-3 right-4 px-2.5 py-1 rounded bg-[#0b1528]/90 border border-[#4edea3]/40 font-mono text-[10px] text-[#4edea3] font-bold">
                    SPO2: 99.4% NOMINAL
                  </div>

                  <div className="absolute bottom-2 left-4 font-mono text-[9px] text-slate-400">
                    DERIVACIÓN II • FILTRO 0.5-40Hz
                  </div>
                  <div className="absolute bottom-2 right-4 font-mono text-[9px] text-[#4edea3]">
                    SINCRONIZADO
                  </div>
                </div>

                {/* Canvas ECG Waveform Trace */}
                <div className="relative w-full h-[190px] bg-[#080f18]">
                  <canvas ref={canvasRef} className="w-full h-full block" />

                  {/* Rhythm selector buttons inside monitor */}
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => setBpmMode(72)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        bpmMode === 72 ? 'bg-[#00f1fd] text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      72 Sinusal
                    </button>
                    <button
                      onClick={() => setBpmMode(105)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        bpmMode === 105 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      105 Esfuerzo
                    </button>
                    <button
                      onClick={() => setBpmMode(135)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        bpmMode === 135 ? 'bg-[#ba1a1a] text-white font-bold' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      135 UCI
                    </button>
                  </div>
                </div>

                {/* Bottom Micro-Telemetry Readouts */}
                <div className="p-3 bg-[#0b1528] border-t border-[#00f1fd]/20 grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-[#080f18] border border-slate-800">
                    <div className="text-slate-500">CAMPO MAG</div>
                    <div className="text-white font-bold">3.0 TESLA</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#080f18] border border-slate-800">
                    <div className="text-slate-500">RESOLUCIÓN</div>
                    <div className="text-[#00f1fd] font-bold">0.12 MM</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#080f18] border border-slate-800">
                    <div className="text-slate-500">ESTADO IA</div>
                    <div className="text-[#4edea3] font-bold">SYNCHRON</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BENTO STRIP: HIGH-IMPACT CLINICAL METRIC CARDS */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-[#0b1528]/80 border border-[#00f1fd]/30 backdrop-blur-md hover:border-[#00f1fd] transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#00f1fd] drop-shadow-[0_0_15px_rgba(0,241,253,0.4)]">
                99.8%
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Precisión Diagnóstica
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Estudios validados bajo norma ISO</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528]/80 border border-[#4edea3]/30 backdrop-blur-md hover:border-[#4edea3] transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#4edea3] drop-shadow-[0_0_15px_rgba(78,222,163,0.4)]">
                +120,000
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Pacientes Atendidos
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Cobertura integral gratuita comunitaria</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528]/80 border border-indigo-500/30 backdrop-blur-md hover:border-indigo-400 transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                45+
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Especialidades Médicas
              </div>
              <div className="text-xs text-slate-400 mt-0.5">25 módulos de gestión unificados</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528]/80 border border-rose-500/30 backdrop-blur-md hover:border-[#ffb4ab] transition-all">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#ffb4ab] drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">
                24/7
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Urgencias & UCI Activas
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Trauma Shock con respuesta inmediata</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CONCERT-POSTER STYLE SPECIALTY CARDS */}
      <section id="especialidades" className="py-20 relative bg-[#080f18] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00f1fd]/10 border border-[#00f1fd]/30 text-[#00f1fd] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              CENTRO DE ALTA COMPLEJIDAD
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              Especialidades de Vanguardia Médica
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Tecnología de última generación, precisión diagnóstica milimétrica y atención médica
              con calidez humana y gratuidad total para el pueblo.
            </p>
          </div>

          {/* Specialty Cards Grid with Featured Double-Width Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialtyCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  className={`group relative rounded-3xl p-7 bg-gradient-to-b ${card.gradient} bg-[#0b1528]/95 border border-slate-800/90 backdrop-blur-xl ${card.borderGlow} transition-all duration-300 flex flex-col justify-between ${
                    card.isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  <div>
                    {/* Top code and category */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-xs text-slate-400 tracking-wider">
                        {card.code}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${card.badgeColor}`}
                      >
                        {card.category}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white group-hover:scale-110 transition-transform shadow-lg">
                        <IconComp size={30} className="text-[#00f1fd]" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#00f1fd] transition-colors leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {card.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {card.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-2.5 py-1 rounded bg-[#080f18] text-slate-300 border border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Metric & Action CTA */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">
                        {card.metrics.label}
                      </div>
                      <div className="font-mono text-sm sm:text-base font-bold text-white">
                        {card.metrics.value}
                      </div>
                    </div>

                    <button
                      onClick={() => navigateTo(card.module)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-[#00f1fd] group-hover:shadow-[0_0_20px_rgba(0,241,253,0.5)] transition-all cursor-pointer"
                    >
                      <span>Acceder al Módulo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE MANCHESTER TRIAGE & NEWS2 SIMULATOR */}
      <section id="triaje" className="py-20 bg-[#050b14] border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Description & Medical Protocol */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                PROTOCOLO DE URGENCIA HOSPITALARIA
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight uppercase">
                Triaje Manchester & Alerta NEWS2 en Tiempo Real
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Priorización clínica objetiva en 5 niveles de gravedad. Al registrarse signos de
                deterioro fisiológico extremo, el sistema dispara automáticamente el código de alerta
                temprana para intervención sin demora.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Escala Manchester:</strong> 5 niveles de prioridad visual para asignación inmediata de recursos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Score NEWS2:</strong> Monitor de 7 variables para anticipar sepsis, shock y paro.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Sincronización Total:</strong> Notificación automática al personal de enfermería y médicos de guardia.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigateTo('triaje')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#ba1a1a] hover:bg-[#d92222] shadow-[0_0_25px_rgba(186,26,26,0.5)] active:scale-95 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>Abrir Estación Oficial de Triaje</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Simulator Widget */}
            <div className="lg:col-span-7">
              <div className="p-7 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#ffb4ab]" />
                    <span className="font-mono text-sm font-bold text-white uppercase">
                      Simulador Clínico de Priorización Inmediata
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#00f1fd] bg-[#080f18] px-2.5 py-1 rounded border border-[#00f1fd]/30">
                    INTERACTIVO
                  </span>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Seleccione un cuadro clínico para ver la respuesta automatizada del protocolo:
                  </label>
                  <div className="space-y-2">
                    {triageOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTriageSymptom(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          selectedTriageSymptom === idx
                            ? 'bg-[#111f38] border-[#00f1fd] text-white shadow-[0_0_20px_rgba(0,241,253,0.25)]'
                            : 'bg-[#080f18] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-3 h-3 rounded-full shrink-0 ${
                              idx === 0
                                ? 'bg-[#ba1a1a]'
                                : idx === 1
                                ? 'bg-amber-500'
                                : idx === 2
                                ? 'bg-yellow-400'
                                : idx === 3
                                ? 'bg-[#10b981]'
                                : 'bg-sky-500'
                            }`}
                          ></span>
                          <span>{opt.label}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {idx === selectedTriageSymptom ? 'ACTIVO' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Calculated Result Box */}
                <div className="mt-6 p-5 rounded-2xl bg-[#080f18] border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${triageOptions[selectedTriageSymptom].badge}`}
                    >
                      {triageOptions[selectedTriageSymptom].level}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Tiempo Máximo de Atención:{' '}
                      <strong className="text-white">
                        {triageOptions[selectedTriageSymptom].time}
                      </strong>
                    </span>
                  </div>

                  <div className="font-mono text-xs text-[#00f1fd] font-semibold mb-1.5">
                    {triageOptions[selectedTriageSymptom].newsScore}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {triageOptions[selectedTriageSymptom].action}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: PATIENT PORTAL QUICK ACCESS KIOSK */}
      <section id="portal" className="py-20 relative bg-[#080f18] border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0b1528] via-[#080f18] to-[#0b1528] border border-[#00f1fd]/30 laser-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f1fd]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex p-3.5 rounded-2xl bg-[#00f1fd]/10 border border-[#00f1fd]/30 text-[#00f1fd] mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase">
                Portal del Paciente Digital
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base">
                Consulta tus resultados de laboratorio validados, proyecciones tomográficas y
                recetas electrónicas oficiales directamente con tu Cédula de Identidad.
              </p>

              {/* Quick ID Search Box */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  placeholder="Ej: V-12345678"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050b14] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00f1fd] focus:ring-1 focus:ring-[#00f1fd] font-mono"
                />
                <button
                  onClick={() => navigateTo('portal_paciente')}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-slate-950 bg-[#00f1fd] hover:bg-[#4edea3] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,241,253,0.4)] cursor-pointer whitespace-nowrap"
                >
                  Consultar Historial
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                  Resultados con Código QR
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00f1fd]" />
                  Cifrado de Datos Clínicos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CLINICAL INFRASTRUCTURE & TECH SPECIFICATIONS */}
      <section className="py-16 bg-[#050b14] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800">
              <Building2 className="w-8 h-8 text-[#00f1fd] mx-auto mb-3" />
              <div className="font-bold text-white text-base">Red ASIC Barrio Adentro</div>
              <div className="text-xs text-slate-400 mt-1">Integración Comunitaria</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800">
              <Cpu className="w-8 h-8 text-[#4edea3] mx-auto mb-3" />
              <div className="font-bold text-white text-base">Dual-Sync Cloud & Offline</div>
              <div className="text-xs text-slate-400 mt-1">Supabase + SQLite Local</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800">
              <Layers className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <div className="font-bold text-white text-base">Trazabilidad Total FEFO</div>
              <div className="text-xs text-slate-400 mt-1">Cero Pérdida de Insumos</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800">
              <Award className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="font-bold text-white text-base">100% Gratuito y Público</div>
              <div className="text-xs text-slate-400 mt-1">Derecho Sagrado a la Salud</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#080f18] border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <div className="font-bold text-white text-base tracking-wider uppercase">
                CDI SALUD INTEGRAL
              </div>
              <p className="text-slate-500 mt-1 text-xs">
                Centro de Diagnóstico Integral • ASIC Red Barrio Adentro • MPPS Venezuela
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('dashboard')}
                className="px-4 py-2 rounded-lg bg-[#0b1528] border border-slate-700 text-white hover:text-[#00f1fd] hover:border-[#00f1fd] text-xs font-semibold transition-all cursor-pointer"
              >
                Ingresar al Dashboard
              </button>
              <button
                onClick={() => navigateTo('triaje')}
                className="px-4 py-2 rounded-lg bg-[#2a0e12] border border-[#ba1a1a] text-[#ffb4ab] hover:border-[#ffb4ab] text-xs font-semibold transition-all cursor-pointer"
              >
                Emergencias / Triaje
              </button>
              <button
                onClick={() => navigateTo('portal_paciente')}
                className="px-4 py-2 rounded-lg bg-[#0b1528] border border-slate-700 text-[#00f1fd] hover:border-[#00f1fd] text-xs font-semibold transition-all cursor-pointer"
              >
                Portal Paciente
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-mono text-[11px]">
            <div>
              © {new Date().getFullYear()} CDI Sistema Integral de Salud. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <span>Versión 2.0 Enterprise</span>
              <span>•</span>
              <span>Vercel + Supabase Active</span>
            </div>
          </div>
        </div>
      </footer>
      {/* PERSISTENT FLOATING QUICK ACTIONS (Volver Arriba & Ingresar al Sistema Clínico) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Floating Quick Action: Ingresar al Sistema Clínico */}
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00f1fd] via-[#4edea3] to-[#10b981] text-slate-950 font-extrabold text-xs shadow-[0_6px_25px_rgba(0,241,253,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title="Ingresar directamente al Sistema Clínico"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-slate-950" />
          <span className="font-sans font-bold">Ingresar al Sistema Clínico</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Floating Quick Action: Volver Arriba */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0b1528]/95 hover:bg-[#111f38] text-[#00f1fd] border border-[#00f1fd]/50 shadow-[0_6px_20px_rgba(0,0,0,0.7)] hover:border-[#00f1fd] hover:text-white active:scale-95 transition-all cursor-pointer backdrop-blur-md group animate-in fade-in"
            title="Volver Arriba"
          >
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs font-mono font-bold">Volver Arriba</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPageView;
