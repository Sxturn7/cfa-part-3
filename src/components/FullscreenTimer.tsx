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
  Award,
  Settings
} from "lucide-react";
import ElasticSlider from "./ElasticSlider";

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
  // Ambient Sound Props
  activeAmbientId: string | null;
  setActiveAmbientId: React.Dispatch<React.SetStateAction<string | null>>;
  ambientVolume: number;
  setAmbientVolume: React.Dispatch<React.SetStateAction<number>>;
}

const STUDY_SOUNDS = [
  { id: "rain", name: "Rain" },
  { id: "ocean", name: "Ocean" },
  { id: "river", name: "River" },
  { id: "white_noise", name: "White Noise" },
  { id: "brown_noise", name: "Brown Noise" },
  { id: "binaural", name: "Binaural" },
];

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
  activeSubjectName,
  activeAmbientId,
  setActiveAmbientId,
  ambientVolume,
  setAmbientVolume
}: FullscreenTimerProps) {
  const [breathingStep, setBreathingStep] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathingProgress, setBreathingProgress] = useState(0); // 0 to 100 for visual scaling
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  


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
          {/* Ambient Sound Pickers inside Fullscreen Header */}
          <div className="flex items-center gap-1 bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-1 rounded-xl">
            {STUDY_SOUNDS.map((sound) => {
              const isSelected = activeAmbientId === sound.id;
              return (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setActiveAmbientId(null);
                    } else {
                      setActiveAmbientId(sound.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 cursor-pointer border-none ${
                    isSelected
                      ? "bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-semibold"
                      : "bg-transparent text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] opacity-70 hover:opacity-100"
                  }`}
                  title={`${sound.name} loop`}
                >
                  <span>{sound.name}</span>
                </button>
              );
            })}
          </div>

          {activeAmbientId && (
            <div className="flex items-center bg-[var(--theme-card)] border border-[var(--theme-border)]/35 px-3 py-1.5 rounded-xl w-32 md:w-36 h-9.5">
              <ElasticSlider
                defaultValue={Math.round(ambientVolume * 100)}
                startingValue={0}
                maxValue={100}
                stepSize={5}
                isStepped={true}
                showValue={false}
                leftIcon={<VolumeX size={11} className="text-[var(--theme-text-main)] shrink-0" />}
                rightIcon={<Volume2 size={11} className="text-[var(--theme-text-main)] shrink-0" />}
                onChange={(val) => setAmbientVolume(val / 100)}
              />
            </div>
          )}



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

          {/* Ambient Volume Control Panel */}
          {activeAmbientId && (
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-5 rounded-2xl w-full text-left space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--theme-text-main)] opacity-70">
                <Volume2 size={13} className="text-[var(--theme-accent)]" />
                <span>Ambient Audio Volume</span>
              </div>
              <div className="w-full flex items-center justify-center py-1">
                <ElasticSlider
                  defaultValue={Math.round(ambientVolume * 100)}
                  startingValue={0}
                  maxValue={100}
                  stepSize={5}
                  isStepped={true}
                  leftIcon={<VolumeX size={14} className="text-[var(--theme-text-main)]" />}
                  rightIcon={<Volume2 size={14} className="text-[var(--theme-text-main)]" />}
                  onChange={(val) => setAmbientVolume(val / 100)}
                />
              </div>
            </div>
          )}

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
