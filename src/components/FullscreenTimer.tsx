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
  "Deep focus is the ultimate competitive advantage.",
  "Focus on the process, not just the outcome. Each second builds your future mastery.",
  "The Level I curriculum is broad, but today's micro-progress is what wins.",
  "Your mind is like water. When calm, everything becomes perfectly clear.",
  "Spaced repetition and high-focus periods always beat late-night distracted cramming.",
  "Integrity in daily prep breeds absolute confidence during the exam."
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

  // Ambient focus synth sound using Web Audio API
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
        osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // 110Hz
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(114, audioCtx.currentTime); // 114Hz binaural beat (4Hz theta delta difference)

        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // extremely gentle and subtle hum

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
      } catch (err) {
        console.warn("Web Audio API focus oscillator blocked:", err);
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
      case "inhale": return "Inhale Slowly";
      case "hold": return "Hold Breath";
      case "exhale": return "Exhale Gently";
      case "rest": return "Rest & Center";
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--theme-bg)] text-[var(--theme-text-dark)] z-50 flex flex-col justify-between p-6 overflow-hidden select-none animate-fadeIn font-sans">
      
      {/* Background radial ambient lights based on selected theme */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--theme-accent)]/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--theme-accent)]/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms]" />

      {/* 1. Header controls */}
      <div className="flex items-center justify-between border-b border-[var(--theme-border)]/20 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--theme-accent-light)] border border-[var(--theme-accent)]/20 flex items-center justify-center text-[var(--theme-accent)]">
            <Compass className="animate-spin duration-[30000ms]" size={16} />
          </div>
          <div>
            <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--theme-text-main)] opacity-70 block">Focus Engine Active</span>
            <span className="text-xs font-semibold text-[var(--theme-text-dark)]">{activeSubjectName} • {activeModuleName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Ambient Sound Toggle */}
          <button
            type="button"
            onClick={() => setAmbientSound(!ambientSound)}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-medium border cursor-pointer ${
              ambientSound 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-[var(--theme-card)] border-[var(--theme-border)]/35 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
            }`}
            title="Toggle binaural focus wave hum"
          >
            {ambientSound ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{ambientSound ? "Binaural Focus On" : "Binaural focus wave"}</span>
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={onMinimize}
            className="flex items-center gap-1.5 bg-[var(--theme-card)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/35 px-4.5 py-2 rounded-xl text-xs font-semibold transition-all text-[var(--theme-text-dark)] hover:-translate-y-[1px] cursor-pointer"
          >
            <Minimize2 size={13} className="opacity-75" />
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
                transform: `scale(${1 + (breathingProgress / 100) * 0.25})`,
                opacity: isTimerRunning ? 0.75 : 0.15
              }}
            />

            {/* Main breathing orb */}
            <div 
              className="absolute rounded-full flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out border shadow-md"
              style={{
                width: `${140 + (breathingProgress / 100) * 60}px`,
                height: `${140 + (breathingProgress / 100) * 60}px`,
                backgroundColor: breathingStep === "hold" ? "rgba(16, 185, 129, 0.08)" : "var(--theme-accent-light)",
                borderColor: breathingStep === "hold" ? "#10B981" : "var(--theme-accent)",
                boxShadow: `0 0 40px ${breathingStep === "hold" ? "rgba(16, 185, 129, 0.15)" : "var(--theme-accent-light)"}`
              }}
            >
              <Sparkles className="text-[var(--theme-accent)]/60 mb-2 animate-pulse" size={18} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-text-dark)]">
                {isTimerRunning ? getBreathingLabel() : "Focus Paused"}
              </span>
              {isTimerRunning && (
                <span className="text-[9px] text-[var(--theme-text-main)] mt-1 opacity-75">
                  {breathingStep === "inhale" || breathingStep === "exhale" ? "Follow rhythm" : "Relax"}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-[var(--theme-text-dark)]">Box Breathing Metronome</h3>
            <p className="text-[11px] text-[var(--theme-text-main)] max-w-xs leading-relaxed opacity-75">
              Sync your breaths to enter deep focus state and increase retention rates.
            </p>
          </div>
        </div>

        {/* Stopwatch & Study Status - Right Side */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-md w-full">
          <div className="space-y-2">
            <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--theme-accent)] bg-[var(--theme-accent-light)] border border-[var(--theme-accent)]/20 px-3 py-1 rounded-full">
              {isTimerRunning ? "Deep session running" : "Timer paused"}
            </span>
            <div className="text-5xl md:text-7xl font-mono font-medium tracking-tight text-[var(--theme-text-dark)] select-text">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-xs text-[var(--theme-text-main)] opacity-75">
              Focus time logged here will sync automatically to your diagnostics report.
            </p>
          </div>

          {/* Motivation Quote */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-5 rounded-2xl w-full text-left space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase text-[var(--theme-text-main)] opacity-70">
              <Award size={12} className="text-amber-500" />
              <span>Diagnostic Mindfulness</span>
            </div>
            <p className="text-xs text-[var(--theme-text-dark)] leading-relaxed italic opacity-90">
              "{STUDY_QUOTES[activeQuoteIdx]}"
            </p>
          </div>

          {/* Control Buttons Panel */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <button
              type="button"
              onClick={onToggleTimer}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-none text-xs font-semibold transition-all hover:-translate-y-[1px] cursor-pointer ${
                isTimerRunning 
                  ? "bg-amber-500 hover:bg-amber-600 text-neutral-900" 
                  : "bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)]"
              }`}
            >
              {isTimerRunning ? <Pause size={18} className="mb-1" /> : <Play size={18} className="mb-1" />}
              <span>{isTimerRunning ? "Pause" : "Resume"}</span>
            </button>

            <button
              type="button"
              onClick={onResetTimer}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[var(--theme-card)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/35 text-[var(--theme-text-dark)] text-xs font-semibold transition-all hover:-translate-y-[1px] cursor-pointer"
            >
              <RotateCcw size={18} className="mb-1 opacity-70" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onSaveSession}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-none font-semibold text-xs transition-all hover:-translate-y-[1px] cursor-pointer"
            >
              <CheckCircle size={18} className="mb-1 text-emerald-100" />
              <span>Log & Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer branding */}
      <div className="text-center text-[var(--theme-text-main)] text-[10px] font-mono tracking-wider opacity-50 z-10 relative">
        CFA LEVEL I PREP RUNWAY • MINDFUL STUDY ENVELOPE
      </div>
    </div>
  );
}
