import React from "react";
import { X, Calendar, ChevronRight, Brain, Info } from "lucide-react";

interface RevisionReminderModalProps {
  isOpen: boolean;
  moduleName: string;
  onClose: () => void;
  onScheduleRevision: (days: number) => void;
}

export default function RevisionReminderModal({
  isOpen,
  moduleName,
  onClose,
  onScheduleRevision,
}: RevisionReminderModalProps) {
  if (!isOpen) return null;

  const cycles = [
    {
      days: 1,
      label: "Cycle 1: Active Recall (Tomorrow)",
      desc: "Disrupt the immediate forgetting curve. Review core formulas and key financial concepts.",
      tag: "1 Day",
      memoryBoost: "95% retention target",
      color: "border-slate-800 hover:border-amber-500 bg-slate-900/20 text-slate-100"
    },
    {
      days: 7,
      label: "Cycle 2: Practice Drill (In a week)",
      desc: "Re-engage before conceptual decay sets in. Take practice quizzes to build deep recall.",
      tag: "7 Days",
      memoryBoost: "97% retention target",
      color: "border-slate-800 hover:border-blue-500 bg-slate-900/20 text-slate-100"
    },
    {
      days: 16,
      label: "Cycle 3: Permanent Memory (Long cycle)",
      desc: "Anchor into semantic long-term memory. Perfect for spaced check-offs before mock exams.",
      tag: "16 Days",
      memoryBoost: "99% retention target",
      color: "border-slate-800 hover:border-purple-500 bg-slate-900/20 text-slate-100"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col p-6 space-y-4">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-450 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/40 transition cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Brain size={15} className="animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Spaced Repetition</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight">
            Schedule Revision Session
          </h3>
        </div>

        {/* Completed Module Target */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">Completed Lesson:</span>
          <p className="text-xs font-bold text-slate-200 mt-0.5">
            {moduleName}
          </p>
        </div>

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Select retention cycle:
        </span>

        {/* Cycles list */}
        <div className="space-y-2">
          {cycles.map((cycle) => (
            <button
              key={cycle.days}
              type="button"
              onClick={() => onScheduleRevision(cycle.days)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left group outline-none cursor-pointer ${cycle.color}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-inner group-hover:text-white group-hover:border-slate-700">
                  {cycle.tag}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition truncate">
                      {cycle.label}
                    </h5>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    {cycle.memoryBoost}
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-250 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-850 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Info size={11} /> Auto-schedules on your calendar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-450 hover:text-slate-200 font-semibold hover:bg-slate-800/40 py-1 px-2.5 rounded transition cursor-pointer"
          >
            Skip, revise later
          </button>
        </div>

      </div>
    </div>
  );
}
