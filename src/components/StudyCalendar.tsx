import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  X, 
  Edit3, 
  SlidersHorizontal,
  CalendarCheck2
} from "lucide-react";
import { UserProfile, StudyCheckpoint, Subject } from "../types";
import SpotlightCard from "./SpotlightCard";

interface StudyCalendarProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  subjects: Subject[];
}

const MARKER_COLORS = [
  { hex: "#EF4444", name: "Ruby Red" },
  { hex: "#F59E0B", name: "Amber Orange" },
  { hex: "#10B981", name: "Emerald Green" },
  { hex: "#3B82F6", name: "Royal Blue" },
  { hex: "#8B5CF6", name: "Violet Purple" },
  { hex: "#EC4899", name: "Berry Pink" },
  { hex: "#14B8A6", name: "Teal Cyan" },
  { hex: "#6B7280", name: "Slate Grey" }
];

export default function StudyCalendar({
  userProfile,
  setUserProfile,
  subjects
}: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<StudyCheckpoint | null>(null);

  // New checkpoint form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("general");
  const [newStatus, setNewStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [newMarkerColor, setNewMarkerColor] = useState("#3B82F6");
  const [newDescription, setNewDescription] = useState("");
  const [newDateStr, setNewDateStr] = useState("");

  // Filter state
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const checkpoints = useMemo(() => {
    return userProfile.checkpoints || [];
  }, [userProfile.checkpoints]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days list to render
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    // Pad leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Get checkpoints for a specific day
  const getDayCheckpoints = (date: Date) => {
    const dateStr = formatDateString(date);
    return checkpoints.filter(cp => {
      const matchDate = cp.date === dateStr;
      const matchSubject = subjectFilter === "all" || cp.subjectId === subjectFilter;
      const matchStatus = statusFilter === "all" || cp.status === statusFilter;
      return matchDate && matchSubject && matchStatus;
    });
  };

  // Checkpoints count statistics
  const stats = useMemo(() => {
    const total = checkpoints.length;
    const completed = checkpoints.filter(c => c.status === "completed").length;
    const inProgress = checkpoints.filter(c => c.status === "in_progress").length;
    const pending = checkpoints.filter(c => c.status === "not_started").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, pct };
  }, [checkpoints]);

  // Open modal to add checkpoint
  const handleOpenAddModal = (date: Date) => {
    setNewTitle("");
    setNewSubjectId("general");
    setNewStatus("not_started");
    setNewMarkerColor("#3B82F6");
    setNewDescription("");
    setNewDateStr(formatDateString(date));
    setIsAddModalOpen(true);
  };

  // Save new checkpoint
  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCp: StudyCheckpoint = {
      id: `checkpoint-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newTitle.trim(),
      date: newDateStr,
      subjectId: newSubjectId,
      status: newStatus,
      markerColor: newMarkerColor,
      description: newDescription.trim() || undefined
    };

    const updatedProfile = {
      ...userProfile,
      checkpoints: [...checkpoints, newCp]
    };

    setUserProfile(updatedProfile);
    setIsAddModalOpen(false);
  };

  // Toggle quick complete checkbox
  const handleToggleComplete = (cpId: string) => {
    const updatedCheckpoints = checkpoints.map(cp => {
      if (cp.id === cpId) {
        const newStatus: "completed" | "not_started" = cp.status === "completed" ? "not_started" : "completed";
        return { 
          ...cp, 
          status: newStatus,
          markerColor: newStatus === "completed" ? "#10B981" : cp.markerColor 
        };
      }
      return cp;
    });

    setUserProfile({
      ...userProfile,
      checkpoints: updatedCheckpoints
    });
  };

  // Delete checkpoint
  const handleDeleteCheckpoint = (cpId: string) => {
    const updatedCheckpoints = checkpoints.filter(cp => cp.id !== cpId);
    setUserProfile({
      ...userProfile,
      checkpoints: updatedCheckpoints
    });
    setIsEditModalOpen(false);
  };

  // Open edit modal
  const handleOpenEditModal = (cp: StudyCheckpoint) => {
    setActiveCheckpoint(cp);
    setNewTitle(cp.title);
    setNewSubjectId(cp.subjectId);
    setNewStatus(cp.status);
    setNewMarkerColor(cp.markerColor);
    setNewDescription(cp.description || "");
    setNewDateStr(cp.date);
    setIsEditModalOpen(true);
  };

  // Save edited checkpoint
  const handleSaveEditCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckpoint || !newTitle.trim()) return;

    const updatedCheckpoints = checkpoints.map(cp => {
      if (cp.id === activeCheckpoint.id) {
        return {
          ...cp,
          title: newTitle.trim(),
          date: newDateStr,
          subjectId: newSubjectId,
          status: newStatus,
          markerColor: newMarkerColor,
          description: newDescription.trim() || undefined
        };
      }
      return cp;
    });

    setUserProfile({
      ...userProfile,
      checkpoints: updatedCheckpoints
    });
    setIsEditModalOpen(false);
  };

  // Selected date checkpoints
  const selectedDayCheckpoints = selectedDay ? getDayCheckpoints(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <SpotlightCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-6 rounded-2xl" borderRadius="16px">
        <div>
          <h2 className="text-xl font-semibold text-[var(--theme-text-dark)] tracking-tight">Curriculum Calendar</h2>
          <p className="text-xs text-[var(--theme-text-main)] mt-1.5 opacity-75 max-w-xl leading-relaxed">
            Map out milestones, assign progress states, and log study cycles to coordinate your Level I review timeline.
          </p>
        </div>
        
        {/* Calendar Stats Summary cards */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/30 rounded-xl px-4 py-2 flex items-center gap-2.5">
            <div className="p-2 bg-[var(--theme-beige)] rounded-lg text-[var(--theme-accent)]">
              <CalendarCheck2 size={16} className="opacity-80" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--theme-text-main)] opacity-70">Checkpoints</p>
              <p className="text-xs font-semibold text-[var(--theme-text-dark)] mt-0.5">{stats.completed} / {stats.total} Done</p>
            </div>
          </div>

          <div className="bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/30 rounded-xl px-4 py-2 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--theme-beige)] border border-[var(--theme-border)]/20 flex items-center justify-center text-[10px] font-mono font-medium text-[var(--theme-text-dark)]">
              {stats.pct}%
            </div>
            <div>
              <p className="text-[10px] text-[var(--theme-text-main)] opacity-70">Consistency</p>
              <div className="w-24 bg-[var(--theme-beige)] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-[var(--theme-accent)] h-full transition-all duration-500" 
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Grid container: Calendar on Left, Selected Day info & Stats on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Calendar Month Grid Card - 3 Columns */}
        <SpotlightCard className="xl:col-span-3 bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-5 shadow-xs flex flex-col justify-between" borderRadius="16px">
          <div>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between border-b border-[var(--theme-border)]/15 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-[var(--theme-beige)]/40 rounded-xl border border-[var(--theme-border)]/30 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] transition-all cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-[var(--theme-beige)]/40 rounded-xl border border-[var(--theme-border)]/30 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] transition-all cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-sm font-semibold text-[var(--theme-text-dark)] px-2">
                  {monthNames[month]} {year}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[var(--theme-beige)]/50 hover:bg-[var(--theme-beige)]/80 border border-[var(--theme-border)]/30 text-[var(--theme-text-dark)] rounded-xl transition-all cursor-pointer hover:-translate-y-[1px]"
                >
                  Today
                </button>
                
                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(selectedDay)}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] rounded-xl transition-all hover:-translate-y-[1px] cursor-pointer"
                  >
                    <Plus size={14} className="opacity-80" /> Add Event
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--theme-beige)]/20 border border-[var(--theme-border)]/30 p-3 rounded-xl mb-4 text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-[var(--theme-text-main)] opacity-70" />
                <span className="font-semibold text-[var(--theme-text-dark)]">Filter Calendar:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--theme-text-main)] opacity-70 text-[11px]">Subject</span>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/30 rounded-lg px-2 py-1 text-xs text-[var(--theme-text-dark)] outline-none cursor-pointer"
                  >
                    <option value="all">All Topics</option>
                    <option value="general">⭐ General Milestones</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--theme-text-main)] opacity-70 text-[11px]">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/30 rounded-lg px-2 py-1 text-xs text-[var(--theme-text-dark)] outline-none cursor-pointer"
                  >
                    <option value="all">All States</option>
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 text-center font-sans text-xs font-medium text-[var(--theme-text-main)] opacity-70 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className="bg-[var(--theme-beige)]/20 border border-dashed border-[var(--theme-border)]/15 rounded-xl aspect-square md:aspect-auto md:h-24 p-1.5"
                    />
                  );
                }

                const dayCheckpoints = getDayCheckpoints(day);
                const isSelected = selectedDay && formatDateString(day) === formatDateString(selectedDay);
                const isToday = formatDateString(day) === formatDateString(new Date());

                return (
                  <button
                    key={`day-${day.getDate()}`}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`text-left rounded-xl border p-1.5 md:p-2 flex flex-col justify-between aspect-square md:aspect-auto md:h-24 transition-all cursor-pointer select-none relative hover:-translate-y-[1px] ${
                      isSelected
                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)]/30"
                        : isToday
                        ? "border-amber-400 bg-amber-50/20"
                        : "border-[var(--theme-border)]/20 hover:border-[var(--theme-border)]/40 bg-[var(--theme-card)] text-[var(--theme-text-dark)]"
                    }`}
                  >
                    {/* Day number with status dot */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-mono font-medium rounded-md px-1 py-0.5 ${
                        isToday 
                          ? "bg-amber-100 text-amber-800" 
                          : isSelected 
                          ? "bg-[var(--theme-accent)] text-[var(--theme-bg)]" 
                          : "text-[var(--theme-text-dark)]"
                      }`}>
                        {day.getDate()}
                      </span>
                      
                      {dayCheckpoints.length > 0 && (
                        <span className="text-[9px] bg-[var(--theme-beige)] border border-[var(--theme-border)]/25 text-[var(--theme-text-dark)] px-1.5 rounded-full md:hidden">
                          {dayCheckpoints.length}
                        </span>
                      )}
                    </div>

                    {/* Checkpoint list inside day - Hidden on mobile */}
                    <div className="hidden md:flex flex-col gap-1 w-full overflow-y-auto max-h-[50px] scrollbar-none mt-1">
                      {dayCheckpoints.slice(0, 3).map(cp => (
                        <div 
                          key={cp.id}
                          className="text-[9px] truncate px-1 py-0.5 rounded flex items-center gap-1 text-[var(--theme-text-dark)] border border-[var(--theme-border)]/15 bg-[var(--theme-beige)]/10"
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                            style={{ backgroundColor: cp.markerColor }}
                          />
                          <span className={cp.status === "completed" ? "line-through opacity-50" : ""}>
                            {cp.title}
                          </span>
                        </div>
                      ))}
                      {dayCheckpoints.length > 3 && (
                        <span className="text-[8px] text-[var(--theme-text-main)] opacity-60 font-medium pl-1">
                          +{dayCheckpoints.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Dot indicators for mobile views */}
                    <div className="flex md:hidden items-center justify-center gap-0.5 w-full mt-1.5 flex-wrap">
                      {dayCheckpoints.slice(0, 4).map(cp => (
                        <span 
                          key={cp.id}
                          className="w-1 h-1 rounded-full shrink-0" 
                          style={{ backgroundColor: cp.markerColor }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </SpotlightCard>

        {/* Selected Day Agenda Sidebar - 1 Column */}
        <SpotlightCard className="xl:col-span-1 bg-[var(--theme-card)] border border-[var(--theme-border)]/35 p-5 shadow-xs flex flex-col justify-between space-y-4" borderRadius="16px">
          <div>
            <div className="border-b border-[var(--theme-border)]/15 pb-3.5 mb-3.5">
              <h3 className="text-xs font-semibold text-[var(--theme-text-dark)] uppercase tracking-wider mb-1">
                Agenda Checkpoints
              </h3>
              {selectedDay ? (
                <p className="text-xs font-medium text-[var(--theme-text-main)]">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              ) : (
                <p className="text-xs text-[var(--theme-text-main)] opacity-70">Select a day on the calendar.</p>
              )}
            </div>

            {selectedDay && (
              <div className="space-y-3">
                {selectedDayCheckpoints.length === 0 ? (
                  <div className="bg-[var(--theme-beige)]/10 border border-dashed border-[var(--theme-border)]/30 p-6 rounded-xl text-center space-y-2">
                    <p className="text-[11px] font-medium text-[var(--theme-text-main)] opacity-70">No checkpoints scheduled.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(selectedDay)}
                      className="text-[10px] font-semibold text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} /> Schedule study event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedDayCheckpoints.map(cp => (
                      <div 
                        key={cp.id}
                        className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                          cp.status === "completed"
                            ? "bg-[var(--theme-beige)]/10 border-[var(--theme-border)]/15"
                            : "bg-[var(--theme-card)] border-[var(--theme-border)]/30 hover:-translate-y-[1px] hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(cp.id)}
                            className="p-0.5 mt-0.5 rounded hover:bg-[var(--theme-beige)]/40 transition border-none bg-transparent cursor-pointer text-[var(--theme-text-main)] hover:text-emerald-600"
                            title={cp.status === "completed" ? "Mark incomplete" : "Complete Milestone"}
                          >
                            {cp.status === "completed" ? (
                              <CheckCircle size={15} className="text-emerald-600" />
                            ) : (
                              <Circle size={15} className="opacity-60" />
                            )}
                          </button>

                          <div className="flex-1 pr-4 min-w-0">
                            <h4 className={`text-xs font-semibold leading-snug truncate ${
                              cp.status === "completed" ? "line-through text-[var(--theme-text-main)] opacity-50" : "text-[var(--theme-text-dark)]"
                            }`}>
                              {cp.title}
                            </h4>
                            
                            {cp.description && (
                              <p className="text-[10px] text-[var(--theme-text-main)] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                                {cp.description}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {/* Subject Badge */}
                              <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[var(--theme-beige)] border border-[var(--theme-border)]/15 text-[var(--theme-text-dark)]">
                                {cp.subjectId === "general" ? "⭐ General" : subjects.find(s => s.id === cp.subjectId)?.name.substring(0, 15) || cp.subjectId}
                              </span>

                              {/* Custom Color Dot */}
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-[var(--theme-border)]/10 shrink-0" 
                                style={{ backgroundColor: cp.markerColor }}
                              />

                              {/* Status badge */}
                              {cp.status === "in_progress" && (
                                <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-800 font-medium px-1.5 rounded-lg">In Progress</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cp)}
                            className="p-1 hover:bg-[var(--theme-beige)]/30 rounded text-[var(--theme-text-main)] opacity-50 hover:opacity-90 transition border-none bg-transparent cursor-pointer"
                            title="Edit Checkpoint"
                          >
                            <Edit3 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick study tips */}
          <div className="bg-[var(--theme-beige)]/20 border border-[var(--theme-border)]/20 rounded-xl p-4 space-y-1.5 opacity-85">
            <h4 className="text-[9px] font-semibold text-[var(--theme-text-main)] uppercase tracking-wider">Candidate Guideline</h4>
            <p className="text-[10px] text-[var(--theme-text-main)] leading-relaxed italic opacity-95">
              "Establish daily mini-checkpoints. Checking off even one micro-milestone per day builds massive exam consistency."
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* --- ADD CHECKPOINT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fadeIn text-left">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] p-1 rounded-full transition border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] mb-4 flex items-center gap-1.5">
              <CalendarIcon size={16} className="text-[var(--theme-accent)] opacity-80" /> Add Study Checkpoint
            </h3>

            <form onSubmit={handleSaveCheckpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Quant Quiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-3 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] font-sans placeholder:opacity-30 transition shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Curriculum Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition cursor-pointer"
                  >
                    <option value="general">⭐ General Study Milestone</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Checkpoint Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2 text-xs text-[var(--theme-text-dark)] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Visual Marker Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MARKER_COLORS.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewMarkerColor(color.hex)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-[10px] transition-all cursor-pointer ${
                        newMarkerColor === color.hex 
                          ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-semibold" 
                          : "border-[var(--theme-border)]/30 bg-[var(--theme-beige)]/20 text-[var(--theme-text-main)] hover:bg-[var(--theme-beige)]"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/25" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none cursor-pointer"
                  >
                    <option value="not_started">🔴 Not Started</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Plan Details (Optional)
                </label>
                <textarea
                  placeholder="Describe equations or sections to review..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-3 py-2 text-xs text-[var(--theme-text-dark)] h-16 resize-none outline-none focus:border-[var(--theme-accent)] placeholder:opacity-30 transition shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] font-semibold text-xs py-3 rounded-xl border-none shadow-xs transition-all hover:-translate-y-[1px] cursor-pointer"
              >
                Create Study Checkpoint
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CHECKPOINT MODAL --- */}
      {isEditModalOpen && activeCheckpoint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fadeIn text-left">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] p-1 rounded-full transition border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-semibold text-[var(--theme-text-dark)] mb-4 flex items-center gap-1.5">
              <Edit3 size={16} className="text-[var(--theme-accent)] opacity-80" /> Edit Study Checkpoint
            </h3>

            <form onSubmit={handleSaveEditCheckpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-3 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Curriculum Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition cursor-pointer"
                  >
                    <option value="general">⭐ General Study Milestone</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Checkpoint Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2 text-xs text-[var(--theme-text-dark)] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Marker Color Customize
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MARKER_COLORS.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewMarkerColor(color.hex)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-[10px] transition-all cursor-pointer ${
                        newMarkerColor === color.hex 
                          ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)] text-[var(--theme-accent)] font-semibold" 
                          : "border-[var(--theme-border)]/30 bg-[var(--theme-beige)]/20 text-[var(--theme-text-main)] hover:bg-[var(--theme-beige)]"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/25" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-2.5 py-2.5 text-xs text-[var(--theme-text-dark)] outline-none cursor-pointer"
                  >
                    <option value="not_started">🔴 Not Started</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-medium text-[var(--theme-text-main)] mb-1.5">
                  Plan Details (Optional)
                </label>
                <textarea
                  placeholder="e.g. Read CFA study material, outline key formulas."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 rounded-xl px-3 py-2 text-xs text-[var(--theme-text-dark)] h-16 resize-none outline-none focus:border-[var(--theme-accent)] placeholder:opacity-30 transition shadow-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCheckpoint(activeCheckpoint.id)}
                  className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:-translate-y-[1px]"
                >
                  <Trash2 size={13} className="opacity-80" /> Delete
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] font-semibold text-xs py-2.5 rounded-xl border-none shadow-xs transition-all hover:-translate-y-[1px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
