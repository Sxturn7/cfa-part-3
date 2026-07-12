import React, { useState, useEffect, useMemo } from "react";
import ClickSpark from "./components/ClickSpark";
import { UserProfile, Subject, ModuleProgress, ActivityLog, ModuleStatus, AppNotification } from "./types";
import { CURRICULUM, FLAT_MODULES, getModuleById, getCurriculum, getFlatModules } from "./curriculum";
import Dashboard from "./components/Dashboard";
import ModuleList from "./components/ModuleList";
import QuizPane from "./components/QuizPane";
import GrowthTree from "./components/GrowthTree";
import StudyCalendar from "./components/StudyCalendar";
import FlashcardsPane from "./components/FlashcardsPane";
import TodoList from "./components/TodoList";
import NotificationCenter from "./components/NotificationCenter";
import RevisionReminderModal from "./components/RevisionReminderModal";
import DesignCustomizer from "./components/DesignCustomizer";
import TutorialTour from "./components/TutorialTour";
import { AppTheme, THEME_PRESETS, applyTheme } from "./theme";
import { BookOpen, Clock, Activity, Calendar, LayoutDashboard, Brain, HelpCircle, LogOut, Eye, EyeOff, Bell, Sparkles, Palette, Database, X, Maximize2, Pause, Play, RotateCcw, CheckCircle, FolderTree } from "lucide-react";
import FullscreenTimer from "./components/FullscreenTimer";
import PixelBlast from "./components/PixelBlast";
import DotField from "./components/DotField";
import Dock from "./components/Dock";
import AeraLogo from "./components/AeraLogo";
import GooeyNav from "./components/GooeyNav";
import { playAmbientSound, stopAmbientSound, updateAmbientVolume } from "./utils/ambientSynth";
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

const NAV_ITEMS = [
  { id: "dashboard", label: "Study Dashboard", icon: <LayoutDashboard size={14} /> },
  { id: "curriculum", label: "Curriculum", icon: <BookOpen size={14} />, tourId: "tour-nav-curriculum" },
  { id: "quiz", label: "Practice Quizzes", icon: <Brain size={14} />, tourId: "tour-nav-quiz" },
  { id: "growth", label: "Knowledge Tree", icon: <FolderTree size={14} />, tourId: "tour-nav-growth" },
  { id: "calendar", label: "Study Calendar", icon: <Calendar size={14} />, tourId: "tour-nav-calendar" },
  { id: "flashcards", label: "Memory Cards", icon: <Brain size={14} />, tourId: "tour-nav-flashcards" },
  { id: "todo", label: "To-Do List", icon: <CheckCircle size={14} />, tourId: "tour-nav-todo" }
];

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
  const [authChosen, setAuthChosen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "curriculum" | "quiz" | "growth" | "calendar" | "flashcards" | "todo">("dashboard");
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);
  const [activeRevisionModId, setActiveRevisionModId] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(THEME_PRESETS.light);
  const [isDesignCustomizerOpen, setIsDesignCustomizerOpen] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  // Dynamic Curriculum Selection based on User Profile Target Exam Date
  const currentCurriculum = useMemo(() => {
    return getCurriculum(userProfile.targetExamDate);
  }, [userProfile.targetExamDate]);

  const currentFlatModules = useMemo(() => {
    return getFlatModules(userProfile.targetExamDate);
  }, [userProfile.targetExamDate]);

  // Global Focus Timer States
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isFullscreenTimerOpen, setIsFullscreenTimerOpen] = useState<boolean>(false);
  const [timerModuleId, setTimerModuleId] = useState<string>("");
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerAccumulated, setTimerAccumulated] = useState<number>(0);



  // Synchronize timerModuleId with current curriculum modules if empty or invalid
  useEffect(() => {
    if (currentFlatModules.length > 0 && (!timerModuleId || !currentFlatModules.some(m => m.id === timerModuleId))) {
      setTimerModuleId(currentFlatModules[0].id);
    }
  }, [currentFlatModules, timerModuleId]);

  // Ambient Sound States
  const [activeAmbientId, setActiveAmbientId] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.25);

  // Sync ambient sound playback
  useEffect(() => {
    if (activeAmbientId) {
      playAmbientSound(activeAmbientId, ambientVolume);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [activeAmbientId]);

  // Sync volume level
  useEffect(() => {
    updateAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  // Handle play/pause transition to compute accurate accumulated seconds
  useEffect(() => {
    if (isTimerRunning) {
      setTimerStartTime(Date.now());
    } else {
      if (timerStartTime !== null) {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const newAccumulated = timerAccumulated + elapsed;
        setTimerAccumulated(newAccumulated);
        setTimerSeconds(newAccumulated);
        setTimerStartTime(null);
      }
    }
  }, [isTimerRunning]);

  // Handle manual/automatic reset of the timer
  useEffect(() => {
    if (timerSeconds === 0 && !isTimerRunning) {
      setTimerStartTime(null);
      setTimerAccumulated(0);
    }
  }, [timerSeconds, isTimerRunning]);

  // High-frequency ticker to update seconds on display
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerStartTime !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        setTimerSeconds(timerAccumulated + elapsed);
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerStartTime, timerAccumulated]);

  const handleSaveUnifiedSession = () => {
    // Save study duration with high accuracy (including fractional support for accurate increments)
    const studyMins = parseFloat((timerSeconds / 60).toFixed(2)) || 1;
    handleLogStudySession(timerModuleId, studyMins, "study");
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setIsFullscreenTimerOpen(false);
    setActiveAmbientId(null); // Stop ambient sound when session ends!
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
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [justRegistered, setJustRegistered] = useState<boolean>(false);

  // Local storage management per email account
  useEffect(() => {
    const savedEmail = localStorage.getItem("cfa_current_email");
    if (savedEmail) {
      setEmail(savedEmail);
      loadUserData(savedEmail);
      setSignedIn(true);

      // Fetch the latest state from Supabase to keep everything synchronized in real-time
      if (isSupabaseConfigured()) {
        fetchFromSupabase(savedEmail).then((cloudData) => {
          if (cloudData) {
            loadUserData(savedEmail, cloudData);
          }
        }).catch((err) => {
          console.error("Mount cloud sync failed:", err);
        });
      }
    }
  }, []);

  // Apply theme on change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const loadUserData = (currentEmail: string, fetchedData?: UserSyncData | null) => {
    // If we have fetched data from Supabase, load that directly!
    if (fetchedData) {
      setCurrentTheme(fetchedData.theme || THEME_PRESETS.light);
      setUserProfile(fetchedData.profile);
      setProgress(fetchedData.progress || {});
      setActivityLogs(fetchedData.logs || []);
      setNotifications(fetchedData.notifications || []);
      setIsOnboarded(fetchedData.onboarded || false);

      // Cache locally in localStorage as a backup
      localStorage.setItem(`cfa_theme_${currentEmail}`, JSON.stringify(fetchedData.theme || THEME_PRESETS.light));
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
        setCurrentTheme(THEME_PRESETS.light);
      }
    } else {
      setCurrentTheme(THEME_PRESETS.light);
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
        title: "Study Plan Activated",
        message: `Your Level I study plan has loaded! All 93 readings are loaded. Mark them complete to build your interactive tree.`,
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
    updatedNotifs?: AppNotification[],
    updatedTheme?: AppTheme,
    updatedOnboarded?: boolean
  ) => {
    if (!email) return;
    localStorage.setItem(`cfa_profile_${email}`, JSON.stringify(updatedProfile));
    localStorage.setItem(`cfa_progress_${email}`, JSON.stringify(updatedProgress));
    localStorage.setItem(`cfa_logs_${email}`, JSON.stringify(updatedLogs));
    
    const activeNotifs = updatedNotifs !== undefined ? updatedNotifs : notifications;
    if (updatedNotifs !== undefined) {
      localStorage.setItem(`cfa_notifs_${email}`, JSON.stringify(updatedNotifs));
    }

    const activeTheme = updatedTheme !== undefined ? updatedTheme : currentTheme;
    const activeOnboarded = updatedOnboarded !== undefined ? updatedOnboarded : isOnboarded;
    localStorage.setItem(`cfa_onboarded_${email}`, activeOnboarded ? "true" : "false");

    // Background Cloud Sync
    if (isSupabaseConfigured()) {
      syncToSupabase({
        email,
        profile: updatedProfile,
        progress: updatedProgress,
        logs: updatedLogs,
        notifications: activeNotifs,
        theme: activeTheme,
        onboarded: activeOnboarded,
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
          title: "Study Plan Activated",
          message: `Your Level I study plan has loaded! All 93 readings are loaded. Mark them complete to build your interactive tree.`,
          timestamp: new Date().toISOString(),
          read: false,
        };

        // Sync to cloud on-registration if active
        if (isSupabaseConfigured()) {
          const syncRes = await syncToSupabase({
            email: emailClean,
            password: password,
            profile: defaultProfile,
            progress: {},
            logs: [],
            notifications: [defaultNotif],
            theme: THEME_PRESETS.dark,
            onboarded: false,
          });
          if (!syncRes.success) {
            setAuthError(`Supabase Cloud Sync Failed: ${syncRes.error}. Please verify your credentials and ensure your SQL table schema includes all columns (notifications, theme, onboarded, updated_at). See the 1-Click SQL Setup script in Database Settings.`);
            setIsAuthLoading(false);
            return;
          }
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
        setJustRegistered(true);
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
    setAuthChosen(false);
    setSignedIn(false);
  };

  const handleSaveDbSettings = (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    addNotification(
      "achievement",
      "🔗 Supabase Cloud Database Connected",
      "Successfully linked your custom Supabase database! Uploading current study metrics, calendars, and logs to the cloud."
    );
    // Force immediate sync with the updated configuration!
    setTimeout(() => {
      saveData(userProfile, progress, activityLogs);
    }, 100);
    setIsDbSettingsOpen(false);
  };

  const handleDisconnectDb = () => {
    clearSupabaseConfig();
    addNotification(
      "reminder",
      "⚠️ Supabase Custom Database Disconnected",
      "Switched to offline local storage mode. Credentials have been removed."
    );
    setDbUrl("");
    setDbKey("");
    setIsDbSettingsOpen(false);
  };

  // State Modifiers
  const handleLogStudySession = (moduleId: string, durationMinutes: number, type: "study" | "quiz", score?: number) => {
    const modObj = getModuleById(moduleId, userProfile.targetExamDate);
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
    const mod = getModuleById(moduleId, userProfile.targetExamDate);
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
      saveData(userProfile, progress, activityLogs, undefined, newTheme);
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
      const mod = getModuleById(moduleId, userProfile.targetExamDate);
      const modName = mod ? mod.name : "Module";
      
      addNotification(
        "completed",
        "✓ Reading Completed",
        `Module "${modName}" marked complete! Spaced repetition sequence recommended.`,
        moduleId
      );
    }
  };

  const handleBatchChangeModuleStatus = (moduleIds: string[], status: ModuleStatus) => {
    const updatedProgress = { ...progress };
    moduleIds.forEach((moduleId) => {
      const currentProg = progress[moduleId] || {
        status: ModuleStatus.NOT_STARTED,
        studyTimeMinutes: 0,
        quizScore: null,
        notes: "",
        lastStudiedAt: null,
        revisionCycle: 0
      };
      updatedProgress[moduleId] = {
        ...currentProg,
        status,
        lastStudiedAt: new Date().toISOString()
      };
    });
    setProgress(updatedProgress);
    saveData(userProfile, updatedProgress, activityLogs);

    if (status === ModuleStatus.COMPLETED) {
      addNotification(
        "completed",
        "✓ Section Completed",
        `All selected readings in the section have been marked as completed. Keep up the momentum!`
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

  // Dynamic background dots config depending on currentTheme preset
  const dotConfig = useMemo(() => {
    const isDark = currentTheme.preset === "dark";
    if (isDark) {
      return {
        dotRadius: 1.6,
        dotSpacing: 14,
        gradientFrom: "rgba(139, 92, 246, 0.40)", // Indigo / Violet glow
        gradientTo: "rgba(99, 102, 241, 0.12)",   // Darker indigo
        glowColor: "rgba(139, 92, 246, 0.22)",
      };
    } else {
      // Light mode (Sage Garden / warm beige)
      return {
        dotRadius: 1.6,
        dotSpacing: 14,
        gradientFrom: "rgba(90, 99, 68, 0.45)",    // Olive/sage green
        gradientTo: "rgba(163, 177, 138, 0.15)",   // Soft warm sage
        glowColor: "rgba(90, 99, 68, 0.20)",
      };
    }
  }, [currentTheme]);

  // Premium Header Stats Calculations
  const diffDays = useMemo(() => {
    if (!userProfile.targetExamDate) return 0;
    const examDate = new Date(userProfile.targetExamDate);
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [userProfile.targetExamDate]);

  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayMins = activityLogs
      .filter((log) => log.timestamp && log.timestamp.startsWith(todayStr))
      .reduce((sum, log) => sum + log.durationMinutes, 0);
    const hrs = parseFloat((todayMins / 60).toFixed(1));
    const target = userProfile.dailyTargetHours || 2;
    const pct = Math.min(100, Math.round((hrs / target) * 100));
    return { hrs, target, pct };
  }, [activityLogs, userProfile.dailyTargetHours]);

  return (
    <ClickSpark
      sparkColor="var(--theme-accent)"
      sparkSize={12}
      sparkRadius={22}
      sparkCount={10}
      duration={500}
    >
      <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-main)] flex flex-col font-sans select-none selection:bg-[var(--theme-accent-light)] relative overflow-x-hidden">
      {/* Dynamic Global Background Field */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <DotField
          dotRadius={dotConfig.dotRadius}
          dotSpacing={dotConfig.dotSpacing}
          bulgeStrength={75}
          glowRadius={180}
          sparkle={true}
          waveAmplitude={0.5}
          gradientFrom={dotConfig.gradientFrom}
          gradientTo={dotConfig.gradientTo}
          glowColor={dotConfig.glowColor}
        />
      </div>

      {/* 1. Header Navigation elements */}
      <header className="border-b border-[var(--theme-border)]/45 bg-[var(--theme-card)]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between transition-all duration-300 relative">
        <div className="flex items-center gap-3 select-none group">
          <div className="h-10 w-10 flex items-center justify-center transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-105">
            <AeraLogo size={42} color="var(--theme-accent)" showText={false} preset={currentTheme.preset} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--theme-text-dark)] tracking-[0.12em] flex items-center gap-2 select-none">
              AAERA
              <span className="text-[9px] bg-[var(--theme-accent-light)]/60 text-[var(--theme-accent)] font-semibold px-2.5 py-0.5 rounded-full select-none border border-[var(--theme-accent)]/15">
                CFA Level I
              </span>
            </h1>
            <p className="text-[10px] text-[var(--theme-text-main)] opacity-70 font-normal">Aim • Analyze • Execute • Reflect • Achieve</p>
          </div>
        </div>

        {signedIn && (
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-[var(--theme-text-dark)] font-medium max-w-[150px] truncate">{userProfile.email}</span>
              <span className="text-[9px] text-[var(--theme-accent)] font-semibold tracking-wider uppercase opacity-85">CFA Level 1 Candidate</span>
            </div>

            {/* Premium Button Deck with unified aesthetics */}
            <div className="flex items-center gap-1.5 bg-[var(--theme-beige)]/40 p-1 rounded-xl border border-[var(--theme-border)]/35">
              {/* Design Customizer Button */}
              <button
                id="tour-nav-design"
                onClick={() => setIsDesignCustomizerOpen(true)}
                className="p-1.5 text-amber-600 hover:text-amber-500 hover:bg-[var(--theme-card)] rounded-lg transition-all duration-200 flex items-center justify-center w-8 h-8 shrink-0 cursor-pointer active:scale-95 hover:shadow-xs group"
                title="AAERA Design Studio"
                aria-label="Design customizer"
              >
                <Palette size={14} className="opacity-80 group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Separation Divider */}
              <div className="w-[1px] h-4 bg-[var(--theme-border)]/30" />

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifCenterOpen(true)}
                className="relative p-1.5 text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] hover:bg-[var(--theme-card)] rounded-lg transition-all duration-200 w-8 h-8 flex items-center justify-center cursor-pointer active:scale-95 hover:shadow-xs group"
                aria-label="Notification center"
              >
                <Bell size={14} className="opacity-80 group-hover:scale-110 transition-transform duration-200" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {/* Separation Divider */}
              <div className="w-[1px] h-4 bg-[var(--theme-border)]/30" />

              {/* Sign Out Button */}
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="hover:bg-rose-500/10 text-rose-600 p-1.5 rounded-lg transition-all duration-200 w-8 h-8 flex items-center justify-center cursor-pointer active:scale-95 hover:shadow-xs group"
                title="Sign Out"
              >
                <LogOut size={14} className="opacity-80 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Dock Sub-Header Bar (visible when signed in and onboarded) */}
      {signedIn && isOnboarded && (
        <div className="w-full bg-transparent py-2 relative z-40 flex items-center justify-center sticky top-[57px] transition-all duration-300">
          <Dock
            items={NAV_ITEMS.map((item) => ({
              id: item.tourId,
              icon: React.isValidElement(item.icon) ? React.cloneElement(item.icon, { size: 20 } as any) : item.icon,
              label: item.label,
              onClick: () => setActiveTab(item.id as any),
              className: activeTab === item.id ? "active-dock-item" : ""
            }))}
            panelHeight={64}
            baseItemSize={48}
            magnification={68}
            distance={120}
          />
        </div>
      )}

      {/* 2. Authentication splash screen */}
      {!signedIn ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-transparent relative overflow-hidden z-10">
          {/* subtle ambient background elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-accent-light)] rounded-full blur-3xl pointer-events-none opacity-40" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--theme-accent-light)] rounded-full blur-3xl pointer-events-none opacity-40" />

          <div className="w-full max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)] p-8 rounded-2xl shadow-xl relative animate-fadeIn">
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105 animate-scaleUp">
                <AeraLogo size={100} color="var(--theme-accent)" showText={false} preset={currentTheme.preset} />
              </div>
              <h2 className="text-2xl font-black tracking-widest text-[var(--theme-text-dark)] uppercase select-none mt-2 font-sans">
                AAERA
              </h2>
              <p className="text-xs text-[var(--theme-text-main)] leading-relaxed max-w-xs mx-auto opacity-80 font-medium">
                Aim • Analyze • Execute • Reflect • Achieve
              </p>
            </div>

            {!authChosen ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center pb-2">
                  <p className="text-xs text-[var(--theme-text-main)] opacity-75 leading-relaxed">
                  Select an option below to continue.
                  </p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthChosen(true);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="w-full text-center bg-[var(--theme-input-bg)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/60 rounded-xl p-4 transition duration-250 cursor-pointer active:scale-[0.99] group flex flex-col items-center justify-center gap-1 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-[var(--theme-text-dark)] group-hover:text-[var(--theme-accent)] transition">
                      Sign in
                    </span>
                    <span className="text-[11px] text-[var(--theme-text-main)] opacity-70 leading-normal max-w-xs mx-auto">
                      Continue your study journey, resume active modules, and keep your progress in sync.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthChosen(true);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="w-full text-center bg-[var(--theme-input-bg)] hover:bg-[var(--theme-beige)] border border-[var(--theme-border)]/60 rounded-xl p-4 transition duration-250 cursor-pointer active:scale-[0.99] group flex flex-col items-center justify-center gap-1 shadow-xs"
                  >
                    <span className="text-sm font-semibold text-[var(--theme-text-dark)] group-hover:text-[var(--theme-accent)] transition">
                      Create account
                    </span>
                    <span className="text-[11px] text-[var(--theme-text-main)] opacity-70 leading-normal max-w-xs mx-auto">
                      Set your exam date, personalize your study plan, and start tracking your progress.
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                {/* Mode header indicators */}
                <div className="text-center mb-5 pb-2 border-b border-[var(--theme-border)]/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--theme-text-dark)]">
                    {authMode === "login" ? "Sign In to AAERA" : "Create Candidate Account"}
                  </h3>
                </div>

                {/* Error & Success Messages */}
                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg font-medium">
                    ⚠️ {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg font-medium">
                    ✨ {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--theme-text-main)] opacity-80 mb-1.5">
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
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] placeholder:text-[var(--theme-text-main)] placeholder:opacity-40 transition font-mono shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--theme-text-main)] opacity-80 mb-1.5">
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
                        className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] placeholder:text-[var(--theme-text-main)] placeholder:opacity-40 transition font-mono shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-main)] opacity-60 hover:opacity-90 outline-none p-1 flex items-center justify-center cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="animate-fadeIn">
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--theme-text-main)] opacity-80 mb-1.5">
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
                        className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] placeholder:text-[var(--theme-text-main)] placeholder:opacity-40 transition font-mono shadow-sm"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] disabled:opacity-50 text-[var(--theme-bg)] font-bold text-xs py-3 rounded-xl tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm mt-4 border-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAuthLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-[var(--theme-bg)]" fill="none" viewBox="0 0 24 24">
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

                <div className="mt-5 flex justify-center border-t border-[var(--theme-border)]/20 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthChosen(false);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-accent)] hover:underline opacity-80 cursor-pointer"
                  >
                    ← Back to Choices
                  </button>
                </div>

                <div className="mt-4 text-center text-[10px] text-[var(--theme-text-main)] opacity-60 leading-relaxed">
                  {authMode === "login" ? (
                    <span>Sign in to access your dashboard, monitor your progress, and continue preparing for the CFA Level I exam.</span>
                  ) : (
                    <span>Create an account to organize your CFA Level I preparation, track every completed module, and monitor your overall progress.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      ) : !isOnboarded ? (
        /* Onboarding Screen (New Profile Date and Weekly Target Hours Setup) */
        <main className="flex-1 flex items-center justify-center p-4 bg-transparent relative z-10">
          <div className="w-full max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)] p-8 rounded-2xl shadow-xl relative animate-fadeIn">
            <div className="text-center space-y-2 mb-6 border-b border-[var(--theme-border)] pb-4">
              <AeraLogo size={60} className="mx-auto" preset={currentTheme.preset} />
              <h2 className="text-xl font-bold tracking-tight text-[var(--theme-text-dark)] font-sans">AAERA Setup</h2>
              <p className="text-xs text-[var(--theme-text-main)] leading-relaxed max-w-xs mx-auto">
                Define your exam target details before launching the adaptive syllabus. Once saved, details can only be adjusted inside Settings.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedProfile = {
                  ...userProfile,
                  targetExamDate: tempOnboardDate,
                  dailyTargetHours: tempOnboardHours
                };
                setUserProfile(updatedProfile);
                setIsOnboarded(true);
                saveData(updatedProfile, progress, activityLogs, undefined, undefined, true);
                
                if (justRegistered) {
                  setIsTourOpen(true);
                  setJustRegistered(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--theme-text-main)] opacity-80 mb-1.5">
                  CFA Target Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={tempOnboardDate}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {
                        console.warn("Native showPicker not supported:", err);
                      }
                    }}
                    onChange={(e) => setTempOnboardDate(e.target.value)}
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition font-mono shadow-sm cursor-pointer hover:bg-[var(--theme-border)]/5"
                  />
                  <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)] pointer-events-none" />
                </div>
                {/* presets inside onboarding */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[
                    { label: "Feb 2027", date: "2027-02-20" },
                    { label: "May 2027", date: "2027-05-18" },
                    { label: "Aug 2027", date: "2027-08-24" },
                    { label: "Nov 2027", date: "2027-11-16" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTempOnboardDate(preset.date)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all border shrink-0 text-center cursor-pointer ${
                        tempOnboardDate === preset.date
                          ? "bg-[var(--theme-accent)] border-[var(--theme-accent)] text-[var(--theme-bg)]"
                          : "bg-[var(--theme-card)] border-[var(--theme-border)]/60 text-[var(--theme-text-main)] hover:bg-[var(--theme-beige)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--theme-text-main)] opacity-80 mb-1.5">
                  Daily Study Goal Hours (e.g. 1 - 8 hours)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={tempOnboardHours}
                  onChange={(e) => setTempOnboardHours(parseInt(e.target.value, 10) || 2)}
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-dark)] outline-none focus:border-[var(--theme-accent)] transition font-mono shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] font-bold text-xs py-3 rounded-xl tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-sm mt-4 border-none cursor-pointer"
              >
                Initialize Study Planner & Begin
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="mt-4 w-full text-center text-xs text-rose-500 hover:underline font-mono bg-transparent border-none outline-none cursor-pointer"
            >
              ← Sign out and clear session
            </button>
          </div>
        </main>
      ) : (
        /* 3. Core Study Application Modules Tabs */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-1 pb-6 space-y-6 relative z-10">
          {/* Render Active selected workspace component */}
          <div className="focus-out-outline animate-fadeIn">
            {activeTab === "dashboard" && (
              <Dashboard
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={currentCurriculum}
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
                activeAmbientId={activeAmbientId}
                setActiveAmbientId={setActiveAmbientId}
                ambientVolume={ambientVolume}
                setAmbientVolume={setAmbientVolume}
                isSupabaseConfigured={isSupabaseConfigured}
                dbUrl={dbUrl}
                setDbUrl={setDbUrl}
                dbKey={dbKey}
                setDbKey={setDbKey}
                onSaveDbSettings={handleSaveDbSettings}
                onDisconnectDb={handleDisconnectDb}
                SUPABASE_SQL_SETUP={SUPABASE_SQL_SETUP}
                addNotification={addNotification}
                saveData={() => saveData(userProfile, progress, activityLogs)}
              />
            )}

            {activeTab === "curriculum" && (
              <ModuleList
                subjects={currentCurriculum}
                progress={progress}
                onChangeModuleStatus={handleChangeModuleStatus}
                onChangeModuleNotes={handleChangeModuleNotes}
                onRecordQuizScore={handleRecordQuizScore}
                onProgressRevisionCycle={handleProgressRevisionCycle}
                onBatchChangeModuleStatus={handleBatchChangeModuleStatus}
              />
            )}

            {activeTab === "quiz" && (
              <QuizPane
                subjects={currentCurriculum}
                progress={progress}
                onRecordQuizScore={handleRecordQuizScore}
                targetExamDate={userProfile.targetExamDate}
              />
            )}

            {activeTab === "growth" && (
              <GrowthTree
                subjects={currentCurriculum}
                progress={progress}
                totalStudyTime={activityLogs.reduce((sum, log) => sum + log.durationMinutes, 0)}
              />
            )}

            {activeTab === "calendar" && (
              <StudyCalendar
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={currentCurriculum}
              />
            )}

            {activeTab === "flashcards" && (
              <FlashcardsPane
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                subjects={currentCurriculum}
              />
            )}

            {activeTab === "todo" && (
              <TodoList
                userProfile={userProfile}
                setUserProfile={handleUpdateProfile}
                addNotification={addNotification}
              />
            )}
          </div>
        </main>
      )}

      {/* Elegant Standard footer */}
      <footer className="border-t border-[var(--theme-border)]/15 mt-12 py-6 text-center text-[var(--theme-text-main)]/60 text-[11px] bg-[var(--theme-card)]/30 backdrop-blur-xs font-sans px-4">
        <div className="max-w-3xl mx-auto leading-relaxed">
          CFA® and Chartered Financial Analyst® are registered trademarks owned by CFA Institute. AAERA is an independent study platform and is not affiliated with, endorsed by, or sponsored by CFA Institute.
        </div>
        <div className="mt-2 text-[10px] font-semibold tracking-widest text-[var(--theme-accent)] uppercase">
          AAERA
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
        activeModuleName={getModuleById(timerModuleId, userProfile.targetExamDate)?.name || "Module"}
        activeSubjectName={getModuleById(timerModuleId, userProfile.targetExamDate)?.subjectName || "CFA Subject"}
        activeAmbientId={activeAmbientId}
        setActiveAmbientId={setActiveAmbientId}
        ambientVolume={ambientVolume}
        setAmbientVolume={setAmbientVolume}
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
                  {getModuleById(timerModuleId, userProfile.targetExamDate)?.name || "Module"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsFullscreenTimerOpen(true)}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                title="Maximize Focus Screen"
              >
                <Maximize2 size={13} />
              </button>
            </div>
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

      {/* Supabase Database Settings Modal */}
      {isDbSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database size={16} className="text-blue-400" />
                Supabase Cloud Database Settings
              </h3>
              <button
                type="button"
                onClick={() => setIsDbSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-800/60 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Durable Cloud Sync keeps your adaptive Study Planner, calendar deadlines, focus hours, quiz scores, custom flashcards, and revision schedules synchronized instantly in real-time across any device.
            </p>

            {isSupabaseConfigured() ? (
              <div className="bg-emerald-950/40 border border-emerald-800/40 p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 block">Cloud Database Linked</span>
                    <span className="text-[10px] text-slate-400 block">Saving everything in real-time.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      saveData(userProfile, progress, activityLogs);
                      addNotification(
                        "achievement",
                        "⚡ Force Sync Executed",
                        "Manual override sync complete! All your curriculum, calendar dates, and focus logs have been pushed to the cloud."
                      );
                    }}
                    className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/50 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    title="Force cloud upload now"
                  >
                    Force Sync
                  </button>
                  <button
                    onClick={handleDisconnectDb}
                    className="bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 border border-rose-900/50 text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Local Offline Mode</span>
                  <span className="text-[10px] text-slate-500 block">All details save to local storage only. Link below to prevent data loss.</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-450 mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://xyzcompany.supabase.co"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-450 mb-1.5">
                  Supabase Anon/Public Key
                </label>
                <input
                  type="password"
                  placeholder="Paste your anon/public key..."
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-700 font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsDbSettingsOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-350 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!dbUrl.trim() || !dbKey.trim()}
                  onClick={() => handleSaveDbSettings(dbUrl, dbKey)}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-slate-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Save & Connect Cloud
                </button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsDbCollapseOpen(!isDbCollapseOpen)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <span>{isDbCollapseOpen ? "Hide" : "Show"} Supabase 1-Click SQL Setup Script</span>
                <span>{isDbCollapseOpen ? "▲" : "▼"}</span>
              </button>

              {isDbCollapseOpen && (
                <div className="mt-2.5 animate-fadeIn space-y-2">
                  <p className="text-[10px] text-slate-550 leading-relaxed">
                    Execute this exact query inside your Supabase project's <strong className="text-slate-400">SQL Editor</strong> to instantly generate the tables, security policies, and sync triggers needed.
                  </p>
                  <div className="relative">
                    <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-400 max-h-48 border border-slate-850 leading-relaxed select-all">
                      {SUPABASE_SQL_SETUP}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
                        addNotification(
                          "completed",
                          "📋 SQL Code Copied",
                          "Copied the SQL Table setup script to your clipboard. Run it in your Supabase SQL editor!"
                        );
                      }}
                      className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-mono font-bold px-2 py-1 rounded text-slate-350 border border-slate-700 transition cursor-pointer"
                    >
                      Copy SQL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-fadeIn">
          <div className="w-full max-w-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-scaleUp">
            <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <LogOut size={22} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--theme-text-dark)] uppercase tracking-wider">
                Sign Out Candidate
              </h3>
              <p className="text-[11px] text-[var(--theme-text-main)] opacity-85 leading-relaxed">
                Are you sure you want to sign out of AAERA? Your progress is saved automatically.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 bg-[var(--theme-bg)] hover:bg-[var(--theme-bg)]/80 text-[var(--theme-text-dark)] py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer border border-[var(--theme-border)]/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutConfirm(false);
                  handleSignOut();
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Interactive Platform Walkthrough Tour */}
      <TutorialTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          setActiveTab("dashboard");
          if (email) {
            localStorage.setItem(`cfa_tour_viewed_${email}`, "true");
          }
        }}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    </div>
    </ClickSpark>
  );
}
