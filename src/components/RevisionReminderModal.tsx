import React from "react";
import { X, Calendar, Sparkles, BookOpen, Clock, CheckCircle, ChevronRight } from "lucide-react";

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Banner header decoration */}
        <div className="h-2 bg-[#5A6344]" />
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={16} />
        </button>

        <div className="p-6 space-y-5">
          {/* Banner Icon */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#5A6344]/20 border border-[#5A6344]/40 flex items-center justify-center text-xl">
              📅
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 tracking-wider">
                Reading Mastery Progressed
              </span>
              <h3 className="text-base font-bold text-slate-100 font-serif">
                Schedule Spaced Repetition Revision
              </h3>
            </div>
          </div>

          {/* Module description */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">COMPLETED TARGET</span>
            <p className="text-xs font-semibold text-slate-200">
              {moduleName}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Congratulations! This module has been marked complete. Select one of the spaced repetition cycles below to lock in your next practice session.
            </p>
          </div>

          {/* Schedule description */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">
              Click to Schedule a Revision Target Period
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: 1 Day */}
              <button
                type="button"
                onClick={() => onScheduleRevision(1)}
                className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-[#5A6344]/10 border border-slate-800 hover:border-[#5A6344]/50 rounded-xl transition text-left group pointer-events-auto outline-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-xs font-mono bg-[#5A6344]/20 hover:bg-[#5A6344]/30 text-[#8E9B64] font-bold px-2 py-1 rounded-lg mt-0.5 min-w-[32px] text-center">
                    1d
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-200 group-hover:text-amber-500 transition">
                      Cycle 1: Active Recall (Tomorrow)
                    </h5>
                    <p className="text-[10px] text-slate-500">Quick review of notes and core financial formulas.</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-650 group-hover:text-[#8E9B64] group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 2: 7 Days */}
              <button
                type="button"
                onClick={() => onScheduleRevision(7)}
                className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-[#5A6344]/10 border border-slate-800 hover:border-[#5A6344]/50 rounded-xl transition text-left group pointer-events-auto outline-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-xs font-mono bg-[#5A6344]/20 hover:bg-[#5A6344]/30 text-[#8E9B64] font-bold px-2 py-1 rounded-lg mt-0.5 min-w-[32px] text-center">
                    7d
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-200 group-hover:text-amber-500 transition">
                      Cycle 2: Practice Drill (In a week)
                    </h5>
                    <p className="text-[10px] text-slate-500">Runway concept assessment / practice test to drill memory.</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-650 group-hover:text-[#8E9B64] group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 3: 16 Days */}
              <button
                type="button"
                onClick={() => onScheduleRevision(16)}
                className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-[#5A6344]/10 border border-slate-800 hover:border-[#5A6344]/50 rounded-xl transition text-left group pointer-events-auto outline-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-xs font-mono bg-[#5A6344]/20 hover:bg-[#5A6344]/30 text-[#8E9B64] font-bold px-2 py-1 rounded-lg mt-0.5 min-w-[32px] text-center">
                    16d
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-200 group-hover:text-amber-500 transition">
                      Cycle 3: Permanent Memory (Long cycle)
                    </h5>
                    <p className="text-[10px] text-slate-500">Comprehensive custom check. Solidify concept map forever.</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-650 group-hover:text-[#8E9B64] group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-250 hover:bg-slate-800/40 text-xs py-2 px-4 rounded-lg transition"
            >
              I will revise later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
