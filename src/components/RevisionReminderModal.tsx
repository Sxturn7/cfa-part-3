import React from "react";
import { X, ChevronRight, Brain, Info } from "lucide-react";

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
      label: "Active Recall (Tomorrow)",
      desc: "Disrupt the forgetting curve early. Review formulas and core concepts.",
      tag: "1d",
      memoryBoost: "95% retention target",
    },
    {
      days: 7,
      label: "Practice Drill (Next week)",
      desc: "Re-engage before conceptual decay sets in. Solve sample question banks.",
      tag: "7d",
      memoryBoost: "97% retention target",
    },
    {
      days: 16,
      label: "Long Spaced Check-off",
      desc: "Deep-anchor into permanent long-term memory. Ideal before practice mocks.",
      tag: "16d",
      memoryBoost: "99% retention target",
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)]/40 rounded-2xl p-6 shadow-xl relative flex flex-col space-y-5">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] p-1.5 rounded-full transition cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[var(--theme-accent)]">
            <Brain size={13} className="opacity-70" />
            <span className="text-[10px] uppercase font-medium tracking-wide">Spaced Repetition</span>
          </div>
          <h3 className="text-base font-semibold text-[var(--theme-text-dark)] tracking-tight">
            Schedule Revision Session
          </h3>
        </div>

        {/* Completed Lesson */}
        <div className="bg-[var(--theme-beige)]/40 p-4 rounded-xl border border-[var(--theme-border)]/30">
          <span className="text-[10px] text-[var(--theme-text-main)] font-sans opacity-60 block">Completed lesson:</span>
          <p className="text-xs font-semibold text-[var(--theme-text-dark)] mt-1">
            {moduleName}
          </p>
        </div>

        <span className="text-[11px] font-medium text-[var(--theme-text-dark)] opacity-70 block">
          Select retention cycle:
        </span>

        {/* Cycles list */}
        <div className="space-y-3">
          {cycles.map((cycle) => (
            <button
              key={cycle.days}
              type="button"
              onClick={() => onScheduleRevision(cycle.days)}
              className="w-full flex items-center justify-between p-3.5 bg-[var(--theme-card)] hover:bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/35 hover:border-[var(--theme-border)] rounded-xl transition-all text-left group outline-none cursor-pointer hover:-translate-y-[1px]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="text-[10px] font-medium bg-[var(--theme-beige)]/70 border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)] w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                  {cycle.tag}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-[var(--theme-text-dark)]">
                    {cycle.label}
                  </h5>
                  <p className="text-[10px] text-[var(--theme-text-main)] opacity-75 mt-0.5 leading-relaxed">
                    {cycle.desc}
                  </p>
                </div>
              </div>
              <ChevronRight size={13} className="text-[var(--theme-text-main)] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0 ml-1.5" />
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--theme-border)]/30 text-[10px] text-[var(--theme-text-main)] opacity-80">
          <span className="flex items-center gap-1">
            <Info size={11} className="opacity-70" /> Auto-saves to your tracker
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--theme-text-dark)] hover:text-[var(--theme-accent)] font-medium transition cursor-pointer"
          >
            Skip, revise later
          </button>
        </div>

      </div>
    </div>
  );
}
