import React, { useState } from "react";
import { Subject, ModuleStatus, ModuleProgress, LearningModule } from "../types";
import { Search, ChevronDown, ChevronRight, CheckCircle, BookOpen, Clock, FileText, RotateCw, Check, AlertCircle } from "lucide-react";
import SpotlightCard from "./SpotlightCard";

interface ModuleListProps {
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  onChangeModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  onChangeModuleNotes: (moduleId: string, notes: string) => void;
  onRecordQuizScore: (moduleId: string, score: number) => void;
  onProgressRevisionCycle: (moduleId: string) => void;
  onBatchChangeModuleStatus: (moduleIds: string[], status: ModuleStatus) => void;
}

export default function ModuleList({
  subjects,
  progress,
  onChangeModuleStatus,
  onChangeModuleNotes,
  onProgressRevisionCycle,
  onBatchChangeModuleStatus,
}: ModuleListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ModuleStatus>("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    quant: true, // Expand quant by default
  });
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [confirmSubject, setConfirmSubject] = useState<Subject | null>(null);
  const [confirmAction, setConfirmAction] = useState<"check" | "uncheck" | null>(null);
  const [showGlobalResetConfirm, setShowGlobalResetConfirm] = useState(false);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const getStatusIcon = (status?: ModuleStatus) => {
    switch (status) {
      case ModuleStatus.COMPLETED:
        return <CheckCircle className="text-emerald-600 w-5 h-5 flex-shrink-0" />;
      case ModuleStatus.IN_PROGRESS:
        return <BookOpen className="text-amber-600 w-5 h-5 flex-shrink-0 animate-pulse" />;
      default:
        return <div className="w-5 h-5 rounded-full border border-[var(--theme-border)] flex-shrink-0" />;
    }
  };

  const currentProgress = (moduleId: string): ModuleProgress => {
    return (
      progress[moduleId] || {
        status: ModuleStatus.NOT_STARTED,
        studyTimeMinutes: 0,
        quizScore: null,
        notes: "",
        lastStudiedAt: null,
        revisionCycle: 0,
      }
    );
  };

  // Filter modules based on search & status
  const matchesFilter = (mod: LearningModule) => {
    const prog = currentProgress(mod.id);
    const matchesSearch = mod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prog.status === statusFilter;
    return matchesSearch && matchesStatus;
  };

  const hasAnyProgress = subjects.some(subj =>
    subj.modules.some(m => {
      const prog = progress[m.id];
      return prog && prog.status !== ModuleStatus.NOT_STARTED;
    })
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SpotlightCard className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-5 shadow-[var(--theme-shadow)] flex flex-col lg:flex-row gap-4 items-center justify-between animate-fadeIn" borderRadius="24px">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--theme-text-main)] opacity-50" />
          <input
            type="text"
            placeholder="Search learning modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 text-[var(--theme-text-dark)] text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[var(--theme-accent)] transition shadow-xs placeholder:opacity-30"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[var(--theme-text-main)] opacity-80">Filter Status:</span>
            <div className="grid grid-cols-4 gap-1 bg-[var(--theme-beige)]/40 p-1 rounded-xl border border-[var(--theme-border)]/30 w-full md:w-auto">
              {(["all", ModuleStatus.NOT_STARTED, ModuleStatus.IN_PROGRESS, ModuleStatus.COMPLETED] as const).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`text-[10px] font-medium py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      statusFilter === f
                        ? "bg-[var(--theme-card)] text-[var(--theme-text-dark)] shadow-xs"
                        : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
                    }`}
                  >
                    {f === "all" ? "All" : f === "not_started" ? "Not started" : f === "in_progress" ? "In progress" : "Done"}
                  </button>
                )
              )}
            </div>
          </div>

          {hasAnyProgress && (
            <div className="shrink-0">
              {showGlobalResetConfirm ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-fadeIn text-[10px] select-none">
                  <span className="text-rose-700 dark:text-rose-400 font-bold">Uncheck all modules?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allModuleIds = subjects.flatMap(s => s.modules.map(m => m.id));
                      onBatchChangeModuleStatus(allModuleIds, ModuleStatus.NOT_STARTED);
                      setShowGlobalResetConfirm(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-bold cursor-pointer transition duration-150"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGlobalResetConfirm(false)}
                    className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md font-semibold cursor-pointer transition duration-150"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGlobalResetConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-650 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 rounded-xl transition duration-200 cursor-pointer select-none"
                  title="Mark all modules in the entire study syllabus as incomplete"
                >
                  <span>Uncheck All Modules</span>
                </button>
              )}
            </div>
          )}
        </div>
      </SpotlightCard>

      {/* Accordion list of subjects */}
      <div className="space-y-4">
        {subjects.map((subj) => {
          const matchingMods = subj.modules.filter((m) => matchesFilter(m));
          if (matchingMods.length === 0 && searchTerm) return null; // hide empty search subject

          const isExpanded = expandedSubjects[subj.id];
          const completedCount = subj.modules.filter(
            (m) => progress[m.id]?.status === ModuleStatus.COMPLETED
          ).length;
          const progressPercent = Math.round((completedCount / subj.modules.length) * 100);
          const hasSubjectProgress = subj.modules.some(
            (m) => {
              const prog = progress[m.id];
              return prog && prog.status !== ModuleStatus.NOT_STARTED;
            }
          );

          return (
            <SpotlightCard
              key={subj.id}
              className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 rounded-3xl overflow-hidden transition-all shadow-[var(--theme-shadow)] hover:shadow-[var(--theme-shadow-hover)] hover:-translate-y-[1px]"
              borderRadius="24px"
            >
              {/* Subject Banner Header */}
              <div
                onClick={() => toggleSubject(subj.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--theme-beige)]/20 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="text-[var(--theme-text-main)] opacity-60 w-5 h-5" /> : <ChevronRight className="text-[var(--theme-text-main)] opacity-60 w-5 h-5" />}
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--theme-text-dark)] flex items-center gap-2">
                      {subj.name}
                      <span className="text-[10px] bg-[var(--theme-beige)] border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)] px-2 py-0.5 rounded-full font-mono font-medium opacity-80">
                        {subj.weight}
                      </span>
                    </h4>
                    <span className="text-[11px] text-[var(--theme-text-main)] opacity-70 mt-1 block">
                      {completedCount} of {subj.modules.length} modules complete ({progressPercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {confirmSubject?.id === subj.id ? (
                    <div 
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-fadeIn text-[10px] select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                        {confirmAction === "check" ? "Check all?" : "Uncheck all?"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const moduleIds = subj.modules.map(m => m.id);
                          onBatchChangeModuleStatus(
                            moduleIds,
                            confirmAction === "check" ? ModuleStatus.COMPLETED : ModuleStatus.NOT_STARTED
                          );
                          setConfirmSubject(null);
                          setConfirmAction(null);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold cursor-pointer transition duration-150"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmSubject(null);
                          setConfirmAction(null);
                        }}
                        className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md font-semibold cursor-pointer transition duration-150"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {progressPercent < 100 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmSubject(subj);
                            setConfirmAction("check");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[var(--theme-accent)] hover:text-[var(--theme-bg)] hover:bg-[var(--theme-accent)] bg-[var(--theme-accent-light)]/25 border border-[var(--theme-accent)]/20 rounded-xl transition duration-200 cursor-pointer select-none"
                          title={`Mark all ${subj.modules.length} readings in ${subj.name} as completed`}
                        >
                          <span>Check All</span>
                        </button>
                      )}
                      {hasSubjectProgress && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmSubject(subj);
                            setConfirmAction("uncheck");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-650 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 rounded-xl transition duration-200 cursor-pointer select-none"
                          title={`Mark all completed or in-progress readings in ${subj.name} as incomplete`}
                        >
                          <span>Uncheck All</span>
                        </button>
                      )}
                    </div>
                  )}
                  <div className="hidden sm:block w-36 bg-[var(--theme-beige)] h-2 rounded-full overflow-hidden border border-[var(--theme-border)]/20">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: `var(--theme-accent)`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--theme-beige)]/50 border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)]">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Collapsed Modules listing */}
              {isExpanded && (
                <div className="border-t border-[var(--theme-border)]/20 p-3 bg-[var(--theme-beige)]/10 divide-y divide-[var(--theme-border)]/15">
                  {matchingMods.map((mod) => {
                    const isModExpanded = expandedModuleId === mod.id;
                    const p = currentProgress(mod.id);

                    return (
                      <div
                        key={mod.id}
                        className={`transition-all py-2 px-3 ${
                          isModExpanded ? "bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)]/30 my-2 shadow-xs" : ""
                        }`}
                      >
                        {/* List Row compact view */}
                        <div
                          onClick={() => setExpandedModuleId(isModExpanded ? null : mod.id)}
                          className="flex items-center justify-between cursor-pointer group hover:bg-[var(--theme-beige)]/20 rounded-lg py-1.5 px-2 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = p.status === ModuleStatus.COMPLETED 
                                  ? ModuleStatus.NOT_STARTED 
                                  : ModuleStatus.COMPLETED;
                                onChangeModuleStatus(mod.id, nextStatus);
                              }}
                              className="bg-transparent border-none p-0.5 rounded-lg hover:bg-[var(--theme-beige)]/40 transition cursor-pointer flex-shrink-0 flex items-center justify-center"
                              title={p.status === ModuleStatus.COMPLETED ? "Click to mark as incomplete" : "Click to mark as completed"}
                            >
                              {getStatusIcon(p.status)}
                            </button>
                            <div className="min-w-0">
                              <span className="text-xs text-[var(--theme-text-main)] opacity-50 font-mono pr-1.5">
                                M{mod.order}.
                              </span>
                              <span className="text-xs font-medium text-[var(--theme-text-dark)] group-hover:text-[var(--theme-accent)] transition-colors">
                                {mod.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Summary indicators */}
                            <span className="text-[10px] text-[var(--theme-text-main)] opacity-70 hidden sm:flex items-center gap-1">
                              <Clock size={11} className="opacity-70" /> {p.studyTimeMinutes} min studied
                            </span>
                            {p.quizScore !== null && (
                              <span className="text-[10px] bg-[var(--theme-beige)] border border-[var(--theme-border)]/30 text-[var(--theme-accent)] px-2 py-0.5 rounded-lg font-medium">
                                Quiz: {p.quizScore}%
                              </span>
                            )}
                            {p.revisionCycle > 0 && (
                              <span className="text-[10px] bg-amber-50/60 text-amber-800 border border-amber-250/50 px-2 py-0.5 rounded-lg flex items-center gap-0.5 font-medium">
                                <RotateCw size={10} className="opacity-70" /> Revise {p.revisionCycle}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expandable modules edit workspace */}
                        {isModExpanded && (
                          <div className="mt-4 pt-4 border-t border-[var(--theme-border)]/20 text-[var(--theme-text-main)] text-xs grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                            {/* Status, Timers and cycle level */}
                            <div className="space-y-4 bg-[var(--theme-beige)]/20 p-4 rounded-xl border border-[var(--theme-border)]/30">
                              <h5 className="font-semibold text-[var(--theme-text-dark)] border-b border-[var(--theme-border)]/20 pb-2 text-[10px] uppercase tracking-wide">
                                Progress Management
                              </h5>

                              <div>
                                <label className="block text-[11px] text-[var(--theme-text-main)] mb-1.5 font-medium">Set Status</label>
                                <select
                                  value={p.status}
                                  onChange={(e) => onChangeModuleStatus(mod.id, e.target.value as ModuleStatus)}
                                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 text-[var(--theme-text-dark)] text-xs px-2.5 py-2 rounded-xl outline-none focus:border-[var(--theme-accent)] transition cursor-pointer"
                                >
                                  <option value={ModuleStatus.NOT_STARTED}>Not started</option>
                                  <option value={ModuleStatus.IN_PROGRESS}>In progress</option>
                                  <option value={ModuleStatus.COMPLETED}>Completed</option>
                                </select>
                              </div>

                              <div className="pt-1">
                                {p.status !== ModuleStatus.COMPLETED ? (
                                  <button
                                    type="button"
                                    onClick={() => onChangeModuleStatus(mod.id, ModuleStatus.COMPLETED)}
                                    className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs hover:-translate-y-[1px] cursor-pointer"
                                  >
                                    ✓ Mark as Completed
                                  </button>
                                ) : (
                                  <div className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold">
                                    <CheckCircle size={14} className="opacity-80" /> Completed
                                  </div>
                                )}
                              </div>

                              <div className="pt-3 border-t border-[var(--theme-border)]/20 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wide">Revision</span>
                                    <div className="flex gap-1.5">
                                      {[1, 2, 3].map((step) => {
                                        const label = step === 1 ? "1d" : step === 2 ? "7d" : "16d";
                                        const active = p.revisionCycle >= step;
                                        return (
                                          <div 
                                            key={step}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 border ${
                                              active 
                                                ? "bg-amber-500 border-amber-400" 
                                                : "bg-[var(--theme-beige)] border-[var(--theme-border)]/40"
                                            }`}
                                            title={`${label} spaced review: ${active ? "Completed" : "Pending"}`}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-amber-700 font-medium">
                                    {p.revisionCycle}/3 done
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onProgressRevisionCycle(mod.id)}
                                  className="w-full py-2 bg-[var(--theme-beige)] hover:bg-[var(--theme-beige-dark)]/50 text-[var(--theme-text-dark)] text-xs rounded-xl font-medium transition cursor-pointer select-none border border-[var(--theme-border)]/40"
                                >
                                  {p.revisionCycle >= 3 ? "Reset study chain" : `Confirm Cycle ${p.revisionCycle + 1} Revision`}
                                </button>
                              </div>
                            </div>

                            {/* Study Notes Workspace */}
                            <div className="md:col-span-2 space-y-2 flex flex-col">
                              <div className="flex items-center justify-between border-b border-[var(--theme-border)]/20 pb-2">
                                <h5 className="font-semibold text-[var(--theme-text-dark)] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                  <FileText size={12} className="text-[var(--theme-accent)] opacity-70" /> Study Notes
                                </h5>
                                <span className="text-[10px] text-[var(--theme-text-main)] opacity-50">Saves automatically</span>
                              </div>
                              <textarea
                                value={p.notes}
                                onChange={(e) => onChangeModuleNotes(mod.id, e.target.value)}
                                placeholder="Write formulas, active learning notes, or equations here for fast retrieval... (e.g. Gordon Growth model, CAPM model, EAR calculations)"
                                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/45 rounded-xl p-3 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition font-sans flex-1 h-[140px] resize-none shadow-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
