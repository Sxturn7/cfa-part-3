import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Brain, 
  LayoutDashboard, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Info,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import { AppTheme, THEME_PRESETS } from "../theme";

const PRESET_ACCENTS = [
  { name: "Royal Blue", value: "#2563EB" },
  { name: "Bright Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#0D9488" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#F43F5E" },
];

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "37, 99, 235";
}

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards" | "todo") => void;
  activeTab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards" | "todo";
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

interface TourStep {
  tab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards" | "todo";
  elementId: string | null;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  text: string;
  actionTip: string;
}

export default function TutorialTour({ isOpen, onClose, setActiveTab, activeTab, currentTheme, onThemeChange }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

 const steps: TourStep[] = [
    {
      tab: "dashboard",
      elementId: null,
      title: "WELCOME TO AAERA! 🚀",
      icon: <Sparkles size={20} />,
      iconColor: "text-amber-500",
      text: "AAERA is your personal companion for mastering the CFA Level I curriculum through structured planning, progress tracking, and focused revision. Built around five core pillars, Aim • Analyze • Execute • Reflect • Elevate, it helps you stay organized, strengthen your understanding, and build consistent momentum every day. From your first module to exam day, AAERA keeps your preparation focused, measurable, and moving forward.",
      actionTip: "Tip: Complete the workspace tour to discover everything AAERA has to offer."
    },
    {
      tab: "dashboard",
      elementId: "tour-study-tracker",
      title: "AAERA FOCUS TRACKER ⏱️",
      icon: <LayoutDashboard size={20} />,
      iconColor: "text-blue-500",
      text: "Stay accountable with AAERA's built in Focus Tracker. Select the curriculum module you're studying, start a timed session, and let AAERA automatically record your study time, build daily streaks, and track your consistency. Optional ambient soundscapes help you maintain focus and make every session distraction free.",
      actionTip: "Tip: The Focus Tracker below is where you'll start and record every study session."
    },
    {
      tab: "curriculum",
      elementId: "tour-nav-curriculum",
      title: "ACTIVE CURRICULUM NOTES 📚",
      icon: <BookOpen size={20} />,
      iconColor: "text-emerald-500",
      text: "The Curriculum is organized into all 93 CFA Level I readings, making it easy to study one topic at a time. Mark each reading as Active, Review, or Completed, keep your personal notes alongside every module, and pick up exactly where you left off across all your devices.",
      actionTip: "Tip: Update the status of each reading as you progress to maintain an accurate view of your syllabus coverage."
    },
    {
      tab: "quiz",
      elementId: "tour-nav-quiz",
      title: "ADAPTIVE PRACTICE QUIZZES ✍️",
      icon: <HelpCircle size={20} />,
      iconColor: "text-violet-500",
      text: "Generate personalized quizzes for any CFA Level I topic and challenge yourself at the right difficulty. Every question includes detailed explanations and step by step solutions to help you learn from every attempt.",
      actionTip: "Tip: Use Practice Quizzes after completing each reading to measure retention and build confidence before revision."
    },
    {
      tab: "growth",
      elementId: "tour-nav-growth",
      title: "KNOWLEDGE TREE 🌳",
      icon: <TrendingUp size={20} />,
      iconColor: "text-teal-500",
      text: "Visualize your progress as you work through the CFA Level I curriculum. Every completed reading, quiz, and milestone contributes to the growth of your Knowledge Tree, giving you a clear picture of how far you've come and what still lies ahead.",
      actionTip: "Tip: Visit your Knowledge Tree regularly to monitor your progress and celebrate every milestone."
    },
    {
      tab: "calendar",
      elementId: "tour-nav-calendar",
      title: "SMART STUDY CALENDAR 📅",
      icon: <Calendar size={20} />,
      iconColor: "text-rose-500",
      text: "Build a personalized study plan in seconds. Simply enter your target exam date, and AAERA automatically schedules all 93 CFA Level I readings across your available study days. Your plan updates dynamically, helping you stay consistent while leaving enough time for revision before exam day.",
      actionTip: "Tip: Keep your target exam date up to date so your study schedule remains accurate and balanced."
    },
    {
      tab: "flashcards",
      elementId: "tour-nav-flashcards",
      title: "AAERA RECALL FLASHCARDS 🧠",
      icon: <Brain size={20} />,
      iconColor: "text-indigo-500",
      text: "Strengthen long term retention with intelligent flashcards powered by spaced repetition. Review key concepts, formulas, and definitions at the right time, rate your confidence after each card, and let AAERA automatically schedule future reviews for maximum recall.",
      actionTip: "Tip: Spend a few minutes reviewing flashcards each day to reinforce concepts and improve long term retention."
    },
     {
      tab: "todo",
      elementId: "tour-todo-list",
      title: "To-Do List 📋",
      icon: <CheckCircle size={20} />,
      iconColor: "text-emerald-500",
      text: "Stay organized with your personal to-do list. Add tasks, mark them as complete, and keep track of what needs to be done. Use it to plan daily study goals, revision targets, practice questions, or anything else you don't want to forget. A clear task list helps you stay focused and consistent throughout your CFA preparation.",
      actionTip: "Tip: Add your custom study goals or checklist items right here in your To-Do List."
    },
    {
      tab: "dashboard",
      elementId: null,
      title: "PERSONALIZE YOUR WORKSPACE 🎨",
      icon: <Palette size={20} />,
      iconColor: "text-blue-500",
      text: "Create a study environment that works best for you. Switch between light and dark themes, choose your favorite accent color, and customize the interface to match your workflow and help you stay focused during every study session.",
      actionTip: "Tip: Personalize your workspace to create a comfortable and distraction free study experience."
    },
    {
      tab: "dashboard",
      elementId: null,
      title: "AAERA : Aim • Analyze • Execute • Reflect • Achieve",
      icon: <Sparkles size={20} />,
      iconColor: "text-amber-500",
      text: "Prep well\nAll the best :-)\n-Satvik",
      actionTip: "Click 'Done' to close the walkthrough and let AAERA guide you to success!"
    }
  ];


  const handleSelectPreset = (presetKey: "light" | "dark") => {
    const selected = THEME_PRESETS[presetKey];
    onThemeChange(selected);
  };

  const handleAccentColorChange = (hexColor: string) => {
    const isLightBase = currentTheme.preset === "light";
    const baseTheme = isLightBase ? THEME_PRESETS.light : THEME_PRESETS.dark;

    const customTheme: AppTheme = {
      ...baseTheme,
      preset: "custom",
      accent: hexColor,
      accentHover: hexColor,
      accentLight: `rgba(${hexToRgb(hexColor)}, 0.15)`,
    };
    onThemeChange(customTheme);
  };

  // Auto advance tour step if user manually clicks on the top tabs
  useEffect(() => {
    if (!isOpen) return;
    const currentStepTab = steps[currentStep].tab;
    if (activeTab !== currentStepTab) {
      const matchIndex = steps.findIndex((s, idx) => s.tab === activeTab && (activeTab !== "dashboard" || idx > 0));
      if (matchIndex !== -1 && matchIndex !== currentStep) {
        setCurrentStep(matchIndex);
      }
    }
  }, [activeTab, isOpen]);

  // Track coordinates of the highlighted element to place the frame overlay
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      const elementId = steps[currentStep].elementId;
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    const interval = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearInterval(interval);
    };
  }, [currentStep, isOpen]);

  // Smoothly scroll target elements into view as they are introduced
  useEffect(() => {
    if (!isOpen) return;
    
    // Give a small delay to allow active tab components to render first
    const timer = setTimeout(() => {
      const elementId = steps[currentStep].elementId;
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ 
            behavior: "smooth", 
            block: "center",
            inline: "nearest"
          });
        }
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      setActiveTab(steps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      setActiveTab(steps[prevIdx].tab);
    }
  };

  return (
    <>
      {/* Dynamic Absolute Highlight Overlay */}
      {targetRect && (
        <div 
          className="fixed pointer-events-none z-50 rounded-xl transition-all duration-300"
          style={{
            left: `${targetRect.left - 4}px`,
            top: `${targetRect.top - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: "0 0 0 9999px rgba(10, 10, 10, 0.45), 0 0 14px rgba(var(--theme-accent), 0.5)",
            border: "2px solid var(--theme-accent)"
          }}
        />
      )}

      {/* Main floating instruction helper card or Full-screen celebratory final slide */}
      {currentStep === steps.length - 1 ? (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-fadeIn pointer-events-auto">
          <div 
            className="w-full max-w-sm bg-[var(--theme-card)] border-2 border-[var(--theme-accent)] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4 text-center animate-scaleUp"
            id="tutorial-tour-final-card"
          >
            {/* Simple Top Badge */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--theme-accent-light)] border border-[var(--theme-accent)]/20 flex items-center justify-center text-[var(--theme-accent)] shadow-xs">
                <Sparkles size={24} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--theme-text-dark)] uppercase tracking-wider">
                NOTE
              </h3>
            </div>

            {/* Simple Italic Note Text */}
            <div className="p-4 bg-[var(--theme-beige)]/10 border border-[var(--theme-border)]/20 rounded-xl">
              <p className="text-xs text-[var(--theme-text-dark)] leading-relaxed italic whitespace-pre-line font-medium opacity-90">
                Prep well
                All the best :-)
              </p>
              <div className="mt-2.5 text-[11px] font-mono tracking-wider text-[var(--theme-accent)] font-semibold uppercase">
                - Satvik
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:-translate-y-[1px] active:translate-y-0"
              >
                Start ur Prep 🚀
              </button>
              
              <button
                type="button"
                onClick={handlePrev}
                className="w-full text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] text-xs font-medium hover:underline bg-transparent border-none outline-none cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="fixed inset-x-0 bottom-0 md:top-24 md:bottom-auto md:right-8 md:left-auto z-50 p-4 md:p-0 pointer-events-none flex justify-center md:block font-sans"
          id="tutorial-tour-container"
        >
          <div 
            className="pointer-events-auto w-full max-w-sm bg-[var(--theme-card)] border-2 border-[var(--theme-accent)] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(var(--theme-accent-light),0.4)] overflow-hidden flex flex-col animate-slideUp"
            id="tutorial-tour-card"
          >
            {/* Progress bar */}
            <div className="w-full bg-[var(--theme-beige)] h-1 flex">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-full transition-all duration-300 flex-1 ${
                    idx <= currentStep ? "bg-[var(--theme-accent)]" : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Card Header */}
            <div className="p-3.5 px-5 border-b border-[var(--theme-border)]/15 flex items-center justify-between bg-[var(--theme-beige)]/10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-medium px-2 py-0.5 rounded-full">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-[10px] text-[var(--theme-text-main)] opacity-60 uppercase tracking-wider font-medium">Workspace Tour</span>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--theme-text-main)] opacity-50 hover:opacity-100 transition p-1 rounded-full cursor-pointer bg-transparent border-none outline-none"
                title="Close Walkthrough"
                aria-label="Close walkthrough"
              >
                <X size={14} />
              </button>
            </div>

            {/* Simple Body */}
            <div className="p-5 space-y-4">
              <div className="flex gap-2.5 items-center">
                <div className={`p-1 rounded-lg shrink-0 ${currentStepData.iconColor}`}>
                  {currentStepData.icon}
                </div>
                <h4 className="text-xs font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider">
                  {currentStepData.title}
                </h4>
              </div>

              <p className="text-xs text-[var(--theme-text-main)] leading-relaxed whitespace-pre-line font-normal opacity-95">
                {currentStepData.text}
              </p>

              {(currentStep === 7 || currentStepData.title.toUpperCase().includes("PERSONALIZE")) && (
                <div className="space-y-4 pt-3.5 border-t border-[var(--theme-border)]/15">
                  {/* Base Mode Options */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--theme-text-main)] uppercase block">
                      Base Workspace Style:
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSelectPreset("light")}
                        className={`py-2 px-3 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          currentTheme.preset === "light"
                            ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-semibold shadow-xs"
                            : "border-[var(--theme-border)]/20 bg-[var(--theme-card)] text-[var(--theme-text-main)] hover:border-[var(--theme-border)]/40"
                        }`}
                      >
                        <Sun size={13} className={currentTheme.preset === "light" ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-main)] opacity-70"} />
                        <span className="text-xs">Sage Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset("dark")}
                        className={`py-2 px-3 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          currentTheme.preset === "dark"
                            ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-semibold shadow-xs"
                            : "border-[var(--theme-border)]/20 bg-[var(--theme-card)] text-[var(--theme-text-main)] hover:border-[var(--theme-border)]/40"
                        }`}
                      >
                        <Moon size={13} className={currentTheme.preset === "dark" ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-main)] opacity-70"} />
                        <span className="text-xs">Sage Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Accent Swatches */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--theme-text-main)] uppercase block">
                      Accent Color Accent:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_ACCENTS.map((accent) => {
                        const isSelected = currentTheme.accent.toLowerCase() === accent.value.toLowerCase();
                        return (
                          <button
                            key={accent.value}
                            type="button"
                            onClick={() => handleAccentColorChange(accent.value)}
                            className="h-8 rounded-xl border border-[var(--theme-border)]/15 bg-[var(--theme-card)] flex items-center justify-center relative hover:border-[var(--theme-border)]/40 transition cursor-pointer group hover:-translate-y-[1px]"
                            title={accent.name}
                          >
                            <span 
                              className="w-4 h-4 rounded-full inline-block shadow-inner"
                              style={{ backgroundColor: accent.value }}
                            />
                            {isSelected && (
                              <span className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center">
                                <Check size={11} className="text-white font-semibold drop-shadow-sm" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Instruction Tip */}
              <div className="p-3 bg-[var(--theme-beige)]/10 border border-[var(--theme-border)]/15 rounded-xl flex items-start gap-2">
                <Info size={12} className="text-[var(--theme-accent)] shrink-0 mt-0.5 opacity-85" />
                <p className="text-[11px] text-[var(--theme-text-main)] opacity-80 leading-snug">
                  {currentStepData.actionTip}
                </p>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3.5 px-5 border-t border-[var(--theme-border)]/15 bg-[var(--theme-beige)]/10 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-[var(--theme-text-main)] opacity-60 hover:opacity-100 text-xs font-medium hover:underline bg-transparent border-none outline-none cursor-pointer"
              >
                Skip Tour
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="bg-[var(--theme-beige)]/30 hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)] px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] border-none text-[var(--theme-bg)] px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  {currentStep === steps.length - 1 ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}