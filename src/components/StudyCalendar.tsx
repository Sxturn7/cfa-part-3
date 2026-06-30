import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  X, 
  Edit3, 
  SlidersHorizontal,
  CalendarCheck2,
  BookmarkCheck,
  Check
} from "lucide-react";
import { UserProfile, StudyCheckpoint, Subject } from "../types";

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
          // Shift marker to grey/green if completed
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F9F8F0] border border-[#E5E2D0] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#4A3728] flex items-center gap-2">
            📅 Candidate Study Calendar & Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map out custom milestone checkpoints, assign color-coded progress status, and track your active exam preparation timeline.
          </p>
        </div>
        
        {/* Calendar Stats Summary cards */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="bg-white border border-[#E5E2D0] rounded-xl px-4 py-2 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CalendarCheck2 size={16} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Checkpoints</p>
              <p className="text-sm font-bold text-[#4A3728]">{stats.completed} / {stats.total} Done</p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E2D0] rounded-xl px-4 py-2 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-slate-700">
              {stats.pct}%
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Consistency</p>
              <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid container: Calendar on Left, Selected Day info & Stats on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Calendar Month Grid Card - 3 Columns */}
        <div className="xl:col-span-3 bg-white border border-[#E5E2D0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between border-b border-[#F1EFE0] pb-4 mb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-50 rounded-lg border border-[#E5E2D0] text-slate-600 hover:text-slate-900 transition"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-50 rounded-lg border border-[#E5E2D0] text-slate-600 hover:text-slate-900 transition"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-sm font-serif font-bold text-[#4A3728] px-2">
                  {monthNames[month]} {year}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#F1EFE0] hover:bg-[#D9D5C3] text-[#4A3728] rounded-lg transition"
                >
                  Today
                </button>
                
                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(selectedDay)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white rounded-lg transition"
                  >
                    <Plus size={14} /> Add Checkpoint
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-600">Filters:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Subject</span>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="bg-white border border-[#E5E2D0] rounded px-2 py-1 text-xs text-[#3D3B30] outline-none"
                  >
                    <option value="all">All Subject Streams</option>
                    <option value="general">⭐ General Milestones</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-[#E5E2D0] rounded px-2 py-1 text-xs text-[#3D3B30] outline-none"
                  >
                    <option value="all">All Progress States</option>
                    <option value="not_started">🔴 Not Started</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 Finished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 text-center font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                      className="bg-slate-50/40 border border-dashed border-slate-100 rounded-xl aspect-square md:aspect-auto md:h-24 p-1.5"
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
                    className={`text-left rounded-xl border p-1.5 md:p-2 flex flex-col justify-between aspect-square md:aspect-auto md:h-24 transition cursor-pointer select-none group relative ${
                      isSelected
                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent-light)]/20 shadow-sm"
                        : isToday
                        ? "border-amber-400 bg-amber-50/20"
                        : "border-[#E5E2D0] hover:border-slate-350 bg-white"
                    }`}
                  >
                    {/* Day number with status dot */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[11px] font-mono font-bold rounded-md px-1 py-0.5 ${
                        isToday 
                          ? "bg-amber-100 text-amber-800" 
                          : isSelected 
                          ? "bg-[var(--theme-accent)] text-white" 
                          : "text-[#4A3728]"
                      }`}>
                        {day.getDate()}
                      </span>
                      
                      {dayCheckpoints.length > 0 && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 rounded-full md:hidden">
                          {dayCheckpoints.length}
                        </span>
                      )}
                    </div>

                    {/* Checkpoint list inside day - Hidden on mobile, beautiful badges on desktop */}
                    <div className="hidden md:flex flex-col gap-1 w-full overflow-y-auto max-h-[50px] scrollbar-none mt-1">
                      {dayCheckpoints.slice(0, 3).map(cp => (
                        <div 
                          key={cp.id}
                          className="text-[9px] truncate px-1 py-0.5 rounded flex items-center gap-1 text-slate-700 font-sans border border-slate-100 bg-slate-50"
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                            style={{ backgroundColor: cp.markerColor }}
                          />
                          <span className={cp.status === "completed" ? "line-through text-slate-400" : ""}>
                            {cp.title}
                          </span>
                        </div>
                      ))}
                      {dayCheckpoints.length > 3 && (
                        <span className="text-[8px] text-slate-400 font-bold font-mono pl-1">
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
        </div>

        {/* Selected Day Info Sidebar - 1 Column */}
        <div className="xl:col-span-1 bg-white border border-[#E5E2D0] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-[#F1EFE0] pb-3.5 mb-3.5">
              <h3 className="text-xs font-bold text-[#4A3728] tracking-wider uppercase font-mono flex items-center gap-2 mb-1">
                📅 Day Agenda
              </h3>
              {selectedDay ? (
                <p className="text-xs font-serif font-bold text-slate-500">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Select a day on the calendar to see agenda or schedule milestones.</p>
              )}
            </div>

            {selectedDay && (
              <div className="space-y-3">
                {selectedDayCheckpoints.length === 0 ? (
                  <div className="bg-slate-50/50 border border-dashed border-[#E5E2D0] p-6 rounded-xl text-center space-y-2">
                    <AlertCircle size={22} className="text-slate-400 mx-auto" />
                    <p className="text-[11px] font-medium text-slate-500">No checkpoints on this day.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(selectedDay)}
                      className="text-[10px] font-bold text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={10} /> Schedule study event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {selectedDayCheckpoints.map(cp => (
                      <div 
                        key={cp.id}
                        className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                          cp.status === "completed"
                            ? "bg-slate-50/75 border-slate-200"
                            : "bg-white border-[#E5E2D0] hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(cp.id)}
                            className="p-0.5 mt-0.5 rounded hover:bg-slate-100 transition border-none bg-transparent cursor-pointer text-slate-450 hover:text-emerald-500"
                            title={cp.status === "completed" ? "Mark incomplete" : "Complete Milestone!"}
                          >
                            {cp.status === "completed" ? (
                              <CheckCircle size={15} className="text-emerald-500" />
                            ) : (
                              <Circle size={15} />
                            )}
                          </button>

                          <div className="flex-1 pr-4 min-w-0">
                            <h4 className={`text-xs font-bold leading-snug truncate ${
                              cp.status === "completed" ? "line-through text-slate-400" : "text-[#4A3728]"
                            }`}>
                              {cp.title}
                            </h4>
                            
                            {cp.description && (
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {cp.description}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {/* Subject Badge */}
                              <span className="text-[8px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                                {cp.subjectId === "general" ? "⭐ General" : subjects.find(s => s.id === cp.subjectId)?.name.substring(0, 15) || cp.subjectId}
                              </span>

                              {/* Custom Color Dot */}
                              <span 
                                className="w-2 h-2 rounded-full border border-white shrink-0" 
                                style={{ backgroundColor: cp.markerColor }}
                                title="Custom Marker"
                              />

                              {/* Status badge */}
                              {cp.status === "in_progress" && (
                                <span className="text-[8px] bg-amber-50 text-amber-700 font-bold px-1 rounded font-mono">In Progress</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover settings / Trash bin */}
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cp)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition border-none bg-transparent cursor-pointer"
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

          {/* Quick study tips / quotes for motivation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <h4 className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">CANDIDATE STUDY PROTIP</h4>
            <p className="text-[10px] text-slate-350 leading-relaxed italic">
              "The secret of the CFA Level I curriculum is consistency. Break complex topics like derivatives or fixed income into small checkpoints and mark off one every single day."
            </p>
          </div>
        </div>
      </div>

      {/* --- ADD CHECKPOINT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fadeIn text-left text-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 font-serif mb-4 flex items-center gap-1.5">
              <CalendarIcon size={16} className="text-[var(--theme-accent)]" /> Add Study Checkpoint
            </h3>

            <form onSubmit={handleSaveCheckpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                  Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Quant QM-2 Quiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-255 outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Curriculum Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="general">⭐ General Study Milestone</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Checkpoint Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-455 mb-1.5">
                  Select Custom Marker Color (Visually Appealing!)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MARKER_COLORS.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewMarkerColor(color.hex)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-sans transition ${
                        newMarkerColor === color.hex 
                          ? "border-[var(--theme-accent)] bg-slate-950/80 text-white font-bold" 
                          : "border-slate-800 bg-slate-950/30 text-slate-400 hover:bg-slate-950/50"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="not_started">🔴 Not Started</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                  Description / Study Plan (Optional)
                </label>
                <textarea
                  placeholder="e.g. Read CFA study material, outline key formulas, then complete 15-question Practice Quiz."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-255 h-16 resize-none outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white font-bold text-xs py-2.5 rounded-xl border-none shadow transition-all duration-150 mt-2"
              >
                Create Study Checkpoint
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CHECKPOINT MODAL --- */}
      {isEditModalOpen && activeCheckpoint && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fadeIn text-left text-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 font-serif mb-4 flex items-center gap-1.5">
              <Edit3 size={16} className="text-[var(--theme-accent)]" /> Edit Study Checkpoint
            </h3>

            <form onSubmit={handleSaveEditCheckpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                  Checkpoint Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-255 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Curriculum Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="general">⭐ General Study Milestone</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Checkpoint Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-455 mb-1.5">
                  Marker Color Customize
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MARKER_COLORS.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewMarkerColor(color.hex)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-sans transition ${
                        newMarkerColor === color.hex 
                          ? "border-[var(--theme-accent)] bg-slate-950/80 text-white font-bold" 
                          : "border-slate-800 bg-slate-950/30 text-slate-400 hover:bg-slate-950/50"
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="not_started">🔴 Not Started</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                  Description / Study Plan (Optional)
                </label>
                <textarea
                  placeholder="e.g. Read CFA study material, outline key formulas."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-255 h-16 resize-none outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCheckpoint(activeCheckpoint.id)}
                  className="flex items-center justify-center gap-1.5 bg-rose-950/35 hover:bg-rose-900/40 border border-rose-900 text-rose-450 hover:text-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white font-bold text-xs py-2.5 rounded-xl border-none shadow transition"
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
