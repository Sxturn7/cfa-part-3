import React, { useState, useMemo } from "react";
import { UserProfile, TodoItem, AppNotification } from "../types";
import { CheckCircle, Check, Plus, Trash2, Sparkles, Filter, Info, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SpotlightCard from "./SpotlightCard";

interface TodoListProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  addNotification?: (type: AppNotification["type"], title: string, text: string) => void;
}

export default function TodoList({ userProfile, setUserProfile, addNotification }: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"high" | "medium" | "low">("medium");
  const [todoFilter, setTodoFilter] = useState<"all" | "active" | "completed" | "high">("all");

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: "todo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: newTodoPriority
    };

    const updatedTodos = [...(userProfile.todos || []), newTodo];
    const updatedProfile = { ...userProfile, todos: updatedTodos };
    setUserProfile(updatedProfile);

    setNewTodoText("");
    setNewTodoPriority("medium");

    if (addNotification) {
      addNotification("achievement", "📋 Task Added", `"${newTodo.text}" was added to your todo list.`);
    }
  };

  const handleAddPresetTodo = (text: string, priority: "high" | "medium" | "low" = "medium") => {
    const newTodo: TodoItem = {
      id: "todo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      priority
    };

    const updatedTodos = [...(userProfile.todos || []), newTodo];
    const updatedProfile = { ...userProfile, todos: updatedTodos };
    setUserProfile(updatedProfile);

    if (addNotification) {
      addNotification("achievement", "⚡ Preset Added", `Added "${text}" to your checklist.`);
    }
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = (userProfile.todos || []).map((todo) => {
      if (todo.id === id) {
        const nextState = !todo.completed;
        if (addNotification && nextState) {
          addNotification("completed", "✅ Task Completed", `"${todo.text}" completed!`);
        }
        return { ...todo, completed: nextState };
      }
      return todo;
    });
    setUserProfile({ ...userProfile, todos: updatedTodos });
  };

  const handleDeleteTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the todo item
    const updatedTodos = (userProfile.todos || []).filter((todo) => todo.id !== id);
    setUserProfile({ ...userProfile, todos: updatedTodos });
    
    if (addNotification) {
      addNotification("reminder", "🗑️ Task Deleted", "Study objective removed from checklist.");
    }
  };

  const filteredTodos = useMemo(() => {
    const todos = userProfile.todos || [];
    let list = [...todos];

    if (todoFilter === "active") {
      list = list.filter((t) => !t.completed);
    } else if (todoFilter === "completed") {
      list = list.filter((t) => t.completed);
    } else if (todoFilter === "high") {
      list = list.filter((t) => t.priority === "high");
    }

    // Uncompleted first, then sorted by priority value, then chronological order of creation
    return list.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const pMap = { high: 3, medium: 2, low: 1 };
      const aP = pMap[a.priority || "medium"];
      const bP = pMap[b.priority || "medium"];
      if (aP !== bP) return bP - aP;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [userProfile.todos, todoFilter]);

  const totalCount = (userProfile.todos || []).length;
  const completedCount = (userProfile.todos || []).filter((t) => t.completed).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div id="tour-todo-list" className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Upper Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-8 rounded-2xl shadow-[var(--theme-shadow)] relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] rounded-xl">
              <CheckCircle size={22} />
            </span>
            <h2 className="text-xl font-black text-[var(--theme-text-dark)] tracking-tight">
              To-Do List
            </h2>
          </div>
          <p className="text-xs text-[var(--theme-text-main)] max-w-2xl leading-relaxed opacity-85">
            Add your daily exam study milestones, check items off as you finish them, and manage your custom preparation workflows. 
            Keep track of active priorities without any rigid schedule constraints.
          </p>
        </div>

        {/* Completion Progress Gauge */}
        <div className="bg-[var(--theme-beige)]/20 px-6 py-4 rounded-2xl border border-[var(--theme-border)]/15 shrink-0 min-w-[240px] relative z-10 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-bold text-[var(--theme-text-dark)] mb-2">
            <span>Overall Completion</span>
            <span className="font-mono text-[var(--theme-accent)] font-extrabold">
              {completedCount}/{totalCount} ({completionPercentage}%)
            </span>
          </div>
          <div className="h-2.5 bg-[var(--theme-border)]/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-[var(--theme-text-main)] mt-2 opacity-65 font-medium leading-normal">
            Checked-off items count towards your active preparation goals.
          </p>
        </div>
      </div>

      {/* Main Grid: Form and Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Create Task & Active Tasks List */}
        <div className="lg:col-span-8 space-y-6">
          <SpotlightCard
            className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-6 flex flex-col transition-all duration-300 shadow-[var(--theme-shadow)]"
            borderRadius="16px"
          >
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-main)] opacity-80 flex items-center gap-1.5 border-b border-[var(--theme-border)]/10 pb-3">
                <Plus size={14} className="text-[var(--theme-accent)]" />
                <span>Create New Study Milestone</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Review CFA Code of Ethics & Standards..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="flex-1 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-4 py-3 rounded-xl font-sans outline-none focus:border-[var(--theme-accent)] transition shadow-xs placeholder:opacity-40"
                />

                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as any)}
                  className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] text-xs px-3 py-3 rounded-xl font-sans outline-none focus:border-[var(--theme-accent)] transition cursor-pointer shrink-0 min-w-[150px]"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>

                <button
                  type="submit"
                  className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] font-bold text-xs px-6 py-3 rounded-xl transition duration-200 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 shadow-md hover:shadow-[var(--theme-shadow-hover)] cursor-pointer border-none"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          </SpotlightCard>

          {/* Checklist Content Box */}
          <div className="space-y-4">
            {/* Filter and Bulk Actions Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--theme-card)] p-3.5 rounded-2xl border border-[var(--theme-border)]/15 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Items", count: totalCount },
                  { id: "active", label: "Active", count: (userProfile.todos || []).filter((t) => !t.completed).length },
                  { id: "completed", label: "Completed", count: completedCount },
                  { id: "high", label: "High Priority 🚨", count: (userProfile.todos || []).filter((t) => t.priority === "high" && !t.completed).length }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTodoFilter(f.id as any)}
                    className={`text-[10px] font-semibold px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      todoFilter === f.id
                        ? "bg-[var(--theme-accent)] border-[var(--theme-accent)] text-[var(--theme-bg)] shadow-xs"
                        : "bg-[var(--theme-card)] border-[var(--theme-border)]/30 text-[var(--theme-text-main)] hover:bg-[var(--theme-beige)]"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-md ${
                      todoFilter === f.id
                        ? "bg-[var(--theme-bg)]/20 text-[var(--theme-bg)]"
                        : "bg-[var(--theme-beige)] text-[var(--theme-text-main)]"
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updatedTodos = (userProfile.todos || []).filter((t) => !t.completed);
                    setUserProfile({ ...userProfile, todos: updatedTodos });
                    if (addNotification) addNotification("reminder", "🗑️ Cleared Tasks", "Cleared completed tasks from checklist.");
                  }}
                  disabled={completedCount === 0}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-xl transition border border-[var(--theme-border)] text-[var(--theme-text-dark)] hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--theme-text-dark)] cursor-pointer bg-transparent"
                >
                  Clear Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your entire todo checklist?")) {
                      setUserProfile({ ...userProfile, todos: [] });
                      if (addNotification) addNotification("reminder", "🗑️ Reset Board", "Your todo checklist has been reset.");
                    }
                  }}
                  disabled={totalCount === 0}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-xl transition border border-[var(--theme-border)] text-[var(--theme-text-dark)] hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--theme-text-dark)] cursor-pointer bg-transparent"
                >
                  Reset Board
                </button>
              </div>
            </div>

            {/* Rendered Checklist items */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTodos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-16 flex flex-col items-center justify-center text-[var(--theme-text-main)] border border-dashed border-[var(--theme-border)]/40 rounded-2xl bg-[var(--theme-card)]"
                  >
                    <CheckCircle size={36} className="mb-3 text-[var(--theme-text-main)]/30 animate-pulse" />
                    <p className="text-xs font-bold text-[var(--theme-text-dark)]">No items match your filter</p>
                    <p className="text-[11px] opacity-70 mt-1 max-w-sm leading-relaxed">
                      {todoFilter === "all"
                        ? "Your todo checklist is currently empty. Use the quick presets on the right or enter custom tasks above."
                        : "No tasks found matching this filter criteria. Change filters or add some items."}
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredTodos.map((todo) => {
                      const priorityStyles = todo.priority === "high"
                        ? "border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 dark:text-rose-100"
                        : todo.priority === "medium"
                        ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 dark:text-amber-100"
                        : "border-[var(--theme-border)]/20 bg-[var(--theme-card)] hover:bg-[var(--theme-beige)]/10 dark:text-slate-100";

                      return (
                        <motion.div
                          key={todo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                            todo.completed
                              ? "bg-[var(--theme-card)]/50 border-[var(--theme-border)]/10 opacity-55"
                              : priorityStyles
                          }`}
                        >
                          <div
                            className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
                            onClick={() => handleToggleTodo(todo.id)}
                          >
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                                todo.completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-[var(--theme-border)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10"
                              }`}
                            >
                              {todo.completed && <Check size={12} strokeWidth={3} />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <span className={`text-xs font-semibold block leading-relaxed select-none ${
                                todo.completed
                                  ? "line-through text-[var(--theme-text-main)] opacity-60"
                                  : "text-[var(--theme-text-dark)]"
                              }`}>
                                {todo.text}
                              </span>

                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                  todo.priority === "high"
                                    ? "bg-rose-500/15 text-rose-700"
                                    : todo.priority === "medium"
                                    ? "bg-amber-500/15 text-amber-700"
                                    : "bg-slate-500/15 text-slate-700"
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    todo.priority === "high"
                                      ? "bg-rose-500 animate-pulse"
                                      : todo.priority === "medium"
                                      ? "bg-amber-500"
                                      : "bg-slate-500"
                                  }`} />
                                  {todo.priority ? todo.priority.toUpperCase() : "MEDIUM"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteTodo(todo.id, e)}
                            className="text-[var(--theme-text-main)] opacity-0 group-hover:opacity-100 hover:text-rose-500 p-2 rounded-lg transition duration-150 cursor-pointer bg-transparent border-none outline-none shrink-0"
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Presets */}
        <div className="lg:col-span-4 space-y-6">
          <SpotlightCard
            className="bg-[var(--theme-card)] border border-[var(--theme-border)]/15 p-6 flex flex-col transition-all duration-300 shadow-[var(--theme-shadow)]"
            borderRadius="16px"
          >
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-main)] opacity-80 flex items-center gap-1.5 border-b border-[var(--theme-border)]/10 pb-3">
                <Sparkles size={14} className="text-[var(--theme-accent)] animate-pulse" />
                <span>Quick Study Presets</span>
              </div>

              <p className="text-[11px] text-[var(--theme-text-main)] opacity-75 leading-relaxed">
                Add standard, high-impact study objectives instantly without writing a custom task:
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { label: "Ethics Standards review", task: "Review CFA Code of Ethics & Standards of Conduct", priority: "high" as const },
                  { label: "Formula sheet drill", task: "Practice formulas for Quantitative Methods", priority: "medium" as const },
                  { label: "FSA Diagnostic practice", task: "Solve 20 Financial Statement Analysis questions", priority: "high" as const },
                  { label: "Revision session log", task: "Review weakest module in Revision schedule", priority: "medium" as const },
                  { label: "Ethics practice quiz", task: "Take a 10-question practice quiz on Ethics", priority: "high" as const },
                  { label: "Mock Exam review", task: "Review and analyze incorrect answers on Mock Exam", priority: "low" as const },
                  { label: "Portfolio Mgmt review", task: "Read summary for Portfolio Management basics", priority: "low" as const },
                  { label: "Derivatives equations", task: "Drill derivatives valuation formulations", priority: "medium" as const }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetTodo(preset.task, preset.priority)}
                    className="w-full text-[11px] text-left p-3 rounded-xl border border-[var(--theme-border)]/20 bg-[var(--theme-card)] hover:bg-[var(--theme-accent-light)]/20 text-[var(--theme-text-dark)] transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 hover:border-[var(--theme-accent)]/30 group hover:shadow-xs"
                  >
                    <span className="truncate font-medium group-hover:text-[var(--theme-accent)] transition">
                      {preset.label}
                    </span>
                    <span className="shrink-0 text-[10px]">
                      {preset.priority === "high" ? "🔴" : preset.priority === "medium" ? "🟡" : "🟢"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
