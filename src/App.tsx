import React, { useState, useEffect } from "react";
import { UserProfile, Subject, ModuleProgress, ActivityLog, ModuleStatus, AppNotification } from "./types";
import { CURRICULUM, FLAT_MODULES, getModuleById } from "./curriculum";
import Dashboard from "./components/Dashboard";
import ModuleList from "./components/ModuleList";
import QuizPane from "./components/QuizPane";
import GrowthTree from "./components/GrowthTree";
import StudyCalendar from "./components/StudyCalendar";
import FlashcardsPane from "./components/FlashcardsPane";
import NotificationCenter from "./components/NotificationCenter";
import RevisionReminderModal from "./components/RevisionReminderModal";
import DesignCustomizer from "./components/DesignCustomizer";
import { AppTheme, THEME_PRESETS, applyTheme } from "./theme";
import { BookOpen, Clock, Activity, Calendar, LayoutDashboard, Brain, HelpCircle, LogOut, Eye, EyeOff, Bell, Sparkles, Palette, Database, X, Maximize2, Pause, Play, RotateCcw, CheckCircle } from "lucide-react";
import FullscreenTimer from "./components/FullscreenTimer";
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseConfigured, 
  syncToSupabase, 
  fetchFromSupabase,
  SUPABASE_SQL_SETUP,
  UserSyncData
} from "./utils/supabaseClient";

export default function App() {
  const [email, setEmail] = useState<string>("");
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: "",
    createdAt: new Date().toISOString(),
    targetExamDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 120 days from now
    studyStartDate: new Date().toISOString().split("T")[0],
    dailyTargetHours: 2,
    checkpoints: [],
  });

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards">("dashboard");
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);
  const [activeRevisionModId, setActiveRevisionModId] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(THEME_PRESETS.sage);
  const [isDesignCustomizerOpen, setIsDesignCustomizerOpen] = useState<boolean>(false);

  // Global Focus Timer States
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isFullscreenTimerOpen, setIsFullscreenTimerOpen] = useState<boolean>(false);
  const [timerModuleId, setTimerModuleId] = useState<string>(FLAT_MODULES[0]?.id || "");

  // Timer tick interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleSaveUnifiedSession = () => {
    const studyMins = Math.round(timerSeconds / 60) || 1;
    handleLogStudySession(timerModuleId, studyMins, "study");
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setIsFullscreenTimerOpen(false);
  };

  // Supabase Sync configuration states
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState<boolean>(false);
  const [isDbCollapseOpen, setIsDbCollapseOpen] = useState<boolean>(false);
  const [dbUrl, setDbUrl] = useState<string>(getSupabaseConfig().url);
  const [dbKey, setDbKey] = useState<string>(getSupabaseConfig().key);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Onboarding parameters targeting initial login/signup
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [tempOnboardDate, setTempOnboardDate] = useState<string>("");
  const [tempOnboardHours, setTempOnboardHours] = useState<number>(2);

  // Local storage management per email account
  useEffect(() => {
    const savedEmail = localStorage.getItem("cfa_current_email");
    if (savedEmail) {
      setEmail(savedEmail);
      loadUserData(savedEmail);
      setSignedIn(true);
    }
  }, []);

  // Apply theme on change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const loadUserData = (currentEmail: string, fetchedData?: UserSyncData | null) => {
    // If we have fetched data from Supabase, load that directly!
    if (fetchedData) {
      setCurrentTheme(fetchedData.theme || THEME_PRESETS.sage);
      setUserProfile(fetchedData.profile);
      setProgress(fetchedData.progress || {});
      setActivityLogs(fetchedData.logs || []);
      setNotifications(fetchedData.notifications || []);
      setIsOnboarded(fetchedData.onboarded || false);

      // Cache locally in localStorage as a backup
      localStorage.setItem(`cfa_theme_${currentEmail}`, JSON.stringify(fetchedData.theme || THEME_PRESETS.sage));
      localStorage.setItem(`cfa_profile_${currentEmail}`, JSON.stringify(fetchedData.profile));
      localStorage.setItem(`cfa_progress_${currentEmail}`, JSON.stringify(fetchedData.progress || {}));
      localStorage.setItem(`cfa_logs_${currentEmail}`, JSON.stringify(fetchedData.logs || []));
      localStorage.setItem(`cfa_notifs_${currentEmail}`, JSON.stringify(fetchedData.notifications || []));
      localStorage.setItem(`cfa_onboarded_${currentEmail}`, fetchedData.onboarded ? "true" : "false");
      if (fetchedData.password) {
        localStorage.setItem(`cfa_auth_${currentEmail}`, fetchedData.password);
      }
      return;
    }

    // Otherwise, load dynamic color adjustments from localStorage
    const themeKey = `cfa_theme_${currentEmail}`;
    const cachedTheme = localStorage.getItem(themeKey);
    if (cachedTheme) {
      try {
        setCurrentTheme(JSON.parse(cachedTheme));
      } catch (e) {
        setCurrentTheme(THEME_PRESETS.sage);
      }
    } else {
      setCurrentTheme(THEME_PRESETS.sage);
    }

    // Load profile
    const profileKey = `cfa_profile_${currentEmail}`;
    const progressKey = `cfa_progress_${currentEmail}`;
    const logsKey = `cfa_logs_${currentEmail}`;

    const cachedProfile = localStorage.getItem(profileKey);
    const cachedProgress = localStorage.getItem(progressKey);
    const cachedLogs = localStorage.getItem(logsKey);

    if (cachedProfile) {
      setUserProfile(JSON.parse(cachedProfile));
    } else {
      const defaultProfile: UserProfile = {
        email: currentEmail,
        createdAt: new Date().toISOString(),
        targetExamDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        studyStartDate: new Date().toISOString().split("T")[0],
        dailyTargetHours: 2,
      };
      setUserProfile(defaultProfile);
      localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
    }

    if (cachedProgress) {
      setProgress(JSON.parse(cachedProgress));
    } else {
      setProgress({});
    }

    if (cachedLogs) {
      setActivityLogs(JSON.parse(cachedLogs));
    } else {
      setActivityLogs([]);
    }

    const cachedNotifs = localStorage.getItem(`cfa_notifs_${currentEmail}`);
    if (cachedNotifs) {
      setNotifications(JSON.parse(cachedNotifs));
    } else {
      const defaultNotif: AppNotification = {
        id: "welcome",
        type: "achievement",
        title: "Study Runway Activated",
        message: `Your Level I study runway has loaded! All 93 readings are loaded. Mark them complete to build your interactive tree.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications([defaultNotif]);
      localStorage.setItem(`cfa_notifs_${currentEmail}`, JSON.stringify([defaultNotif]));
    }

    // Check onboarding status
    const isSetup = localStorage.getItem(`cfa_onboarded_${currentEmail}`) === "true";
    setIsOnboarded(isSetup);
  };

  // Sync temp variables with profile for onboarding defaults
  useEffect(() => {
    if (signedIn && !isOnboarded && userProfile) {
      setTempOnboardDate(userProfile.targetExamDate);
      setTempOnboardHours(userProfile.dailyTargetHours);
    }
  }, [signedIn, isOnboarded, userProfile]);

  const saveData = (
    updatedProfile: UserProfile, 
    updatedProgress: Record<string, ModuleProgress>, 
    updatedLogs: ActivityLog[],
    updatedNotifs?: AppNotification[]
  ) => {
    if (!email) return;
    localStorage.setItem(`cfa_profile_${email}`, JSON.stringify(updatedProfile));
    localStorage.setItem(`cfa_progress_${email}`, JSON.stringify(updatedProgress));
    localStorage.setItem(`cfa_logs_${email}`, JSON.stringify(updatedLogs));
    
    const activeNotifs = updatedNotifs !== undefined ? updatedNotifs : notifications;
    if (updatedNotifs !== undefined) {
      localStorage.setItem(`cfa_notifs_${email}`, JSON.stringify(updatedNotifs));
    }

    // Background Cloud Sync
    if (isSupabaseConfigured()) {
      syncToSupabase({
        email,
        profile: updatedProfile,
        progress: updatedProgress,
        logs: updatedLogs,
        notifications: activeNotifs,
        theme: currentTheme,
        onboarded: isOnboarded,
      }).catch((err) => console.error("Cloud auto sync failed:", err));
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsAuthLoading(true);

    const emailClean = email.trim().toLowerCase();

    if (!emailClean || !emailClean.includes("@")) {
      setAuthError("Please enter a valid candidate email address.");
      setIsAuthLoading(false);
      return;
    }

    if (!password) {
      setAuthError("Please enter a password.");
      setIsAuthLoading(false);
      return;
    }

    try {
      if (authMode === "signup") {
        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          setIsAuthLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setAuthError("Passwords do not match.");
          setIsAuthLoading(false);
          return;
        }

        // 1. Supabase Cloud Check
        if (isSupabaseConfigured()) {
          const cloudData = await fetchFromSupabase(emailClean);
          if (cloudData) {
            setAuthError("This email is already registered in the Cloud database. Please sign in instead.");
            setIsAuthLoading(false);
            return;
          }
        } else {
          // 2. Local Storage Check
          const existingPassword = localStorage.getItem(`cfa_auth_${emailClean}`);
          if (existingPassword) {
            setAuthError("This email is already registered locally. Please sign in instead.");
            setIsAuthLoading(false);
            return;
          }
        }

        // Register Account parameters
        localStorage.setItem(`cfa_auth_${emailClean}`, password);
        localStorage.setItem("cfa_current_email", emailClean);

        const defaultProfile: UserProfile = {
          email: emailClean,
          createdAt: new Date().toISOString(),
          targetExamDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          studyStartDate: new Date().toISOString().split("T")[0],
          dailyTargetHours: 2,
        };

        const defaultNotif: AppNotification = {
          id: "welcome",
          type: "achievement",
          title: "Study Runway Activated",
          message: `Your Level I study runway has loaded! All 93 readings are loaded. Mark them complete to build your interactive tree.`,
          timestamp: new Date().toISOString(),
          read: false,
        };

        // Sync to cloud on-registration if active
        if (isSupabaseConfigured()) {
          await syncToSupabase({
            email: emailClean,
            password: password,
            profile: defaultProfile,
            progress: {},
            logs: [],
            notifications: [defaultNotif],
            theme: THEME_PRESETS.sage,
            onboarded: false,
          });
        }

        setEmail(emailClean);
        setUserProfile(defaultProfile);
        setProgress({});
        setActivityLogs([]);
        setNotifications([defaultNotif]);
        setIsOnboarded(false);

        // Save local copies
        localStorage.setItem(`cfa_profile_${emailClean}`, JSON.stringify(defaultProfile));
        localStorage.setItem(`cfa_progress_${emailClean}`, JSON.stringify({}));
        localStorage.setItem(`cfa_logs_${emailClean}`, JSON.stringify([]));
        localStorage.setItem(`cfa_notifs_${emailClean}`, JSON.stringify([defaultNotif]));
        localStorage.setItem(`cfa_onboarded_${emailClean}`, "false");

        setSignedIn(true);
        setAuthSuccess("Account successfully registered!");
        setPassword("");
        setConfirmPassword("");
      } else {
        // Log-in flow
        let loadedData: UserSyncData | null = null;
        let authPassword = "";

        if (isSupabaseConfigured()) {
          const cloudData = await fetchFromSupabase(emailClean);
          if (cloudData) {
            authPassword = cloudData.password || "";
            loadedData = cloudData;
          }
        }

        if (!loadedData) {
          authPassword = localStorage.getItem(`cfa_auth_${emailClean}`) || "";
        }

        if (!authPassword) {
          setAuthError("No registered account found with this email. Please sign up first.");
          setIsAuthLoading(false);
          return;
        }

        if (authPassword !== password) {
          setAuthError("Incorrect password. Please verify and try again.");
          setIsAuthLoading(false);
          return;
        }

        // Save active session
        localStorage.setItem("cfa_current_email", emailClean);
        localStorage.setItem(`cfa_auth_${emailClean}`, authPassword);
        setEmail(emailClean);

        loadUserData(emailClean, loadedData);
        setSignedIn(true);

        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setAuthError("An error occurred during authentication.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("cfa_current_email");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
    setAuthSuccess("");
    setIsOnboarded(false);
    setSignedIn(false);
  };

  // State Modifiers
  const handleLogStudySession = (moduleId: string, durationMinutes: number, type: "study" | "quiz", score?: number) => {
    const modObj = FLAT_MODULES.find(m => m.id === moduleId);
    if (!modObj) return;

    // Create new activity log
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      moduleId,
      subjectId: modObj.subjectId,
      moduleName: modObj.name,
      subjectName: modObj.subjectName,
      type: type === "quiz" ? "quiz" : "study",
      durationMinutes,
      score,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);

    // Update Progress
    const currentProg = progress[moduleId] || {
      status: ModuleStatus.IN_PROGRESS,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        status: currentProg.status === ModuleStatus.COMPLETED ? ModuleStatus.COMPLETED : ModuleStatus.IN_PROGRESS,
        studyTimeMinutes: currentProg.studyTimeMinutes + durationMinutes,
        quizScore: score !== undefined ? score : currentProg.quizScore,
        lastStudiedAt: new Date().toISOString()
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, updatedLogs);
  };

  const addNotification = (
    type: "reminder" | "achievement" | "completed",
    title: string,
    message: string,
    moduleId?: string
  ) => {
    if (!email) return;
    const newNotif: AppNotification = {
      id: "notif-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      moduleId,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveData(userProfile, progress, activityLogs, updated);
      return updated;
    });
  };

  const handleToggleNotificationRead = (id: string) => {
    if (!email) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
      saveData(userProfile, progress, activityLogs, updated);
      return updated;
    });
  };

  const handleDeleteNotification = (id: string) => {
    if (!email) return;
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveData(userProfile, progress, activityLogs, updated);
      return updated;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    if (!email) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveData(userProfile, progress, activityLogs, updated);
      return updated;
    });
  };

  const handleClearAllNotifications = () => {
    if (!email) return;
    setNotifications([]);
    saveData(userProfile, progress, activityLogs, []);
  };

  const handleScheduleRevision = (moduleId: string, days: number = 1) => {
    const mod = FLAT_MODULES.find((m) => m.id === moduleId);
    const modName = mod ? mod.name : "Module";

    const currentProg = progress[moduleId] || {
      status: ModuleStatus.NOT_STARTED,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        revisionCycle: currentProg.revisionCycle + 1,
        status: ModuleStatus.COMPLETED
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);

    // Custom notification reminder based on chosen days
    addNotification(
      "reminder",
      `📅 Spaced Repetition (In ${days} Day${days > 1 ? "s" : ""})`,
      `Cycle ${currentProg.revisionCycle + 1} locked. Revision set for "${modName}" in ${days} days.`,
      moduleId
    );

    addNotification(
      "achievement",
      "🏆 Streak Maintained",
      `Saved a revision plan for "${modName}" over a ${days}-day cycle. Excellent practice!`,
      moduleId
    );

    setActiveRevisionModId(null);
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setCurrentTheme(newTheme);
    if (email) {
      localStorage.setItem(`cfa_theme_${email}`, JSON.stringify(newTheme));
    }
  };

  const handleChangeModuleStatus = (moduleId: string, status: ModuleStatus) => {
    const currentProg = progress[moduleId] || {
      status: ModuleStatus.NOT_STARTED,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const isTransitioningToCompleted = status === ModuleStatus.COMPLETED && currentProg.status !== ModuleStatus.COMPLETED;

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        status,
        lastStudiedAt: new Date().toISOString()
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);

    if (isTransitioningToCompleted) {
      setActiveRevisionModId(moduleId);
      const mod = FLAT_MODULES.find((m) => m.id === moduleId);
      const modName = mod ? mod.name : "Module";
      
      addNotification(
        "completed",
        "✓ Reading Completed",
        `Module "${modName}" marked complete! Spaced repetition sequence recommended.`,
        moduleId
      );
    }
  };

  const handleChangeModuleNotes = (moduleId: string, notes: string) => {
    const currentProg = progress[moduleId] || {
      status: ModuleStatus.NOT_STARTED,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        notes
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);
  };

  const handleRecordQuizScore = (moduleId: string, score: number) => {
    const currentProg = progress[moduleId] || {
      status: ModuleStatus.NOT_STARTED,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        quizScore: score,
        status: currentProg.status === ModuleStatus.NOT_STARTED ? ModuleStatus.IN_PROGRESS : currentProg.status
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);
  };

  const handleProgressRevisionCycle = (moduleId: string) => {
    const currentProg = progress[moduleId] || {
      status: ModuleStatus.NOT_STARTED,
      studyTimeMinutes: 0,
      quizScore: null,
      notes: "",
      lastStudiedAt: null,
      revisionCycle: 0
    };

    const nextCycle = currentProg.revisionCycle >= 3 ? 0 : currentProg.revisionCycle + 1;

    const updatedProgress = {
      ...progress,
      [moduleId]: {
        ...currentProg,
        revisionCycle: nextCycle
      }
    };
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);
  };

  // Sync profile targets with save
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveData(newProfile, progress, activityLogs);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-blue-600/30">
      {/* 1. Header Navigation elements */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-1.5 border border-blue-400/20">
            <span className="font-extrabold text-sm text-white font-sans tracking-tight">CFA</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Level I Prep Engine
              <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-950 select-none">
                93 Modules Embedded
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Excellence in Finance Curriculum Study Partner</p>
          </div>
        </div>

        {signedIn && (
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-300 font-mono font-medium">{userProfile.email}</span>
              <span className="text-[10px] text-slate-500">CFA Level I Account</span>
            </div>

            {/* Design Customizer Button */}
            <button
              onClick={() => setIsDesignCustomizerOpen(true)}
              className="p-2 text-amber-500 hover:text-amber-400 bg-slate-800/30 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 rounded-full transition flex items-center justify-center w-8 h-8 shrink-0 shadow-sm"
              title="Runway Design Studio"
              aria-label="Design customizer"
            >
              <Palette size={14} />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifCenterOpen(true)}
              className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg transition"
              aria-label="Notification center"
            >
              <Bell size={15} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 font-bold border border-slate-900 text-[9px] text-white flex items-center justify-center animate-bounce">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <button
              onClick={handleSignOut}
              className="bg-slate-800/80 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold select-none flex items-center gap-1.5 transition"
            >
              <LogOut size={13} />
              Switch Account
            </button>
          </div>
        )}
      </header>

      {/* 2. Authentication splash screen */}
      {!signedIn ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
          {/* visual dynamic ambient shapes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-slate-900/85 border border-slate-850 p-8 rounded-2xl shadow-xl relative animate-fadeIn">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#5A6344] mx-auto flex items-center justify-center shadow-md text-white font-serif italic text-2xl font-bold">
                C
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight text-[#4A3728]">CFA Level I Mastery</h2>
              <p className="text-xs text-[#7D7859] leading-relaxed max-w-xs mx-auto">
                Access your private adaptive Study Planner, 93 embedded curriculum modules, and interactive Visual Growth Tree.
              </p>
            </div>

            {/* Auth Mode Tab Bar */}
            <div className="flex border-b border-[#E5E2D0] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  authMode === "login"
                    ? "border-b-2 border-[#5A6344] text-[#4A3728]"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  authMode === "signup"
                    ? "border-b-2 border-[#5A6344] text-[#4A3728]"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-[#94625A]/40 text-[#94625A] text-xs rounded-lg font-medium">
                ⚠️ {authError}
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 bg-[#FDFCF8] border border-[#A3B18A] text-[#5A6344] text-xs rounded-lg font-medium">
                ✨ {authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-1.5">
                  Candidate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your candidate email..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  className="w-full bg-white border border-[#D9D5C3] rounded-xl px-3 py-2.5 text-sm text-[#3D3B30] outline-none placeholder:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-1.5">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={authMode === "signup" ? "Choose secure password (6+ chars)..." : "Enter password..."}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    className="w-full bg-white border border-[#D9D5C3] rounded-xl pl-3 pr-10 py-2.5 text-sm text-[#3D3B30] outline-none placeholder:text-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none p-1 flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Verify your password..."
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    className="w-full bg-white border border-[#D9D5C3] rounded-xl px-3 py-2.5 text-sm text-[#3D3B30] outline-none placeholder:text-slate-400 font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-[#5A6344] hover:bg-[#4a5137] disabled:bg-[#5A6344]/50 text-white font-bold text-xs py-3 rounded-xl tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm mt-4 border-none flex items-center justify-center gap-2"
              >
                {isAuthLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying Candidate...
                  </>
                ) : (
                  authMode === "login" ? "Sign In & Access Curriculum" : "Register CFA Candidate Account"
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-[#E5E2D0] pt-4 text-center text-[10px] text-[#A8A48F] leading-relaxed">
              {authMode === "login" ? (
                <span>🔑 Enter your registered email and password to safely resume statistics and quiz feedback tracks.</span>
              ) : (
                <span>🌱 Creating an account secure-locks your unique analytics profile, notes history, and active performance logs.</span>
              )}
            </div>
          </div>
        </main>
      ) : !isOnboarded ? (
        /* Onboarding Screen (New Profile Date and Weekly Target Hours Setup) */
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/85 border border-[#E5E2D0] p-8 rounded-2xl shadow-xl relative animate-fadeIn">
            <div className="text-center space-y-2 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#5A6344] mx-auto flex items-center justify-center shadow-md text-white font-serif italic text-2xl font-bold">
                🌱
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight text-[#4A3728]">CFA Level I Runway Setup</h2>
              <p className="text-xs text-[#7D7859] leading-relaxed max-w-xs mx-auto">
                Define your exam runway before launching the adaptive syllabus. Once saved, dates can only be adjusted inside Settings.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const profileKey = `cfa_profile_${email}`;
                const updatedProfile = {
                  ...userProfile,
                  targetExamDate: tempOnboardDate,
                  dailyTargetHours: tempOnboardHours
                };
                setUserProfile(updatedProfile);
                localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
                localStorage.setItem(`cfa_onboarded_${email}`, "true");
                setIsOnboarded(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-1.5">
                  CFA Target Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={tempOnboardDate}
                  onChange={(e) => setTempOnboardDate(e.target.value)}
                  className="w-full bg-white border border-[#D9D5C3] rounded-xl px-3 py-2.5 text-sm text-[#3D3B30] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-1.5">
                  Daily Study Goal Hours (e.g. 1 - 8 hours)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={tempOnboardHours}
                  onChange={(e) => setTempOnboardHours(parseInt(e.target.value, 10) || 2)}
                  className="w-full bg-white border border-[#D9D5C3] rounded-xl px-3 py-2.5 text-sm text-[#3D3B30] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5A6344] hover:bg-[#4a5137] text-white font-bold text-xs py-3 rounded-xl tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm mt-4 border-none"
              >
                Initialize Study Planner & Begin
              </button>
            </form>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 w-full text-center text-xs text-rose-500 hover:underline font-mono bg-transparent border-none outline-none"
            >
              ← Sign out and clear session
            </button>
          </div>
        </main>
      ) : (
        /* 3. Core Study Application Modules Tabs */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Tabs Selector Navigation items */}
          <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={14} />
              Study Dashboard
            </button>

            <button
              onClick={() => setActiveTab("curriculum")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "curriculum"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={14} />
              Curriculum (93 Modules)
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "quiz"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Brain size={14} />
              Practice Quizzes
            </button>

            <button
              onClick={() => setActiveTab("growth")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "growth"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles size={14} />
              Interactive Knowledge Tree
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "calendar"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar size={14} />
              Study Calendar
            </button>

            <button
              onClick={() => setActiveTab("flashcards")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 font-mono flex items-center gap-1.5 transition ${
                activeTab === "flashcards"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Brain size={14} />
              Memory Recall (Flashcards)
            </button>
          </div>

          {/* Render Active selected workspace component */}
          <div className="focus-out-outline animate-fadeIn">
            {activeTab === "dashboard" && (
              <Dashboard
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={CURRICULUM}
                progress={progress}
                activityLogs={activityLogs}
                onLogStudySession={handleLogStudySession}
                timerSeconds={timerSeconds}
                setTimerSeconds={setTimerSeconds}
                isTimerRunning={isTimerRunning}
                setIsTimerRunning={setIsTimerRunning}
                isFullscreenTimerOpen={isFullscreenTimerOpen}
                setIsFullscreenTimerOpen={setIsFullscreenTimerOpen}
                timerModuleId={timerModuleId}
                setTimerModuleId={setTimerModuleId}
              />
            )}

            {activeTab === "curriculum" && (
              <ModuleList
                subjects={CURRICULUM}
                progress={progress}
                onChangeModuleStatus={handleChangeModuleStatus}
                onChangeModuleNotes={handleChangeModuleNotes}
                onRecordQuizScore={handleRecordQuizScore}
                onProgressRevisionCycle={handleProgressRevisionCycle}
              />
            )}

            {activeTab === "quiz" && (
              <QuizPane
                subjects={CURRICULUM}
                progress={progress}
                onRecordQuizScore={handleRecordQuizScore}
              />
            )}

            {activeTab === "growth" && (
              <GrowthTree
                subjects={CURRICULUM}
                progress={progress}
                totalStudyTime={activityLogs.reduce((sum, log) => sum + log.durationMinutes, 0)}
              />
            )}

            {activeTab === "calendar" && (
              <StudyCalendar
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={CURRICULUM}
              />
            )}

            {activeTab === "flashcards" && (
              <FlashcardsPane
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={CURRICULUM}
              />
            )}
          </div>
        </main>
      )}

      {/* Elegant Standard footer */}
      <footer className="border-t border-slate-850 mt-12 py-6 text-center text-slate-500 text-[11px] bg-slate-950/60 font-sans">
        <div>
          CFA® and Chartered Financial Analyst® are registered trademarks owned by CFA Institute. This prep utility is an independent learning assistant.
        </div>
        <div className="mt-1 font-mono">
          CFA Prep Engine v1.1.0 • Independent Study Assistant
        </div>
      </footer>

      {/* Notification Drawer */}
      <NotificationCenter
        notifications={notifications}
        onToggleRead={handleToggleNotificationRead}
        onDelete={handleDeleteNotification}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
      />

      {/* Revision Reminder Popup */}
      {activeRevisionModId && (
        <RevisionReminderModal
          isOpen={!!activeRevisionModId}
          moduleName={getModuleById(activeRevisionModId)?.name || "Module"}
          onClose={() => setActiveRevisionModId(null)}
          onScheduleRevision={(days) => handleScheduleRevision(activeRevisionModId, days)}
        />
      )}

      {/* Design Studio Customizer Sidebar */}
      <DesignCustomizer
        isOpen={isDesignCustomizerOpen}
        onClose={() => setIsDesignCustomizerOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Fullscreen focus mode panel */}
      <FullscreenTimer
        isOpen={isFullscreenTimerOpen}
        onMinimize={() => setIsFullscreenTimerOpen(false)}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onResetTimer={() => {
          setIsTimerRunning(false);
          setTimerSeconds(0);
        }}
        onSaveSession={handleSaveUnifiedSession}
        activeModuleName={FLAT_MODULES.find(m => m.id === timerModuleId)?.name || "Module"}
        activeSubjectName={FLAT_MODULES.find(m => m.id === timerModuleId)?.subjectName || "CFA Subject"}
      />

      {/* Floating Timer Corner Widget (counting in corner, can maximize or pause/reset/save) */}
      {(!isFullscreenTimerOpen && (timerSeconds > 0 || isTimerRunning)) && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-slate-100 p-4 rounded-2xl shadow-2xl flex flex-col gap-2.5 max-w-[280px] w-full animate-fadeIn transition-all">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">FOCUS RUNNING</span>
                <span className="text-[10px] text-slate-300 truncate font-serif font-medium block">
                  {FLAT_MODULES.find(m => m.id === timerModuleId)?.name || "Module"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreenTimerOpen(true)}
              className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
              title="Maximize Focus Screen"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-bold tracking-tight text-white">
              {(() => {
                const hrs = Math.floor(timerSeconds / 3600);
                const mins = Math.floor((timerSeconds % 3600) / 60);
                const secs = timerSeconds % 60;
                return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
              })()}
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isTimerRunning 
                    ? "bg-amber-950/40 border-amber-800/50 text-amber-400 hover:bg-amber-950/60" 
                    : "bg-blue-950/40 border-blue-800/50 text-blue-400 hover:bg-blue-950/60"
                }`}
              >
                {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-350 transition cursor-pointer"
                title="Reset study timer"
              >
                <RotateCcw size={12} />
              </button>

              <button
                onClick={handleSaveUnifiedSession}
                className="p-1.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/60 rounded-lg transition cursor-pointer"
                title="Save & log session to stats"
              >
                <CheckCircle size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
