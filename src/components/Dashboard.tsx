import React, { useState, useEffect } from "react";
import { UserProfile, Subject, ModuleProgress, ActivityLog, ModuleStatus } from "../types";
import { FLAT_MODULES } from "../curriculum";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  X, 
  GraduationCap, 
  Maximize2,
  Volume2,
  VolumeX,
  Music,
  Award,
  Sparkles,
  Activity
} from "lucide-react";
import GrowthTree from "./GrowthTree";
import FullscreenTimer from "./FullscreenTimer";
import BorderGlow from "./BorderGlow";
import SpotlightCard from "./SpotlightCard";
import ElasticSlider from "./ElasticSlider";

export function formatStudyTime(minutes: number): string {
  if (minutes <= 0) return "0 mins";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) {
    if (mins > 0) {
      return `${hrs}hr ${mins}mins`;
    }
    return `${hrs}hr`;
  }
  return `${mins}mins`;
}

const DASHBOARD_QUOTES = [
  "The most important investment you can make is in yourself. - Warren Buffett",
  "To get what you want, you have to deserve what you want. - Charlie Munger",
  "The investor’s chief problem and even his worst enemy is likely to be himself. - Benjamin Graham",
  "An investment in knowledge pays the best interest. - Benjamin Franklin",
  "In the world of securities, courage becomes the supreme virtue. - Benjamin Graham",
  "Knowing what you don’t know is more useful than being brilliant. - Charlie Munger",
  "Risk comes from not knowing what you're doing. - Warren Buffett",
  "Success is a function of managing your focus, not your time. - Timeless"
];

const STUDY_SOUNDS = [
  { id: "rain", name: "Rain", path: "/audio/rain.mp3" },
  { id: "ocean", name: "Ocean", path: "/audio/Ocean.mp3" },
  { id: "river", name: "River", path: "/audio/River.mp3" },
  { id: "white_noise", name: "White Noise", path: "/audio/White Noise.mp3" },
  { id: "brown_noise", name: "Brown Noise", path: "/audio/Brown Noise.mp3" },
  { id: "binaural", name: "Binaural", path: "synth" },
];

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  activityLogs: ActivityLog[];
  onLogStudySession: (moduleId: string, durationMinutes: number, type: "study" | "quiz", score?: number) => void;
  // Timer props
  timerSeconds: number;
  setTimerSeconds: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreenTimerOpen: boolean;
  setIsFullscreenTimerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  timerModuleId: string;
  setTimerModuleId: React.Dispatch<React.SetStateAction<string>>;
  // Ambient Sound Props
  activeAmbientId: string | null;
  setActiveAmbientId: React.Dispatch<React.SetStateAction<string | null>>;
  ambientVolume: number;
  setAmbientVolume: React.Dispatch<React.SetStateAction<number>>;
}

export default function Dashboard({
  userProfile,
  setUserProfile,
  subjects,
  progress,
  activityLogs,
  onLogStudySession,
  timerSeconds,
  setTimerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  isFullscreenTimerOpen,
  setIsFullscreenTimerOpen,
  timerModuleId,
  setTimerModuleId,
  activeAmbientId,
  setActiveAmbientId,
  ambientVolume,
  setAmbientVolume
}: DashboardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  // Rotate dashboard motivation quote
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIdx((prev) => (prev + 1) % DASHBOARD_QUOTES.length);
    }, 25000); // 25s rotation
    return () => clearInterval(interval);
  }, []);

  // 1. Countdown calculations
  const calculateDaysRemaining = () => {
    const today = new Date();
    const examDate = new Date(userProfile.targetExamDate);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysTotal = () => {
    const start = new Date(userProfile.studyStartDate);
    const end = new Date(userProfile.targetExamDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const daysRemaining = calculateDaysRemaining();
  const totalDays = calculateDaysTotal();
  const elapsedDays = Math.max(0, totalDays - daysRemaining);
  const timeProgressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  // 2. Studies Statistics
  const totalStudyMinutes = activityLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const totalStudyHrs = (totalStudyMinutes / 60).toFixed(2);

  // Daily calculations
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dailyMinutes = activityLogs
    .filter(log => new Date(log.timestamp) >= todayStart)
    .reduce((sum, log) => sum + log.durationMinutes, 0);
  const dailyHrs = (dailyMinutes / 60).toFixed(2);
  const dailyHrsNum = parseFloat(dailyHrs);
  const dailyTargetVal = Math.max(0.5, userProfile.dailyTargetHours || 2);
  const dailyProgressPct = Math.min(
    100,
    (dailyHrsNum / dailyTargetVal) * 100
  );

  // Module completion stats
  const totalModules = 93;
  const completedModules = FLAT_MODULES.filter(
    (m) => progress[m.id]?.status === ModuleStatus.COMPLETED
  ).length;
  const inProgressModules = FLAT_MODULES.filter(
    (m) => progress[m.id]?.status === ModuleStatus.IN_PROGRESS
  ).length;
  const curriculumPercentage = Math.round((completedModules / totalModules) * 100);

  // Subject-level analysis
  const subjectScores = subjects.map(subj => {
    const mods = subj.modules;
    const completed = mods.filter(m => progress[m.id]?.status === ModuleStatus.COMPLETED);
    const scores = completed
      .map(m => progress[m.id]?.quizScore)
      .filter((s): s is number => s !== null);
    
    return {
      id: subj.id,
      name: subj.name,
      completed: completed.length,
      total: mods.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      color: subj.color
    };
  });

  const weakSubjects = subjectScores.filter(s => s.avgScore !== null && s.avgScore < 70);

  // 3. Studying Stopwatch Timer State
  const [selectedModuleId, setSelectedModuleId] = useState(FLAT_MODULES[0]?.id || "");
  const [manualMinutes, setManualMinutes] = useState("30");
  const [loggedScore, setLoggedScore] = useState("");
  const [sessionType, setSessionType] = useState<"study" | "quiz">("study");

  // Dynamically sync active stopwatch duration to Minutes state
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0 && timerModuleId === selectedModuleId) {
      const minsVal = Math.round(timerSeconds / 60) || 1;
      setManualMinutes(minsVal.toString());
    }
  }, [timerSeconds, isTimerRunning, timerModuleId, selectedModuleId]);

  const toggleTimer = () => {
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    setTimerModuleId(selectedModuleId);
    if (nextRunning) {
      setIsFullscreenTimerOpen(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleSaveUnifiedSession = () => {
    const duration = parseInt(manualMinutes, 10);
    if (!duration || duration <= 0) {
      alert("Please enter a valid study duration in minutes.");
      return;
    }
    const parsedScore = loggedScore ? parseInt(loggedScore, 10) : undefined;
    onLogStudySession(selectedModuleId, duration, sessionType, parsedScore);
    
    // Clear & reset inputs safely, preserving default minutes block
    setManualMinutes("30");
    setLoggedScore("");
    setIsFullscreenTimerOpen(false);
    resetTimer();
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        {/* Dashboard Top Title with Settings Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-1 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[var(--theme-accent-light)] flex items-center justify-center shrink-0">
              <GraduationCap className="text-[var(--theme-accent)] opacity-80" size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--theme-text-dark)] tracking-tight">Study Dashboard</h2>
              <p className="text-xs text-[var(--theme-text-main)] mt-1.5 opacity-75 max-w-xl leading-relaxed">
                Everything you need to stay on track, in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="mt-5 sm:mt-0 flex items-center gap-2 bg-[var(--theme-card)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/45 text-[var(--theme-text-dark)] text-xs font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-[1px] hover:shadow-xs active:scale-98 cursor-pointer"
          >
            <Settings size={12} className="animate-spin-slow text-[var(--theme-accent)] opacity-70" />
            <span>Plan Settings</span>
          </button>
        </div>

        {/* 1. Upper Metrics Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Exam Countdown */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-5 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1.5px] flex flex-col justify-between" borderRadius="14px">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-main)] font-medium tracking-tight opacity-75">
                <Calendar size={14} className="text-[var(--theme-accent)] shrink-0" />
                <span>Exam Countdown</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-[var(--theme-text-dark)] tracking-tight">
                  {daysRemaining}
                </span>
                <span className="text-xs text-[var(--theme-text-main)] font-medium opacity-60">days left</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] text-[var(--theme-text-main)] opacity-70 font-mono">
                <span>{elapsedDays} days prepared</span>
                <span>{Math.round(timeProgressPct)}%</span>
              </div>
              <div className="w-full bg-[var(--theme-border)]/10 h-1.5 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-[var(--theme-accent)] h-full rounded-full transition-all duration-700" 
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Total Study Time */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-5 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1.5px] flex flex-col justify-between" borderRadius="14px">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-main)] font-medium tracking-tight opacity-75">
                <Clock size={14} className="text-[var(--theme-accent)] shrink-0" />
                <span>Total Study Time</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-[var(--theme-text-dark)] tracking-tight">
                  {formatStudyTime(totalStudyMinutes)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {(() => {
                const studyLogs = activityLogs.filter(l => l.type === "study");
                const quizLogs = activityLogs.filter(l => l.type === "quiz");
                const studyMinutes = studyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
                const quizMinutes = quizLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

                return (
                  <div className="flex items-center justify-between gap-4 border-t border-[var(--theme-border)]/10 pt-3.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[var(--theme-text-main)] opacity-50 block">Reading</span>
                      <span className="text-xs font-semibold text-[var(--theme-text-dark)]">{formatStudyTime(studyMinutes)}</span>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] text-[var(--theme-text-main)] opacity-50 block">Practice Quiz</span>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{formatStudyTime(quizMinutes)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </SpotlightCard>

          {/* Card 3: Today's Effort */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-5 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1.5px] flex flex-col justify-between" borderRadius="14px">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-main)] font-medium tracking-tight opacity-75">
                <Activity size={14} className="text-emerald-600 shrink-0" />
                <span>Today's Effort</span>
              </div>
              
              <div className="mt-3.5 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-3xl font-extrabold text-[var(--theme-text-dark)] tracking-tight block">
                    {formatStudyTime(dailyMinutes)}
                  </span>
                  <span className="text-[10px] text-[var(--theme-text-main)] opacity-50 block">
                    Target: {formatStudyTime(dailyTargetVal * 60)}
                  </span>
                </div>
                
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20 rounded-full">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" className="stroke-[var(--theme-border)]/10 fill-none" strokeWidth="2.5" />
                    <circle cx="16" cy="16" r="13" className="stroke-emerald-600 dark:stroke-emerald-500 fill-none transition-all duration-500 ease-out" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 13} strokeDashoffset={2 * Math.PI * 13 - (Math.min(100, dailyProgressPct) / 100) * (2 * Math.PI * 13)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-[8px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {Math.round(dailyProgressPct)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-[var(--theme-text-main)] opacity-70 leading-tight">
              {dailyMinutes >= (dailyTargetVal * 60) ? "🎉 Goal achieved!" : `⏳ ${formatStudyTime(Math.max(0, dailyTargetVal * 60 - dailyMinutes))} remaining`}
            </div>
          </SpotlightCard>

          {/* Card 4: Syllabus Coverage */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-5 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1.5px] flex flex-col justify-between" borderRadius="14px">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-main)] font-medium tracking-tight opacity-75">
                <BookOpen size={14} className="text-[var(--theme-accent)] shrink-0" />
                <span>Syllabus Coverage</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-[var(--theme-text-dark)] tracking-tight">
                  {curriculumPercentage}%
                </span>
                <span className="text-xs text-[var(--theme-text-main)] font-medium opacity-60">completed</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] text-[var(--theme-text-main)] opacity-70 font-mono">
                <span>{completedModules}/{totalModules} modules</span>
                <span>{inProgressModules} active</span>
              </div>
              <div className="grid grid-cols-10 gap-1.5 mt-1">
                {Array.from({ length: 10 }).map((_, index) => {
                  const isActive = curriculumPercentage >= (index + 1) * 10;
                  return (
                    <div 
                      key={index} 
                      className={`h-1.5 rounded-sm transition-all duration-500 ${
                        isActive 
                          ? "bg-indigo-600 dark:bg-indigo-400" 
                          : "bg-slate-200/50 dark:bg-slate-800/40"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* 2. Bento Grid: Compact Stopwatch and the Prominent Interactive Growth Tree (Visually Pleasing Place!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unified Interactive Study Logger - Occupies 1 column */}
          <BorderGlow
            colors={["var(--theme-accent)", "transparent"]}
            borderRadius={16}
            glowRadius={220}
            glowIntensity={0.8}
            animated={false}
            className="lg:col-span-1 shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)]"
          >
            <div id="tour-study-tracker" className="p-7">
              <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] mb-5 border-b border-[var(--theme-border)]/30 pb-3">
                Study Session
              </h3>

            <div className="space-y-5">
              {/* CFA Curriculum Module */}
              <div>
                <label className="block text-[10px] font-semibold text-[var(--theme-text-dark)] opacity-70 uppercase mb-2">
                  Curriculum Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full bg-[var(--theme-input-bg)] text-[var(--theme-text-dark)] border border-[var(--theme-border)]/40 rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[var(--theme-accent)] transition font-sans cursor-pointer shadow-xs"
                >
                  {subjects.map((subj) => (
                    <optgroup key={subj.id} label={`${subj.name} (${subj.weight})`}>
                      {subj.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          M{m.order}: {m.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* SECTION A: Live Focus Tracker (Big & Prominent!) */}
              <div className="bg-[var(--theme-beige)]/15 p-4.5 rounded-2xl border border-[var(--theme-border)]/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider opacity-70">
                    Live Focus Tracker
                  </span>
                  {isTimerRunning && (
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans animate-pulse flex items-center gap-1 font-medium border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Big Digital Clock Display */}
                <div className="font-mono text-3xl font-bold text-center py-4 text-[var(--theme-text-dark)] tracking-wider bg-[var(--theme-card)] border border-[var(--theme-border)]/25 rounded-xl shadow-xs">
                  {formatTimer(timerSeconds)}
                </div>

                {/* Large Primary Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border-none shadow-sm flex items-center justify-center gap-2 active:scale-98 ${
                    isTimerRunning
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isTimerRunning ? "Pause Session" : "Start Live Study"}</span>
                </button>

                {/* Small Action Controls Row */}
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFullscreenTimerOpen(true)}
                    className="bg-[var(--theme-accent-light)] hover:bg-[var(--theme-accent-light)]/80 text-[var(--theme-accent)] px-3.5 py-2 rounded-lg text-[10px] font-medium transition-all duration-200 flex items-center gap-1.5 border-none cursor-pointer"
                    title="Enter Fullscreen Focus mode"
                  >
                    <Maximize2 size={11} />
                    <span>Maximize Focus</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetTimer}
                    disabled={timerSeconds === 0}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border-none flex items-center gap-1.5 text-[10px] ${
                      timerSeconds === 0
                        ? "bg-[var(--theme-beige)]/30 text-[var(--theme-text-main)]/40 cursor-not-allowed"
                        : "bg-[var(--theme-beige)] hover:bg-[var(--theme-beige-dark)]/50 text-[var(--theme-text-dark)]"
                    }`}
                    title="Reset Stopwatch"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* SECTION B: Manual Session Logger (Compact & Secondary!) */}
              <div className="border-t border-[var(--theme-border)]/30 pt-4 space-y-4">
                <span className="text-[10px] font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider opacity-70 block">
                  Log Completed Session
                </span>

                {/* Mode & Quiz Score Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-medium text-[var(--theme-text-dark)] opacity-70 mb-1.5">
                      Study Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--theme-beige)]/50 rounded-lg border border-[var(--theme-border)]/20">
                      <button
                        type="button"
                        onClick={() => setSessionType("study")}
                        className={`text-[9px] py-1 px-1.5 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                          sessionType === "study"
                            ? "bg-[var(--theme-card)] text-[var(--theme-text-dark)] shadow-xs"
                            : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                        }`}
                      >
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionType("quiz")}
                        className={`text-[9px] py-1 px-1.5 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                          sessionType === "quiz"
                            ? "bg-[var(--theme-card)] text-rose-700 shadow-xs"
                            : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                        }`}
                      >
                        Quiz
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-[var(--theme-text-dark)] opacity-70 mb-1.5">
                      {sessionType === "quiz" ? "Quiz score (%)" : "Score (%)"}
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      min="0"
                      max="100"
                      value={loggedScore}
                      onChange={(e) => setLoggedScore(e.target.value)}
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-lg py-1.5 px-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition placeholder:text-[var(--theme-text-main)] placeholder:opacity-30 shadow-xs"
                    />
                  </div>
                </div>

                {/* Session Duration Row */}
                <div className="grid grid-cols-3 gap-2.5 items-end">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-medium text-[var(--theme-text-dark)] opacity-70 mb-1.5">
                      Duration (Min)
                    </label>
                    <input
                      type="number"
                      placeholder="Min"
                      min="1"
                      step="0.1"
                      value={manualMinutes}
                      onChange={(e) => {
                        setManualMinutes(e.target.value);
                        if (isTimerRunning) {
                          setIsTimerRunning(false);
                        }
                      }}
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-lg py-1.5 px-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                    />
                  </div>
                  
                  <div className="col-span-2 grid grid-cols-4 gap-1">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setManualMinutes(mins.toString());
                          if (isTimerRunning) {
                            setIsTimerRunning(false);
                          }
                        }}
                        className={`text-[9px] py-1.5 rounded-md border transition-all duration-200 cursor-pointer ${
                          manualMinutes === mins.toString()
                            ? "bg-[var(--theme-accent-light)] border-[var(--theme-accent)]/20 text-[var(--theme-accent)] font-medium"
                            : "bg-[var(--theme-card)] border-[var(--theme-border)]/20 hover:bg-[var(--theme-beige)] text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact, smaller manual submit button */}
                <button
                  type="button"
                  onClick={handleSaveUnifiedSession}
                  className="w-full bg-transparent hover:bg-[var(--theme-accent-light)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/30 font-semibold text-[10px] py-2 rounded-xl transition-all duration-200 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={11} />
                  <span>Log Manual Session</span>
                </button>
              </div>

              {/* Study Sounds walla section */}
              <div className="border-t border-[var(--theme-border)]/30 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-[var(--theme-text-dark)] opacity-80 flex items-center gap-1">
                    <Music size={11} className="text-[var(--theme-accent)]" />
                    Study Ambient Sound
                  </span>
                  {activeAmbientId && (
                    <span className="text-[9px] text-emerald-600 font-mono flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      PLAYING
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-1.5">
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
                        className={`flex items-center justify-center py-2 px-1.5 rounded-lg border text-[10px] tracking-wide transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-[var(--theme-accent-light)] border-[var(--theme-accent)]/30 text-[var(--theme-accent)] font-semibold"
                            : "bg-[var(--theme-card)] border-[var(--theme-border)]/20 hover:bg-[var(--theme-beige)] text-[var(--theme-text-main)]"
                        }`}
                        title={`Play ${sound.name} on repeat`}
                      >
                        <span className="truncate">{sound.name}</span>
                      </button>
                    );
                  })}
                </div>
                
                {activeAmbientId && (
                  <div className="mt-2.5 flex flex-col items-center bg-[var(--theme-beige)]/30 p-3 rounded-2xl border border-[var(--theme-border)]/15">
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
                )}
              </div>

              {/* Runway Motivation Quote Section */}
              <div className="border-t border-[var(--theme-border)]/30 pt-3">
                <div className="bg-[var(--theme-beige)]/15 p-2.5 rounded-xl border border-[var(--theme-border)]/15 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-[9px] font-semibold uppercase text-[var(--theme-accent)]">
                    <Award size={10} className="text-amber-500 animate-pulse animate-duration-1000" />
                    <span>MOtivation</span>
                  </div>
                  <p className="text-[10px] text-[var(--theme-text-dark)] leading-relaxed italic opacity-90">
                    "{DASHBOARD_QUOTES[activeQuoteIdx]}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

          {/* Growth Tree - Occupies 2 columns (Visually stunning interactive epicenter) */}
          <div className="lg:col-span-2">
            <GrowthTree subjects={subjects} progress={progress} totalStudyTime={totalStudyMinutes} isDashboard={true} />
          </div>
        </div>

        {/* 3. Analytics on Weak Subjects & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weak Areas Alerts */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-7 flex flex-col transition-all duration-300 shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)] hover:-translate-y-[1.5px]" borderRadius="16px">
            <h3 className="text-sm font-semibold text-rose-755 mb-5 border-b border-[var(--theme-border)]/30 pb-3">
              Attention Areas (under 70%)
            </h3>

            {weakSubjects.length === 0 ? (
              <div className="bg-[var(--theme-beige)]/10 border border-[var(--theme-border)]/20 p-6 rounded-2xl text-center flex-1 flex flex-col items-center justify-center">
                <CheckCircle size={20} className="mb-2.5 text-emerald-600 opacity-80" />
                <p className="text-xs font-medium text-[var(--theme-text-dark)]">Exemplary scores maintained</p>
                <p className="text-[11px] text-[var(--theme-text-main)] mt-2 leading-relaxed max-w-[200px] opacity-75">No subject averages have slumped behind the 70% threshold yet.</p>
              </div>
            ) : (
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
                <p className="text-[11px] text-[var(--theme-text-main)] leading-relaxed mb-1 font-normal opacity-80">
                  Subjects with running averages falling below the passing threshold:
                </p>
                {weakSubjects.map((s) => (
                  <div key={s.id} className="bg-[var(--theme-beige)]/20 border border-[var(--theme-border)]/20 p-3.5 rounded-xl flex items-center justify-between transition-all hover:bg-[var(--theme-beige)]/30">
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold text-[var(--theme-text-dark)] block truncate">{s.name}</span>
                      <span className="text-[10px] text-[var(--theme-text-main)] opacity-75 mt-0.5 block">
                        {s.completed} of {s.total} complete
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-rose-700 bg-rose-50/60 px-2 py-1 rounded-lg border border-rose-100/50 shrink-0">
                      {s.avgScore}% avg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>

          {/* Activity Logs history table */}
          <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-7 md:col-span-2 flex flex-col transition-all duration-300 shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)] hover:-translate-y-[1.5px]" borderRadius="16px">
            <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] mb-5 border-b border-[var(--theme-border)]/30 pb-3">
              Session Activity Registers
            </h3>

            {activityLogs.length === 0 ? (
              <div className="p-8 text-center bg-[var(--theme-beige)]/10 border border-[var(--theme-border)]/20 rounded-2xl text-[var(--theme-text-main)] opacity-70 text-xs flex-1 flex items-center justify-center">
                No sessions registered. Use the stopwatch or Study Logger to file data.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[260px] scrollbar-thin flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--theme-border)]/20 text-[10px] text-[var(--theme-text-main)] opacity-60">
                      <th className="py-3 px-5 font-medium">Date</th>
                      <th className="py-3 px-5 font-medium">Subject</th>
                      <th className="py-3 px-5 font-medium">Module Topic</th>
                      <th className="py-3 px-5 font-medium">Spent</th>
                      <th className="py-3 px-5 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-border)]/10">
                    {activityLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--theme-beige)]/5 transition-colors">
                        <td className="py-3.5 px-5 text-[10px] text-[var(--theme-text-main)] opacity-75 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `rgba(var(--theme-accent-light), 0.15)`, color: `var(--theme-accent)` }}>
                            {log.subjectName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[var(--theme-text-dark)] font-medium max-w-[220px] truncate">
                          {log.moduleName}
                        </td>
                        <td className="py-3.5 px-5 text-[var(--theme-text-main)] opacity-85">{log.durationMinutes}m</td>
                        <td className="py-3.5 px-5 text-right">
                          {log.score !== undefined ? (
                            <span className={`font-semibold ${log.score >= 70 ? "text-emerald-700" : "text-rose-700"}`}>
                              {log.score}%
                            </span>
                          ) : (
                            <span className="text-[var(--theme-text-main)] opacity-30">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Floating Settings Modal Triggered from Title Header - Changes ONLY allowed here! */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fadeIn">
            <div className="bg-[var(--theme-card)] border-2 border-[var(--theme-accent)] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative transform scale-100 transition-all">
              <div className="flex justify-between items-center border-b border-[var(--theme-border)]/50 pb-4">
                <h3 className="text-base font-semibold text-[var(--theme-text-dark)] flex items-center gap-2">
                  <Settings size={18} className="text-[var(--theme-accent)] animate-spin-slow" />
                  Adjust Study Runway Goals
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] hover:bg-[var(--theme-beige)] p-2 rounded-full text-xs transition cursor-pointer"
                  aria-label="Close settings"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    Candidate Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userProfile.email}
                    className="w-full bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/80 text-[var(--theme-text-main)] text-xs px-4 py-3 rounded-xl outline-none font-mono cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    Daily Study Goal (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={userProfile.dailyTargetHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 2;
                      setUserProfile({ ...userProfile, dailyTargetHours: val });
                      localStorage.setItem(`cfa_profile_${userProfile.email}`, JSON.stringify({
                        ...userProfile,
                        dailyTargetHours: val
                      }));
                    }}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-4 py-3 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] focus:ring-1 focus:ring-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    CFA Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={userProfile.targetExamDate}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setUserProfile({ ...userProfile, targetExamDate: chosen });
                      localStorage.setItem(`cfa_profile_${userProfile.email}`, JSON.stringify({
                        ...userProfile,
                        targetExamDate: chosen
                      }));
                    }}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-4 py-3 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] focus:ring-1 focus:ring-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--theme-border)]/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--theme-border)]/60 text-xs text-[var(--theme-text-main)] hover:bg-[var(--theme-beige)] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] text-xs font-semibold px-6 py-2.5 rounded-xl transition border-none shadow-sm cursor-pointer"
                >
                  Save & Lock Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
