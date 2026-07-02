import React, { useState, useEffect } from "react";
import { UserProfile, Subject, ModuleProgress, ActivityLog, ModuleStatus } from "../types";
import { FLAT_MODULES } from "../curriculum";
import { Play, Pause, RotateCcw, Save, Calendar, Clock, BookOpen, AlertTriangle, CheckCircle, Settings, X, GraduationCap, Maximize2 } from "lucide-react";
import GrowthTree from "./GrowthTree";
import FullscreenTimer from "./FullscreenTimer";

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
  setTimerModuleId
}: DashboardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const totalStudyHrs = (totalStudyMinutes / 60).toFixed(1);

  // Daily calculations
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dailyMinutes = activityLogs
    .filter(log => new Date(log.timestamp) >= todayStart)
    .reduce((sum, log) => sum + log.durationMinutes, 0);
  const dailyHrs = (dailyMinutes / 60).toFixed(1);
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
      <div className="space-y-10">
        {/* Dashboard Top Title with Settings Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Countdown card */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-[1px]">
            <div className="absolute top-4 right-4 text-[var(--theme-text-dark)] opacity-[0.08]">
              <Calendar size={48} />
            </div>
            <p className="text-[10px] text-[var(--theme-text-main)] uppercase tracking-wide opacity-60 font-medium">Exam Countdown</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-semibold text-[var(--theme-text-dark)] tracking-tight">
                {daysRemaining}
              </span>
              <span className="text-xs font-medium text-[var(--theme-text-main)] opacity-75 font-sans">days left</span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-[9px] text-[var(--theme-text-main)] mb-1.5 font-sans opacity-70">
                <span>Time elapsed ({elapsedDays} days)</span>
                <span>{Math.round(timeProgressPct)}%</span>
              </div>
              <div className="w-full bg-[var(--theme-beige)]/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[var(--theme-accent)] h-full rounded-full transition-all duration-700" 
                  style={{ width: `${timeProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Study Hours Tracker */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-[1px]">
            <div className="absolute top-4 right-4 text-[var(--theme-text-dark)] opacity-[0.08]">
              <Clock size={48} />
            </div>
            <p className="text-[10px] text-[var(--theme-text-main)] uppercase tracking-wide opacity-60 font-medium">Total Study Time</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-semibold text-[var(--theme-text-dark)] tracking-tight">
                {totalStudyHrs}
              </span>
              <span className="text-xs font-medium text-[var(--theme-text-main)] opacity-75 font-sans">hours</span>
            </div>
            <p className="text-xs text-[var(--theme-text-main)] mt-6 opacity-80 leading-relaxed">
              Target pace: <span className="text-[var(--theme-accent)] font-medium">{userProfile.dailyTargetHours} hrs/day</span>
            </p>
          </div>

          {/* Daily study progression */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-[1px]">
            <div className="absolute top-4 right-4 text-[var(--theme-text-dark)] opacity-[0.08]">
              <BookOpen size={48} />
            </div>
            <p className="text-[10px] text-[var(--theme-text-main)] uppercase tracking-wide opacity-60 font-medium">Today's Effort</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-semibold text-[var(--theme-text-dark)] tracking-tight">
                {dailyHrs}
              </span>
              <span className="text-xs font-medium text-[var(--theme-text-main)] opacity-75 font-sans">/ {userProfile.dailyTargetHours} hrs</span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-[9px] text-[var(--theme-text-main)] mb-1.5 font-sans opacity-70">
                <span>Daily target progress</span>
                <span>{Math.round(dailyProgressPct)}%</span>
              </div>
              <div className="w-full bg-[var(--theme-beige)]/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${dailyProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Curriculum Coverage */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-[1px]">
            <div className="absolute top-4 right-4 text-[var(--theme-text-dark)] opacity-[0.08]">
              <GraduationCap size={48} />
            </div>
            <p className="text-[10px] text-[var(--theme-text-main)] uppercase tracking-wide opacity-60 font-medium">Syllabus Coverage</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-semibold text-[var(--theme-text-dark)] tracking-tight">
                {curriculumPercentage}%
              </span>
              <span className="text-xs font-medium text-[var(--theme-text-main)] opacity-75 font-sans">completed</span>
            </div>
            <p className="text-xs text-[var(--theme-text-main)] mt-6 opacity-85 leading-relaxed">
              <span className="text-emerald-600 font-semibold">{completedModules}</span> Done <span className="opacity-30">•</span> <span className="text-amber-600 font-semibold">{inProgressModules}</span> Active
            </p>
          </div>
        </div>

        {/* 2. Bento Grid: Compact Stopwatch and the Prominent Interactive Growth Tree (Visually Pleasing Place!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unified Interactive Study Logger - Occupies 1 column */}
          <div id="tour-study-tracker" className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] mb-5 border-b border-[var(--theme-border)]/30 pb-3">
                Study Logger
              </h3>

              <div className="space-y-6">
                {/* CFA Curriculum Module */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--theme-text-dark)] opacity-80 mb-2">
                    Curriculum Module
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] text-[var(--theme-text-dark)] border border-[var(--theme-border)]/40 rounded-xl py-3 px-3.5 text-xs outline-none focus:border-[var(--theme-accent)] transition font-sans cursor-pointer shadow-xs"
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

                {/* Mode & Quiz Score Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--theme-text-dark)] opacity-80 mb-2">
                      Study Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--theme-beige)]/60 rounded-xl border border-[var(--theme-border)]/35">
                      <button
                        type="button"
                        onClick={() => setSessionType("study")}
                        className={`text-[10px] py-1.5 px-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
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
                        className={`text-[10px] py-1.5 px-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
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
                    <label className="block text-[11px] font-medium text-[var(--theme-text-dark)] opacity-80 mb-2">
                      {sessionType === "quiz" ? "Quiz score (%)" : "Score (%)"}
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      min="0"
                      max="100"
                      value={loggedScore}
                      onChange={(e) => setLoggedScore(e.target.value)}
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl py-2.5 px-3.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition placeholder:text-[var(--theme-text-main)] placeholder:opacity-30 shadow-xs"
                    />
                  </div>
                </div>

                {/* Session Duration Selector and Quick Presets */}
                <div className="bg-[var(--theme-beige)]/20 p-5 rounded-2xl border border-[var(--theme-border)]/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-[var(--theme-text-dark)] opacity-80">
                      Duration (Minutes)
                    </span>
                    {isTimerRunning && (
                      <span className="text-[10px] text-emerald-700 font-sans animate-pulse flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                        Live: {formatTimer(timerSeconds)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      min="1"
                      value={manualMinutes}
                      onChange={(e) => {
                        setManualMinutes(e.target.value);
                        if (isTimerRunning) {
                          setIsTimerRunning(false);
                        }
                      }}
                      className="w-20 bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl py-2.5 px-3.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                    />
                    
                    {/* Quick Preset Buttons */}
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
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
                          className={`text-[10px] py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
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

                  {/* Built-in Stopwatch controls */}
                  <div className="flex items-center justify-between border-t border-[var(--theme-border)]/30 pt-3.5">
                    <span className="text-[10px] font-medium text-[var(--theme-text-main)] opacity-70">Stopwatch</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleTimer}
                        className={`flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border-none ${
                          isTimerRunning
                            ? "bg-amber-600 text-white hover:bg-amber-500"
                            : "bg-[var(--theme-beige)] hover:bg-[var(--theme-beige-dark)]/50 text-[var(--theme-text-dark)]"
                        }`}
                      >
                        {isTimerRunning ? <Pause size={10} className="opacity-80" /> : <Play size={10} className="opacity-80" />}
                        {isTimerRunning ? "Stop" : "Live track"}
                      </button>
                      
                      {isTimerRunning && (
                        <button
                          type="button"
                          onClick={() => setIsFullscreenTimerOpen(true)}
                          className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] p-1.5 px-3 rounded-lg text-[10px] font-medium transition-all duration-200 flex items-center gap-1 border-none cursor-pointer"
                          title="Enter Fullscreen Focus mode"
                        >
                          <Maximize2 size={10} className="opacity-80" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={resetTimer}
                        className="bg-[var(--theme-beige)]/60 hover:bg-[var(--theme-beige)] text-[var(--theme-text-main)] p-2 rounded-lg transition-all duration-200 cursor-pointer border-none"
                        title="Reset Stopwatch"
                      >
                        <RotateCcw size={11} className="opacity-70" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--theme-border)]/30 pt-4 mt-6">
              <button
                type="button"
                onClick={handleSaveUnifiedSession}
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] font-medium text-xs py-3 rounded-xl border-none shadow-xs flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-xs active:scale-98 cursor-pointer"
              >
                <CheckCircle size={13} className="text-[var(--theme-bg)] opacity-85" />
                <span>Log Study Session</span>
              </button>
            </div>
          </div>

          {/* Growth Tree - Occupies 2 columns (Visually stunning interactive epicenter) */}
          <div className="lg:col-span-2">
            <GrowthTree subjects={subjects} progress={progress} totalStudyTime={totalStudyMinutes} isDashboard={true} />
          </div>
        </div>

        {/* 3. Analytics on Weak Subjects & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weak Areas Alerts */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-sm">
            <h3 className="text-sm font-semibold text-rose-750 mb-5 border-b border-[var(--theme-border)]/30 pb-3">
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
          </div>

          {/* Activity Logs history table */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 md:col-span-2 flex flex-col transition-all duration-300 hover:shadow-sm">
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
          </div>
        </div>

        {/* Floating Settings Modal Triggered from Title Header - Changes ONLY allowed here! */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/60 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-[var(--theme-border)]/50 pb-3">
                <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] flex items-center gap-1.5">
                  ⚙️ Adjust Runway Goals
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] hover:bg-[var(--theme-beige)] p-1.5 rounded-full text-xs transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    Candidate Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userProfile.email}
                    className="w-full bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/80 text-[var(--theme-text-main)] text-xs px-3.5 py-2.5 rounded-xl outline-none font-mono cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
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
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-3.5 py-2.5 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider opacity-75 mb-1.5 font-mono">
                    CFA Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={userProfile.targetExamDate}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setUserProfile({ ...userProfile, targetExamDate: chosen });
                      // Also store inside local storage to match persistence constraints
                      localStorage.setItem(`cfa_profile_${userProfile.email}`, JSON.stringify({
                        ...userProfile,
                        targetExamDate: chosen
                      }));
                    }}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-3.5 py-2.5 rounded-xl font-mono outline-none focus:border-[var(--theme-accent)] transition shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--theme-border)]/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full sm:w-auto bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] text-xs font-semibold px-5 py-2.5 rounded-xl transition border-none shadow-sm cursor-pointer"
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
