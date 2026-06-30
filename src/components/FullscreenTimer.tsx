import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Minimize2, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Compass, 
  Award 
} from "lucide-react";

interface FullscreenTimerProps {
  isOpen: boolean;
  onMinimize: () => void;
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSaveSession: () => void;
  activeModuleName: string;
  activeSubjectName: string;
}

const STUDY_QUOTES = [
  "Deep work is the superpower of the 21st century.",
  "Focus on the process, not just the outcome. Each second builds your future self.",
  "The Level I curriculum is vast, but today's progress is what matters.",
  "Your mind is like water. When turbulent, it's difficult to see. When calm, everything becomes clear.",
  "Spaced repetition and high-focus periods beat long, distracted cramming every single time.",
  "Integrity in study breeds ultimate clarity in execution."
];

export default function FullscreenTimer({
  isOpen,
  onMinimize,
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onSaveSession,
  activeModuleName,
  activeSubjectName
}: FullscreenTimerProps) {
  const [breathingStep, setBreathingStep] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathingProgress, setBreathingProgress] = useState(0); // 0 to 100 for visual scaling
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [ambientSound, setAmbientSound] = useState(false);
  const [audioNode, setAudioNode] = useState<HTMLAudioElement | null>(null);

  // Breathing Guide loop (4-second box breathing cycle)
  useEffect(() => {
    if (!isTimerRunning || !isOpen) return;

    let counter = 0;
    const interval = setInterval(() => {
      counter = (counter + 1) % 16;
      
      if (counter < 4) {
        setBreathingStep("inhale");
        setBreathingProgress(((counter + 1) / 4) * 100);
      } else if (counter < 8) {
        setBreathingStep("hold");
        setBreathingProgress(100);
      } else if (counter < 12) {
        setBreathingStep("exhale");
        setBreathingProgress((1 - ((counter - 7) / 4)) * 100);
      } else {
        setBreathingStep("rest");
        setBreathingProgress(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isOpen]);

  // Rotate quotes every 45 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveQuoteIdx(prev => (prev + 1) % STUDY_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Ambient focus synth sound (optional, built using web audio API to avoid missing file errors!)
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;

    if (ambientSound && isTimerRunning && isOpen) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        osc1 = audioCtx.createOscillator();
        osc2 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        // Relaxing low-frequency binaural hum
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(120, audioCtx.currentTime); // 120Hz
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(124, audioCtx.currentTime); // 124Hz binaural beat

        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); // very quiet and subtle

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
      } catch (err) {
        console.warn("Web Audio API not fully allowed in iframe:", err);
      }
    }

    return () => {
      if (osc1) osc1.stop();
      if (osc2) osc2.stop();
      if (audioCtx) audioCtx.close();
    };
  }, [ambientSound, isTimerRunning, isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathingLabel = () => {
    switch (breathingStep) {
      case "inhale": return "Breathe In Slowly";
      case "hold": return "Hold the Breath";
      case "exhale": return "Breathe Out Gently";
      case "rest": return "Pause & Reset";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col justify-between p-6 overflow-hidden select-none">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />

      {/* 1. Header controls */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--theme-accent)]/20 border border-[var(--theme-accent)]/40 flex items-center justify-center text-[var(--theme-accent)]">
            <Compass className="animate-spin duration-[20000ms]" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 block">Focus Engine Active</span>
            <span className="text-xs font-serif font-bold text-slate-350">{activeSubjectName} • {activeModuleName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Sound Toggle */}
          <button
            type="button"
            onClick={() => setAmbientSound(!ambientSound)}
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-mono border ${
              ambientSound 
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400" 
                : "bg-slate-900 border-slate-800 text-slate-450 hover:text-slate-200"
            }`}
            title="Toggle Binaural hum to help focus"
          >
            {ambientSound ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{ambientSound ? "Binaural On" : "Ambient sound"}</span>
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={onMinimize}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition text-slate-300"
          >
            <Minimize2 size={13} />
            <span>Minimize</span>
          </button>
        </div>
      </div>

      {/* 2. Main visual content container */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 max-w-5xl mx-auto w-full z-10 relative">
        
        {/* Breathing Orb & Visual Animation - Left Side */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-56 h-56 md:w-64 md:h-64">
            
            {/* Ambient outer pulse ring */}
            <div 
              className="absolute inset-0 rounded-full bg-[var(--theme-accent)]/5 transition-all duration-1000 ease-in-out"
              style={{ 
                transform: `scale(${1 + (breathingProgress / 100) * 0.3})`,
                opacity: isTimerRunning ? 0.7 : 0.2
              }}
            />

            {/* Main breathing orb */}
            <div 
              className="absolute rounded-full flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out border shadow-2xl"
              style={{
                width: `${140 + (breathingProgress / 100) * 60}px`,
                height: `${140 + (breathingProgress / 100) * 60}px`,
                backgroundColor: breathingStep === "hold" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.1)",
                borderColor: breathingStep === "hold" ? "#10B981" : "rgba(59, 130, 246, 0.4)",
                boxShadow: `0 0 40px ${breathingStep === "hold" ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.15)"}`
              }}
            >
              <Sparkles className="text-[var(--theme-accent)]/60 mb-2 animate-pulse" size={18} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {isTimerRunning ? getBreathingLabel() : "Focus Stopped"}
              </span>
              {isTimerRunning && (
                <span className="text-[9px] font-mono font-medium text-slate-500 mt-1">
                  {breathingStep === "inhale" || breathingStep === "exhale" ? "Deep breath" : "Relax"}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-slate-350">Box Breathing Focus Guide</h3>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Match your breaths to the expanding center orb to lower heart rate and enter a productive study flow.
            </p>
          </div>
        </div>

        {/* Stopwatch & Study Status - Right Side */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-md w-full">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--theme-accent)] bg-[var(--theme-accent)]/15 border border-[var(--theme-accent)]/30 px-2.5 py-1 rounded-full">
              {isTimerRunning ? "⏱️ STUDY SESSION RUNNING" : "⏸️ TRACKER PAUSED"}
            </span>
            <div className="text-5xl md:text-7xl font-mono font-extrabold tracking-tight text-white select-text">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Active module study clock. Your accrued study statistics sync perfectly.
            </p>
          </div>

          {/* Motivation Quote */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full text-left space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-slate-500">
              <Award size={12} className="text-amber-500" />
              <span>CFA Candidate Encouragement</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
              "{STUDY_QUOTES[activeQuoteIdx]}"
            </p>
          </div>

          {/* Control Buttons Panel */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <button
              type="button"
              onClick={onToggleTimer}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border font-bold text-xs transition ${
                isTimerRunning 
                  ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950" 
                  : "bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] border-[var(--theme-accent)] text-white"
              }`}
            >
              {isTimerRunning ? <Pause size={18} className="mb-1" /> : <Play size={18} className="mb-1" />}
              <span>{isTimerRunning ? "Pause Clock" : "Resume"}</span>
            </button>

            <button
              type="button"
              onClick={onResetTimer}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 font-bold text-xs transition"
            >
              <RotateCcw size={18} className="mb-1 text-slate-400" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onSaveSession}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-650 hover:bg-emerald-700 border border-emerald-800 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/20"
            >
              <CheckCircle size={18} className="mb-1 text-emerald-300" />
              <span>Log & Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer branding */}
      <div className="text-center text-slate-650 text-[10px] font-mono z-10 relative">
        CFA STUDY BUDDY • DESIGNED WITH DISTRACTION-FREE INTERACTION SHIELDS
      </div>
    </div>
  );
}
