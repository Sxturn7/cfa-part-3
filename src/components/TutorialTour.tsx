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
  HelpCircle,
  TrendingUp,
  Info
} from "lucide-react";

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards") => void;
  activeTab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards";
}

interface TourStep {
  tab: "dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards";
  elementId: string | null;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  text: string;
  actionTip: string;
}

export default function TutorialTour({ isOpen, onClose, setActiveTab, activeTab }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      tab: "dashboard",
      elementId: null,
      title: "Welcome Candidate! 🚀",
      icon: <Sparkles size={20} />,
      iconColor: "text-amber-400",
      text: "Welcome to your CFA Level I Prep Runway. All 10 major subjects and 93 curriculum modules are pre-loaded. Let's do a quick walkthrough of what you can do here!",
      actionTip: "Click 'Next' below to begin the quick walkthrough."
    },
    {
      tab: "dashboard",
      elementId: "tour-study-tracker",
      title: "Live Study Focus Tracker ⏱️",
      icon: <LayoutDashboard size={20} />,
      iconColor: "text-blue-400",
      text: "This is your active focus stopwatch. Select any reading module and click 'Live Track' to log your study minutes and build your preparation streak!",
      actionTip: "Look at the highlighted Study Logger card on the dashboard."
    },
    {
      tab: "curriculum",
      elementId: "tour-nav-curriculum",
      title: "Curriculum Syllabus & Notes 📚",
      icon: <BookOpen size={20} />,
      iconColor: "text-emerald-400",
      text: "Browse all 93 syllabus readings. Set custom statuses (Active, Reviewing, Complete) and write personal study notes for easy reference.",
      actionTip: "Click the highlighted Curriculum tab above or click Next."
    },
    {
      tab: "quiz",
      elementId: "tour-nav-quiz",
      title: "Practice Quizzes ✍️",
      icon: <HelpCircle size={20} />,
      iconColor: "text-violet-400",
      text: "Generate custom practice questions on any topic. Get instant math steps, clear answer explanations, and track your score milestones.",
      actionTip: "Click on the Practice Quizzes tab above to test your skills."
    },
    {
      tab: "growth",
      elementId: "tour-nav-growth",
      title: "Interactive Knowledge Garden 🌳",
      icon: <TrendingUp size={20} />,
      iconColor: "text-teal-400",
      text: "Watch your financial progress grow visually. Your completed readings and logged study hours nourish a beautiful, dynamic tree!",
      actionTip: "Click on the Interactive Knowledge Tree tab above to check it out."
    },
    {
      tab: "calendar",
      elementId: "tour-nav-calendar",
      title: "Smart Study Calendar 📅",
      icon: <Calendar size={20} />,
      iconColor: "text-rose-400",
      text: "Enter your target exam date. Our system automatically distributes the readings across your calendar to keep you on schedule.",
      actionTip: "Click on the Study Calendar tab above to see your roadmap."
    },
    {
      tab: "flashcards",
      elementId: "tour-nav-flashcards",
      title: "Active Recall Flashcards 🧠",
      icon: <Brain size={20} />,
      iconColor: "text-indigo-400",
      text: "Review complex CFA formulas and terms. Flip cards to reveal answers and self-rate your memory retention level.",
      actionTip: "Click on the Memory Recall tab above to study Leitner flashcards."
    },
    {
      tab: "dashboard",
      elementId: null,
      title: "All the Best! 🌟",
      icon: <Sparkles size={20} />,
      iconColor: "text-amber-400",
      text: "You are all set to conquer the CFA Level I Prep Runway!\n\nPrep well and stay focused. You've got this!\n\n- Satvik",
      actionTip: "Click 'Done' to finish the walkthrough and begin your study session."
    }
  ];

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
      {/* Dynamic Absolute Highlight Overlay - pointer-events-none lets users click tabs natively! */}
      {targetRect && (
        <div 
          className="fixed pointer-events-none z-50 rounded-xl transition-all duration-300"
          style={{
            left: `${targetRect.left - 4}px`,
            top: `${targetRect.top - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.45), 0 0 14px rgba(59, 130, 246, 0.5)",
            border: "2px solid rgba(59, 130, 246, 0.85)"
          }}
        >
          {/* Subtle blinking click helper label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-mono text-[9px] px-2 py-0.5 rounded font-extrabold shadow-md tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ACTIVE AREA
          </div>
        </div>
      )}

      {/* Main floating instruction helper card */}
      <div 
        className="fixed inset-x-0 bottom-0 md:top-24 md:bottom-auto md:right-8 md:left-auto z-50 p-4 md:p-0 pointer-events-none flex justify-center md:block"
        id="tutorial-tour-container"
      >
        <div 
          className="pointer-events-auto w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slideUp"
          id="tutorial-tour-card"
        >
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-1 flex">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-full transition-all duration-300 flex-1 ${
                  idx <= currentStep ? "bg-blue-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Card Header */}
          <div className="p-3 px-4 border-b border-slate-850 flex items-center justify-between bg-slate-950/20">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-slate-800 text-blue-400 font-mono px-2 py-0.5 rounded-full font-bold">
                STEP {currentStep + 1} OF {steps.length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">QUICK TOUR</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-350 transition p-0.5 rounded cursor-pointer bg-transparent border-none outline-none"
              title="Close Walkthrough"
              aria-label="Close walkthrough"
            >
              <X size={14} />
            </button>
          </div>

          {/* Simple Body */}
          <div className="p-5 space-y-3.5">
            <div className="flex gap-2.5 items-center">
              <div className={`p-1.5 rounded-lg shrink-0 ${currentStepData.iconColor}`}>
                {currentStepData.icon}
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                {currentStepData.title}
              </h4>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-line">
              {currentStepData.text}
            </p>

            {/* Instruction Tip */}
            <div className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg flex items-start gap-1.5">
              <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 font-sans leading-snug">
                {currentStepData.actionTip}
              </p>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="p-3 px-4 border-t border-slate-850 bg-slate-950/50 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 text-xs font-semibold hover:underline bg-transparent border-none outline-none cursor-pointer"
            >
              Skip
            </button>

            <div className="flex gap-1.5">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 px-3 py-1 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={12} />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 border-none text-white px-3.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Done
                    <Check size={12} className="ml-0.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={12} className="ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
