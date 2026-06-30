import { createClient } from "@supabase/supabase-js";
import { UserProfile, ModuleProgress, ActivityLog, AppNotification } from "../types";
import { AppTheme } from "../theme";

// ==========================================
// PASTE YOUR SUPABASE CREDENTIALS DIRECTLY HERE:
// ==========================================
const SUPABASE_URL = "https://tdzdmzermurikloydpxb.supabase.co"; // e.g. "https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkendtemVybXVyaWtsb3lkcHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTUxODQsImV4cCI6MjA5ODM5MTE4NH0.Cn5lwhF1UNnGCkxIFK-fXvzyg2AG2XwjATxHtcd_sXA"; // Your long alphanumeric anon public key

// Retrieve config from environment variables, localStorage, or hardcoded constants above
export function getSupabaseConfig() {
  const url = SUPABASE_URL || ((import.meta as any).env?.VITE_SUPABASE_URL as string) || localStorage.getItem("cfa_supabase_url") || "";
  const key = SUPABASE_ANON_KEY || ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || localStorage.getItem("cfa_supabase_anon_key") || "";
  return { url: url.trim(), key: key.trim() };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem("cfa_supabase_url", url.trim());
  localStorage.setItem("cfa_supabase_anon_key", key.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem("cfa_supabase_url");
  localStorage.removeItem("cfa_supabase_anon_key");
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return url.length > 0 && key.length > 0;
}

// Lazy initialization of Supabase client
let supabaseClientInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  
  const { url, key } = getSupabaseConfig();
  try {
    // Return cached instance if configuration hasn't changed
    if (supabaseClientInstance && supabaseClientInstance.supabaseUrl === url) {
      return supabaseClientInstance;
    }
    supabaseClientInstance = createClient(url, key);
    return supabaseClientInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

export interface UserSyncData {
  email: string;
  password?: string;
  profile: UserProfile;
  progress: Record<string, ModuleProgress>;
  logs: ActivityLog[];
  notifications: AppNotification[];
  theme: AppTheme;
  onboarded: boolean;
}

/**
 * Sync user study progress and credentials to Supabase
 */
export async function syncToSupabase(data: UserSyncData): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const emailClean = data.email.trim().toLowerCase();
  
  try {
    const storedPassword = typeof window !== "undefined" ? localStorage.getItem(`cfa_auth_${emailClean}`) : null;
    const activePassword = data.password || storedPassword || "cfa_secure_pass";

    const payload: any = {
      email: emailClean,
      password: activePassword,
      profile: data.profile,
      progress: data.progress,
      logs: data.logs,
      notifications: data.notifications,
      theme: data.theme,
      onboarded: data.onboarded,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("cfa_users_sync")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error("Failed to sync data to Supabase:", err);
    return false;
  }
}

/**
 * Fetch and load user progress and credentials from Supabase
 */
export async function fetchFromSupabase(email: string): Promise<UserSyncData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const emailClean = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from("cfa_users_sync")
      .select("*")
      .eq("email", emailClean)
      .maybeSingle();

    if (error) {
      console.error("Supabase select error:", error);
      return null;
    }

    if (!data) return null;

    return {
      email: data.email,
      password: data.password,
      profile: typeof data.profile === "string" ? JSON.parse(data.profile) : data.profile,
      progress: typeof data.progress === "string" ? JSON.parse(data.progress) : data.progress,
      logs: typeof data.logs === "string" ? JSON.parse(data.logs) : data.logs,
      notifications: typeof data.notifications === "string" ? JSON.parse(data.notifications) : data.notifications,
      theme: typeof data.theme === "string" ? JSON.parse(data.theme) : data.theme,
      onboarded: data.onboarded,
    };
  } catch (err) {
    console.error("Failed to fetch data from Supabase:", err);
    return null;
  }
}

/**
 * SQL generation snippet for the user to execute inside their Supabase SQL editor
 */
export const SUPABASE_SQL_SETUP = `-- Copy and run this inside your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS cfa_users_sync (
  email text PRIMARY KEY,
  password text,
  profile jsonb,
  progress jsonb,
  logs jsonb,
  notifications jsonb,
  theme jsonb,
  onboarded boolean,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE cfa_users_sync ENABLE ROW LEVEL SECURITY;

-- Allow public access policy for easy synchronization
CREATE POLICY "Allow public read and write"
ON cfa_users_sync
FOR ALL
USING (true)
WITH CHECK (true);
`;
